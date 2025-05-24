import { useState, useCallback } from "react";
import { DataSet } from "vis-data/peer";
import { Node, Edge, NodesDataSet, EdgesDataSet } from "../types/graph-types";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_BORDER_COLOR,
  DEFAULT_EDGE_COLOR,
  NODE_HIGHLIGHT_BACKGROUND,
  NODE_HIGHLIGHT_BORDER,
  EDGE_HIGHLIGHT_COLOR,
} from "@/constants/graph-constants";
import { IdType } from "vis-network";
import { resetAllVisuals as utilResetAllVisuals } from "@/lib/graph-utils";

export function useGraphData(
  initialNodes: Node[] = [],
  initialEdges: Edge[] = [],
) {
  const [nodesDataSet] = useState<NodesDataSet>(() => {
    const nodesWithFullColor = initialNodes.map((n) => ({
      ...n,
      color:
        typeof n.color === "string"
          ? n.color // Se a cor inicial for uma string, usa-a
          : {
              // Caso contrário, constrói o objeto de cor completo
              background: n.color?.background || DEFAULT_NODE_COLOR,
              border: n.color?.border || DEFAULT_NODE_BORDER_COLOR,
              highlight: n.color?.highlight || {
                background: NODE_HIGHLIGHT_BACKGROUND,
                border: NODE_HIGHLIGHT_BORDER,
              },
            },
    }));
    return new DataSet<Node, "id">(nodesWithFullColor);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [edgesDataSet, _setEdgesDataSet] = useState<EdgesDataSet>(() => {
    const edgesWithFullColor = initialEdges.map((e) => ({
      ...e,
      color:
        typeof e.color === "string"
          ? e.color
          : {
              color: e.color?.color || DEFAULT_EDGE_COLOR,
              highlight: e.color?.highlight || EDGE_HIGHLIGHT_COLOR,
            },
      label: undefined,
    }));
    return new DataSet<Edge, "id">(edgesWithFullColor);
  });

  const nodes = nodesDataSet;
  const edges = edgesDataSet;

  const addNode = useCallback(
    (position?: { x: number; y: number }) => {
      const currentNodesArray = nodes.get();
      const newId =
        currentNodesArray.length > 0
          ? Math.max(0, ...currentNodesArray.map((n) => Number(n.id))) + 1
          : 1;

      const newNodeData: Node = {
        id: newId,
        label: `Nó ${newId}`,
        color: {
          background: DEFAULT_NODE_COLOR,
          border: DEFAULT_NODE_BORDER_COLOR,
          highlight: {
            background: NODE_HIGHLIGHT_BACKGROUND,
            border: NODE_HIGHLIGHT_BORDER,
          },
        },
      };

      if (position) {
        newNodeData.x = position.x;
        newNodeData.y = position.y;
        newNodeData.fixed = { x: true, y: true };
      }

      nodes.add(newNodeData);

      //Soltar o nó após um pequeno delay
      if (position) {
        setTimeout(() => {
          // Verifica se o nó ainda existe antes de tentar atualizar
          if (nodes.get(newId)) {
            nodes.update({ id: newId, fixed: { x: false, y: false } });
          }
        }, 150);
      }
    },
    [nodes],
  );

  const removeNode = useCallback(() => {
    const allNodesArray = nodes.get({ order: "id" });
    if (allNodesArray.length === 0) return;

    const nodeToRemove = allNodesArray[allNodesArray.length - 1];
    if (!nodeToRemove) return;

    nodes.remove(nodeToRemove.id);

    const connectedEdgesArray = edges.get({
      filter: (edge) =>
        edge.from === nodeToRemove.id || edge.to === nodeToRemove.id,
    });
    if (connectedEdgesArray.length > 0) {
      edges.remove(connectedEdgesArray.map((edge) => edge.id as IdType));
    }
  }, [nodes, edges]);

  const addEdge = useCallback(
    (from: IdType, to: IdType) => {
      const edgeExists =
        edges.get({
          filter: (edge) =>
            (edge.from === from && edge.to === to) ||
            (edge.from === to && edge.to === from),
        }).length > 0;

      if (from === to || edgeExists) {
        console.warn(
          "addEdge: Tentativa de adicionar auto-loop ou aresta duplicada.",
        );
        return;
      }

      const edgeId = [from, to].sort((a, b) => Number(a) - Number(b)).join("-");
      edges.add({
        id: edgeId,
        from,
        to,
        color: {
          color: DEFAULT_EDGE_COLOR,
          highlight: EDGE_HIGHLIGHT_COLOR,
        },
      });
    },
    [edges],
  );

  const removeLastEdge = useCallback(() => {
    const edgeArray = edges.get({ order: "id" });
    if (edgeArray.length === 0) return;

    const lastEdge = edgeArray[edgeArray.length - 1];
    edges.remove(lastEdge.id);
  }, [edges]);

  const resetGraphVisuals = useCallback(() => {
    utilResetAllVisuals(nodes, edges);
  }, [nodes, edges]);

  const clearGraph = useCallback(() => {
    nodes.clear();
    edges.clear();
  }, [nodes, edges]);

  return {
    nodes,
    edges,
    addNode,
    removeNode,
    addEdge,
    removeLastEdge,
    resetGraphVisuals,
    clearGraph,
  };
}
