export interface SkillNode {
  id: string;
  slug: string;
  label: string;
  category: 'frontend' | 'backend' | 'devops' | 'softskill' | 'other';
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
