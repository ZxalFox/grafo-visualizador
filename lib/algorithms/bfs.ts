import { IdType } from "vis-network";
import { HIGHLIGHT_COLOR_BFS } from "@/constants/graph-constants";
import { getNeighbors } from "@/lib/graph-utils";
import { AlgorithmImplementation } from "@/types/graph-types";

export const bfs: AlgorithmImplementation = (
  nodes,
  edges,
  startNodeId,
  { animationSpeed, updateNodeVisual, onAlgorithmComplete },
) => {
  // Validação do nó inicial
  if (!startNodeId || !nodes.get(startNodeId)) {
    console.error(
      "BFS Error: Start node is invalid or not found in the graph.",
    );
    if (typeof onAlgorithmComplete === "function") {
      onAlgorithmComplete();
    }
    return; // Retorna explicitamente se não houver nó inicial
  }

  const visited = new Set<IdType>();
  const queue: IdType[] = [];
  let intervalId: NodeJS.Timeout | null = null; // Para controlar a animação

  // Adiciona o nó inicial à fila e marca como visitado
  queue.push(startNodeId);
  visited.add(startNodeId);

  // Atualiza visualmente o nó inicial
  updateNodeVisual(startNodeId, {
    color: {
      background: HIGHLIGHT_COLOR_BFS,
      border: HIGHLIGHT_COLOR_BFS,
      highlight: {
        background: HIGHLIGHT_COLOR_BFS,
        border: HIGHLIGHT_COLOR_BFS,
      },
    },
  });

  const step = () => {
    if (queue.length === 0) {
      if (intervalId) clearInterval(intervalId);
      if (typeof onAlgorithmComplete === "function") {
        onAlgorithmComplete();
      }
      return;
    }

    const currentProcessingNodeId = queue.shift();
    if (!currentProcessingNodeId) {
      if (intervalId) clearInterval(intervalId);
      if (typeof onAlgorithmComplete === "function") {
        onAlgorithmComplete();
      }
      return;
    }

    const neighbors = getNeighbors(currentProcessingNodeId, edges);

    neighbors.forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
        updateNodeVisual(neighborId, {
          color: {
            background: HIGHLIGHT_COLOR_BFS,
            border: HIGHLIGHT_COLOR_BFS,
            highlight: {
              background: HIGHLIGHT_COLOR_BFS,
              border: HIGHLIGHT_COLOR_BFS,
            },
          },
        });
      }
    });
  };

  // Inicia a animação
  intervalId = setInterval(step, animationSpeed);

  // Retorna a função de limpeza para interromper o intervalo se o componente for desmontado
  // ou se o algoritmo for parado externamente.
  return {
    cleanup: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
};
