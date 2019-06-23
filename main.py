import sys

from flask import Flask, request, jsonify

sys.path.append("./python")
from midi_process import process_midi


app = Flask(__name__)


@app.route("/")
def root():
    return app.send_static_file("index.html")


@app.route("/process-midi", methods=["POST"])
def jsonify_midi():
    try:
        file = request.files["midiFile"]
        name = file.filename
    except:
        file = "sample-midi/happy-birthday-simplified.mid"
        name = "happy-birthday-simplified.mid"
    title, notes = process_midi(file, name)
    return jsonify(title, notes)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8888, debug=True)
