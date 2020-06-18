class Player {
  constructor(instrument, song) {
    this.instrument = instrument;
    this.song = song;
  }

  get isPlaying() {
    return this._startTime != null;
  }

  get playTime() {
    if (!this.isPlaying) {
      return null;
    }

    let audioContext = this.instrument.context;
    return audioContext.currentTime - this._startTime;
  }

  get song() {
    return this._song;
  }

  set song(song) {
    if (this.isPlaying) {
      this.stop();
    }

    this._song = song;

    if (!song) {
      return;
    }

    this._events = [];
    for (let note of song.notes) {
      let event = { time: note.time, note: note.pitch, duration: note.duration, gain: note.velocity };
      this._events.push(event);
    }
  }

  get songTime() {
    return this.song?.endTime;
  }

  play(playTime) {
    if (!this.instrument || !this.song) {
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
    if (!this.instrument) {
      throw TypeError("An instrument is required to pause or stop");
    }

    clearTimeout(this._nextInterval);
    this.instrument.stop();
    this._startTime = null;
  }

  _emitPlayerEvent(playerEvent) {
    this._eventListeners[playerEvent]?.();
  }
}
