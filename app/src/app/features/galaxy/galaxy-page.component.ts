import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { SkillGraphService } from '../../core/data/skill-graph.service';
import { SkillEdge, SkillGraph, SkillNode } from '../../core/models/skill-graph.model';
import { GENERAL_GRAPH } from '../../core/data/general-graph';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
  VignetteEffect
} from 'postprocessing';
import { N8AOPostPass } from 'n8ao';
import {
  collectRequiresPrerequisiteIds,
  getNextQuestNodes,
  getQuestVisualState,
  questProgressCounts,
  type QuestNodeVisualState
} from './quest-mode';
import {
  createAmbientDustPoints,
  createHeroNexusGroup,
  updateAmbientDustUniforms,
  updateHeroNexusVisual
} from './galaxy-vfx';
import { applyPlanetQuestVisual, createPlanetShaderMaterial, type PlanetUniformsHandle } from './galaxy-planets';
import { applyGltfQuestVisual } from './galaxy-gltf-materials';
import { createHelmetParticlePoints, updateHelmetParticles } from './galaxy-helmet';
import { createSkillGateVfx, updateSkillGate } from './galaxy-skill-gate';
import { PlanetGltfService } from './planet-gltf.service';
import { createEdgeBeamGroup } from './galaxy-edge-beams';
import { GALAXY_PRESETS, type GalaxyVisualPreset, presetCosmicWarm } from './galaxy-visual-presets';
import { environment } from '../../../environments/environment';

/** Energie-Strang + optional Fluss-Partikel */
type EdgeVisual = {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  relation: SkillEdge['relation'];
  beamGroup: THREE.Group;
  beamOuter: THREE.Mesh;
  beamInner: THREE.Mesh;
  flowMesh?: THREE.Mesh;
  flowT: number;
  flowSpeed: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
};

