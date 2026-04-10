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

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dismiss.emit();
    }
  }
}
