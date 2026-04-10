export type TickFn = (deltaSeconds: number, elapsedSeconds: number) => void;

/**
 * Central rAF loop with capped delta for stability after tab switches.
 */
export class AnimationLoop {
  private rafId = 0;
  private lastTimeMs = 0;
  private readonly listeners = new Set<TickFn>();
  private running = false;

  add(fn: TickFn): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTimeMs = performance.now();
    const frame = (now: number): void => {
      if (!this.running) {
        return;
      }
      const rawDelta = (now - this.lastTimeMs) / 1000;
      this.lastTimeMs = now;
      const delta = Math.min(0.05, Math.max(0, rawDelta));
      const elapsed = now / 1000;
      for (const fn of this.listeners) {
        fn(delta, elapsed);
      }
      this.rafId = requestAnimationFrame(frame);
    };
    this.rafId = requestAnimationFrame(frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }
}
