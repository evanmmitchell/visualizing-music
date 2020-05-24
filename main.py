import sys
import base64
from flask import Flask, request
from flask_talisman import Talisman
from midi_process import process_midi


app = Flask(__name__)

Talisman(app)

DEFAULT_MIDI_PATH = "sample-midi/happy-birthday-simplified.mid"


@app.route("/")
def root():
    return app.send_static_file("index.html")


@app.route("/process-midi", methods=["POST"])
def jsonify_midi():
    try:
        file = request.files["midiFile"]
        name = file.filename
        contents = file.read()
        file.seek(0)
    except Exception as e:
        # if app.debug:
        #     sys.stderr.write(str(e) + "\n")
        file = DEFAULT_MIDI_PATH
        name = DEFAULT_MIDI_PATH.split("/")[-1]
        with open(DEFAULT_MIDI_PATH, "rb") as input_file:
            contents = input_file.read()
    title, notes = process_midi(file, name)
    base64_contents = base64.b64encode(contents).decode("utf-8")
    return {"title": title, "notes": notes, "contents": base64_contents}
