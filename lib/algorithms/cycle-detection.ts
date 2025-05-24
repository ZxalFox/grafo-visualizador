import { IdType } from "vis-network";
import {
  HIGHLIGHT_COLOR_DFS,
  HIGHLIGHT_COLOR_CYCLE_EDGE,
  NODE_HIGHLIGHT_BACKGROUND,
  NODE_HIGHLIGHT_BORDER,
  EDGE_HIGHLIGHT_COLOR, 
  DEFAULT_EDGE_COLOR, 
} from "@/constants/graph-constants";
import { getNeighbors } from "@/lib/graph-utils";
import { AlgorithmImplementation } from "@/types/graph-types";

export const detectCycle: AlgorithmImplementation = (
  nodes,
  edges,
  startNodeId,
  { animationSpeed, updateNodeVisual, updateEdgeVisual, onAlgorithmComplete }
) => {
  if (!startNodeId) {
    console.error("Cycle Detection Error: Start node is required.");
    if (typeof onAlgorithmComplete === "function") {
      onAlgorithmComplete({
        found: false,
        message: "Nó inicial não fornecido.",
      });
    }
    return;
  }
  if (!nodes.get(startNodeId)) {
    console.error("Cycle Detection Error: Start node not found in graph.");
    if (typeof onAlgorithmComplete === "function") {
      onAlgorithmComplete({
        found: false,
        message: "Nó inicial não encontrado no grafo.",
      });
    }
    return;
  }

  const visited = new Set<IdType>();
  const parent = new Map<IdType, IdType | null>();
  const dfsStack: IdType[] = [];

  let cycleFound = false;
  const cycleEdgesSet = new Set<string>();
  let intervalId: NodeJS.Timeout | null = null;

  dfsStack.push(startNodeId);
  // O nó é marcado como visitado e colorido quando é processado pela primeira vez no loop 'step'

  const step = () => {
    if (dfsStack.length === 0 || cycleFound) {
      if (intervalId) clearInterval(intervalId);
      if (typeof onAlgorithmComplete === "function") {
        onAlgorithmComplete({
          found: cycleFound,
          message: cycleFound
            ? "Ciclo detectado!"
            : "Nenhum ciclo detectado a partir do nó inicial.",
          cycleEdgeIds: Array.from(cycleEdgesSet),
        });
      }
      return;
    }

    const u = dfsStack[dfsStack.length - 1]; 
    if (!visited.has(u)) {
      visited.add(u);
      updateNodeVisual(u, {
        color: {
          background: HIGHLIGHT_COLOR_DFS,
          border: HIGHLIGHT_COLOR_DFS,
          highlight: {
            background: NODE_HIGHLIGHT_BACKGROUND,
            border: NODE_HIGHLIGHT_BORDER,
          },
        },
      });
    }

    const neighbors = getNeighbors(u, edges);
    let processedChildInThisStep = false;

    for (const v of neighbors) {
      if (cycleFound) break;

      const edgeIdUV = [u, v].sort((a, b) => Number(a) - Number(b)).join("-");

      if (!visited.has(v)) {
        parent.set(v, u);
        dfsStack.push(v);
        processedChildInThisStep = true;
        break;
      } else if (v !== parent.get(u)) {
        cycleFound = true;
        cycleEdgesSet.add(edgeIdUV);
        updateEdgeVisual(edgeIdUV, {
          isHighlighted: true,
          color: {
            color: HIGHLIGHT_COLOR_CYCLE_EDGE,
            highlight: HIGHLIGHT_COLOR_CYCLE_EDGE,
          },
        });

        let curr = u;
        while (curr !== v && parent.has(curr)) {
          const p = parent.get(curr)!;
          if (p === null) break; // Atingiu a raiz antes de encontrar v, não deveria acontecer em um ciclo simples
          const edgeIdCurrP = [curr, p]
            .sort((a, b) => Number(a) - Number(b))
            .join("-");
          cycleEdgesSet.add(edgeIdCurrP);
          updateEdgeVisual(edgeIdCurrP, {
            isHighlighted: true,
            color: {
              color: HIGHLIGHT_COLOR_CYCLE_EDGE,
              highlight: HIGHLIGHT_COLOR_CYCLE_EDGE,
            },
          });
          curr = p;
          if (cycleEdgesSet.size > edges.length) {
            // Safety break
            console.error("Cycle path reconstruction possibly looping");
            break;
          }
        }
        processedChildInThisStep = true; // Considera que "processou" ao encontrar ciclo
        break;
      }
    }

    if (
      !processedChildInThisStep &&
      dfsStack.length > 0 &&
      dfsStack[dfsStack.length - 1] === u
    ) {
      // Se nenhum vizinho não visitado foi empilhado (ou um ciclo foi encontrado e interrompeu o loop de vizinhos)
      // e 'u' ainda é o topo (o que significa que não ramificamos para um novo filho nesta etapa),
      // então 'u' está totalmente explorado.
      dfsStack.pop();
    }
  };

  intervalId = setInterval(step, animationSpeed);

  return {
    cleanup: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      const highlightedEdges = edges
        .get()
        .filter((edge) => edge.isHighlighted === true);

      highlightedEdges.forEach((edge) => {
        if (typeof edge.id === "string") {
          updateEdgeVisual(edge.id, {
            isHighlighted: false,
            color: {
              // Reseta para a cor padrão da aresta
              color: DEFAULT_EDGE_COLOR,
              highlight: EDGE_HIGHLIGHT_COLOR,
            },
          });
        }
      });
    },
  };
};
