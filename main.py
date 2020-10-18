from flask import Flask, request, send_from_directory
from flask_talisman import Talisman
from midi_process import process_midi


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


app = Flask(__name__, static_url_path="")

csp = {"default-src": "'self'", "media-src": "'self' data:"}
Talisman(app, content_security_policy=csp)

DEFAULT_SONG = process_midi("sample-midi/happy-birthday-simplified.mid")


@app.route("/")
def route_root():
    return app.send_static_file("index.html")


@app.route("/process-midi", methods=["POST"])
def route_process_midi():
    song = None
    exception = None

    if request.files:
        midiFile = request.files["midiFile"]
        try:
            song = process_midi(midiFile)
        except ValueError as ve:
            exception = str(ve)
    else:
        song = DEFAULT_SONG

    return {"song": serialize(song), "exception": exception}


@app.route("/sample-midi/<path:filename>")
def route_midi(filename):
    return send_from_directory("sample-midi", filename)
