import { environment as localEnv } from './environment.local';

/** App config: values come from `environment.local.ts` (gitignored copy of the example file). */
export const environment = {
  production: false,
  supabaseUrl: localEnv.supabaseUrl,
  supabaseAnonKey: localEnv.supabaseAnonKey,
  /** true = GLB unter /models/planets/; false = prozedurale Exoplaneten-Shader (empfohlen für „realistische“ Kugeln). */
  useGltfPlanetMeshes: false
};
