// lib/algorithms/connected-components.ts
import { IdType } from "vis-network";
import {
  COMPONENT_COLORS,
  NODE_HIGHLIGHT_BORDER,
  NODE_HIGHLIGHT_BACKGROUND,
} from "@/constants/graph-constants"; // Paleta de cores para os componentes
import { getNeighbors } from "@/lib/graph-utils";
import { AlgorithmImplementation } from "@/types/graph-types";

export const findConnectedComponents: AlgorithmImplementation = (
  nodes,
  edges,
  _startNodeId, // O nó inicial não é estritamente necessário, o algoritmo varre todos os nós
  { animationSpeed, updateNodeVisual, onAlgorithmComplete }
) => {
  const visited = new Set<IdType>(); // Nós já visitados em alguma travessia de componente
  let componentCount = 0;
  let colorIndex = 0; // Para ciclar pelas cores em COMPONENT_COLORS

  const allNodeIds = nodes.getIds(); // Pega todos os IDs de nós no início
  let mainNodeIndex = 0; // Índice para iterar por allNodeIds

  const currentComponentQueue: IdType[] = []; // Fila para o BFS dentro do componente atual
  let currentComponentColor: string;
  let currentComponentIdValue: number;

  let intervalId: NodeJS.Timeout | null = null;

  const step = () => {
    // Fase 1: Processar a fila do BFS do componente atual
    if (currentComponentQueue.length > 0) {
      const currentNodeInComponent = currentComponentQueue.shift()!; // Sabemos que não é vazio

      // Nó já foi colorido quando adicionado à fila/visitado pela primeira vez
      // Mas podemos reconfirmar ou adicionar um efeito de "processando" se desejado

      const neighbors = getNeighbors(currentNodeInComponent, edges);
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          currentComponentQueue.push(neighborId);
          nodes.update({
            // Atualiza o DataSet diretamente com a propriedade 'component'
            id: neighborId,
            component: currentComponentIdValue,
          });
          updateNodeVisual(neighborId, {
            // Atualiza o visual
            color: {
              background: currentComponentColor,
              border: currentComponentColor, // Pode ser uma borda diferente se preferir
              highlight: {
                // Highlight consistente
                background: NODE_HIGHLIGHT_BACKGROUND,
                border: NODE_HIGHLIGHT_BORDER,
              },
            },
            // A propriedade 'component' é atualizada no DataSet, não precisa ser em 'updates' visuais
            // a menos que queira exibir no label do nó, o que exigiria mais lógica.
          });
        }
      }
      // Se a fila do componente atual esvaziou, passamos para a próxima iteração principal
      if (currentComponentQueue.length === 0) {
        // Não faz nada aqui, a próxima chamada a step irá para a Fase 2
      }
    }
    // Fase 2: Encontrar o próximo nó não visitado para iniciar um novo componente
    else {
      let foundNextStartNode = false;
      while (mainNodeIndex < allNodeIds.length) {
        const potentialStartNodeId = allNodeIds[mainNodeIndex];
        mainNodeIndex++; // Avança para a próxima vez

        if (!visited.has(potentialStartNodeId)) {
          componentCount++;
          currentComponentIdValue = componentCount;
          currentComponentColor =
            COMPONENT_COLORS[colorIndex % COMPONENT_COLORS.length];
          colorIndex++;

          visited.add(potentialStartNodeId);
          currentComponentQueue.push(potentialStartNodeId);
          nodes.update({
            id: potentialStartNodeId,
            component: currentComponentIdValue,
          });
          updateNodeVisual(potentialStartNodeId, {
            color: {
              background: currentComponentColor,
              border: currentComponentColor,
              highlight: {
                background: NODE_HIGHLIGHT_BACKGROUND,
                border: NODE_HIGHLIGHT_BORDER,
              },
            },
          });
          foundNextStartNode = true;
          break; // Sai do while e permite que a próxima chamada a step processe a fila
        }
      }
      // Se não encontrou mais nós não visitados e a fila está vazia, o algoritmo terminou
      if (!foundNextStartNode && currentComponentQueue.length === 0) {
        if (intervalId) clearInterval(intervalId);
        if (typeof onAlgorithmComplete === "function") {
          // Retorna um objeto com a contagem e uma mensagem
          onAlgorithmComplete({
            count: componentCount,
            message: `Encontrados ${componentCount} componente(s) conectado(s).`,
          });
        }
        return;
      }
    }
  };

  // Inicia a animação
  // Reseta visuais antes de começar, caso haja estados anteriores
  // resetAllVisuals(nodes, edges); // Isso já deve ser feito pelo useGraphInteractions
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
