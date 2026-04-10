/**
 * Observes host size and window pixel ratio; debounces via rAF coalescing.
 */
export class ResizeHandler {
  private observer?: ResizeObserver;
  private readonly onWindowResize = (): void => this.schedule();
  private raf = 0;

  constructor(
    private readonly host: HTMLElement,
    private readonly onResize: (width: number, height: number, pixelRatio: number) => void
  ) {}

  start(): void {
    this.observer = new ResizeObserver(() => this.schedule());
    this.observer.observe(this.host);
    window.addEventListener('resize', this.onWindowResize);
    this.schedule();
  }

  stop(): void {
    window.removeEventListener('resize', this.onWindowResize);
    this.observer?.disconnect();
    this.observer = undefined;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private schedule(): void {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => {
      const w = Math.max(1, this.host.clientWidth);
      const h = Math.max(1, this.host.clientHeight);
      const pr = Math.min(2, window.devicePixelRatio || 1);
      this.onResize(w, h, pr);
    });
  }
}
