### Local ###
from .midi.events import *


def text_encode(text):
    encoded = ""
    for character in text:
        if (ord(character) < 32) or (ord(character) > 128):
            for byte in character.encode("utf8"):
                encoded += "\\{:03o}".format(byte)
        else:
            encoded += character
    return encoded


def write_event(track, time, identifier, data):
    return ("{}, {}, {}" + (", {}" * len(data)) + "\n").format(track, time, identifier, *data)


def from_NoteOffEvent(track, time, event):
    return write_event(track, time, "Note_off_c", [event.channel, *event.data])


def from_NoteOnEvent(track, time, event):
    return write_event(track, time, "Note_on_c", [event.channel, *event.data])


def from_AfterTouchEvent(track, time, event):
    return write_event(track, time, "Poly_aftertouch_c", [event.channel, *event.data])


def from_ControlChangeEvent(track, time, event):
    return write_event(track, time, "Control_c", [event.channel, *event.data])


def from_ProgramChangeEvent(track, time, event):
    return write_event(track, time, "Program_c", [event.channel, *event.data])


def from_ChannelAfterTouchEvent(track, time, event):
    return write_event(track, time, "Channel_aftertouch_c", [event.channel, event.data[0]])


def from_PitchWheelEvent(track, time, event):
    return write_event(track, time, "Pitch_bend_c", [event.channel, (event.data[0] | (event.data[1] << 7))])


def from_SequenceNumberMetaEvent(track, time, event):
    return write_event(track, time, "Sequence_number", [((event.data[0] << 8) | event.data[1])])


def from_ProgramNameEvent(track, time, event):
    return write_event(track, time, "Program_name_t", ['"{}"'.format(text_encode(event.text))])


def from_TextMetaEvent(track, time, event):
    return write_event(track, time, "Text_t", ['"{}"'.format(text_encode(event.text))])


def from_CopyrightMetaEvent(track, time, event):
    return write_event(track, time, "Copyright_t", ['"{}"'.format(text_encode(event.text))])


def from_TrackNameEvent(track, time, event):
    return write_event(track, time, "Title_t", ['"{}"'.format(text_encode(event.text))])


def from_InstrumentNameEvent(track, time, event):
    return write_event(track, time, "Instrument_name_t", ['"{}"'.format(text_encode(event.text))])


def from_LyricsEvent(track, time, event):
    return write_event(track, time, "Lyric_t", ['"{}"'.format(text_encode(event.text))])


def from_MarkerEvent(track, time, event):
    return write_event(track, time, "Marker_t", ['"{}"'.format(text_encode(event.text))])


def from_CuePointEvent(track, time, event):
    return write_event(track, time, "Cue_point_t", ['"{}"'.format(text_encode(event.text))])


def from_ChannelPrefixEvent(track, time, event):
    return write_event(track, time, "Channel_prefix", [*event.data])


def from_PortEvent(track, time, event):
    return write_event(track, time, "MIDI_port", [*event.data] if event.data else [0])


def from_EndOfTrackEvent(track, time, event):
    return write_event(track, time, "End_track", [])


def from_DeviceNameEvent(track, time, event):
    return write_event(track, time, "Device_name", [])


def from_TrackLoopEvent(track, time, event):
    return write_event(track, time, "Loop_track", [])


def from_SetTempoEvent(track, time, event):
    return write_event(track, time, "Tempo", [event.get_mpqn()])


def from_SmpteOffsetEvent(track, time, event):
    return write_event(track, time, "SMPTE_offset", [*event.data])


def from_TimeSignatureEvent(track, time, event):
    return write_event(track, time, "Time_signature", [*event.data])


def from_KeySignatureEvent(track, time, event):
    return write_event(track, time, "Key_signature", [event.get_alternatives(), '"major"' if len(event.data) > 1 and event.data[1] == 0 else '"minor"'])


def from_SequencerSpecificEvent(track, time, event):
    return write_event(track, time, "Sequencer_specific", [len(event.data), *event.data])


def from_SysexEvent(track, time, event):
    return write_event(track, time, "System_exclusive", [len(event.data), *event.data])
