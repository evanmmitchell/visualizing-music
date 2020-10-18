from math import inf
from py_midicsv import midi_to_csv


class Song:
    def __init__(self, title):
        self.title = title
        self.notes = []
        self.minPitch = inf
        self.maxPitch = -inf
        self.minTrack = inf
        self.maxTrack = -inf
        self.startTime = inf
        self.endTime = -inf

    def add_note(self, track, tick_on, tick_off, pitch, velocity, tempo_map):
        note = self.Note(track, tick_on, tick_off, pitch, velocity, tempo_map)
        self.notes.append(note)
        self.minPitch = min(self.minPitch, note.pitch)
        self.maxPitch = max(self.maxPitch, note.pitch)
        self.minTrack = min(self.minTrack, note.track)
        self.maxTrack = max(self.maxTrack, note.track)
        self.startTime = min(self.startTime, note.time)
        self.endTime = max(self.endTime, note.time + note.duration)

    class Note:
        def __init__(self, track, tick_on, tick_off, pitch, velocity, tempo_map):
            MICROS_PER_SECOND = 1000000
            MAX_VELOCITY = 127
            self.track = track
            start = tempo_map.micros_at_tick(tick_on) / MICROS_PER_SECOND
            end = tempo_map.micros_at_tick(tick_off) / MICROS_PER_SECOND
            self.duration = end - start
            self.time = start
            self.pitch = pitch
            self.velocity = velocity / MAX_VELOCITY


class TempoMap:
    def __init__(self):
        self.ticks_per_quarter_note = 480
        self.tempo_map = []

    def add_tempo(self, tick, tempo):
        tempo_event = self.TempoEvent(tick, tempo, self.micros_at_tick(tick))
        self.tempo_map.append(tempo_event)

    def micros_at_tick(self, tick):
        tempo_event_at_tick = self.TempoEvent()
        for tempo_event in self.tempo_map:
            if tempo_event.tick > tick:
                break
            tempo_event_at_tick = tempo_event
        micros_offset = (
            (tick - tempo_event_at_tick.tick)
            / self.ticks_per_quarter_note
            * tempo_event_at_tick.tempo
        )
        return tempo_event_at_tick.micros + micros_offset

    class TempoEvent:
        def __init__(self, tick=0, tempo=500000, micros=0):
            self.tick = tick
            self.tempo = tempo
            self.micros = micros


def serialize(obj):
    if isinstance(obj, list):
        serialized = [serialize(x) for x in obj]
    elif isinstance(obj, dict):
        serialized = dict([(serialize(x), serialize(y)) for x, y in obj.items()])
    elif hasattr(obj, "__dict__"):
        serialized = serialize(vars(obj))
    else:
        return obj

    return serialized


def process_midi(midiFile):
    if isinstance(midiFile, str):
        filename = midiFile.rsplit("/", 1)[-1]
    else:
        filename = midiFile.filename

    filename = filename.rsplit(".", 1)
    title = filename[0]
    extension = filename[1].lower() if 1 < len(filename) else ""
    if extension not in ["mid", "midi", "kar"]:
        raise ValueError("Oops! Your file seems to have the wrong extension!")

    try:
        csv = midi_to_csv(midiFile)
    except Exception:
        raise ValueError("Oh no! There was a problem processing your MIDI file!")

    song = Song(title)
    tempo_map = TempoMap()
    rows = "".join(csv).splitlines()
    for i, row in enumerate(rows):
        cells = row.split(", ")
        event = cells[2]
        if event == "Header":
            tempo_map.ticks_per_quarter_note = int(cells[5])
        elif event == "Title_t" and (track := int(cells[0])) == 1:
            song.title = cells[3][1:-1]
        elif event == "Tempo":
            tick = int(cells[1])
            tempo = int(cells[3])
            tempo_map.add_tempo(tick, tempo)
        elif event == "Note_on_c" and (velocity := int(cells[5])) != 0:
            track_on = int(cells[0])
            tick_on = int(cells[1])
            pitch_on = int(cells[4])
            velocity_on = velocity
            for row in rows[i:]:
                cells = row.split(", ")
                event = cells[2]
                if (
                    (
                        (event == "Note_on_c" and (velocity := int(cells[5])) == 0)
                        or event == "Note_off_c"
                    )
                    and track_on == (track_off := int(cells[0]))
                    and pitch_on == (pitch_off := int(cells[4]))
                ):
                    tick_off = int(cells[1])
                    song.add_note(track_on, tick_on, tick_off, pitch_on, velocity_on, tempo_map)
                    break

    if not song.notes:
        raise ValueError("Uh oh! Looks like your MIDI file doesn't have any notes!")

    return serialize(song)
