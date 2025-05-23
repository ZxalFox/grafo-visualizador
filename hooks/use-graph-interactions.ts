// hooks/use-graph-interactions.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { IdType } from "vis-network";
import {
  NodesDataSet,
  EdgesDataSet,
  AlgorithmImplementation,
  Node as CustomNode, // Renomeado para clareza
  Edge as CustomEdge, // Renomeado para clareza
} from "@/types/graph-types";
import {
  resetAllVisuals as utilResetAllVisuals,
  updateNodeVisual as utilUpdateNodeVisual,
} from "@/lib/graph-utils";
import {
  ANIMATION_SPEED_MS,
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_BORDER_COLOR,
  SELECTED_NODE_COLOR_ALGORITHM,
  SELECTED_NODE_BORDER_ALGORITHM,
  SELECTED_NODE_COLOR_EDGE_CREATION,
  SELECTED_NODE_BORDER_EDGE_CREATION,
  // Constantes de highlight do nó para uso no objeto de cor completo
  NODE_HIGHLIGHT_BACKGROUND,
  NODE_HIGHLIGHT_BORDER,
} from "@/constants/graph-constants";

interface UseGraphInteractionsProps {
  nodes: NodesDataSet;
  edges: EdgesDataSet;
  // addEdgeToDataSet agora é mais simples, sem pesos ou showWeightsGlobally
  addEdgeToDataSet: (from: IdType, to: IdType) => void;
}

