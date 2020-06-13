from flask import Flask, request
from flask_talisman import Talisman
from midi_process import process_midi


app = Flask(__name__)

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

    return {"song": song, "exception": exception}
