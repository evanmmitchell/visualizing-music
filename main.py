import sys
from flask import Flask, request, jsonify
import base64

sys.path.append("./python")
from midi_process import process_midi


app = Flask(__name__)
DEFAULT_MIDI_PATH = "sample-midi/happy-birthday-simplified.mid"


@app.route("/")
def root():
    return app.send_static_file("index.html")


@app.route("/process-midi", methods=["POST"])
def jsonify_midi():
    try:
        file = request.files["midiFile"]
        name = file.filename
        title, notes = process_midi(file, name)
    except Exception as e:
        # sys.stderr.write(str(e) + "\n")
        file = DEFAULT_MIDI_PATH
        name = DEFAULT_MIDI_PATH.split("/")[-1]
        title, notes = process_midi(file, name)
    return jsonify(title, notes)


@app.route("/player-midi", methods=["POST"])
def player_midi():
    try:
        file = request.files["midiFile"]
        contents = file.read()
    except Exception as e:
        with open(DEFAULT_MIDI_PATH, 'rb') as file:
            contents = file.read()
    return base64.b64encode(contents)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8888, debug=True)
