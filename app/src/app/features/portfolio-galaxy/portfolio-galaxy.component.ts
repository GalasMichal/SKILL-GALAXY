import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, input } from '@angular/core';
import { Experience } from './engine/experience';
import type { PortfolioSkill } from './engine/portfolio-skill.model';

@Component({
  selector: 'app-portfolio-galaxy',
  standalone: true,
  templateUrl: './portfolio-galaxy.component.html',
  styleUrl: './portfolio-galaxy.component.scss'
})
export class PortfolioGalaxyComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;

  /** When unset, placeholder skills from `SkillSystem` are used */
  readonly skills = input<PortfolioSkill[] | undefined>(undefined);

  private experience?: Experience;

  ngAfterViewInit(): void {
    this.experience = new Experience(this.hostRef.nativeElement, this.skills());
    this.experience.start();
  }

  ngOnDestroy(): void {
    this.experience?.dispose();
    this.experience = undefined;
  }
}
