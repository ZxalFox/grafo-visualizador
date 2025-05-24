import React from "react";
import Button from "./ui/button";
import { AlgorithmImplementation } from "@/types/graph-types";
import { bfs } from "@/lib/algorithms/bfs";
import { dfs } from "@/lib/algorithms/dfs";
import { findConnectedComponents } from "@/lib/algorithms/connected-components";
import { detectCycle } from "@/lib/algorithms/cycle-detection";

interface AlgorithmControlsProps {
  onRunAlgorithm: (
    algorithm: AlgorithmImplementation,
    algorithmKey: string
  ) => void;
  onStopAlgorithm: () => void;
  onResetVisuals: () => void;
  isAlgorithmRunning: boolean;
  selectedNodeId: string | number | null;
}

// Lista dos algoritmos disponíveis
const availableAlgorithms = [
  {
    key: "BFS",
    displayName: "Busca em Largura (BFS)",
    fn: bfs,
    requiresStartNode: true,
  },
  {
    key: "DFS",
    displayName: "Busca em Profundidade (DFS)",
    fn: dfs,
    requiresStartNode: true,
  },
  {
    key: "CONNECTED_COMPONENTS",
    displayName: "Componentes Conectados",
    fn: findConnectedComponents,
    requiresStartNode: false,
  },
  {
    key: "CYCLE_DETECTION",
    displayName: "Detectar Ciclo",
    fn: detectCycle,
    requiresStartNode: true,
  },
];

const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  onRunAlgorithm,
  onStopAlgorithm,
  onResetVisuals,
  isAlgorithmRunning,
  selectedNodeId,
}) => {
  return (
    <div className="p-4 code-text bg-amber-500 border-2 border-amber-600 rounded-lg shadow-md space-y-3">
      <h3 className="text-xl font-semibold text-neutral-800 mb-4">
        Executar Algoritmos
      </h3>

      {/* Feedback sobre seleção de nó e estado de execução */}
      {!isAlgorithmRunning && selectedNodeId === null && (
        <p className="text-sm text-neutral-800 mb-2 px-1">
          Selecione um nó inicial para BFS, DFS ou Detecção de Ciclo.
          &quot;Componentes Conectados&quot; pode ser executado sem nó inicial.
        </p>
      )}
      {!isAlgorithmRunning && selectedNodeId !== null && (
        <p className="text-sm text-neutral-800 mb-2 px-1">
          Nó inicial para algoritmos selecionado:{" "}
          <span className="font-bold">{selectedNodeId}</span>.
        </p>
      )}
      {isAlgorithmRunning && (
        <p className="text-sm text-neutral-800 animate-pulse mb-2 px-1">
          Algoritmo em execução...
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableAlgorithms.map((algo) => {
          const isDisabled =
            isAlgorithmRunning ||
            (algo.requiresStartNode && selectedNodeId === null);

          return (
            <Button
              key={algo.key}
              onClick={() => onRunAlgorithm(algo.fn, algo.key)}
              disabled={isDisabled}
              className="w-full text-sm"
              aria-label={`Executar o algoritmo: ${algo.displayName}`}
            >
              {algo.displayName}
            </Button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 pt-3 border-t border-slate-200">
        <Button
          onClick={onStopAlgorithm}
          variant="destructive"
          disabled={!isAlgorithmRunning}
          className="w-full flex-1"
          aria-label="Parar a execução do algoritmo atual"
        >
          Parar Algoritmo
        </Button>
        <Button
          onClick={onResetVisuals}
          variant="outline"
          disabled={isAlgorithmRunning}
          className="w-full flex-1"
          aria-label="Resetar as cores e o estado visual do grafo"
        >
          Resetar Visual
        </Button>
      </div>
    </div>
  );
};

export default AlgorithmControls;
