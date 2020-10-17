class Player extends EventTarget {
  constructor(instrument, song, onready) {
    super();

    this.instrument = instrument;
    this.song = song;
    this.addEventListener("ready", onready);
  }

  get instrument() {
    return this._instrument;
  }

  set instrument(instrument) {
    (async () => {
      this._instrument = await instrument;

      if (this.isReady) {
        this.dispatchEvent(new Event("ready"));
      }
    })();
  }

  get song() {
    return this._song;
  }

  set song(song) {
    this.stop();

    this._song = song;

    if (this.isReady) {
      this.dispatchEvent(new Event("ready"));
    }
  }

  get isPlaying() {
    return this._startTime != null;
  }

  get isReady() {
    return this.instrument != null && this.song != null;
  }

  get playTime() {
    if (!this.isPlaying) {
      return null;
    }

    let audioContext = this.instrument.context;
    return audioContext.currentTime - this._startTime;
  }

  get songTime() {
    return this.song?.endTime;
  }

  play(playTime) {
    if (!this.isReady) {
      throw TypeError("Both an instrument and a song are required to play");
    }

    const SCHEDULE_INTERVAL = 0.5;
    const TIME_TO_SCHEDULE = 0.1;
    const MILLIS_PER_SECOND = 1000;
    let audioContext = this.instrument.context;
    let nextPlayTime = playTime + SCHEDULE_INTERVAL;

    let notesToSchedule = this.song.notes.filter(note => playTime <= note.time && note.time < nextPlayTime);
    notesToSchedule = JSON.parse(JSON.stringify(notesToSchedule));  // Deep copy
    notesToSchedule.forEach(note => note.time -= playTime);

    if (!this.isPlaying) {
      this._startTime = audioContext.currentTime - playTime;
    }
    this.instrument.schedule(this._startTime + playTime, notesToSchedule);

    if (nextPlayTime < this.songTime) {
      this._nextInterval = setTimeout(() => this.play(nextPlayTime), (SCHEDULE_INTERVAL - TIME_TO_SCHEDULE) * MILLIS_PER_SECOND);
    } else {
      let endTime = this._startTime + this.songTime;
      this._nextInterval = setTimeout(() => this.stop(), (endTime - audioContext.currentTime) * MILLIS_PER_SECOND);
    }

    this.dispatchEvent(new Event("play"));
  }

  pause() {
    this._stopPlaying();

    this.dispatchEvent(new Event("pause"));
  }

  stop() {
    this._stopPlaying();

    this.dispatchEvent(new Event("stop"));
  }

  _stopPlaying() {
    clearTimeout(this._nextInterval);
    this.instrument?.stop();
    this._startTime = null;
  }
}
