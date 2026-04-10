import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  input
} from '@angular/core';
import { Experience } from './engine/experience';
import type { PortfolioSkill } from './engine/portfolio-skill.model';
import { PortfolioDetailPanelComponent } from './portfolio-detail-panel/portfolio-detail-panel.component';
import { skillToPanelView } from './portfolio-panel.mapper';
import type { PortfolioPanelViewModel } from './portfolio-skill-detail.model';
import { pfLog } from './engine/portfolio-focus-debug';
import { SAMPLE_PORTFOLIO_SKILLS } from './sample-portfolio-skills';

/** Set to `true` locally to log focus ↔ panel in the console. */
const PANEL_FOCUS_TRACE = false;

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

  private readonly cdr = inject(ChangeDetectorRef);

  private experience?: Experience;
  private closePanelTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Single source of truth for “a sphere is focused” — same beat as `SkillSystem` / camera focus.
   * Panel visibility: `focusedSkillId !== null` (see template `[open]`).
   */
  focusedSkillId: string | null = null;

  displayModel: PortfolioPanelViewModel | null = null;

  ngAfterViewInit(): void {
    const data = this.skills() ?? SAMPLE_PORTFOLIO_SKILLS;
    this.experience = new Experience(
      this.hostRef.nativeElement,
      data,
      () => {},
      (id) => {
        this.onFocusId(id, data);
        // Zoneless apps: focus callbacks run from rAF (Three loop) — trigger CD so the panel binds.
        this.cdr.detectChanges();
      }
    );
    this.experience.start();
  }

  ngOnDestroy(): void {
    if (this.closePanelTimer) {
      clearTimeout(this.closePanelTimer);
      this.closePanelTimer = null;
    }
    this.experience?.dispose();
    this.experience = undefined;
  }

  onPanelDismiss(): void {
    this.experience?.clearSkillFocus();
  }

  private trace(message: string, detail?: unknown): void {
    if (!PANEL_FOCUS_TRACE) {
      return;
    }
    if (detail !== undefined) {
      console.log(`[portfolio-panel] ${message}`, detail);
    } else {
      console.log(`[portfolio-panel] ${message}`);
    }
  }

  private onFocusId(id: string | null, data: PortfolioSkill[]): void {
    this.trace('onFocusId', { id, focusedSkillId: this.focusedSkillId });

    if (this.closePanelTimer) {
      clearTimeout(this.closePanelTimer);
      this.closePanelTimer = null;
    }

    if (id !== null) {
      const skill = data.find((s) => s.id === id);
      if (!skill) {
        pfLog('onFocusId: unknown skill id — clearing 3D focus to resync', id);
        this.experience?.clearSkillFocus();
        return;
      }

      const wasOpen = this.focusedSkillId !== null;
      this.focusedSkillId = id;
      this.displayModel = skillToPanelView(skill);

      if (!wasOpen) {
        this.trace('panel open: true (focusedSkillId set)', { focusedSkillId: this.focusedSkillId });
      } else {
        this.trace('focus changed while panel open — model updated', { focusedSkillId: this.focusedSkillId });
      }
      return;
    }

    if (this.focusedSkillId !== null) {
      this.trace('panel open: false (focus cleared)', { hadFocusedSkillId: this.focusedSkillId });
    }
    this.focusedSkillId = null;
    this.trace('focusedSkillId after clear', this.focusedSkillId);

    this.closePanelTimer = setTimeout(() => {
      this.displayModel = null;
      this.closePanelTimer = null;
    }, PANEL_CLOSE_CONTENT_HOLD_MS);
  }
}
