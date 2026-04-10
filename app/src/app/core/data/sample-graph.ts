import { SkillGraph } from '../models/skill-graph.model';

export const SAMPLE_GRAPH: SkillGraph = {
  nodes: [
    { id: '1', slug: 'typescript', label: 'TypeScript', category: 'frontend', level: 4, description: 'Typed JavaScript for large codebases.', x: -4, y: 0, z: 0 },
    { id: '2', slug: 'angular', label: 'Angular', category: 'frontend', level: 4, description: 'Framework for structured web applications.', x: -1.5, y: 1.2, z: 1.5 },
    { id: '3', slug: 'supabase', label: 'Supabase', category: 'backend', level: 3, description: 'Backend platform on top of Postgres.', x: 2, y: -0.2, z: 0.8 },
    { id: '4', slug: 'postgres', label: 'Postgres', category: 'backend', level: 3, description: 'Relational database and SQL engine.', x: 4, y: 1.1, z: -1.2 },
    { id: '5', slug: 'threejs', label: 'Three.js', category: 'frontend', level: 2, description: '3D rendering library for the web.', x: -0.5, y: -1.6, z: -2.2 }
  ],
  edges: [
    { id: 'e1', fromNodeId: '1', toNodeId: '2', relation: 'requires' },
    { id: 'e2', fromNodeId: '2', toNodeId: '3', relation: 'supports' },
    { id: 'e3', fromNodeId: '3', toNodeId: '4', relation: 'requires' },
    { id: 'e4', fromNodeId: '1', toNodeId: '5', relation: 'related' }
  ]
};
