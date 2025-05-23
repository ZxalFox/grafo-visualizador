// components/graph-visualization.tsx
"use client"; // Mantém a diretiva para componentes cliente no Next.js App Router

import React, { useEffect, useRef, memo } from "react"; // Adicionado memo para otimização
import { Network, IdType, Options as VisOptions } from "vis-network/peer"; // Importado VisOptions para tipar GRAPH_OPTIONS
import { NodesDataSet, EdgesDataSet } from "@/types/graph-types"; // Nossos tipos customizados
import { GRAPH_OPTIONS } from "@/constants/graph-constants"; // Nossas opções de grafo padrão

interface GraphVisualizationProps {
  nodes: NodesDataSet; // DataSet de nós
  edges: EdgesDataSet; // DataSet de arestas
  onNodeClick: (nodeId: IdType) => void; // Callback para quando um nó é clicado
  // onEdgeClick foi removido, pois não há mais edição de pesos de aresta por clique
  setNetworkInstance: (network: Network | null) => void; // Callback para expor a instância da rede
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  nodes,
  edges,
  onNodeClick,
  // onEdgeClick não é mais uma prop
  setNetworkInstance,
}) => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  // Usamos uma ref para a instância da rede para poder destruí-la no cleanup
  // e para acessar métodos da rede (como 'fit')
  const networkInstanceRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!graphContainerRef.current) {
      console.warn(
        "Graph container ref not available for network initialization."
      );
      return;
    }

    const data = { nodes, edges };

    // As opções do grafo são importadas e agora são explicitamente tipadas
    // para melhor segurança e autocompletar.
    // Removido o @ts-ignore, assumindo que GRAPH_OPTIONS está alinhado com VisOptions.
    // Se houver problemas de tipo com GRAPH_OPTIONS, eles devem ser corrigidos em constants/graph-constants.ts
    // ou um cast seguro pode ser feito aqui se as diferenças forem intencionais e compatíveis.
    const newNetwork = new Network(
      graphContainerRef.current,
      data,
      GRAPH_OPTIONS as VisOptions // Cast para VisOptions para garantir compatibilidade
    );

    // Event listener para cliques no grafo
    newNetwork.on("click", (params) => {
      if (params.nodes.length > 0) {
        // Se um ou mais nós foram clicados, chama onNodeClick com o primeiro nó clicado
        onNodeClick(params.nodes[0]);
      } else {
        // Se o clique foi fora de um nó (e não em uma aresta com handler específico),
        // pode-se, opcionalmente, limpar a seleção de nó aqui, se desejado.
        // Exemplo: onNodeClick(null); // Descomente se quiser essa funcionalidade
      }
      // A lógica para onEdgeClick foi removida
    });

    networkInstanceRef.current = newNetwork; // Armazena a instância na ref
    if (typeof setNetworkInstance === "function") {
      setNetworkInstance(newNetwork); // Expõe a instância via callback
    }

    // Função de cleanup do useEffect: destrói a instância da rede ao desmontar o componente
    // ou antes de recriar o efeito devido a mudanças nas dependências.
    return () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
        networkInstanceRef.current = null;
        if (typeof setNetworkInstance === "function") {
          setNetworkInstance(null);
        }
      }
    };
    // Dependências do useEffect: recria a rede se os DataSets de nós/arestas mudarem,
    // ou se as callbacks onNodeClick/setNetworkInstance mudarem.
  }, [nodes, edges, onNodeClick, setNetworkInstance]);

  // Efeito separado para lidar com o redimensionamento da janela e ajustar o grafo.
  // Este efeito só precisa rodar uma vez para adicionar/remover o event listener.
  useEffect(() => {
    const handleResize = () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.fit(); // Ajusta o zoom para caber todos os elementos
      }
    };

    window.addEventListener("resize", handleResize);
    // Chama uma vez para o ajuste inicial, se a rede já existir
    // (pode ser redundante se a física já fizer isso na estabilização)
    // handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Array de dependências vazio, roda apenas no mount e unmount

  return (
    <div
      ref={graphContainerRef}
      className="w-full h-[500px] md:h-[600px] bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden"
      aria-label="Área de visualização do grafo interativo"
      role="application" // Indica que é uma aplicação interativa
    />
  );
};

// Envolver com React.memo pode otimizar se as props não mudarem frequentemente,
// prevenindo re-renderizações desnecessárias do componente de visualização.
export default memo(GraphVisualization);
