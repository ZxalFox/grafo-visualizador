// lib/algorithms/bfs.ts
import { IdType } from "vis-network";
import { HIGHLIGHT_COLOR_BFS } from "@/constants/graph-constants";
import { getNeighbors } from "@/lib/graph-utils"; // Assumindo que getNeighbors será mantido/adaptado
import { AlgorithmImplementation } from "@/types/graph-types";

export const bfs: AlgorithmImplementation = (
  nodes,
  edges,
  startNodeId,
  { animationSpeed, updateNodeVisual, onAlgorithmComplete }
) => {
  // Validação do nó inicial
  if (!startNodeId || !nodes.get(startNodeId)) {
    console.error(
      "BFS Error: Start node is invalid or not found in the graph."
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
  // A cor deve ser um objeto completo se não for uma string simples
  updateNodeVisual(startNodeId, {
    // Assumindo que updateNodeVisual em graph-utils ou useGraphInteractions
    // lida com a estrutura completa do objeto de cor (incluindo highlight)
    // ou que HIGHLIGHT_COLOR_BFS é uma string de cor simples.
    // Se HIGHLIGHT_COLOR_BFS for apenas a cor de fundo, a atualização precisa ser mais completa:
    // color: { background: HIGHLIGHT_COLOR_BFS, border: HIGHLIGHT_COLOR_BFS, highlight: { background: ..., border: ... }}
    // Por simplicidade, vamos assumir que updateNodeVisual é inteligente ou que a constante é uma string.
    // Para ser mais explícito e seguro, baseado em nossa definição de Node:
    color: {
      background: HIGHLIGHT_COLOR_BFS,
      border: HIGHLIGHT_COLOR_BFS, // Ou uma cor de borda específica para BFS
      highlight: {
        // Usando placeholders, idealmente seriam constantes
        background: HIGHLIGHT_COLOR_BFS, // Ou um highlight específico para BFS
        border: HIGHLIGHT_COLOR_BFS, // Ou um highlight específico para BFS
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
      // Verificação de segurança, embora queue.length já cubra
      if (intervalId) clearInterval(intervalId);
      if (typeof onAlgorithmComplete === "function") {
        onAlgorithmComplete();
      }
      return;
    }

    // A cor do currentProcessingNodeId já foi atualizada quando ele foi adicionado à 'visited' e à 'queue'.
    // Se quisermos uma cor diferente para "processando agora", poderíamos atualizar aqui.

    const neighbors = getNeighbors(currentProcessingNodeId, edges);

    neighbors.forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
        // Atualiza visualmente o vizinho ao ser descoberto e adicionado à fila
        updateNodeVisual(neighborId, {
          color: {
            // Estrutura de cor completa
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
        intervalId = null; // Boa prática para evitar chamadas múltiplas a clearInterval
      }
    },
  };
};
