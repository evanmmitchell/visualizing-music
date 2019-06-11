### System ###
from io import StringIO

### Local ###
from .events import midi_to_csv_map
from .midi.fileio import read_midifile


def parse(file):
    """Parses a MIDI file into CSV format.

    Args:
        file: A string giving the path to a file on disk or an open file-like object.

    Returns:
        A list of strings, with each string containing one atomic MIDI command
        in CSV format.

        ["0, 0, Header, 1, 1, 480",
         "1, 0, Start_track",
         "1, 0, Tempo, 500000"]
    """
    csv_file = []
    pattern = read_midifile(file)
    csv_file.append("0, 0, Header, {}, {}, {}\n".format(pattern.format, len(pattern), pattern.resolution))
    for index, track in enumerate(pattern):
        csv_file.append("{}, {}, Start_track\n".format(index + 1, 0))
        abstime = 0
        for event in track:
            abstime += event.tick
            csv_file.append(midi_to_csv_map[type(event)](index + 1, abstime, event))
    csv_file.append("0, 0, End_of_file")
    return csv_file
