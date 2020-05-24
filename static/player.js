class Player {
  constructor(instrument, events, songTime) {
    this.instrument = instrument;
    this.events = events;
    this.songTime = songTime;

    this._startTime;
    this._nextInterval;
    this._eventListeners = {};
  }

  get isPlaying() {
    return this._startTime !== undefined;
  }

  get playPercent() {
    if (this.isPlaying) {
      let audioContext = this.instrument.context;
      let playTime = audioContext.currentTime - this._startTime;
      return playTime / this.songTime * 100;
    }
    return undefined;
  }

  play(playTime) {
    const SCHEDULE_INTERVAL = 0.5;
    const TIME_TO_SCHEDULE = 0.1;
    const MILLIS_PER_SECOND = 1000;
    let audioContext = this.instrument.context;
    let nextPlayTime = playTime + SCHEDULE_INTERVAL;

    let eventsToSchedule = this.events.filter(event => playTime <= event.time && event.time < nextPlayTime);
    eventsToSchedule = JSON.parse(JSON.stringify(eventsToSchedule));    // Deep copy
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
    this._eventListeners[playerEvent] = callback;
  }

  _stopPlaying() {
    clearTimeout(this._nextInterval);
    this.instrument.stop();
    this._startTime = undefined;

    this._emitPlayerEvent("stopPlaying");
  }

  _emitPlayerEvent(playerEvent) {
    this._eventListeners[playerEvent]?.();
  }
}
