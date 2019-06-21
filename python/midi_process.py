import sys

from midicsv import midi_to_csv


class NoteEvent:
    def __init__(self, track, tick, pitch, velocity):
        self.track = track
        self.tick = tick
        self.pitch = pitch
        self.velocity = velocity


class Note:
    def __init__(self, noteEvent_on, noteEvent_off):
        self.track = noteEvent_on.track
        self.start = TempoMap.microsAtTick(noteEvent_on.tick) / 1000000
        self.end = TempoMap.microsAtTick(noteEvent_off.tick) / 1000000
        self.pitch = noteEvent_on.pitch
        self.velocity = noteEvent_on.velocity


class TempoEvent:
    def __init__(self, tick, tempo):
        self.tick = tick
        self.tempo = tempo


class TempoMap:
    tpqn = 480  # ticks per quarter note
    tmap = []

    def tempoEventAtTick(tick):
        savedTempoEvent = TempoEvent(0, 500000)
        for tempoEvent in TempoMap.tmap:
            if tempoEvent.tick > tick:
                break
            savedTempoEvent = tempoEvent
        return savedTempoEvent

    def microsAtTick(tick):
        if tick == 0:
            return 0
        tempoEvent = TempoMap.tempoEventAtTick(tick)
        return (
            TempoMap.microsAtTick(tempoEvent.tick)
            + (tick - tempoEvent.tick) * tempoEvent.tempo / TempoMap.tpqn
        )


def process_midi(file):
    rows = []
    if file.lower().endswith(("mid", "midi", "kar")):
        try:
            rows = midi_to_csv(file).splitlines()
        except OSError:
            sys.exit("Couldn't open '" + file + "'.")
    # elif file.lower().endswith(("musicxml", "mxl", mscx", "mscz")):
    #     try:
    #
    #     except OSError:
    #         sys.exit("Couldn't open '" + file + "'.")
    else:
        sys.exit("Couldn't process " + file + " (invalid file extension).")

    noteEvents = []
    for i, row in enumerate(rows):
        cells = row.split(", ")
        track = int(cells[0])
        tick = int(cells[1])
        event = cells[2]
        if event == "Header":
            TempoMap.tpqn = int(cells[5])
        elif event == "Tempo":
            tempo = int(cells[3])
            TempoMap.tmap.append(TempoEvent(tick, tempo))
        elif event == "Note_on_c":
            pitch = int(cells[4])
            velocity = int(cells[5])
            noteEvents.append(NoteEvent(track, tick, pitch, velocity))
        elif event == "Note_off_c":
            pitch = int(cells[4])
            velocity = 0
            noteEvents.append(NoteEvent(track, tick, pitch, velocity))

    notes = []
    for i, noteEvent_on in enumerate(noteEvents):
        for noteEvent_off in noteEvents[i:]:
            if (
                noteEvent_on.velocity != 0
                and noteEvent_off.velocity == 0
                and noteEvent_on.track == noteEvent_off.track
                and noteEvent_on.pitch == noteEvent_off.pitch
            ):
                notes.append(Note(noteEvent_on, noteEvent_off))
                break

    notes = [vars(note) for note in notes]
    return notes
