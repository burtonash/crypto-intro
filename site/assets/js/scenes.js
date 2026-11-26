// SceneStepper (PRD §7.3): an ordered list of scenes with a cursor and optional
// autoplay. Mode-agnostic; Stage drives it from the keyboard, Explore could
// drive it from buttons.

export class SceneStepper {
  constructor(ids, { start = 0, onChange = () => {}, durationOf = () => 4000, onState = () => {} } = {}) {
    this.onState = onState;
    this.ids = ids;
    this.index = Math.max(0, Math.min(ids.length - 1, start));
    this.onChange = onChange;
    this.durationOf = durationOf;
    this.playing = false;
    this.timer = null;
    this.remaining = 0;
    this.startedAt = 0;
  }

  get id() { return this.ids[this.index]; }
  get atEnd() { return this.index === this.ids.length - 1; }

  go(i) {
    const next = Math.max(0, Math.min(this.ids.length - 1, i));
    const changed = next !== this.index;
    this.index = next;
    this.finished = false;
    if (!this.playing) this.remaining = 0;
    this.onChange(this.id, this.index);
    if (this.playing) this._schedule(this.durationOf(this.id));
    return changed;
  }
  next() { return this.go(this.index + 1); }
  prev() { return this.go(this.index - 1); }
  reset() { this.pause(); this.go(0); }

  play() {
    if (this.playing) return;
    if (this.finished) this.go(0);
    this.playing = true;
    this._schedule(this.remaining > 0 ? this.remaining : this.durationOf(this.id));
    this.onState();
  }
  pause() {
    if (!this.playing) return;
    this.playing = false;
    clearTimeout(this.timer);
    this.remaining = Math.max(0, this.remaining - (performance.now() - this.startedAt));
    this.onState();
  }
  toggle() { this.playing ? this.pause() : this.play(); }

  _schedule(ms) {
    clearTimeout(this.timer);
    this.remaining = ms;
    this.startedAt = performance.now();
    this.timer = setTimeout(() => {
      this.remaining = 0;
      if (this.atEnd) { this.playing = false; this.finished = true; this.onState(); return; }
      this.next();
    }, ms);
  }
}
