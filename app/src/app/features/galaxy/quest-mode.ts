import { SkillEdge, SkillGraph, SkillNode } from '../../core/models/skill-graph.model';

export type QuestNodeVisualState = 'locked' | 'available' | 'completed' | 'target';

/** Edge direction: prerequisite (from) -> dependent (to) when relation === requires */
export function collectRequiresPrerequisiteIds(graph: SkillGraph, targetId: string): Set<string> {
  const needed = new Set<string>();
  const stack = [targetId];
  while (stack.length) {
    const current = stack.pop()!;
    for (const edge of graph.edges) {
      if (edge.relation !== 'requires') {
        continue;
      }
      if (edge.toNodeId !== current) {
        continue;
      }
      const prereq = edge.fromNodeId;
      if (!needed.has(prereq)) {
        needed.add(prereq);
        stack.push(prereq);
      }
    }
  }
  return needed;
}

/** Topological order: foundations first, target last (only requires edges among closure ∪ {target}) */
export function buildQuestOrder(graph: SkillGraph, targetId: string): string[] {
  const prereqs = collectRequiresPrerequisiteIds(graph, targetId);
  const nodesInQuest = new Set<string>([...prereqs, targetId]);
  const requiresEdges = graph.edges.filter(
    (e) => e.relation === 'requires' && nodesInQuest.has(e.fromNodeId) && nodesInQuest.has(e.toNodeId)
  );

  const indegree = new Map<string, number>();
  nodesInQuest.forEach((id) => indegree.set(id, 0));
  requiresEdges.forEach((e) => {
    indegree.set(e.toNodeId, (indegree.get(e.toNodeId) ?? 0) + 1);
  });

  const queue: string[] = [];
  nodesInQuest.forEach((id) => {
    if ((indegree.get(id) ?? 0) === 0) {
      queue.push(id);
    }
  });

  const ordered: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    ordered.push(id);
    requiresEdges.forEach((e) => {
      if (e.fromNodeId !== id) {
        return;
      }
      const next = e.toNodeId;
      const nextIn = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextIn);
      if (nextIn === 0) {
        queue.push(next);
      }
    });
  }

  if (ordered.length !== nodesInQuest.size) {
    return Array.from(nodesInQuest);
  }
  return ordered;
}

export function getQuestVisualState(
  nodeId: string,
  targetId: string | null,
  completedIds: ReadonlySet<string>,
  graph: SkillGraph
): QuestNodeVisualState {
  if (!targetId) {
    return 'available';
  }
  if (nodeId === targetId) {
    return completedIds.has(nodeId) ? 'completed' : 'target';
  }
  const prereqs = collectRequiresPrerequisiteIds(graph, targetId);
  if (!prereqs.has(nodeId) && nodeId !== targetId) {
    return 'locked';
  }
  if (completedIds.has(nodeId)) {
    return 'completed';
  }
  const incomingRequires = graph.edges.filter(
    (e) => e.relation === 'requires' && e.toNodeId === nodeId && prereqs.has(e.fromNodeId)
  );
  const allDone = incomingRequires.every((e) => completedIds.has(e.fromNodeId));
  return allDone ? 'available' : 'locked';
}

export function getNextQuestNodes(
  graph: SkillGraph,
  targetId: string,
  completedIds: ReadonlySet<string>
): SkillNode[] {
  const prereqs = collectRequiresPrerequisiteIds(graph, targetId);
  const candidates = [...prereqs, targetId]
    .map((id) => graph.nodes.find((n) => n.id === id))
    .filter((n): n is SkillNode => Boolean(n));

  return candidates.filter((node) => {
    if (completedIds.has(node.id)) {
      return false;
    }
    const state = getQuestVisualState(node.id, targetId, completedIds, graph);
    if (state === 'available') {
      return true;
    }
    if (node.id === targetId && state === 'target') {
      return [...prereqs].every((id) => completedIds.has(id));
    }
    return false;
  });
}

export function questProgressCounts(
  graph: SkillGraph,
  targetId: string,
  completedIds: ReadonlySet<string>
): { done: number; total: number } {
  const order = buildQuestOrder(graph, targetId);
  const steps = order.filter((id) => id !== targetId);
  const total = steps.length;
  const done = steps.filter((id) => completedIds.has(id)).length;
  return { done, total };
}
