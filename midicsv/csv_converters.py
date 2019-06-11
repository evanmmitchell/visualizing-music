### System ###
import re

### Local ###
from .midi.events import *


def text_decode(text):
    decoded = text
    for octc in re.findall(r"\\(\d{3})", decoded):
        decoded = decoded.replace(r"\%s" % octc, chr(int(octc, 8)))
    return decoded


def to_NoteOffEvent(track, time, identifier, line):
    channel, pitch, velocity = map(int, line)
    return NoteOffEvent(tick=time, channel=channel, pitch=pitch, velocity=velocity)


def to_NoteOnEvent(track, time, identifier, line):
    channel, pitch, velocity = map(int, line)
    return NoteOnEvent(tick=time, channel=channel, pitch=pitch, velocity=velocity)


def to_AfterTouchEvent(track, time, identifier, line):
    cannel, value = map(int, line)
    return AfterTouchEvent(tick=time, channel=channel, value=value)


def to_ControlChangeEvent(track, time, identifier, line):
    channel, control, value = map(int, line)
    return ControlChangeEvent(tick=time, channel=channel, control=control, value=value)


def to_ProgramChangeEvent(track, time, identifier, line):
    channel, value = map(int, line)
    return ProgramChangeEvent(tick=time, channel=channel, value=value)


def to_ChannelAfterTouchEvent(track, time, identifier, line):
    channel, value = map(int, line)
    return ChannelAfterTouchEvent(tick=time, channel=channel, value=value)


def to_PitchWheelEvent(track, time, identifier, line):
    channel, value = map(int, line)
    return PitchWheelEvent(tick=time, channel=channel, pitch=value - 0x2000)


def to_SequenceNumberMetaEvent(track, time, identifier, line):
    value = int(line[0])
    return SequenceNumberMetaEvent(tick=time, value=value)


def to_ProgramNameEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return ProgramNameEvent(tick=time, data=text)


def to_TextMetaEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return TextMetaEvent(tick=time, data=text)


def to_CopyrightMetaEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return CopyrightMetaEvent(tick=time, data=text)


def to_TrackNameEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return TrackNameEvent(tick=time, data=text)


def to_InstrumentNameEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return InstrumentNameEvent(tick=time, data=text)


def to_LyricsEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return LyricsEvent(tick=time, data=text)


def to_MarkerEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return MarkerEvent(tick=time, data=text)


def to_CuePointEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return CuePointEvent(tick=time, data=text)


def to_ChannelPrefixEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return ChannelPrefixEvent(tick=time, data=text)


def to_PortEvent(track, time, identifier, line):
    text = text_decode(line[0]).encode()
    return PortEvent(tick=time, text=text)


def to_EndOfTrackEvent(track, time, identifier, line):
    return EndOfTrackEvent(tick=time)


def to_DeviceNameEvent(track, time, identifier, line):
    return DeviceNameEvent(tick=time)


def to_TrackLoopEvent(track, time, identifier, line):
    return TrackLoopEvent(tick=time)


def to_SetTempoEvent(track, time, identifier, line):
    mpqn = int(line[0])
    return SetTempoEvent(tick=time, mpqn=mpqn)


def to_SmpteOffsetEvent(track, time, identifier, line):
    return SmpteOffsetEvent(tick=time)


def to_TimeSignatureEvent(track, time, identifier, line):
    num, denom, click, notesq = map(int, line)
    return TimeSignatureEvent(tick=time, numerator=num, denominator=denom, metronome=click, thirtyseconds=notesq)


def to_KeySignatureEvent(track, time, identifier, line):
    key, major = int(line[0]), False if line[1] == "major" else True
    return KeySignatureEvent(tick=time, alternatives=key, minor=major)


def to_SequencerSpecificEvent(track, time, identifier, line):
    length, text = int(line[0]), text_decode(line[1]).encode()
    return SequencerSpecificEvent(tick=time, data=text)


def to_SysexEvent(track, time, identifier, line):
    length, data = int(line[0]), [int(item) for item in line[1:]]
    return SysexEvent(tick=time, data=data)
