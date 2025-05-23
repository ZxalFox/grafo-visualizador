// lib/graph-utils.ts
import {
  NodesDataSet,
  EdgesDataSet,
  Node as CustomNode, // Renomeado para clareza
  Edge as CustomEdge, // Renomeado para clareza
} from "@/types/graph-types";
import { IdType } from "vis-network";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_BORDER_COLOR, // Usaremos este para a borda padrão
  DEFAULT_EDGE_COLOR,
  // Constantes de highlight que definimos anteriormente
  NODE_HIGHLIGHT_BACKGROUND,
  NODE_HIGHLIGHT_BORDER,
  EDGE_HIGHLIGHT_COLOR,
} from "@/constants/graph-constants";

/**
 * Reseta o visual de todos os nós e arestas para seus estados padrão.
 * Nós voltam para a cor padrão.
 * Arestas voltam para a cor padrão e não terão labels.
 */
export function resetAllVisuals(
  nodes: NodesDataSet,
  edges: EdgesDataSet
): void {
  // Reseta nós
  const nodeUpdates = nodes.getIds().map((id) => ({
    id,
    color: {
      background: DEFAULT_NODE_COLOR,
      border: DEFAULT_NODE_BORDER_COLOR, // Usando uma cor de borda padrão definida
      highlight: {
        background: NODE_HIGHLIGHT_BACKGROUND,
        border: NODE_HIGHLIGHT_BORDER,
      },
    },
  }));
  if (nodeUpdates.length > 0) {
    nodes.update(nodeUpdates as CustomNode[]); // Cast para o nosso tipo Node customizado
  }

  // Reseta arestas
  const edgeUpdates = edges.getIds().map((id) => {
    return {
      id,
      color: {
        color: DEFAULT_EDGE_COLOR,
        highlight: EDGE_HIGHLIGHT_COLOR,
      },
      label: undefined, // Garante que não haja labels (anteriormente usado para pesos)
    };
  });
  if (edgeUpdates.length > 0) {
    edges.update(edgeUpdates as CustomEdge[]); // Cast para o nosso tipo Edge customizado
  }
}

/**
 * Atualiza propriedades visuais de um nó específico.
 * @param nodes O DataSet de nós.
 * @param id O ID do nó a ser atualizado.
 * @param updates Um objeto contendo as propriedades do nó a serem atualizadas.
 * Se 'color' for um objeto, deve ser a estrutura completa (com highlight).
 */
export const updateNodeVisual = (
  nodes: NodesDataSet,
  id: IdType,
  updates: Partial<CustomNode> // Usando nosso tipo Node customizado
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

/**
 * Atualiza propriedades visuais de uma aresta específica.
 * @param edges O DataSet de arestas.
 * @param id O ID da aresta a ser atualizada (string).
 * @param updates Um objeto contendo as propriedades da aresta a serem atualizadas.
 */
export const updateEdgeVisual = (
  edges: EdgesDataSet,
  id: string, // ID da aresta é string
  updates: Partial<CustomEdge> // Usando nosso tipo Edge customizado
): void => {
  const existingEdge = edges.get(id);
  if (existingEdge) {
    edges.update({ ...existingEdge, ...updates, id });
  } else {
    console.warn(`Edge with ID ${id} not found for visual update.`);
  }
};

/**
 * Obtém os IDs dos nós vizinhos a um nó específico.
 * @param nodeId O ID do nó para o qual encontrar os vizinhos.
 * @param edges O DataSet de arestas.
 * @returns Um array de IDs dos nós vizinhos (sem duplicatas).
 */
export const getNeighbors = (nodeId: IdType, edges: EdgesDataSet): IdType[] => {
  const neighbors = new Set<IdType>(); // Usamos um Set para evitar duplicatas automaticamente
  edges.forEach((edge) => {
    if (edge.from === nodeId && edge.to != null) {
      // edge.to != null é uma checagem extra
      neighbors.add(edge.to);
    } else if (edge.to === nodeId && edge.from != null) {
      neighbors.add(edge.from);
    }
  });
  return Array.from(neighbors);
};
