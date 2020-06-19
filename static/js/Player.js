class Player {
  constructor(instrument, song, onready) {
    this.instrument = instrument;
    this.song = song;
    this.on("ready", onready);
  }

  get instrument() {
    return this._instrument;
  }

  set instrument(instrument) {
    (async () => {
      this._instrument = await instrument;

      if (this.isReady) {
        this._emitPlayerEvent("ready");
      }
    })();
  }

  get song() {
    return this._song;
  }

  set song(song) {
    this.stop();

    this._song = null;

    if (song?.notes) {
      this._events = [];
      for (let note of song.notes) {
        let event = { time: note.time, note: note.pitch, duration: note.duration, gain: note.velocity };
        this._events.push(event);
      }
    }

    this._song = song;

    if (this.isReady) {
      this._emitPlayerEvent("ready");
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

    let eventsToSchedule = this._events.filter(event => playTime <= event.time && event.time < nextPlayTime);
    eventsToSchedule = JSON.parse(JSON.stringify(eventsToSchedule));  // Deep copy
    eventsToSchedule.forEach(event => event.time -= playTime);
    this._startTime = this._startTime ?? audioContext.currentTime - playTime;
    this.instrument.schedule(this._startTime + playTime, eventsToSchedule);

    if (nextPlayTime < this.songTime) {
      this._nextInterval = setTimeout(() => this.play(nextPlayTime), (SCHEDULE_INTERVAL - TIME_TO_SCHEDULE) * MILLIS_PER_SECOND);
    } else {
      let endTime = this._startTime + this.songTime;
      this._nextInterval = setTimeout(() => this.stop(), (endTime - audioContext.currentTime) * MILLIS_PER_SECOND);
    }

    this._emitPlayerEvent("play");
  }

  pause() {
    this._stopPlaying();

    this._emitPlayerEvent("pause");
  }

  stop() {
    this._stopPlaying();

    this._emitPlayerEvent("stop");
  }

  on(playerEvent, callback) {
    if (!this._eventListeners) {
      this._eventListeners = {};
    }
    this._eventListeners[playerEvent] = callback;
  }

  _stopPlaying() {
    clearTimeout(this._nextInterval);
    this.instrument?.stop();
    this._startTime = null;
  }

  _emitPlayerEvent(playerEvent) {
    this._eventListeners?.[playerEvent]?.();
  }
}
