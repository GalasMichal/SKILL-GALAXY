/**
 * Uses the committed example so `ng build` works without a gitignored file.
 * For real Supabase keys: copy `environment.local.example.ts` → `environment.local.ts`,
 * switch this import to `./environment.local`, and keep `environment.local.ts` out of git.
 */
import { environment as localEnv } from './environment.local.example';

/** App config: Supabase URLs/keys from local example (placeholders) or your `environment.local.ts`. */
export const environment = {
  production: false,
  supabaseUrl: localEnv.supabaseUrl,
  supabaseAnonKey: localEnv.supabaseAnonKey,
  /** true = GLB unter /models/planets/; false = prozedurale Exoplaneten-Shader (empfohlen für „realistische“ Kugeln). */
  useGltfPlanetMeshes: false
};
