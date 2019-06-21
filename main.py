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
    file = request.get_data().decode("UTF-8")
    notes = process_midi(file)
    return jsonify(notes)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8888, debug=True)
