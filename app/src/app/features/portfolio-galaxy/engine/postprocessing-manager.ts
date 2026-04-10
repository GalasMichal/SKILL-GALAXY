import * as THREE from 'three';
import {
  BlendFunction,
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
  VignetteEffect
} from 'postprocessing';

/**
 * Bloom tuned for tight, bright highlights only — less haze, sharper glow core.
 */
export class PostprocessingManager {
  readonly composer: EffectComposer;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    const bloom = new BloomEffect({
      blendFunction: BlendFunction.SCREEN,
      luminanceThreshold: 0.76,
      luminanceSmoothing: 0.085,
      mipmapBlur: true,
      intensity: 0.4,
      radius: 0.26
    });

    const vignette = new VignetteEffect({
      blendFunction: BlendFunction.NORMAL,
      darkness: 0.34,
      offset: 0.35
    });

    this.composer.addPass(new EffectPass(camera, bloom, vignette));
    this.composer.addPass(new EffectPass(camera, new SMAAEffect({ preset: SMAAPreset.HIGH })));
  }

  setSize(width: number, height: number): void {
    this.composer.setSize(width, height);
  }

  render(): void {
    this.composer.render();
  }

  dispose(): void {
    this.composer.dispose();
  }
}