@Component({
  selector: 'app-galaxy-page',
  standalone: true,
  templateUrl: './galaxy-page.component.html',
  styleUrl: './galaxy-page.component.scss'
})
export class GalaxyPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasHost', { static: true }) canvasHost!: ElementRef<HTMLDivElement>;

  private readonly skillGraphService = inject(SkillGraphService);
  private readonly planetGltf = inject(PlanetGltfService);
  private readonly cdr = inject(ChangeDetectorRef);

  // --- Template state ---
  protected graph: SkillGraph = { nodes: [], edges: [] };
  protected readonly categories: Array<SkillNode['category'] | 'all'> = [
    'all',
    'frontend',
    'backend',
    'devops',
    'softskill'
  ];
  protected activeCategory: SkillNode['category'] | 'all' = 'all';
  protected selectedNode: SkillNode | null = null;
  protected hoveredNode: SkillNode | null = null;
  protected dataSource: 'supabase' | 'sample' | 'demo' = 'sample';
  protected useDemoGraph = true;
  protected tooltipX = 0;
  protected tooltipY = 0;

  protected questTargetId: string | null = null;
  protected questCompleted = new Set<string>();
  protected introTime = 0;
  protected pulsePhase = 0;
  /** Drei Galaxie-Looks — in der Toolbar umschalten */
  protected readonly galaxyVisualPresets = GALAXY_PRESETS;
  protected activeVisualPreset: GalaxyVisualPreset = presetCosmicWarm;

  // --- Three.js core ---
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
  private renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  private labelRenderer = new CSS2DRenderer();
  private composer?: EffectComposer;
  private n8aoPass?: N8AOPostPass;
  private controls?: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  // --- Graph objects ---
  private nodeGroups = new Map<string, THREE.Group>();
  private nodeLabels = new Map<string, CSS2DObject>();
  private edgeVisuals: EdgeVisual[] = [];
  private starFields: THREE.Points[] = [];
  private nebulaLayers: THREE.Mesh[] = [];
  private ambientLight?: THREE.AmbientLight;
  private keyLight?: THREE.DirectionalLight;
  private fillLight?: THREE.DirectionalLight;
  private rimLight?: THREE.PointLight;
  private heroNexus?: THREE.Group;
  private ambientDust?: THREE.Points;
  private visibilityHandler = () => {
    this.animPaused = document.hidden;
  };
  private animPaused = false;
  private destroyed = false;
  private questPathEdgeCache: Set<string> | null = null;
  private lastHoveredId: string | null = null;
  private pointerTooltipCdrRaf = 0;
  private readonly introTargetVec = new THREE.Vector3();
  private readonly introStartCam = new THREE.Vector3(3.5, 18, 44);
  private readonly introEndCam = new THREE.Vector3(0, 2.35, 16.8);
  private readonly flyToTargetVec = new THREE.Vector3();
  private readonly skillGatePos = new THREE.Vector3();
  private heroHovered = false;
  private heroDissolve = 0;
  private skillGateGroup?: THREE.Group;
  private skillGateIntensity = 0;

  private animationFrameId = 0;
  private resizeHandler = () => this.onResize();
  protected sourceGraph: SkillGraph = { nodes: [], edges: [] };
  private lastFrameMs = performance.now();

  async ngAfterViewInit(): Promise<void> {
    this.initSceneSubsystem();
    this.initPostSubsystem();
    this.initInteractionSubsystem();
    if (environment.useGltfPlanetMeshes) {
      await this.planetGltf.preload();
    }
    await this.loadGraphSubsystem();
    if (this.destroyed) {
      return;
    }
    this.animate();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.pointerTooltipCdrRaf !== 0) {
      cancelAnimationFrame(this.pointerTooltipCdrRaf);
      this.pointerTooltipCdrRaf = 0;
    }
    cancelAnimationFrame(this.animationFrameId);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.disposeSkillGateVfx();
    this.clearGraphObjects();
    this.controls?.dispose();
    this.composer?.dispose();
    this.disposeHeroAndDust();
    this.disposeCosmicBackground();
    this.disposeSceneLights();
    this.scene.fog = null;
    this.scene.background = null;
    this.renderer.dispose();
    this.labelRenderer.domElement.remove();
    this.canvasHost.nativeElement.removeEventListener('pointerdown', this.onCanvasPointerDown);
    this.canvasHost.nativeElement.removeEventListener('pointermove', this.onCanvasPointerMove);
    this.canvasHost.nativeElement.removeEventListener('pointerleave', this.onCanvasPointerLeave);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private disposeCosmicBackground(): void {
    this.nebulaLayers.forEach((mesh) => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      this.scene.remove(mesh);
    });
    this.nebulaLayers = [];
    this.starFields.forEach((pts) => {
      pts.geometry.dispose();
      (pts.material as THREE.Material).dispose();
      this.scene.remove(pts);
    });
    this.starFields = [];
  }

  private disposeSkillGateVfx(): void {
    if (!this.skillGateGroup) {
      return;
    }
    this.skillGateGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
    this.scene.remove(this.skillGateGroup);
    this.skillGateGroup = undefined;
  }

  private disposeSceneLights(): void {
    const lights: (THREE.Light | undefined)[] = [this.ambientLight, this.keyLight, this.fillLight, this.rimLight];
    for (const light of lights) {
      if (light) {
        this.scene.remove(light);
        light.dispose();
      }
    }
    this.ambientLight = undefined;
    this.keyLight = undefined;
    this.fillLight = undefined;
    this.rimLight = undefined;
  }

  private disposeHeroAndDust(): void {
    if (this.heroNexus) {
      this.heroNexus.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
        if (child instanceof THREE.Points) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      this.scene.remove(this.heroNexus);
      this.heroNexus = undefined;
    }
    if (this.ambientDust) {
      this.ambientDust.geometry.dispose();
      (this.ambientDust.material as THREE.Material).dispose();
      this.scene.remove(this.ambientDust);
      this.ambientDust = undefined;
    }
  }

  // --- SCENE subsystem ---
  private initSceneSubsystem(): void {
    const host = this.canvasHost.nativeElement;
    this.renderer.setSize(host.clientWidth, host.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.96;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);

    this.labelRenderer.setSize(host.clientWidth, host.clientHeight);
    this.labelRenderer.domElement.className = 'label-layer';
    host.appendChild(this.labelRenderer.domElement);

    const vis = this.activeVisualPreset;
    this.scene.background = new THREE.Color(vis.background);
    this.scene.fog = new THREE.FogExp2(vis.fogHex, vis.fogDensity);

    this.camera.position.copy(this.introStartCam);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 48;
    this.controls.target.set(0, 0, 0);

    this.ambientLight = new THREE.AmbientLight(vis.ambientHex, vis.ambientIntensity);
    this.keyLight = new THREE.DirectionalLight(0xfff5f0, 1.05);
    this.keyLight.position.set(10, 18, 12);
    this.fillLight = new THREE.DirectionalLight(vis.fillHex, vis.fillIntensity);
    this.fillLight.position.set(-14, -6, -10);
    this.rimLight = new THREE.PointLight(vis.rimHex, 0.82, 92);
    this.rimLight.position.set(-12, 8, -18);

    this.scene.add(this.ambientLight, this.keyLight, this.fillLight, this.rimLight);
    this.setupCosmicBackdrop(vis);
    this.heroNexus = createHeroNexusGroup();
    this.heroNexus.position.set(0, -1.05, 0);
    const helmetPts = createHelmetParticlePoints(5200);
    this.heroNexus.add(helmetPts);
    this.heroNexus.userData['helmet'] = helmetPts;
    this.scene.add(this.heroNexus);
    this.ambientDust = createAmbientDustPoints(2200, new THREE.Color(vis.dustTintA), new THREE.Color(vis.dustTintB));
    this.scene.add(this.ambientDust);
    this.skillGateGroup = createSkillGateVfx();
    this.scene.add(this.skillGateGroup);
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private setupCosmicBackdrop(p: GalaxyVisualPreset): void {
    p.nebula.forEach((layer) => {
      const geo = new THREE.SphereGeometry(layer.scale, 48, 48);
      const mat = new THREE.MeshBasicMaterial({
        color: layer.color,
        side: THREE.BackSide,
        transparent: true,
        opacity: layer.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geo, mat);
      this.scene.add(mesh);
      this.nebulaLayers.push(mesh);
    });

    const counts = [520, 380, 220];
    const spreads = [150, 110, 175];
    const sizes = [0.028, 0.022, 0.04];
    const colors = p.starColors;
    for (let i = 0; i < counts.length; i++) {
      const geo = new THREE.BufferGeometry();
      const verts = new Float32Array(counts[i] * 3);
      for (let j = 0; j < counts[i]; j++) {
        verts[j * 3] = (Math.random() - 0.5) * spreads[i];
        verts[j * 3 + 1] = (Math.random() - 0.5) * spreads[i];
        verts[j * 3 + 2] = (Math.random() - 0.5) * spreads[i];
      }
      geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      const mat = new THREE.PointsMaterial({
        color: colors[i % colors.length],
        size: sizes[i],
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const pts = new THREE.Points(geo, mat);
      this.scene.add(pts);
      this.starFields.push(pts);
    }
  }

  protected setGalaxyVisualPreset(p: GalaxyVisualPreset): void {
    if (p.id === this.activeVisualPreset.id || this.destroyed) {
      return;
    }
    this.activeVisualPreset = p;
    this.scene.background = new THREE.Color(p.background);
    this.scene.fog = new THREE.FogExp2(p.fogHex, p.fogDensity);
    if (this.ambientLight) {
      this.ambientLight.color.setHex(p.ambientHex);
      this.ambientLight.intensity = p.ambientIntensity;
    }
    if (this.fillLight) {
      this.fillLight.color.setHex(p.fillHex);
      this.fillLight.intensity = p.fillIntensity;
    }
    if (this.rimLight) {
      this.rimLight.color.setHex(p.rimHex);
    }
    this.disposeCosmicBackground();
    this.setupCosmicBackdrop(p);
    if (this.ambientDust) {
      this.ambientDust.geometry.dispose();
      (this.ambientDust.material as THREE.Material).dispose();
      this.scene.remove(this.ambientDust);
    }
    this.ambientDust = createAmbientDustPoints(2200, new THREE.Color(p.dustTintA), new THREE.Color(p.dustTintB));
    this.scene.add(this.ambientDust);
    this.cdr.detectChanges();
  }

  // --- POST subsystem (pmndrs + N8AO + cinematic stack) ---
  private initPostSubsystem(): void {
    const host = this.canvasHost.nativeElement;
    const w = host.clientWidth;
    const h = host.clientHeight;
    const composer = new EffectComposer(this.renderer);
    composer.setSize(w, h);

    composer.addPass(new RenderPass(this.scene, this.camera));

    const n8aoPass = new N8AOPostPass(this.scene, this.camera, w, h);
    n8aoPass.configuration.aoRadius = 1.25;
    n8aoPass.configuration.distanceFalloff = 1.05;
    n8aoPass.configuration.intensity = 2.65;
    n8aoPass.configuration.color = new THREE.Color(0x000000);
    n8aoPass.setQualityMode('High');
    composer.addPass(n8aoPass);
    this.n8aoPass = n8aoPass;

    const bloom = new BloomEffect({
      blendFunction: BlendFunction.SCREEN,
      luminanceThreshold: 0.5,
      luminanceSmoothing: 0.08,
      mipmapBlur: true,
      intensity: 1.28,
      radius: 0.72
    });
    const vignette = new VignetteEffect({
      blendFunction: BlendFunction.NORMAL,
      darkness: 0.5,
      offset: 0.36
    });
    const chromatic = new ChromaticAberrationEffect({
      blendFunction: BlendFunction.NORMAL,
      offset: new THREE.Vector2(0.00055, 0.00085),
      radialModulation: true,
      modulationOffset: 0.12
    });
    composer.addPass(new EffectPass(this.camera, bloom, vignette, chromatic));
    composer.addPass(new EffectPass(this.camera, new SMAAEffect({ preset: SMAAPreset.HIGH })));

    this.composer = composer;
  }

  // --- INTERACTION subsystem ---
  private initInteractionSubsystem(): void {
    this.canvasHost.nativeElement.addEventListener('pointerdown', this.onCanvasPointerDown);
    this.canvasHost.nativeElement.addEventListener('pointermove', this.onCanvasPointerMove);
    this.canvasHost.nativeElement.addEventListener('pointerleave', this.onCanvasPointerLeave);
    window.addEventListener('resize', this.resizeHandler);
  }

  // --- GRAPH / DATA subsystem ---
  protected async toggleGraphMode(): Promise<void> {
    this.useDemoGraph = !this.useDemoGraph;
    await this.loadGraphSubsystem();
  }

  protected setCategoryFilter(category: SkillNode['category'] | 'all'): void {
    this.activeCategory = category;
    this.applyCategoryFilter();
  }

  protected getConnectedNodes(node: SkillNode | null): SkillNode[] {
    if (!node) {
      return [];
    }
    const connectedNodeIds = new Set<string>();
    this.graph.edges.forEach((edge) => {
      if (edge.fromNodeId === node.id) {
        connectedNodeIds.add(edge.toNodeId);
      }
      if (edge.toNodeId === node.id) {
        connectedNodeIds.add(edge.fromNodeId);
      }
    });
    return this.graph.nodes.filter((entry) => connectedNodeIds.has(entry.id));
  }

  protected relationCount(node: SkillNode | null): number {
    if (!node) {
      return 0;
    }
    return this.graph.edges.filter((edge) => edge.fromNodeId === node.id || edge.toNodeId === node.id).length;
  }

  private async loadGraphSubsystem(): Promise<void> {
    if (this.useDemoGraph) {
      this.sourceGraph = GENERAL_GRAPH;
      this.dataSource = 'demo';
    } else {
      this.sourceGraph = await this.skillGraphService.getGraph();
      this.dataSource = this.skillGraphService.dataSource;
    }
    this.selectedNode = this.sourceGraph.nodes[0] ?? null;
    this.hoveredNode = null;
    this.activeCategory = 'all';
    if (!this.questTargetId || !this.sourceGraph.nodes.some((n) => n.id === this.questTargetId)) {
      this.questTargetId = null;
      this.questCompleted.clear();
    }
    this.invalidateQuestPathCache();
    this.applyCategoryFilter();
    this.introTime = 0;
    this.cdr.detectChanges();
  }

  private applyCategoryFilter(): void {
    const filteredNodes =
      this.activeCategory === 'all'
        ? this.sourceGraph.nodes
        : this.sourceGraph.nodes.filter((node) => node.category === this.activeCategory);
    const nodeIds = new Set(filteredNodes.map((node) => node.id));
    const filteredEdges = this.sourceGraph.edges.filter(
      (edge) => nodeIds.has(edge.fromNodeId) && nodeIds.has(edge.toNodeId)
    );
    this.graph = { nodes: filteredNodes, edges: filteredEdges };

    if (this.selectedNode && !nodeIds.has(this.selectedNode.id)) {
      this.selectedNode = filteredNodes[0] ?? null;
    }
    if (this.questTargetId && !nodeIds.has(this.questTargetId)) {
      this.questTargetId = filteredNodes[0]?.id ?? null;
      this.questCompleted.clear();
    }

    this.clearGraphObjects();
    this.renderGraphSubsystem(this.graph);
    this.refreshQuestVisuals();
    this.updateNodeHighlight();
    this.cdr.detectChanges();
  }

  // --- QUEST subsystem (template helpers) ---
  protected setQuestTarget(nodeId: string): void {
    if (!nodeId) {
      this.questTargetId = null;
      this.questCompleted.clear();
      this.refreshQuestVisuals();
      this.cdr.detectChanges();
      return;
    }
    this.questTargetId = nodeId;
    this.questCompleted.clear();
    this.refreshQuestVisuals();
    const node = this.graph.nodes.find((n) => n.id === nodeId);
    if (node) {
      this.selectNode(node);
    }
    this.cdr.detectChanges();
  }

  protected startDemoQuest(): void {
    const supa = this.sourceGraph.nodes.find((n) => n.slug === 'supabase');
    if (supa) {
      this.setQuestTarget(supa.id);
    }
  }

  protected completeSelectedQuestStep(): void {
    if (!this.selectedNode || !this.questTargetId) {
      return;
    }
    const state = getQuestVisualState(this.selectedNode.id, this.questTargetId, this.questCompleted, this.sourceGraph);
    if (state === 'locked' || state === 'completed') {
      return;
    }
    if (state === 'target') {
      const prereqs = collectRequiresPrerequisiteIds(this.sourceGraph, this.questTargetId);
      const allPrereqsDone = [...prereqs].every((id) => this.questCompleted.has(id));
      if (!allPrereqsDone) {
        return;
      }
    }
    this.questCompleted.add(this.selectedNode.id);
    this.refreshQuestVisuals();
    this.pulsePhase = 1;
    const next = getNextQuestNodes(this.sourceGraph, this.questTargetId, this.questCompleted)[0];
    if (next) {
      this.flyToNode(next, 0.55);
    }
    this.cdr.detectChanges();
  }

  protected questProgress(): { done: number; total: number } {
    if (!this.questTargetId) {
      return { done: 0, total: 0 };
    }
    return questProgressCounts(this.sourceGraph, this.questTargetId, this.questCompleted);
  }

  protected nextQuestNodes(): SkillNode[] {
    if (!this.questTargetId) {
      return [];
    }
    return getNextQuestNodes(this.sourceGraph, this.questTargetId, this.questCompleted).filter((n) =>
      this.graph.nodes.some((g) => g.id === n.id)
    );
  }

  protected questStateLabel(nodeId: string): QuestNodeVisualState {
    return getQuestVisualState(nodeId, this.questTargetId, this.questCompleted, this.sourceGraph);
  }

  protected questStateDisplay(state: QuestNodeVisualState): string {
    switch (state) {
      case 'locked':
        return 'Locked';
      case 'available':
        return 'Next up';
      case 'completed':
        return 'Done';
      case 'target':
        return 'Boss node';
      default:
        return state;
    }
  }

  protected questTargetNode(): SkillNode | null {
    if (!this.questTargetId) {
      return null;
    }
    return this.sourceGraph.nodes.find((n) => n.id === this.questTargetId) ?? null;
  }

  protected canCompleteSelectedQuestStep(): boolean {
    if (!this.selectedNode || !this.questTargetId) {
      return false;
    }
    const state = getQuestVisualState(this.selectedNode.id, this.questTargetId, this.questCompleted, this.sourceGraph);
    if (state === 'locked' || state === 'completed') {
      return false;
    }
    if (state === 'target') {
      const prereqs = collectRequiresPrerequisiteIds(this.sourceGraph, this.questTargetId);
      return [...prereqs].every((id) => this.questCompleted.has(id));
    }
    return state === 'available';
  }

  private requiresPathEdgeIds(): Set<string> {
    const set = new Set<string>();
    if (!this.questTargetId) {
      return set;
    }
    const needed = collectRequiresPrerequisiteIds(this.sourceGraph, this.questTargetId);
    needed.add(this.questTargetId);
    this.sourceGraph.edges.forEach((e) => {
      if (e.relation !== 'requires') {
        return;
      }
      if (needed.has(e.fromNodeId) && needed.has(e.toNodeId)) {
        set.add(e.id);
      }
    });
    return set;
  }

  private invalidateQuestPathCache(): void {
    this.questPathEdgeCache = null;
  }

  private getQuestPathEdges(): Set<string> {
    if (!this.questPathEdgeCache) {
      this.questPathEdgeCache = this.requiresPathEdgeIds();
    }
    return this.questPathEdgeCache;
  }

  private refreshQuestVisuals(): void {
    this.nodeGroups.forEach((group, id) => {
      this.applyQuestMaterialToGroup(group, id);
    });
    this.invalidateQuestPathCache();
    this.updateEdgeHighlight();
    this.updateLabelOpacity();
  }

  // --- RENDER graph subsystem ---
  private renderGraphSubsystem(graph: SkillGraph): void {
    graph.edges.forEach((edge) => {
      const from = graph.nodes.find((node) => node.id === edge.fromNodeId);
      const to = graph.nodes.find((node) => node.id === edge.toNodeId);
      if (!from || !to) {
        return;
      }
      const start = new THREE.Vector3(from.x, from.y, from.z);
      const end = new THREE.Vector3(to.x, to.y, to.z);
      if (start.distanceToSquared(end) < 1e-8) {
        return;
      }
      const baseHex = this.getEdgeColor(edge.relation);
      const coreCol = new THREE.Color(baseHex);
      const glowCol = coreCol.clone().multiplyScalar(1.45);
      const { group, outer, inner } = createEdgeBeamGroup(start, end, coreCol, glowCol);
      group.userData['edgeId'] = edge.id;
      this.scene.add(group);

      let flowMesh: THREE.Mesh | undefined;
      if (edge.relation === 'requires' || edge.relation === 'supports') {
        const flowGeo = new THREE.IcosahedronGeometry(0.055, 1);
        const flowMat = new THREE.MeshBasicMaterial({
          color: 0xfff5e6,
          transparent: true,
          opacity: 0.92,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        flowMesh = new THREE.Mesh(flowGeo, flowMat);
        flowMesh.position.copy(start);
        this.scene.add(flowMesh);
      }

      this.edgeVisuals.push({
        edgeId: edge.id,
        fromNodeId: edge.fromNodeId,
        toNodeId: edge.toNodeId,
        relation: edge.relation,
        beamGroup: group,
        beamOuter: outer,
        beamInner: inner,
        flowMesh,
        flowT: Math.random(),
        flowSpeed: edge.relation === 'requires' ? 0.38 : 0.24,
        start,
        end
      });
    });

    graph.nodes.forEach((node) => {
      const group = this.createNodeGroup(node);
      this.scene.add(group);
      this.nodeGroups.set(node.id, group);
      const label = this.createNodeLabel(node);
      this.scene.add(label);
      this.nodeLabels.set(node.id, label);
    });
  }

  private createNodeGroup(node: SkillNode): THREE.Group {
    const group = new THREE.Group();
    group.position.set(node.x, node.y, node.z);
    group.userData['nodeId'] = node.id;

    const baseR = 0.22 + node.level * 0.034;
    const gltfRoot = environment.useGltfPlanetMeshes ? this.planetGltf.cloneForCategory(node.category) : null;
    if (gltfRoot) {
      this.planetGltf.scaleToBoundingRadius(gltfRoot, baseR);
      gltfRoot.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.userData['nodeId'] = node.id;
        }
      });
      group.add(gltfRoot);
      group.userData['gltfRoot'] = gltfRoot;
      group.userData['core'] = gltfRoot;
    } else {
      const planetHandle = createPlanetShaderMaterial(node.category);
      const core = new THREE.Mesh(new THREE.SphereGeometry(baseR, 72, 72), planetHandle.material);
      core.userData['nodeId'] = node.id;
      group.userData['planet'] = planetHandle;
      group.userData['core'] = core;
      group.add(core);
    }

    this.applyQuestMaterialToGroup(group, node.id);
    return group;
  }

  private applyQuestMaterialToGroup(group: THREE.Group, nodeId: string): void {
    const planet = group.userData['planet'] as PlanetUniformsHandle | undefined;
    const gltfRoot = group.userData['gltfRoot'] as THREE.Object3D | undefined;
    const node = this.graph.nodes.find((n) => n.id === nodeId);
    if (!node) {
      return;
    }
    const state = getQuestVisualState(nodeId, this.questTargetId, this.questCompleted, this.sourceGraph);
    if (planet) {
      applyPlanetQuestVisual(planet, state, node.category);
    }
    if (gltfRoot) {
      applyGltfQuestVisual(gltfRoot, state, this.getNodeColor(node.category));
    }
  }

  private createNodeLabel(node: SkillNode): CSS2DObject {
    const element = document.createElement('div');
    element.className = 'sg-node-label';
    element.textContent = node.label;
    const label = new CSS2DObject(element);
    const r = 0.22 + node.level * 0.034;
    label.position.set(node.x, node.y + r + 0.42, node.z);
    return label;
  }

  protected selectNode(node: SkillNode): void {
    this.selectedNode = node;
    this.flyToNode(node, 0.42);
    this.updateNodeHighlight();
    this.updateLabelOpacity();
  }

  private onCanvasPointerDown = (event: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const groups = Array.from(this.nodeGroups.values());
    const intersects = this.raycaster.intersectObjects(groups, true);
    const firstHit = intersects[0];
    if (!firstHit) {
      return;
    }
    let obj: THREE.Object3D | null = firstHit.object;
    let nodeId: string | undefined;
    while (obj) {
      nodeId = obj.userData['nodeId'] as string | undefined;
      if (nodeId) {
        break;
      }
      obj = obj.parent;
    }
    const node = this.graph.nodes.find((entry) => entry.id === nodeId);
    if (node) {
      this.selectNode(node);
    }
  };

  private pickHeroHover(event: PointerEvent): boolean {
    if (!this.heroNexus) {
      return false;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObject(this.heroNexus, true).length > 0;
  }

  private onCanvasPointerMove = (event: PointerEvent) => {
    this.heroHovered = this.pickHeroHover(event);
    const hit = this.pickNode(event);
    this.hoveredNode = hit ?? null;
    this.canvasHost.nativeElement.style.cursor = hit || this.heroHovered ? 'pointer' : 'grab';
    this.tooltipX = event.offsetX + 12;
    this.tooltipY = event.offsetY + 12;
    this.updateLabelOpacity();
    const hid = hit?.id ?? null;
    if (hid !== this.lastHoveredId) {
      if (this.pointerTooltipCdrRaf !== 0) {
        cancelAnimationFrame(this.pointerTooltipCdrRaf);
        this.pointerTooltipCdrRaf = 0;
      }
      this.lastHoveredId = hid;
      this.cdr.detectChanges();
    } else if (hit && this.pointerTooltipCdrRaf === 0) {
      this.pointerTooltipCdrRaf = requestAnimationFrame(() => {
        this.pointerTooltipCdrRaf = 0;
        if (!this.destroyed) {
          this.cdr.detectChanges();
        }
      });
    }
  };

  private onCanvasPointerLeave = () => {
    this.heroHovered = false;
    this.hoveredNode = null;
    this.canvasHost.nativeElement.style.cursor = 'grab';
    this.updateLabelOpacity();
    if (this.lastHoveredId !== null) {
      this.lastHoveredId = null;
      this.cdr.detectChanges();
    }
  };

  private updateNodeHighlight(): void {
    this.nodeLabels.forEach((label, nodeId) => {
      const element = label.element as HTMLDivElement;
      if (this.selectedNode?.id === nodeId) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
    this.updateEdgeHighlight();
  }

  private updateEdgeHighlight(): void {
    const pathEdges = this.getQuestPathEdges();
    const sel = this.selectedNode?.id;
    this.edgeVisuals.forEach((ev) => {
      const onSel = Boolean(sel && (ev.fromNodeId === sel || ev.toNodeId === sel));
      const onPath = pathEdges.has(ev.edgeId);
      const o = ev.beamOuter.material as THREE.MeshBasicMaterial;
      const i = ev.beamInner.material as THREE.MeshBasicMaterial;
      const base = new THREE.Color(this.getEdgeColor(ev.relation));
      i.color.copy(base);
      o.color.copy(base).multiplyScalar(1.35);
      if (onSel) {
        o.opacity = 0.62;
        i.opacity = 1;
      } else if (onPath) {
        o.opacity = 0.52;
        i.opacity = 0.98;
      } else {
        o.opacity = 0.22;
        i.opacity = 0.42;
      }
    });
  }

  private updateLabelOpacity(): void {
    if (!this.selectedNode) {
      this.nodeLabels.forEach((label) => {
        (label.element as HTMLDivElement).style.opacity = this.hoveredNode ? '0.55' : '0.75';
      });
      return;
    }
    const connected = new Set(
      this.getConnectedNodes(this.selectedNode).map((n) => n.id).concat(this.selectedNode.id)
    );
    this.nodeLabels.forEach((label, id) => {
      const el = label.element as HTMLDivElement;
      if (id === this.selectedNode?.id) {
        el.style.opacity = '1';
        return;
      }
      if (this.hoveredNode?.id === id) {
        el.style.opacity = '0.95';
        return;
      }
      el.style.opacity = connected.has(id) ? '0.85' : '0.35';
    });
  }

  private onResize(): void {
    const host = this.canvasHost.nativeElement;
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (width < 2 || height < 2) {
      return;
    }
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
    this.composer?.setSize(width, height);
    this.n8aoPass?.setSize(width, height);
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

  private getEdgeColor(relation: SkillEdge['relation']): number {
    switch (relation) {
      case 'requires':
        return 0xff9f9f;
      case 'supports':
        return 0x74c0fc;
      default:
        return 0xb197fc;
    }
  }

  private flyToNode(node: SkillNode, lerp: number): void {
    this.flyToTargetVec.set(node.x + 2.2, node.y + 2.0, node.z + 9.5);
    this.camera.position.lerp(this.flyToTargetVec, lerp);
    this.controls?.target.set(node.x, node.y, node.z);
  }

  private clearGraphObjects(): void {
    this.nodeGroups.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const m = child.material;
          if (Array.isArray(m)) {
            m.forEach((mat) => mat.dispose());
          } else {
            m.dispose();
          }
        }
      });
      this.scene.remove(group);
    });
    this.edgeVisuals.forEach((ev) => {
      this.scene.remove(ev.beamGroup);
      ev.beamOuter.geometry.dispose();
      (ev.beamOuter.material as THREE.Material).dispose();
      ev.beamInner.geometry.dispose();
      (ev.beamInner.material as THREE.Material).dispose();
      if (ev.flowMesh) {
        this.scene.remove(ev.flowMesh);
        ev.flowMesh.geometry.dispose();
        (ev.flowMesh.material as THREE.Material).dispose();
      }
    });
    this.nodeLabels.forEach((label) => {
      this.scene.remove(label);
      label.element.remove();
    });
    this.nodeGroups.clear();
    this.nodeLabels.clear();
    this.edgeVisuals = [];
  }

  private pickNode(event: PointerEvent): SkillNode | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.nodeGroups.values()), true);
    const firstHit = intersects[0];
    if (!firstHit) {
      return null;
    }
    let obj: THREE.Object3D | null = firstHit.object;
    let nodeId: string | undefined;
    while (obj) {
      nodeId = obj.userData['nodeId'] as string | undefined;
      if (nodeId) {
        break;
      }
      obj = obj.parent;
    }
    return this.graph.nodes.find((entry) => entry.id === nodeId) ?? null;
  }

  private animate = (): void => {
    if (this.destroyed) {
      return;
    }
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrameMs) / 1000);
    this.lastFrameMs = now;
    const timeSec = now * 0.001;

    if (this.animPaused) {
      this.controls?.update();
      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
      this.labelRenderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(this.animate);
      return;
    }

    this.introTime += dt;
    if (this.introTime < 4.25) {
      const u = Math.min(1, this.introTime / 4.25);
      const t = this.easeOutCubic(u);
      this.introTargetVec.copy(this.introStartCam).lerp(this.introEndCam, t);
      this.introTargetVec.x += Math.sin(u * Math.PI) * 2.5 * (1 - u * 0.88);
      this.camera.position.copy(this.introTargetVec);
    }

    const targetHD = this.heroHovered ? 1 : 0;
    this.heroDissolve += (targetHD - this.heroDissolve) * Math.min(1, dt * 7.5);

    const pulse = this.pulsePhase;
    if (this.rimLight) {
      this.rimLight.intensity = 0.85 + Math.sin(now * 0.002) * 0.12 + pulse * 0.4;
    }

    this.nebulaLayers.forEach((mesh, i) => {
      mesh.rotation.y += dt * 0.012 * (i + 1);
      mesh.rotation.x += dt * 0.004 * (i + 1);
    });
    this.starFields.forEach((sf, i) => {
      sf.rotation.y += dt * (0.02 + i * 0.01);
    });

    if (this.ambientDust) {
      updateAmbientDustUniforms(this.ambientDust, timeSec);
    }
    const helmet = this.heroNexus?.userData['helmet'] as THREE.Points | undefined;
    if (helmet) {
      const formed = THREE.MathUtils.smoothstep(this.introTime, 0.08, 2.95);
      updateHelmetParticles(helmet, timeSec, formed, this.heroDissolve);
    }
    if (this.heroNexus) {
      updateHeroNexusVisual(this.heroNexus, dt, timeSec, pulse, Boolean(this.questTargetId));
    }

    this.nodeGroups.forEach((g) => {
      const ph = g.userData['planet'] as PlanetUniformsHandle | undefined;
      if (ph) {
        ph.setCamera(this.camera.position);
        ph.setTime(timeSec);
      }
    });

    const targetGI = this.questTargetId ? 1 : 0;
    this.skillGateIntensity += (targetGI - this.skillGateIntensity) * Math.min(1, dt * 3.2);
    if (this.skillGateGroup) {
      const qn = this.questTargetId ? this.graph.nodes.find((n) => n.id === this.questTargetId) : undefined;
      if (qn) {
        this.skillGatePos.set(qn.x, qn.y, qn.z);
      }
      updateSkillGate(
        this.skillGateGroup,
        this.camera,
        timeSec,
        this.skillGateIntensity,
        this.skillGatePos,
        dt
      );
    }

    const pathEdgeSet = this.getQuestPathEdges();
    this.edgeVisuals.forEach((ev) => {
      if (!ev.flowMesh) {
        return;
      }
      const pathBoost = pathEdgeSet.has(ev.edgeId) ? 1.35 : 1;
      ev.flowT += dt * ev.flowSpeed * pathBoost;
      if (ev.flowT > 1) {
        ev.flowT -= 1;
      }
      ev.flowMesh.position.lerpVectors(ev.start, ev.end, ev.flowT);
      const mat = ev.flowMesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + 0.55 * Math.sin(ev.flowT * Math.PI);
    });

    this.nodeGroups.forEach((group, id) => {
      let s = this.selectedNode?.id === id ? 1.18 : 1;
      if (id === this.selectedNode?.id && pulse > 0.002) {
        s *= 1 + pulse * 0.14;
      }
      group.scale.setScalar(s);
    });

    this.pulsePhase = pulse > 0.002 ? pulse * 0.9 : 0;

    this.controls?.update();
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    this.labelRenderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private easeOutCubic(t: number): number {
    const u = 1 - t;
    return 1 - u * u * u;
  }
}
