// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { IdType, Network } from "vis-network/peer"; // Tipos do vis-network

// Hooks customizados
import { useGraphData } from "@/hooks/use-graph-data";
import { useGraphInteractions } from "@/hooks/use-graph-interactions";

// Componentes da UI
import GraphVisualization from "@/components/graph-visualization";
import GraphEditorControls from "@/components/graph-editor-controls";
import AlgorithmControls from "@/components/algorithm-controls";

// Tipos customizados da aplicação
import { Node, Edge, AlgorithmImplementation } from "@/types/graph-types";

// Dados iniciais para o grafo (opcional)
// Node[] e Edge[] já são os tipos simplificados (sem peso em Edge)
const initialNodesData: Node[] = [
  { id: 1, label: "Nó A" }, // Cor e outros visuais são definidos por useGraphData
  { id: 2, label: "Nó B" },
  { id: 3, label: "Nó C" },
  { id: 4, label: "Nó D" },
];

const initialEdgesData: Edge[] = [
  // Sem 'weight' ou 'label' para pesos
  { id: "1-2", from: 1, to: 2 },
  { id: "1-3", from: 1, to: 3 },
  { id: "2-4", from: 2, to: 4 },
  { id: "3-4", from: 3, to: 4 },
];

export default function HomePage() {
  // Hook para gerenciar os dados do grafo (nós, arestas e suas manipulações básicas)
  const {
    nodes, // DataSet de nós
    edges, // DataSet de arestas
    addNode,
    removeNode,
    addEdge: addEdgeToDataSet, // Função para adicionar aresta (assinatura simplificada)
    removeLastEdge,
    resetGraphVisuals: hardResetVisuals, // Função para resetar visuais (assinatura simplificada)
    clearGraph,
  } = useGraphData(initialNodesData, initialEdgesData);

  // Hook para gerenciar interações do usuário com o grafo e execução de algoritmos
  const {
    selectedNodeId, // ID do nó selecionado para iniciar algoritmo
    nodesForNewEdge, // Nós selecionados para criar uma nova aresta (0, 1 ou 2)
    isAlgorithmRunning, // Boolean: um algoritmo está em execução?
    handleNodeClick, // Handler para clique em nó
    clearNodeSelectionForEdge, // Para limpar seleção de nós para nova aresta
    runAlgorithm: runAlgorithmFromHook, // Função base para rodar algoritmo
    stopCurrentAlgorithm, // Para parar algoritmo em execução
    setSelectedNodeId, // Para setar/limpar nó selecionado para algoritmo
  } = useGraphInteractions({
    nodes,
    edges,
    addEdgeToDataSet, // Passa a função simplificada de useGraphData
    // Props relacionadas a peso (updateEdgeWeightInDataSet, toggleAllEdgeLabelsInDataSet) foram removidas
  });

  // Ref para a instância da rede vis-network (para chamadas diretas à API se necessário)
  const [networkInstance, setNetworkInstance] = useState<Network | null>(null);

  // Wrapper para runAlgorithm para passar o nome/chave do algoritmo (útil para logging/UI)
  const runAlgorithm = useCallback(
    (algorithm: AlgorithmImplementation, algorithmKey: string) => {
      runAlgorithmFromHook(algorithm, algorithmKey); // algorithmKey pode ser "BFS", "DFS"
    },
    [runAlgorithmFromHook]
  );

  // Handler para resetar completamente o estado visual e de seleção
  const handleResetAll = useCallback(() => {
    stopCurrentAlgorithm(); // Para qualquer algoritmo, reseta visuais e seleções internas
    hardResetVisuals(); // Reseta cores do grafo (sem parâmetro de peso)
    setSelectedNodeId(null); // Limpa seleção de nó para algoritmo
    clearNodeSelectionForEdge(); // Limpa seleção de nós para aresta

    if (networkInstance) {
      // Força a rede a recarregar os dados para garantir que os visuais resetados sejam aplicados
      networkInstance.setData({ nodes, edges });
    }
  }, [
    stopCurrentAlgorithm,
    hardResetVisuals,
    setSelectedNodeId,
    clearNodeSelectionForEdge,
    networkInstance,
    nodes,
    edges,
  ]);

  // Efeito de limpeza: para o algoritmo se o componente for desmontado
  useEffect(() => {
    return () => {
      if (isAlgorithmRunning) {
        stopCurrentAlgorithm();
      }
    };
  }, [isAlgorithmRunning, stopCurrentAlgorithm]);

  // Determina se o grafo está vazio para desabilitar botões de remoção
  const isGraphEmpty = nodes.length === 0 && edges.length === 0;

  return (
    <main className="container mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-50 to-sky-100">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-700 tracking-tight">
          Visualizador Interativo de Grafos
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Crie grafos, interaja com nós e arestas, e visualize algoritmos de
          travessia como BFS e DFS em ação.
        </p>
        {/* Feedback sobre modo de edição de pesos foi removido */}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Coluna Principal: Visualização do Grafo */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-xl shadow-2xl overflow-hidden">
          <GraphVisualization
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            // onEdgeClick foi removido
            setNetworkInstance={setNetworkInstance}
          />
        </div>

        {/* Coluna Lateral: Controles */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-6">
          <GraphEditorControls
            onAddNode={addNode}
            onRemoveNode={removeNode}
            onRemoveLastEdge={removeLastEdge}
            onClearSelection={clearNodeSelectionForEdge}
            onClearGraph={() => {
              stopCurrentAlgorithm();
              clearGraph();
              setSelectedNodeId(null);
            }}
            nodesForNewEdgeCount={nodesForNewEdge.length}
            isGraphEmpty={isGraphEmpty} // Passa o estado para desabilitar botões
            // onToggleEditWeightsMode e isEditingWeights foram removidos
          />
          <AlgorithmControls
            onRunAlgorithm={runAlgorithm}
            onStopAlgorithm={stopCurrentAlgorithm}
            onResetVisuals={handleResetAll}
            isAlgorithmRunning={isAlgorithmRunning}
            selectedNodeId={selectedNodeId}
            // isEditingWeights foi removido
          />
        </aside>
      </div>

      {/* Feedback Visual para Algoritmo em Execução */}
      {isAlgorithmRunning && (
        <div
          className="fixed bottom-6 right-6 bg-sky-600 text-white px-6 py-3 rounded-lg shadow-xl animate-pulse z-50 flex items-center space-x-3"
          role="alert"
          aria-live="assertive"
        >
          <svg
            className="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Algoritmo em execução...</span>
        </div>
      )}

      {/* Seção de Instruções Atualizada */}
      <div className="mt-10 p-6 bg-white border border-slate-200 rounded-lg shadow">
        <h3 className="text-2xl font-semibold mb-4 text-slate-700">
          Como Usar
        </h3>
        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
          <li>
            <strong>Adicionar Nó:</strong> Use o botão "Adicionar Nó".
          </li>
          <li>
            <strong>Adicionar Aresta:</strong> Clique em um nó, depois clique em
            outro nó distinto para criar uma aresta entre eles.
          </li>
          <li>
            <strong>Limpar Seleção para Aresta:</strong> Se selecionou um nó
            para criar uma aresta e deseja cancelar, clique em "Limpar Seleção"
            ou clique novamente no nó selecionado.
          </li>
          <li>
            <strong>Executar Algoritmo (BFS/DFS):</strong> Primeiro, clique em
            um nó no grafo para defini-lo como o ponto de partida. Em seguida,
            clique no botão do algoritmo desejado (BFS ou DFS).
          </li>
          <li>
            <strong>Parar Algoritmo:</strong> Se um algoritmo estiver em
            execução animada, use o botão "Parar Algoritmo" para interrompê-lo.
          </li>
          <li>
            <strong>Resetar Visual:</strong> Limpa todas as cores de destaque da
            execução de algoritmos e o estado de seleção, restaurando a
            aparência padrão do grafo.
          </li>
          <li>
            <strong>Remover Elementos:</strong> Use "Remover Nó" ou "Remover
            Aresta" para excluir os últimos elementos adicionados (baseado em
            ID). "Limpar Grafo" remove todos os elementos.
          </li>
        </ul>
      </div>

      <footer className="text-center py-10 text-sm text-slate-500">
        <p>
          Uma ferramenta para explorar e aprender sobre algoritmos em grafos.
        </p>
      </footer>
    </main>
  );
}
