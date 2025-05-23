// hooks/use-graph-interactions.ts
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
    [nodes]
  );

  const handleNodeClick = useCallback(
    (clickedNodeId: IdType) => {
      if (isAlgorithmRunning) {
        console.log("handleNodeClick: Algoritmo em execução, clique ignorado.");
        return;
      }

      setAlgorithmResultMessage(null); // Limpa mensagens anteriores

      // Para evitar ler selectedNodeIdForAlgorithm obsoleto dentro do updater do setNodesForNewEdge,
      // vamos calcular o próximo estado de ambos e depois atualizar os visuais.
      // Primeiro, calculamos qual seria o próximo estado de nodesForNewEdge.
      let nextNodesForEdge: IdType[];
      const currentNodesForEdge = nodesForNewEdge; // Pega o valor atual do estado

      if (currentNodesForEdge.includes(clickedNodeId)) {
        nextNodesForEdge = currentNodesForEdge.filter(
          (id) => id !== clickedNodeId
        );
      } else {
        nextNodesForEdge = [...currentNodesForEdge, clickedNodeId];
        if (nextNodesForEdge.length > 2) {
          // Não deve permitir mais de 2, mas como segurança
          nextNodesForEdge = [nextNodesForEdge[0], clickedNodeId]; // Mantém o primeiro e o clicado
        }
      }

      // Agora, com base no nextNodesForEdge, determinamos o nextSelectedNodeIdForAlgorithm
      // e se uma aresta deve ser criada.
      let nextSelectedNodeIdForAlgo = selectedNodeIdForAlgorithm; // Começa com o valor atual

      if (nextNodesForEdge.length === 2) {
        const [from, to] = nextNodesForEdge;
        addEdgeToDataSet(from, to);
        nextSelectedNodeIdForAlgo = clickedNodeId; // O último nó clicado se torna o de algoritmo
        // Imediatamente após adicionar a aresta, resetamos a seleção para a próxima aresta
        setNodesForNewEdge([]); // Atualiza o estado para a próxima renderização
        // Para a atualização visual IMEDIATA, usaremos um array vazio para newSelectionForEdge
        // A atualização visual abaixo usará `[]` para newSelectionForEdge e nextSelectedNodeIdForAlgo
        nodes.getIds().forEach((id) => {
          if (id === nextSelectedNodeIdForAlgo) {
            updateNodeColorVisuals(
              id,
              SELECTED_NODE_COLOR_ALGORITHM,
              SELECTED_NODE_BORDER_ALGORITHM
            );
          } else {
            updateNodeColorVisuals(
              id,
              DEFAULT_NODE_COLOR,
              DEFAULT_NODE_BORDER_COLOR
            );
          }
        });
        setSelectedNodeIdForAlgorithm(nextSelectedNodeIdForAlgo);
      } else {
        // Se não formou uma aresta completa, atualiza os estados e os visuais
        if (nextNodesForEdge.length === 1) {
          nextSelectedNodeIdForAlgo = nextNodesForEdge[0];
        } else {
          // nextNodesForEdge.length === 0
          // Se desmarcou o único nó que estava para aresta, ou clicou e não havia seleção
          nextSelectedNodeIdForAlgo = clickedNodeId; // O nó clicado se torna o de algoritmo se a seleção de aresta está vazia
          // Se o nó clicado era o único na seleção e foi desmarcado, nextNodesForEdge estará vazio.
          // Nesse caso, clickedNodeId (que foi desmarcado) não deveria ser o nó de algoritmo.
          // Se desmarcou o único, e nextNodesForEdge se tornou [], então o nó de algo deve ser null.
          if (
            currentNodesForEdge.length === 1 &&
            currentNodesForEdge[0] === clickedNodeId &&
            nextNodesForEdge.length === 0
          ) {
            nextSelectedNodeIdForAlgo = null;
          }
        }
        setNodesForNewEdge(nextNodesForEdge);
        setSelectedNodeIdForAlgorithm(nextSelectedNodeIdForAlgo);

        // Atualiza o visual de todos os nós com base nos estados calculados para este clique
        nodes.getIds().forEach((id) => {
          if (nextNodesForEdge.includes(id)) {
            updateNodeColorVisuals(
              id,
              SELECTED_NODE_COLOR_EDGE_CREATION,
              SELECTED_NODE_BORDER_EDGE_CREATION
            );
          } else if (id === nextSelectedNodeIdForAlgo) {
            updateNodeColorVisuals(
              id,
              SELECTED_NODE_COLOR_ALGORITHM,
              SELECTED_NODE_BORDER_ALGORITHM
            );
          } else {
            updateNodeColorVisuals(
              id,
              DEFAULT_NODE_COLOR,
              DEFAULT_NODE_BORDER_COLOR
            );
          }
        });
      }
    },
    [
      isAlgorithmRunning,
      nodes,
      edges, // edges pode ser necessário se addEdgeToDataSet tivesse efeitos colaterais visuais lidos aqui
      addEdgeToDataSet,
      updateNodeColorVisuals,
      nodesForNewEdge, // Precisa ler o estado atual para calcular o próximo
      selectedNodeIdForAlgorithm, // Precisa ler o estado atual
      // setSelectedNodeIdForAlgorithm e setNodesForNewEdge não são dependências de useCallback
    ]
  );

  const clearNodeSelectionForEdgeUI = useCallback(() => {
    const currentSelectedAlgoNode = selectedNodeIdForAlgorithm;
    nodesForNewEdge.forEach((id) => {
      if (id !== currentSelectedAlgoNode) {
        updateNodeColorVisuals(
          id,
          DEFAULT_NODE_COLOR,
          DEFAULT_NODE_BORDER_COLOR
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

      const requiresStartNode = !(algorithmKey === "CONNECTED_COMPONENTS");
      if (requiresStartNode && !selectedNodeIdForAlgorithm) {
        setAlgorithmResultMessage(
          "Por favor, selecione um nó inicial para este algoritmo."
        );
        // alert("Por favor, selecione um nó inicial para este algoritmo."); // Alert pode ser intrusivo
        return;
      }

      setAlgorithmResultMessage(null);
      if (activeAlgorithmCleanupRef.current) {
        activeAlgorithmCleanupRef.current();
      }

      utilResetAllVisuals(nodes, edges);
      setNodesForNewEdge([]);
      setIsAlgorithmRunning(true);

      if (selectedNodeIdForAlgorithm && requiresStartNode) {
        updateNodeColorVisuals(
          selectedNodeIdForAlgorithm,
          "lightgreen",
          "green"
        );
      }

      const algoOptions = {
        animationSpeed: ANIMATION_SPEED_MS,
        updateNodeVisual: (id: IdType, updates: Partial<CustomNode>) => {
          utilUpdateNodeVisual(nodes, id, updates);
        },
        updateEdgeVisual: (id: string, updates: Partial<CustomEdge>) => {
          utilUpdateEdgeVisual(edges, id, updates);
        },
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
              message = `Encontrados ${
                (result as { count: number }).count
              } componente(s) conectado(s).`;
            } else if (
              algorithmKey === "CYCLE_DETECTION" &&
              "found" in result &&
              typeof (result as { found: boolean }).found === "boolean"
            ) {
              message = (result as { found: boolean }).found
                ? `Alerta: Um ciclo foi detectado!`
                : `Nenhum ciclo detectado a partir do nó inicial.`;
            }
          } else if (result !== undefined) {
            message += ` Resultado: ${String(result)}`;
          }
          setAlgorithmResultMessage(message);

          if (selectedNodeIdForAlgorithm && requiresStartNode) {
            updateNodeColorVisuals(
              selectedNodeIdForAlgorithm,
              SELECTED_NODE_COLOR_ALGORITHM,
              SELECTED_NODE_BORDER_ALGORITHM
            );
          }
        },
      };

      const execution = algorithm(
        nodes,
        edges,
        selectedNodeIdForAlgorithm,
        algoOptions
      );
      if (execution && typeof execution.cleanup === "function") {
        activeAlgorithmCleanupRef.current = execution.cleanup;
      }
    },
    [
      isAlgorithmRunning,
      selectedNodeIdForAlgorithm,
      nodes,
      edges,
      updateNodeColorVisuals,
      // setAlgorithmResultMessage não é uma dependência direta do useCallback, mas é usado internamente
    ]
  );

  const stopCurrentAlgorithm = useCallback(() => {
    if (activeAlgorithmCleanupRef.current) {
      activeAlgorithmCleanupRef.current();
      activeAlgorithmCleanupRef.current = null;
    }
    setIsAlgorithmRunning(false);
    utilResetAllVisuals(nodes, edges);

    // Mantém o nó de algoritmo selecionado, se houver, e sua cor de seleção
    if (selectedNodeIdForAlgorithm) {
      updateNodeColorVisuals(
        selectedNodeIdForAlgorithm,
        SELECTED_NODE_COLOR_ALGORITHM,
        SELECTED_NODE_BORDER_ALGORITHM
      );
    } else {
      // Se não havia nó de algoritmo selecionado, garante que tudo está no padrão
      nodes
        .getIds()
        .forEach((id) =>
          updateNodeColorVisuals(
            id,
            DEFAULT_NODE_COLOR,
            DEFAULT_NODE_BORDER_COLOR
          )
        );
    }
    setNodesForNewEdge([]);
    setAlgorithmResultMessage(
      "Execução do algoritmo interrompida pelo usuário."
    );
  }, [nodes, edges, selectedNodeIdForAlgorithm, updateNodeColorVisuals]);

  useEffect(() => {
    return () => {
      if (activeAlgorithmCleanupRef.current) {
        activeAlgorithmCleanupRef.current();
      }
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
