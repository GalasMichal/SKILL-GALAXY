export interface SkillNode {
  id: string;
  slug: string;
  label: string;
  category: 'frontend' | 'backend' | 'devops' | 'softskill' | 'other';
  description?: string;
  /** Optional game / portfolio metadata */
  difficulty?: number;
  xp?: number;
  tags?: string[];
  level: number;
  x: number;
  y: number;
  z: number;
}

export interface SkillEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relation: 'requires' | 'supports' | 'related';
}

export interface SkillGraph {
  nodes: SkillNode[];
  edges: SkillEdge[];
}
