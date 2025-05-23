// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { IdType, Network } from "vis-network/peer";

// Hooks customizados
import { useGraphData } from "@/hooks/use-graph-data";
import { useGraphInteractions } from "@/hooks/use-graph-interactions";

// Componentes da UI
import GraphVisualization from "@/components/graph-visualization";
import GraphEditorControls from "@/components/graph-editor-controls";
import AlgorithmControls from "@/components/algorithm-controls";

// Tipos customizados da aplicação
import { Node, Edge, AlgorithmImplementation } from "@/types/graph-types";

// Dados iniciais (grafo não ponderado)
const initialNodesData: Node[] = [
  { id: 1, label: "Nó A" },
  { id: 2, label: "Nó B" },
  { id: 3, label: "Nó C" },
  { id: 4, label: "Nó D" },
  { id: 5, label: "Nó E" }, // Nó para teste de componente desconexo
];

const initialEdgesData: Edge[] = [
  { id: "1-2", from: 1, to: 2 },
  { id: "1-3", from: 1, to: 3 },
  { id: "2-4", from: 2, to: 4 },
  // Aresta { id: "3-4", from: 3, to: 4 } removida para testar ciclo e componentes
];

export default function HomePage() {
  const {
    nodes,
    edges,
    addNode,
    removeNode,
    addEdge: addEdgeToDataSet, // Assinatura simplificada: (from, to) => void
    removeLastEdge,
    resetGraphVisuals: hardResetVisuals, // Assinatura simplificada: () => void
    clearGraph,
  } = useGraphData(initialNodesData, initialEdgesData);

  const {
    selectedNodeId,
    nodesForNewEdge,
    isAlgorithmRunning,
    handleNodeClick,
    clearNodeSelectionForEdge,
    runAlgorithm: runAlgorithmFromHook,
    stopCurrentAlgorithm,
    setSelectedNodeId,
    algorithmResultMessage, // Mensagem de resultado do algoritmo (do ajuste no hook)
  } = useGraphInteractions({
    nodes,
    edges,
    addEdgeToDataSet,
  });

  const [networkInstance, setNetworkInstance] = useState<Network | null>(null);

  // Wrapper para runAlgorithm para passar a chave/nome do algoritmo
  const runAlgorithm = useCallback(
    (algorithm: AlgorithmImplementation, algorithmKey: string) => {
      // O startNodeId é o selectedNodeId, que pode ser null para Componentes Conectados
      runAlgorithmFromHook(algorithm, algorithmKey);
    },
    [runAlgorithmFromHook]
  );

  const handleResetAll = useCallback(() => {
    stopCurrentAlgorithm(); // Para algoritmo, reseta visuais e seleções internas
    hardResetVisuals(); // Reseta cores do grafo para o padrão
    setSelectedNodeId(null);
    clearNodeSelectionForEdge();
    if (networkInstance) {
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

  useEffect(() => {
    return () => {
      if (isAlgorithmRunning) {
        stopCurrentAlgorithm();
      }
    };
  }, [isAlgorithmRunning, stopCurrentAlgorithm]);

  const isGraphEmpty = nodes.length === 0; // Simplificado: se não há nós, não há arestas nos controles

  return (
    <main className="container mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-8 min-h-screen bg-gradient-to-br from-slate-100 to-sky-100">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-800 tracking-tight">
          Visualizador Interativo de Grafos
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
          Crie e manipule grafos. Explore visualmente algoritmos como Busca em
          Largura (BFS), Busca em Profundidade (DFS), Componentes Conectados e
          Detecção de Ciclos.
        </p>
      </header>

      {/* Mensagem de Resultado do Algoritmo */}
      {algorithmResultMessage && !isAlgorithmRunning && (
        <div
          className="mb-6 p-4 text-center text-sm rounded-md bg-sky-50 border-sky-300 border text-sky-700 shadow"
          role="status"
        >
          {algorithmResultMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8 rounded-xl shadow-2xl overflow-hidden bg-white">
          <GraphVisualization
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            setNetworkInstance={setNetworkInstance}
          />
        </div>

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
            isGraphEmpty={isGraphEmpty}
          />
          <AlgorithmControls
            onRunAlgorithm={runAlgorithm}
            onStopAlgorithm={stopCurrentAlgorithm}
            onResetVisuals={handleResetAll}
            isAlgorithmRunning={isAlgorithmRunning}
            selectedNodeId={selectedNodeId}
          />
        </aside>
      </div>

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

      <div className="mt-10 p-6 bg-white border border-slate-200 rounded-lg shadow">
        <h3 className="text-2xl font-semibold mb-4 text-slate-700">
          Instruções de Uso
        </h3>
        <ul className="list-disc list-inside text-slate-600 space-y-2 pl-2">
          <li>
            <strong>Adicionar Nó:</strong> Use o botão "Adicionar Nó".
          </li>
          <li>
            <strong>Adicionar Aresta:</strong> Clique em um nó, depois clique em
            outro nó distinto.
          </li>
          <li>
            <strong>Limpar Seleção para Aresta:</strong> Se selecionou um nó
            para criar uma aresta e deseja cancelar, clique em "Limpar Seleção"
            ou clique novamente no nó selecionado.
          </li>
          <li>
            <strong>Executar Algoritmo:</strong>
            <ul className="list-['◦'] list-inside pl-4 mt-1 space-y-1">
              <li>
                Para <strong>BFS, DFS e Detecção de Ciclo</strong>, primeiro
                clique em um nó no grafo para defini-lo como ponto de partida.
                Depois, clique no botão do algoritmo.
              </li>
              <li>
                <strong>Componentes Conectados</strong> pode ser executado sem
                um nó inicial pré-selecionado (ele analisará o grafo inteiro).
              </li>
            </ul>
          </li>
          <li>
            <strong>Parar Algoritmo:</strong> Interrompe a animação do algoritmo
            atual.
          </li>
          <li>
            <strong>Resetar Visual:</strong> Limpa cores de destaque e seleções,
            restaurando a aparência padrão do grafo.
          </li>
        </ul>
      </div>

      <footer className="text-center py-10 text-sm text-slate-500">
        <p>
          Ferramenta de aprendizado de Algoritmos em Grafos. Explore e
          divirta-se!
        </p>
      </footer>
    </main>
  );
}
