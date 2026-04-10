import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { SAMPLE_GRAPH } from './sample-graph';
import { SkillEdge, SkillGraph, SkillNode } from '../models/skill-graph.model';

type DbNode = {
  id: string;
  slug: string;
  label: string;
  category: SkillNode['category'];
  description?: string;
  difficulty?: number;
  xp?: number;
  tags?: string[];
  level: number;
  position: { x: number; y: number; z: number };
};

type DbEdge = {
  id: string;
  from_node_id: string;
  to_node_id: string;
  relation: SkillEdge['relation'];
};

@Injectable({ providedIn: 'root' })
export class SkillGraphService {
  private supabase =
    environment.supabaseUrl && environment.supabaseAnonKey
      ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
      : null;

  public dataSource: 'supabase' | 'sample' = 'sample';

  async getGraph(): Promise<SkillGraph> {
    if (!this.supabase) {
      this.dataSource = 'sample';
      return SAMPLE_GRAPH;
    }

    const [nodesResult, edgesResult] = await Promise.all([
      this.supabase.from('nodes').select('*').order('label', { ascending: true }),
      this.supabase.from('edges').select('*')
    ]);

    if (nodesResult.error || edgesResult.error || !nodesResult.data || !edgesResult.data) {
      if (nodesResult.error) {
        console.warn('[SkillGraph] nodes query failed:', nodesResult.error.message);
      }
      if (edgesResult.error) {
        console.warn('[SkillGraph] edges query failed:', edgesResult.error.message);
      }
      this.dataSource = 'sample';
      return SAMPLE_GRAPH;
    }

    const nodes: SkillNode[] = (nodesResult.data as DbNode[]).map((node) => ({
      id: node.id,
      slug: node.slug,
      label: node.label,
      category: node.category ?? 'other',
      description: node.description,
      difficulty: node.difficulty,
      xp: node.xp,
      tags: node.tags,
      level: node.level,
      x: node.position?.x ?? 0,
      y: node.position?.y ?? 0,
      z: node.position?.z ?? 0
    }));

    const edges: SkillEdge[] = (edgesResult.data as DbEdge[]).map((edge) => ({
      id: edge.id,
      fromNodeId: edge.from_node_id,
      toNodeId: edge.to_node_id,
      relation: edge.relation
    }));

    this.dataSource = 'supabase';
    return { nodes, edges };
  }
}
