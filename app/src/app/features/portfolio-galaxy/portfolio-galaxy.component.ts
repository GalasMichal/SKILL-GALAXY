import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  input
} from '@angular/core';
import { CAMERA_FOCUS_PRE_ROLL_MS } from './engine/camera-focus-manager';
import { Experience } from './engine/experience';
import type { PortfolioSkill } from './engine/portfolio-skill.model';
import { PortfolioDetailPanelComponent } from './portfolio-detail-panel/portfolio-detail-panel.component';
import { skillToPanelView } from './portfolio-panel.mapper';
import type { PortfolioPanelViewModel } from './portfolio-skill-detail.model';
import { pfLog } from './engine/portfolio-focus-debug';
import { SAMPLE_PORTFOLIO_SKILLS } from './sample-portfolio-skills';

/** Panel enters when camera motion starts — same beat as `CameraFocusManager` pre-roll end. */
const PANEL_OPEN_DELAY_MS = CAMERA_FOCUS_PRE_ROLL_MS;
/** Keep content mounted until slide/fade completes (`$dur-panel` in panel SCSS + small buffer). */
const PANEL_CLOSE_CONTENT_HOLD_MS = 400;

@Component({
  selector: 'app-portfolio-galaxy',
  standalone: true,
  imports: [PortfolioDetailPanelComponent],
  templateUrl: './portfolio-galaxy.component.html',
  styleUrl: './portfolio-galaxy.component.scss'
})
export class PortfolioGalaxyComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;

  /** When unset, placeholder skills from sample config are used */
  readonly skills = input<PortfolioSkill[] | undefined>(undefined);

  private readonly zone = inject(NgZone);

  private experience?: Experience;
  private closePanelTimer: ReturnType<typeof setTimeout> | null = null;
  private openPanelTimer: ReturnType<typeof setTimeout> | null = null;

  /** Visible panel state — animated open/close */
  panelOpen = false;
  /** Content can outlive `panelOpen` briefly for exit motion */
  displayModel: PortfolioPanelViewModel | null = null;

  ngAfterViewInit(): void {
    const data = this.skills() ?? SAMPLE_PORTFOLIO_SKILLS;
    this.experience = new Experience(
      this.hostRef.nativeElement,
      data,
      () => {},
      (id) => this.zone.run(() => this.onFocusId(id, data))
    );
    this.experience.start();
  }

  ngOnDestroy(): void {
    if (this.closePanelTimer) {
      clearTimeout(this.closePanelTimer);
      this.closePanelTimer = null;
    }
    if (this.openPanelTimer) {
      clearTimeout(this.openPanelTimer);
      this.openPanelTimer = null;
    }
    this.experience?.dispose();
    this.experience = undefined;
  }

  onPanelDismiss(): void {
    this.experience?.clearSkillFocus();
  }

  private onFocusId(id: string | null, data: PortfolioSkill[]): void {
    if (this.closePanelTimer) {
      clearTimeout(this.closePanelTimer);
      this.closePanelTimer = null;
    }
    if (this.openPanelTimer) {
      clearTimeout(this.openPanelTimer);
      this.openPanelTimer = null;
    }

    if (id !== null) {
      const skill = data.find((s) => s.id === id);
      if (!skill) {
        pfLog('onFocusId: unknown skill id — clearing 3D focus to resync', id);
        this.experience?.clearSkillFocus();
        return;
      }
      this.displayModel = skillToPanelView(skill);
      if (this.panelOpen) {
        pfLog('panel already open — updating model only', id);
        return;
      }
      this.openPanelTimer = setTimeout(() => {
        this.panelOpen = true;
        pfLog('panel open: true', id);
        this.openPanelTimer = null;
      }, PANEL_OPEN_DELAY_MS);
      return;
    }

    pfLog('panel open: false');
    this.panelOpen = false;
    this.closePanelTimer = setTimeout(() => {
      this.displayModel = null;
      this.closePanelTimer = null;
    }, PANEL_CLOSE_CONTENT_HOLD_MS);
  }
}
