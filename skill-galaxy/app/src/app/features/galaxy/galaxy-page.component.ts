import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { SkillGraphService } from '../../core/data/skill-graph.service';
import { SkillGraph, SkillNode } from '../../core/models/skill-graph.model';
import * as THREE from 'three';

@Component({
  selector: 'app-galaxy-page',
  standalone: true,
  templateUrl: './galaxy-page.component.html',
  styleUrl: './galaxy-page.component.scss'
})
export class GalaxyPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true }) canvasHost!: ElementRef<HTMLDivElement>;

  private readonly skillGraphService = inject(SkillGraphService);

  protected graph: SkillGraph = { nodes: [], edges: [] };

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
  private renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  private animationFrameId = 0;

  async ngAfterViewInit(): Promise<void> {
    this.graph = await this.skillGraphService.getGraph();
    this.initThree();
    this.renderGraph(this.graph);
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
  }

  private initThree(): void {
    const host = this.canvasHost.nativeElement;
    this.renderer.setSize(host.clientWidth, host.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color('#05070d');
    this.camera.position.set(0, 0, 12);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const point = new THREE.PointLight(0x6ea8fe, 1.2, 40);
    point.position.set(4, 4, 10);

    this.scene.add(ambient, point);
  }

  private renderGraph(graph: SkillGraph): void {
    graph.edges.forEach((edge) => {
      const from = graph.nodes.find((node) => node.id === edge.fromNodeId);
      const to = graph.nodes.find((node) => node.id === edge.toNodeId);

      if (!from || !to) {
        return;
      }

      const points = [
        new THREE.Vector3(from.x, from.y, from.z),
        new THREE.Vector3(to.x, to.y, to.z)
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x5a6480, transparent: true, opacity: 0.75 });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
    });

    graph.nodes.forEach((node) => {
      const sphere = this.createNodeMesh(node);
      this.scene.add(sphere);
    });
  }

  private createNodeMesh(node: SkillNode): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.25 + node.level * 0.04, 18, 18);
    const material = new THREE.MeshStandardMaterial({
      color: this.getNodeColor(node.category),
      roughness: 0.35,
      metalness: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(node.x, node.y, node.z);
    return mesh;
  }

  private getNodeColor(category: SkillNode['category']): number {
    switch (category) {
      case 'frontend':
        return 0x4dabf7;
      case 'backend':
        return 0x63e6be;
      case 'devops':
        return 0xffd43b;
      case 'softskill':
        return 0xff8787;
      default:
        return 0xd0bfff;
    }
  }

  private animate = (): void => {
    this.scene.rotation.y += 0.0016;
    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
