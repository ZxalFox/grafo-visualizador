// hooks/use-graph-data.ts
import { useState, useCallback } from "react";
import { DataSet } from "vis-data/peer";
import {
  Node,
  Edge, // Este tipo Edge já foi simplificado (sem weight/label de peso)
  NodesDataSet,
  EdgesDataSet,
} from "../types/graph-types"; // Ajuste o caminho se necessário
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_BORDER_COLOR,
  DEFAULT_EDGE_COLOR,
  NODE_HIGHLIGHT_BACKGROUND, // Importado de constants
  NODE_HIGHLIGHT_BORDER, // Importado de constants
  EDGE_HIGHLIGHT_COLOR, // Importado de constants
} from "@/constants/graph-constants"; // Ajuste o caminho se necessário
import { IdType } from "vis-network";
import { resetAllVisuals as utilResetAllVisuals } from "@/lib/graph-utils"; // Importando o utilitário

export function useGraphData(
  initialNodes: Node[] = [],
  initialEdges: Edge[] = [] // Edge[] agora é do tipo simplificado
) {
  const [nodesDataSet] = useState<NodesDataSet>(() => {
    const nodesWithFullColor = initialNodes.map((n) => ({
      ...n, // Preserva id, label e outras propriedades de VisNodeOriginal
      // Garante que a estrutura de cor esteja completa conforme nossa definição de Node
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

  
  const [edgesDataSet, _setEdgesDataSet] = useState<EdgesDataSet>(() => {
    const edgesWithFullColor = initialEdges.map((e) => ({
      ...e, // Preserva id, from, to e outras propriedades de VisEdge
      // Garante que a estrutura de cor esteja completa
      color:
        typeof e.color === "string"
          ? e.color
          : {
              color: e.color?.color || DEFAULT_EDGE_COLOR,
              highlight: e.color?.highlight || EDGE_HIGHLIGHT_COLOR,
            },
      label: undefined, // Garante que não haja labels de peso nas arestas iniciais
    }));
    return new DataSet<Edge, "id">(edgesWithFullColor);
  });

  const nodes = nodesDataSet;
  const edges = edgesDataSet;

  const addNode = useCallback(() => {
    const currentNodesArray = nodes.get(); // Retorna todos os nós como um array
    const newId =
      currentNodesArray.length > 0
        ? Math.max(0, ...currentNodesArray.map((n) => Number(n.id))) + 1
        : 1;
    nodes.add({
      id: newId,
      label: `Nó ${newId}`, // Label obrigatório pela nossa interface Node
      color: {
        background: DEFAULT_NODE_COLOR,
        border: DEFAULT_NODE_BORDER_COLOR,
        highlight: {
          background: NODE_HIGHLIGHT_BACKGROUND,
          border: NODE_HIGHLIGHT_BORDER,
        },
      },
    });
  }, [nodes]);

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
      edges.remove(connectedEdgesArray.map((edge) => edge.id as IdType)); // Cast para IdType se necessário
    }
  }, [nodes, edges]);

  // addEdge simplificado: sem weight, sem showWeightsGlobally
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
          "addEdge: Tentativa de adicionar auto-loop ou aresta duplicada."
        );
        return;
      }

      // ID da aresta continua sendo uma string "menorId-maiorId"
      const edgeId = [from, to].sort((a, b) => Number(a) - Number(b)).join("-");
      edges.add({
        id: edgeId,
        from,
        to,
        // Nenhuma propriedade 'weight' ou 'label' para peso aqui
        color: {
          color: DEFAULT_EDGE_COLOR,
          highlight: EDGE_HIGHLIGHT_COLOR,
        },
      });
    },
    [edges]
  );

  const removeLastEdge = useCallback(() => {
    const edgeArray = edges.get({ order: "id" });
    if (edgeArray.length === 0) return;

    const lastEdge = edgeArray[edgeArray.length - 1];
    edges.remove(lastEdge.id);
  }, [edges]);

  // resetGraphVisuals agora não precisa mais do parâmetro showWeightsAfterReset
  // Ele simplesmente chama o utilitário de lib/graph-utils.ts
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
    addEdge, // Assinatura simplificada
    removeLastEdge,
    resetGraphVisuals, // Comportamento simplificado
    clearGraph,
    // updateEdgeWeight e toggleAllEdgeLabels foram removidos
  };
}
