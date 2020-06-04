from flask import Flask, request
from flask_talisman import Talisman
from midi_process import process_midi


app = Flask(__name__)

csp = {"default-src": "'self'", "media-src": "'self' data:"}
Talisman(app, content_security_policy=csp)

DEFAULT_MIDI_PATH = "sample-midi/happy-birthday-simplified.mid"


@app.route("/")
def route_root():
    return app.send_static_file("index.html")


@app.route("/process-midi", methods=["POST"])
def route_process_midi():
    try:
        file = request.files["midiFile"]
        name = file.filename
    except Exception:
        file = DEFAULT_MIDI_PATH
        name = file.split("/")[-1]
    title, notes = process_midi(file, name)
    return {"title": title, "notes": notes}
