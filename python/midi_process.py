import sys
from midicsv import midi_to_csv


class Note:
    def __init__(self, track, tick_on, tick_off, pitch, velocity):
        self.track = track
        self.start = TempoMap.microsAtTick(tick_on) / 1000000
        self.end = TempoMap.microsAtTick(tick_off) / 1000000
        self.duration = self.end - self.start
        self.pitch = pitch
        self.velocity = velocity

class TempoEvent:
    tick   = 0
    micros = 0
    tempo  = 500000

class TempoMap:
    tpqn = 480  # ticks per quarter note
    tmap = []

    @classmethod
    def addTempo(cls, tick, tempo):
        tempoEvent = TempoEvent()
        tempoEvent.tick = tick
        tempoEvent.tempo = tempo
        tempoEvent.micros = cls.microsAtTick(tick)
        cls.tmap.append(tempoEvent)

    @classmethod
    def tempoEventAtTick(cls, tick):
        savedTempoEvent = TempoEvent()
        for tempoEvent in cls.tmap:
            if tempoEvent.tick > tick:
                break
            savedTempoEvent = tempoEvent
        return savedTempoEvent

    @classmethod
    def microsAtTick(cls, tick):
        tempoEvent = cls.tempoEventAtTick(tick)
        return tempoEvent.micros + ((tick - tempoEvent.tick) * tempoEvent.tempo) / cls.tpqn


def process_midi(file, name):
    rows = []
    if name.lower().endswith(("mid", "midi", "kar")):
        rows = midi_to_csv(file).splitlines()
    # elif file.lower().endswith(("musicxml", "mxl", mscx", "mscz")):
    else:
        raise ValueError("Couldn't process " + name + " (invalid file extension).")

    notes = []
    title = ".".join(name.split(".")[:-1])  # Remove file extension
    for i, row in enumerate(rows):
        cells = row.split(", ")
        event = cells[2]
        if event == "Header":
            TempoMap.tpqn = int(cells[5])
        elif event == "Title_t":
            title = cells[3][1:-1]
        elif event == "Tempo":
            tick = int(cells[1])
            tempo = int(cells[3])
            TempoMap.addTempo(tick, tempo)
        elif event == "Note_on_c":
            velocity = int(cells[5])
            if velocity != 0:
                track_on = int(cells[0])
                tick_on = int(cells[1])
                pitch_on = int(cells[4])
                velocity_on = velocity
                for row in rows[i:]:
                    cells = row.split(", ")
                    event = cells[2]
                    if event == "Note_on_c" or event == "Note_off_c":
                        velocity = 0 if event == "Note_off_c" else int(cells[5])
                        if velocity == 0:
                            track_off = int(cells[0])
                            tick_off = int(cells[1])
                            pitch_off = int(cells[4])
                            if track_on == track_off and pitch_on == pitch_off:
                                track = track_on
                                pitch = pitch_on
                                velocity = velocity_on
                                note = Note(track, tick_on, tick_off, pitch, velocity)
                                notes.append(note)
                                break

    notes = [vars(note) for note in notes]
    return [title, notes]
