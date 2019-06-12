import sys
import operator
import json
import midicsv


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
        self.duration = self.end - self.start


class TempoEvent:
    def __init__(self, tick, tempo, micros):
        self.tick = tick
        self.tempo = tempo
        self.micros = micros


class TempoMap:
    tpqn = 480  # ticks per quarter note
    tmap = []

    def addTempo(tick, tempo):
        tempoEvent = TempoEvent(tick, tempo, TempoMap.microsAtTick(tick))
        TempoMap.tmap.append(tempoEvent)

    def tempoEventAtTick(tick):
        savedTempoEvent = TempoEvent(0, 0, 0)
        for tempoEvent in TempoMap.tmap:
            if tempoEvent.tick > tick:
                break
            savedTempoEvent = tempoEvent
        return savedTempoEvent

    def microsAtTick(tick):
        tempoEvent = TempoMap.tempoEventAtTick(tick)
        return (
            tempoEvent.micros
            # TempoMap.microsAtTick(tempoEvent.tick)
            + ((tick - tempoEvent.tick) * tempoEvent.tempo) / TempoMap.tpqn
        )


file = sys.argv[1]
rows = []
if file.lower().endswith(("mid", "midi", "kar")):
    try:
        rows = midicsv.midi_to_csv(file).splitlines()
    except OSError:
        sys.exit("Couldn't open '" + file + "'.")
# elif file.lower().endswith(("mscx", "mscz")):
#     try:
#         tmpFile = "tmp-" + file + ".mid"
#         subprocess.call(
#             ["bash", "-c", "mscore " + file + " -o " + tmpFile + " &>/dev/null"]
#         )
#         rows = subprocess.check_output(["midicsv", tmpFile]).splitlines()
#         subprocess.call(["rm", tmpFile])
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
        TempoMap.addTempo(tick, tempo)
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
    if noteEvent_on.velocity == 0:
        continue
    for noteEvent_off in noteEvents[i:]:
        if (
            noteEvent_off.velocity != 0
            or noteEvent_off.track != noteEvent_on.track
            or noteEvent_off.pitch != noteEvent_on.pitch
        ):
            continue
        notes.append(Note(noteEvent_on, noteEvent_off))
        break

notes.sort(key=operator.attrgetter("start"))

notes = [vars(note) for note in notes]
print(json.dumps(notes))
