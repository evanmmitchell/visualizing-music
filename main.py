from json import JSONEncoder
from flask import Flask, jsonify, request, send_from_directory
from flask_talisman import Talisman
from midi_process import process_midi


DEFAULT_SONG = process_midi("sample-midi/happy-birthday-simplified.mid")


class ObjectJSONEncoder(JSONEncoder):
    def default(self, o):
        try:
            return vars(o)
        except:
            return super().default(o)


app = Flask(__name__, static_url_path="")

app.json_encoder = ObjectJSONEncoder

csp = {"default-src": "'self'", "media-src": "'self' data:"}
Talisman(app, content_security_policy=csp)


@app.route("/")
def route_root():
    return app.send_static_file("index.html")


@app.post("/process-midi")
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

    return jsonify(song=song, exception=exception)


@app.route("/sample-midi/<path:filename>")
def route_sample_midi(filename):
    return send_from_directory("sample-midi", filename)
