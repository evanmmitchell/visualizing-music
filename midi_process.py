import sys
from py_midicsv import midi_to_csv


class Note:
    def __init__(self, track, tick_on, tick_off, pitch, velocity):
        MICROS_PER_SECOND = 1000000
        MAX_VELOCITY = 127

        self.track = track
        self.start = TempoMap.micros_at_tick(tick_on) / MICROS_PER_SECOND
        self.end = TempoMap.micros_at_tick(tick_off) / MICROS_PER_SECOND
        self.pitch = pitch
        self.velocity = velocity / MAX_VELOCITY


class TempoEvent:
    def __init__(self, tick=0, tempo=500000, micros=0):
        self.tick = tick
        self.tempo = tempo
        self.micros = micros


class TempoMap:
    ticks_per_quarter_note = 480
    tempo_map = []

    @classmethod
    def add_tempo(cls, tick, tempo):
        tempo_event = TempoEvent(tick, tempo, cls.micros_at_tick(tick))
        cls.tempo_map.append(tempo_event)

    @classmethod
    def micros_at_tick(cls, tick):
        tempo_event_at_tick = TempoEvent()
        for tempo_event in cls.tempo_map:
            if tempo_event.tick > tick:
                break
            tempo_event_at_tick = tempo_event
        micros_offset = (
            (tick - tempo_event_at_tick.tick)
            / cls.ticks_per_quarter_note
            * tempo_event_at_tick.tempo
        )
        return tempo_event_at_tick.micros + micros_offset


def process_midi(file, name):
    rows = []
    if name.lower().endswith(("mid", "midi", "kar")):
        rows = "".join(midi_to_csv(file)).splitlines()
    # elif file.lower().endswith(("musicxml", "mxl", mscx", "mscz")):
    else:
        raise ValueError("Couldn't process " + name + " (invalid file extension).")

    title = ".".join(name.split(".")[:-1])  # Remove file extension

    notes = []
    for i, row in enumerate(rows):
        cells = row.split(", ")
        event = cells[2]
        if event == "Header":
            TempoMap.ticks_per_quarter_note = int(cells[5])
        elif event == "Title_t" and (track := int(cells[0])) == 1:
            title = cells[3][1:-1]
        elif event == "Tempo":
            tick = int(cells[1])
            tempo = int(cells[3])
            TempoMap.add_tempo(tick, tempo)
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
                    note = Note(track_on, tick_on, tick_off, pitch_on, velocity_on)
                    notes.append(note)
                    break

    return [title, [vars(note) for note in notes]]
