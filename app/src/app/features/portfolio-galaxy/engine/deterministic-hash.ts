/**
 * Stable pseudo-random in [0,1) from an index — no Math.random() flicker, cheap on CPU.
 */
export function hash01(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
