import { useState, useCallback, useRef, useEffect } from "react";
import { IdType } from "vis-network";
import {
  NodesDataSet,
  EdgesDataSet,
  AlgorithmImplementation,
  Node as CustomNode,
  Edge as CustomEdge,
} from "@/types/graph-types";
import {
  resetAllVisuals as utilResetAllVisuals,
  updateNodeVisual as utilUpdateNodeVisual,
  updateEdgeVisual as utilUpdateEdgeVisual,
} from "@/lib/graph-utils";
import {
  ANIMATION_SPEED_MS,
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_BORDER_COLOR,
  SELECTED_NODE_COLOR_ALGORITHM,
  SELECTED_NODE_BORDER_ALGORITHM,
  SELECTED_NODE_COLOR_EDGE_CREATION,
  SELECTED_NODE_BORDER_EDGE_CREATION,
  NODE_HIGHLIGHT_BACKGROUND,
  NODE_HIGHLIGHT_BORDER,
} from "@/constants/graph-constants";

interface UseGraphInteractionsProps {
  nodes: NodesDataSet;
  edges: EdgesDataSet;
  addEdgeToDataSet: (from: IdType, to: IdType) => void;
}

export function useGraphInteractions({
  nodes,
  edges,
  addEdgeToDataSet,
}: UseGraphInteractionsProps) {
  const [selectedNodeIdForAlgorithm, setSelectedNodeIdForAlgorithm] =
    useState<IdType | null>(null);
  const [nodesForNewEdge, setNodesForNewEdge] = useState<IdType[]>([]);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  const [algorithmResultMessage, setAlgorithmResultMessage] = useState<
    string | null
  >(null);
  const activeAlgorithmCleanupRef = useRef<(() => void) | null>(null);

  const updateNodeColorVisuals = useCallback(
    (nodeId: IdType, background: string, border: string) => {
      utilUpdateNodeVisual(nodes, nodeId, {
        color: {
          background,
          border,
          highlight: {
            background: NODE_HIGHLIGHT_BACKGROUND,
            border: NODE_HIGHLIGHT_BORDER,
          },
        },
      });
    },
    [nodes],
  );

  const handleNodeClick = useCallback(
    (clickedNodeId: IdType) => {
      if (isAlgorithmRunning) return;
      setAlgorithmResultMessage(null);

      // Captura os estados anteriores para comparação
      const prevNodesForEdge = [...nodesForNewEdge];
      const prevSelectedNodeIdForAlgo = selectedNodeIdForAlgorithm;

      // Calcula os próximos estados
      let nextNodesForEdgeArray: IdType[];
      if (prevNodesForEdge.includes(clickedNodeId)) {
        nextNodesForEdgeArray = prevNodesForEdge.filter(
          (id) => id !== clickedNodeId,
        );
      } else {
        nextNodesForEdgeArray = [...prevNodesForEdge, clickedNodeId];
        if (nextNodesForEdgeArray.length > 2) {
          // Garante no máximo 2 nós para uma aresta
          // Mantém o primeiro nó selecionado e o nó clicado atualmente
          nextNodesForEdgeArray = [
            prevNodesForEdge[0] || clickedNodeId,
            clickedNodeId,
          ];
        }
      }

      let nextSelectedNodeIdForAlgoValue = prevSelectedNodeIdForAlgo;
      let edgeWasFormed = false;

      if (nextNodesForEdgeArray.length === 2) {
        const [from, to] = nextNodesForEdgeArray;
        addEdgeToDataSet(from, to);
        nextSelectedNodeIdForAlgoValue = clickedNodeId; // O último nó clicado (que formou a aresta) se torna o selecionado para algoritmo
        // O estado de `nodesForNewEdge` será atualizado para [] abaixo
        edgeWasFormed = true;
      } else if (nextNodesForEdgeArray.length === 1) {
        nextSelectedNodeIdForAlgoValue = nextNodesForEdgeArray[0]; // O único nó na seleção de aresta também é o de algoritmo
      } else {
        // Se a seleção de aresta está vazia:
        // Se o clique foi para desmarcar o 'clickedNodeId' (que era o único na seleção de aresta e talvez o de algoritmo)
        if (
          prevNodesForEdge.length === 1 &&
          prevNodesForEdge[0] === clickedNodeId
        ) {
          nextSelectedNodeIdForAlgoValue = null; // Limpa a seleção de algoritmo
        } else {
          // Senão, o nó clicado se torna o selecionado para algoritmo
          nextSelectedNodeIdForAlgoValue = clickedNodeId;
        }
      }

      // Atualiza os estados do React
      setNodesForNewEdge(edgeWasFormed ? [] : nextNodesForEdgeArray);
      setSelectedNodeIdForAlgorithm(nextSelectedNodeIdForAlgoValue);

      const nodesToUpdateVisuals = new Set<IdType>();

      // 1. Nós que ESTAVAM selecionados (para aresta ou algoritmo)
      prevNodesForEdge.forEach((id) => nodesToUpdateVisuals.add(id));
      if (prevSelectedNodeIdForAlgo)
        nodesToUpdateVisuals.add(prevSelectedNodeIdForAlgo);

      // 2. Nós que ESTÃO selecionados AGORA (para aresta ou algoritmo)
      // Usa `nextNodesForEdgeArray` para a seleção de aresta atual (antes de ser resetada se edgeWasFormed)
      // Se uma aresta foi formada, a seleção de `nodesForNewEdge` efetivamente se torna vazia para este ciclo visual.
      const currentVisualEdgeSelection = edgeWasFormed
        ? []
        : nextNodesForEdgeArray;
      currentVisualEdgeSelection.forEach((id) => nodesToUpdateVisuals.add(id));
      if (nextSelectedNodeIdForAlgoValue)
        nodesToUpdateVisuals.add(nextSelectedNodeIdForAlgoValue);

      // 3. O nó clicado sempre precisa ser reavaliado
      nodesToUpdateVisuals.add(clickedNodeId);

      // Aplica as atualizações visuais apenas aos nós identificados
      nodesToUpdateVisuals.forEach((nodeId) => {
        if (currentVisualEdgeSelection.includes(nodeId)) {
          updateNodeColorVisuals(
            nodeId,
            SELECTED_NODE_COLOR_EDGE_CREATION,
            SELECTED_NODE_BORDER_EDGE_CREATION,
          );
        } else if (nodeId === nextSelectedNodeIdForAlgoValue) {
          updateNodeColorVisuals(
            nodeId,
            SELECTED_NODE_COLOR_ALGORITHM,
            SELECTED_NODE_BORDER_ALGORITHM,
          );
        } else {
          updateNodeColorVisuals(
            nodeId,
            DEFAULT_NODE_COLOR,
            DEFAULT_NODE_BORDER_COLOR,
          );
        }
      });
    },
    [
      isAlgorithmRunning,
      nodesForNewEdge,
      selectedNodeIdForAlgorithm,
      addEdgeToDataSet,
      updateNodeColorVisuals,
    ],
  );

  const clearNodeSelectionForEdgeUI = useCallback(() => {
    const currentSelectedAlgoNode = selectedNodeIdForAlgorithm;
    nodesForNewEdge.forEach((id) => {
      if (id !== currentSelectedAlgoNode) {
        updateNodeColorVisuals(
          id,
          DEFAULT_NODE_COLOR,
          DEFAULT_NODE_BORDER_COLOR,
        );
      }
    });
    setNodesForNewEdge([]);
  }, [nodesForNewEdge, selectedNodeIdForAlgorithm, updateNodeColorVisuals]);

  const runAlgorithm = useCallback(
    (algorithm: AlgorithmImplementation, algorithmKey: string) => {
      if (isAlgorithmRunning) {
        console.warn("runAlgorithm: Algoritmo já em execução.");
        return;
      }
      const requiresStartNode = algorithmKey !== "CONNECTED_COMPONENTS";
      if (requiresStartNode && !selectedNodeIdForAlgorithm) {
        setAlgorithmResultMessage(
          "Por favor, selecione um nó inicial para este algoritmo.",
        );
        return;
      }
      setAlgorithmResultMessage(null);
      if (activeAlgorithmCleanupRef.current)
        activeAlgorithmCleanupRef.current();

      utilResetAllVisuals(nodes, edges);
      setNodesForNewEdge([]);
      setIsAlgorithmRunning(true);

      if (selectedNodeIdForAlgorithm && requiresStartNode) {
        updateNodeColorVisuals(
          selectedNodeIdForAlgorithm,
          "lightgreen",
          "green",
        );
      }

      const algoOptions = {
        animationSpeed: ANIMATION_SPEED_MS,
        updateNodeVisual: (id: IdType, updates: Partial<CustomNode>) =>
          utilUpdateNodeVisual(nodes, id, updates),
        updateEdgeVisual: (id: string, updates: Partial<CustomEdge>) =>
          utilUpdateEdgeVisual(edges, id, updates),
        onAlgorithmComplete: (result?: unknown) => {
          setIsAlgorithmRunning(false);
          activeAlgorithmCleanupRef.current = null;
          let message = `${algorithmKey} concluído.`;
          if (typeof result === "object" && result !== null) {
            if (
              "message" in result &&
              typeof (result as { message: string }).message === "string"
            ) {
              message = (result as { message: string }).message;
            } else if (
              algorithmKey === "CONNECTED_COMPONENTS" &&
              "count" in result &&
              typeof (result as { count: number }).count === "number"
            ) {
              message = `Encontrados ${(result as { count: number }).count} componente(s) conectado(s).`;
            } else if (
              algorithmKey === "CYCLE_DETECTION" &&
              "found" in result &&
              typeof (result as { found: boolean }).found === "boolean"
            ) {
              message = (result as { found: boolean }).found
                ? `Alerta: Um ciclo foi detectado!`
                : `Nenhum ciclo detectado a partir do nó inicial.`;
            }
          } else if (result !== undefined)
            message += ` Resultado: ${String(result)}`;
          setAlgorithmResultMessage(message);
          if (selectedNodeIdForAlgorithm && requiresStartNode) {
            updateNodeColorVisuals(
              selectedNodeIdForAlgorithm,
              SELECTED_NODE_COLOR_ALGORITHM,
              SELECTED_NODE_BORDER_ALGORITHM,
            );
          }
        },
      };
      const execution = algorithm(
        nodes,
        edges,
        selectedNodeIdForAlgorithm,
        algoOptions,
      );
      if (execution && typeof execution.cleanup === "function")
        activeAlgorithmCleanupRef.current = execution.cleanup;
    },
    [
      isAlgorithmRunning,
      selectedNodeIdForAlgorithm,
      nodes,
      edges,
      updateNodeColorVisuals,
    ],
  );

  const stopCurrentAlgorithm = useCallback(() => {
    if (activeAlgorithmCleanupRef.current) {
      activeAlgorithmCleanupRef.current();
      activeAlgorithmCleanupRef.current = null;
    }
    setIsAlgorithmRunning(false);
    utilResetAllVisuals(nodes, edges);
    if (selectedNodeIdForAlgorithm) {
      updateNodeColorVisuals(
        selectedNodeIdForAlgorithm,
        SELECTED_NODE_COLOR_ALGORITHM,
        SELECTED_NODE_BORDER_ALGORITHM,
      );
    }
    setNodesForNewEdge([]);
    setAlgorithmResultMessage("Execução finalizada.");
  }, [nodes, edges, selectedNodeIdForAlgorithm, updateNodeColorVisuals]);

  useEffect(() => {
    return () => {
      if (activeAlgorithmCleanupRef.current)
        activeAlgorithmCleanupRef.current();
    };
  }, []);

  return {
    selectedNodeId: selectedNodeIdForAlgorithm,
    nodesForNewEdge,
    isAlgorithmRunning,
    algorithmResultMessage,
    handleNodeClick,
    clearNodeSelectionForEdge: clearNodeSelectionForEdgeUI,
    runAlgorithm,
    stopCurrentAlgorithm,
    setSelectedNodeId: setSelectedNodeIdForAlgorithm,
  };
}
