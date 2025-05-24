import {
  NodesDataSet,
  EdgesDataSet,
  Node as CustomNode,
  Edge as CustomEdge,
} from "@/types/graph-types";
import { IdType } from "vis-network";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_BORDER_COLOR,
  DEFAULT_EDGE_COLOR,
  NODE_HIGHLIGHT_BACKGROUND,
  NODE_HIGHLIGHT_BORDER,
  EDGE_HIGHLIGHT_COLOR,
} from "@/constants/graph-constants";

export function resetAllVisuals(
  nodes: NodesDataSet,
  edges: EdgesDataSet,
): void {
  // Reseta nós
  const nodeUpdates = nodes.getIds().map((id) => ({
    id,
    color: {
      background: DEFAULT_NODE_COLOR,
      border: DEFAULT_NODE_BORDER_COLOR,
      highlight: {
        background: NODE_HIGHLIGHT_BACKGROUND,
        border: NODE_HIGHLIGHT_BORDER,
      },
    },
  }));
  if (nodeUpdates.length > 0) {
    nodes.update(nodeUpdates as CustomNode[]);
  }

  // Reseta arestas
  const edgeUpdates = edges.getIds().map((id) => {
    return {
      id,
      color: {
        color: DEFAULT_EDGE_COLOR,
        highlight: EDGE_HIGHLIGHT_COLOR,
      },
      label: undefined,
    };
  });
  if (edgeUpdates.length > 0) {
    edges.update(edgeUpdates as CustomEdge[]);
  }
}

export const updateNodeVisual = (
  nodes: NodesDataSet,
  id: IdType,
  updates: Partial<CustomNode>,
): void => {
  const existingNode = nodes.get(id);
  if (existingNode) {
    // Para garantir que não percamos outras propriedades do nó, fazemos um merge.
    // O 'id' é necessário para a função 'update'.
    nodes.update({ ...existingNode, ...updates, id });
  } else {
    console.warn(`Node with ID ${id} not found for visual update.`);
  }
};

export const updateEdgeVisual = (
  edges: EdgesDataSet,
  id: string,
  updates: Partial<CustomEdge>,
): void => {
  const existingEdge = edges.get(id);
  if (existingEdge) {
    edges.update({ ...existingEdge, ...updates, id });
  } else {
    console.warn(`Edge with ID ${id} not found for visual update.`);
  }
};

export const getNeighbors = (nodeId: IdType, edges: EdgesDataSet): IdType[] => {
  const neighbors = new Set<IdType>(); // Usamos um Set para evitar duplicatas automaticamente
  edges.forEach((edge) => {
    if (edge.from === nodeId && edge.to != null) {
      neighbors.add(edge.to);
    } else if (edge.to === nodeId && edge.from != null) {
      neighbors.add(edge.from);
    }
  });
  return Array.from(neighbors);
};
