"use client";

import { useState, useEffect, useCallback } from "react";
import { Network } from "vis-network/peer";
import { useGraphData } from "@/hooks/use-graph-data";
import { useGraphInteractions } from "@/hooks/use-graph-interactions";
import GraphVisualization from "@/components/graph-visualization";
import GraphEditorControls from "@/components/graph-editor-controls";
import AlgorithmControls from "@/components/algorithm-controls";
import { Node, Edge, AlgorithmImplementation } from "@/types/graph-types";

// Dados iniciais
const initialNodesData: Node[] = [
  { id: 1, label: "Nó 1" },
  { id: 2, label: "Nó 2" },
  { id: 3, label: "Nó 3" },
  { id: 4, label: "Nó 4" },
];

const initialEdgesData: Edge[] = [
  { id: "1-2", from: 1, to: 2 },
  { id: "1-3", from: 1, to: 3 },
  { id: "2-4", from: 2, to: 4 },
];

export default function HomePage() {
  const {
    nodes,
    edges,
    addNode,
    removeNode,
    addEdge: addEdgeToDataSet,
    removeLastEdge,
    resetGraphVisuals: hardResetVisuals,
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
    algorithmResultMessage,
  } = useGraphInteractions({
    nodes,
    edges,
    addEdgeToDataSet,
  });

  const [networkInstance, setNetworkInstance] = useState<Network | null>(null);

  const runAlgorithm = useCallback(
    (algorithm: AlgorithmImplementation, algorithmKey: string) => {
      runAlgorithmFromHook(algorithm, algorithmKey);
    },
    [runAlgorithmFromHook],
  );

  const handleResetAll = useCallback(() => {
    stopCurrentAlgorithm();
    hardResetVisuals();
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

  const isGraphEmpty = nodes.length === 0;

  return (
    <main className="min-h-screen space-y-8 bg-yellow-100">
      <header className="flex justify-around bg-amber-500 p-4 text-neutral-800">
        <div className="flex flex-col justify-center">
          <h1 className="code-text flex items-center text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            V_I_Grafo
          </h1>
          <p className="mt-2 font-bold">Visualizador Interativo de Grafos</p>
        </div>
        <p className="code-text mt-3 max-w-3xl text-end text-base sm:text-lg">
          Crie e manipule grafos. Explore visualmente algoritmos como Busca em
          Largura (BFS), Busca em Profundidade (DFS), Componentes Conectados e
          Detecção de Ciclos.
        </p>
      </header>
      <div className="code-text mx-6 mt-10 rounded-lg border-2 border-yellow-600 bg-yellow-200 p-6 text-yellow-900 shadow">
        <h3 className="mb-4 text-2xl font-semibold">Instruções de Uso</h3>
        <ul className="list-inside list-disc space-y-2 pl-2">
          <li>
            <strong>Adicionar Nó:</strong> Use o botão &quot;Adicionar Nó&quot;.
          </li>
          <li>
            <strong>Adicionar Aresta:</strong> Clique em um nó, depois clique em
            outro nó distinto.
          </li>
          <li>
            <strong>Limpar Seleção para Aresta:</strong> Se selecionou um nó
            para criar uma aresta e deseja cancelar, clique em &quot;Limpar
            Seleção&quot; ou clique novamente no nó selecionado.
          </li>
          <li>
            <strong>Executar Algoritmo:</strong>
            <ul className="mt-1 list-inside list-disc space-y-1 pl-4">
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

      {/* Mensagem de Resultado do Algoritmo */}
      {algorithmResultMessage && !isAlgorithmRunning && (
        <div className="code-text flex justify-center">
          <div className="w-lg rounded-2xl border border-green-300 bg-green-50 p-4 text-center text-sm text-green-700 shadow">
            {algorithmResultMessage}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 items-start gap-6 px-6 lg:grid-cols-12 lg:gap-8">
        <div className="overflow-hidden rounded-xl shadow-2xl lg:col-span-7 xl:col-span-8">
          <GraphVisualization
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            setNetworkInstance={setNetworkInstance}
          />
        </div>

        <aside className="space-y-6 lg:col-span-5 xl:col-span-4">
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
          className="fixed right-6 bottom-6 z-50 flex animate-pulse items-center space-x-3 rounded-lg bg-green-300 px-6 py-3 text-green-800 shadow-xl"
          role="alert"
          aria-live="assertive"
        >
          <svg
            className="h-5 w-5 animate-spin"
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

      <footer className="space-y-2 bg-amber-800 py-6 text-center text-sm">
        <div>
          <p>V_I_Grafos</p>
          <p>Visualizador Interativo de Grafo</p>
        </div>
        <div>
          <p>Desenvolvido por Ayron Sanfra sem fins lucrativos</p>
          <p>2025</p>
        </div>
      </footer>
    </main>
  );
}