export function useGraphInteractions({
  nodes,
  edges,
  addEdgeToDataSet,
}: UseGraphInteractionsProps) {
  const [selectedNodeIdForAlgorithm, setSelectedNodeIdForAlgorithm] =
    useState<IdType | null>(null);
  const [nodesForNewEdge, setNodesForNewEdge] = useState<IdType[]>([]); // Armazena 0, 1 ou 2 nós
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  const activeAlgorithmCleanupRef = useRef<(() => void) | null>(null);

  // Helper para atualizar a cor visual dos nós, garantindo a estrutura completa do objeto de cor
  const updateNodeColorVisuals = useCallback(
    (nodeId: IdType, background: string, border: string) => {
      utilUpdateNodeVisual(nodes, nodeId, {
        color: {
          background,
          border,
          highlight: {
            // Usando constantes de highlight definidas
            background: NODE_HIGHLIGHT_BACKGROUND,
            border: NODE_HIGHLIGHT_BORDER,
          },
        },
      });
    },
    [nodes] // NODE_HIGHLIGHT_BACKGROUND e BORDER são constantes, não precisam ser dependências
  );

  // Reseta visualmente todos os nós para o padrão e limpa seleções internas
  const resetAllNodeVisualSelections = useCallback(() => {
    nodes.getIds().forEach((id) => {
      updateNodeColorVisuals(id, DEFAULT_NODE_COLOR, DEFAULT_NODE_BORDER_COLOR);
    });
    setNodesForNewEdge([]);
    setSelectedNodeIdForAlgorithm(null);
  }, [nodes, updateNodeColorVisuals]);

  const handleNodeClick = useCallback(
    (clickedNodeId: IdType) => {
      if (isAlgorithmRunning) {
        console.log("handleNodeClick: Algoritmo em execução, clique ignorado.");
        return;
      }

      // Atualiza o estado dos nós selecionados para criar uma nova aresta
      setNodesForNewEdge((prevNodesForEdge) => {
        let newSelectionForEdge = [...prevNodesForEdge];

        if (newSelectionForEdge.includes(clickedNodeId)) {
          // Se o nó já está selecionado para aresta, remove-o (desseleção)
          newSelectionForEdge = newSelectionForEdge.filter(
            (id) => id !== clickedNodeId
          );
          // Ao deselecionar, ele pode se tornar o nó para algoritmo, ou nenhum se não houver mais seleções
          setSelectedNodeIdForAlgorithm(
            newSelectionForEdge.length === 0 ? null : newSelectionForEdge[0]
          );
        } else {
          // Se o nó não está selecionado, adiciona-o (até o limite de 2)
          if (newSelectionForEdge.length < 2) {
            newSelectionForEdge.push(clickedNodeId);
          }
        }

        // Lógica após atualizar newSelectionForEdge
        if (newSelectionForEdge.length === 2) {
          const [from, to] = newSelectionForEdge;
          addEdgeToDataSet(from, to); // Adiciona aresta (sem peso)

          // Limpa a seleção para nova aresta
          // E define o último nó clicado (que completou a aresta) como selecionado para algoritmo
          setSelectedNodeIdForAlgorithm(clickedNodeId);
          newSelectionForEdge = []; // Reseta para próxima aresta
        } else if (newSelectionForEdge.length === 1) {
          // Se apenas um nó está selecionado para aresta, ele também é o candidato para algoritmo
          setSelectedNodeIdForAlgorithm(newSelectionForEdge[0]);
        } else {
          // 0 nós selecionados para aresta
          // Se não há nós para aresta, o nó clicado (se não desmarcou a si mesmo)
          // ou o nó que restou (se houver) ou null, define o nó para algoritmo.
          // Se acabamos de deselecionar o único nó, selectedNodeIdForAlgorithm já foi setado para null.
          // Se clicamos em um nó e não havia seleção para aresta, este nó é o candidato.
          setSelectedNodeIdForAlgorithm(clickedNodeId); // Se não estava na seleção e a seleção está vazia, torna-se o candidato
        }

        // Atualiza o visual de todos os nós com base nos estados atuais
        nodes.getIds().forEach((id) => {
          if (newSelectionForEdge.includes(id)) {
            updateNodeColorVisuals(
              id,
              SELECTED_NODE_COLOR_EDGE_CREATION,
              SELECTED_NODE_BORDER_EDGE_CREATION
            );
          } else if (id === selectedNodeIdForAlgorithm) {
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

        return newSelectionForEdge; // Retorna o novo estado para setNodesForNewEdge
      });
    },
    [
      isAlgorithmRunning,
      nodes, // DataSet é estável
      addEdgeToDataSet, // Callback do prop, deve ser estável
      updateNodeColorVisuals, // Callback interno, estável
      // selectedNodeIdForAlgorithm é lido indiretamente via setSelectedNodeIdForAlgorithm
    ]
  );

  const clearNodeSelectionForEdgeUI = useCallback(() => {
    // Reseta a cor dos nós que estavam selecionados para uma nova aresta
    nodesForNewEdge.forEach((id) => {
      // Se o nó não for o selecionado para algoritmo, reseta para padrão, senão mantém cor de algoritmo
      if (id !== selectedNodeIdForAlgorithm) {
        updateNodeColorVisuals(
          id,
          DEFAULT_NODE_COLOR,
          DEFAULT_NODE_BORDER_COLOR
        );
      }
    });
    setNodesForNewEdge([]);
    // Não limpa selectedNodeIdForAlgorithm aqui, permitindo que um nó seja selecionado para algoritmo
    // e o usuário cancele a criação de uma aresta sem perder a seleção do algoritmo.
  }, [
    nodesForNewEdge,
    selectedNodeIdForAlgorithm,
    updateNodeColorVisuals,
    setNodesForNewEdge,
  ]);

  // runAlgorithm agora não precisa de algorithmName para lógica de peso
  const runAlgorithm = useCallback(
    (algorithm: AlgorithmImplementation, algorithmName?: string) => {
      if (isAlgorithmRunning) {
        console.warn(
          "runAlgorithm: Tentativa de iniciar algoritmo enquanto outro está em execução."
        );
        return;
      }
      if (!selectedNodeIdForAlgorithm) {
        alert("Por favor, selecione um nó inicial clicando nele.");
        return;
      }

      if (activeAlgorithmCleanupRef.current) {
        activeAlgorithmCleanupRef.current(); // Limpa qualquer intervalo de algoritmo anterior
      }

      utilResetAllVisuals(nodes, edges); // Reseta todas as cores do grafo (nós e arestas)
      setNodesForNewEdge([]); // Garante que a seleção de aresta seja limpa
      setIsAlgorithmRunning(true);

      // Destaca o nó inicial do algoritmo
      updateNodeColorVisuals(selectedNodeIdForAlgorithm, "lightgreen", "green"); // Cor específica para início de algoritmo

      const algoOptions = {
        animationSpeed: ANIMATION_SPEED_MS,
        updateNodeVisual: (id: IdType, updates: Partial<CustomNode>) => {
          // Esta função é chamada pelos algoritmos para atualizar o visual de um nó.
          // Ex: marcar como visitado com uma cor específica do algoritmo.
          utilUpdateNodeVisual(nodes, id, updates);
        },
        onAlgorithmComplete: () => {
          setIsAlgorithmRunning(false);
          activeAlgorithmCleanupRef.current = null;
          console.log(`${algorithmName || "Algoritmo"} concluído.`);
          // Mantém o nó inicial do algoritmo selecionado e colorido (ex: lightblue)
          // para que o usuário saiba qual foi o ponto de partida, se desejar.
          // Ou pode resetar para DEFAULT_NODE_COLOR se preferir.
          if (selectedNodeIdForAlgorithm) {
            updateNodeColorVisuals(
              selectedNodeIdForAlgorithm,
              SELECTED_NODE_COLOR_ALGORITHM,
              SELECTED_NODE_BORDER_ALGORITHM
            );
          }
        },
      };

      const result = algorithm(
        nodes,
        edges,
        selectedNodeIdForAlgorithm,
        algoOptions
      );
      if (result && typeof result.cleanup === "function") {
        activeAlgorithmCleanupRef.current = result.cleanup;
      }
    },
    [
      isAlgorithmRunning,
      selectedNodeIdForAlgorithm,
      nodes,
      edges,
      updateNodeColorVisuals, // Dependência
    ]
  );

  const stopCurrentAlgorithm = useCallback(() => {
    if (activeAlgorithmCleanupRef.current) {
      activeAlgorithmCleanupRef.current();
      activeAlgorithmCleanupRef.current = null;
    }
    setIsAlgorithmRunning(false);
    utilResetAllVisuals(nodes, edges); // Reseta todas as cores
    // Limpa seleções visuais e de estado
    if (selectedNodeIdForAlgorithm) {
      updateNodeColorVisuals(
        selectedNodeIdForAlgorithm,
        DEFAULT_NODE_COLOR,
        DEFAULT_NODE_BORDER_COLOR
      );
    }
    setSelectedNodeIdForAlgorithm(null);
    nodesForNewEdge.forEach((id) =>
      updateNodeColorVisuals(id, DEFAULT_NODE_COLOR, DEFAULT_NODE_BORDER_COLOR)
    );
    setNodesForNewEdge([]);
  }, [
    nodes,
    edges,
    selectedNodeIdForAlgorithm,
    nodesForNewEdge,
    updateNodeColorVisuals,
  ]);

  // Efeito para limpar o intervalo do algoritmo se o componente for desmontado
  useEffect(() => {
    return () => {
      if (activeAlgorithmCleanupRef.current) {
        activeAlgorithmCleanupRef.current();
      }
    };
  }, []); // Executa apenas no mount e unmount do hook/componente que o usa

  return {
    selectedNodeId: selectedNodeIdForAlgorithm,
    nodesForNewEdge, // Para feedback na UI sobre quantos nós estão selecionados para a aresta
    isAlgorithmRunning,
    // Estados removidos: isEditingEdgeWeights, showWeightsGlobally
    handleNodeClick,
    // handleEdgeClick removido
    clearNodeSelectionForEdge: clearNodeSelectionForEdgeUI,
    runAlgorithm,
    stopCurrentAlgorithm,
    setSelectedNodeId: setSelectedNodeIdForAlgorithm, // Permite resetar externamente
    // toggleEditWeightsMode removido
  };
}
