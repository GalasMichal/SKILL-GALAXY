import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import type { PortfolioPanelViewModel } from '../portfolio-skill-detail.model';

@Component({
  selector: 'app-portfolio-detail-panel',
  standalone: true,
  templateUrl: './portfolio-detail-panel.component.html',
  styleUrl: './portfolio-detail-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioDetailPanelComponent {
  /** Drives visibility animation — content may linger briefly via parent `model`. */
  readonly open = input(false);
  readonly model = input<PortfolioPanelViewModel | null>(null);

  readonly dismiss = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.dismiss.emit();
    }
  }

  /**
   * Use pointerup, not click: after touch/pointer on the canvas, browsers may synthesize a click
   * on the topmost element under the finger once the panel/backdrop appears — which would
   * immediately dismiss and clear sphere focus.
   */
  onBackdropPointerUp(event: PointerEvent): void {
    if (!this.open()) {
      return;
    }
    if (!event.isPrimary) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (event.target !== event.currentTarget) {
      return;
    }
    this.dismiss.emit();
  }
}
