// lib/algorithms/dfs.ts
import { IdType } from "vis-network";
import { HIGHLIGHT_COLOR_DFS } from "@/constants/graph-constants";
import { getNeighbors } from "@/lib/graph-utils"; // Assumindo que getNeighbors será mantido/adaptado
import { AlgorithmImplementation } from "@/types/graph-types";

export const dfs: AlgorithmImplementation = (
  nodes,
  edges,
  startNodeId,
  { animationSpeed, updateNodeVisual, onAlgorithmComplete }
) => {
  // Validação do nó inicial
  if (!startNodeId || !nodes.get(startNodeId)) {
    console.error("DFS Error: Start node is invalid or not found in the graph.");
    if (typeof onAlgorithmComplete === "function") {
      onAlgorithmComplete();
    }
    return;
  }

  const visited = new Set<IdType>();
  const stack: IdType[] = []; // Usamos uma pilha para DFS iterativo
  let intervalId: NodeJS.Timeout | null = null;

  // Adiciona o nó inicial à pilha
  stack.push(startNodeId);

  const step = () => {
    if (stack.length === 0) {
      if (intervalId) clearInterval(intervalId);
      if (typeof onAlgorithmComplete === "function") {
        onAlgorithmComplete();
      }
      return;
    }

    const currentProcessingNodeId = stack.pop(); // Pega do topo da pilha
    if (!currentProcessingNodeId) { // Verificação de segurança
        if (intervalId) clearInterval(intervalId);
        if (typeof onAlgorithmComplete === "function") {
            onAlgorithmComplete();
        }
        return;
    }

    if (!visited.has(currentProcessingNodeId)) {
      visited.add(currentProcessingNodeId);

      // Atualiza visualmente o nó ao ser visitado
      updateNodeVisual(currentProcessingNodeId, {
        color: { // Estrutura de cor completa
            background: HIGHLIGHT_COLOR_DFS,
            border: HIGHLIGHT_COLOR_DFS, // Ou uma cor de borda específica para DFS
            highlight: { // Usando placeholders, idealmente seriam constantes
                background: HIGHLIGHT_COLOR_DFS, // Ou um highlight específico para DFS
                border: HIGHLIGHT_COLOR_DFS,     // Ou um highlight específico para DFS
            }
        }
      });

      const neighbors = getNeighbors(currentProcessingNodeId, edges);
      // Adiciona vizinhos não visitados à pilha.
      // A ordem de adição pode influenciar a ordem de visitação (ex: reverter para simular recursão).
      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          stack.push(neighborId);
        }
      });
    }
  };

  // Inicia a animação
  intervalId = setInterval(step, animationSpeed);

  return {
    cleanup: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
};