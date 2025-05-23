// components/algorithm-controls.tsx
import React from "react";
import Button from "./ui/button"; // Seu componente de botão Tailwind estilizado
import { AlgorithmImplementation } from "@/types/graph-types"; // Tipo de implementação de algoritmo
import { bfs } from "@/lib/algorithms/bfs"; // Implementação do BFS
import { dfs } from "@/lib/algorithms/dfs"; // Implementação do DFS

interface AlgorithmControlsProps {
  // Callback para executar um algoritmo, passando a função e um nome (chave) para identificação
  onRunAlgorithm: (algorithm: AlgorithmImplementation, algorithmKey: string) => void;
  onStopAlgorithm: () => void; // Callback para parar o algoritmo em execução
  onResetVisuals: () => void; // Callback para resetar os visuais do grafo
  isAlgorithmRunning: boolean; // Estado que indica se um algoritmo está em execução
  selectedNodeId: string | number | null; // ID do nó selecionado como inicial para o algoritmo
  // A prop isEditingWeights foi removida
}

// Lista dos algoritmos disponíveis (agora apenas BFS e DFS)
const availableAlgorithms = [
  { key: "BFS", displayName: "Executar BFS", fn: bfs },
  { key: "DFS", displayName: "Executar DFS", fn: dfs },
  // Dijkstra e Prim foram removidos
];

const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  onRunAlgorithm,
  onStopAlgorithm,
  onResetVisuals,
  isAlgorithmRunning,
  selectedNodeId,
  // isEditingWeights não é mais uma prop
}) => {
  const canRunAlgorithm = !isAlgorithmRunning && selectedNodeId !== null;

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-md space-y-3">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">
        Algoritmos de Travessia
      </h3>

      {!isAlgorithmRunning && selectedNodeId === null && (
        <p className="text-sm text-red-500 mb-2 px-1">
          Selecione um nó no grafo para definir como ponto de partida dos algoritmos.
        </p>
      )}
      {!isAlgorithmRunning && selectedNodeId !== null && (
        <p className="text-sm text-sky-700 mb-2 px-1">
          Nó inicial selecionado: <span className="font-bold">{selectedNodeId}</span>.
        </p>
      )}
      {isAlgorithmRunning && (
        <p className="text-sm text-orange-600 animate-pulse mb-2 px-1">
          Algoritmo em execução...
        </p>
      )}

      <div className="grid grid-cols-1 gap-3">
        {availableAlgorithms.map((algo) => (
          <Button
            key={algo.key}
            onClick={() => onRunAlgorithm(algo.fn, algo.key)}
            // Desabilita se um algoritmo já está rodando ou nenhum nó foi selecionado
            disabled={!canRunAlgorithm}
            className="w-full"
            aria-label={`Executar o algoritmo ${algo.key}`}
          >
            {algo.displayName}
          </Button>
        ))}
      </div>

      <div className="mt-4 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 pt-3 border-t border-slate-200">
        <Button
          onClick={onStopAlgorithm}
          variant="destructive" // Estilo para ação de "parar"
          disabled={!isAlgorithmRunning} // Habilitado apenas se um algoritmo estiver rodando
          className="w-full flex-1"
          aria-label="Parar a execução do algoritmo atual"
        >
          Parar Algoritmo
        </Button>
        <Button
          onClick={onResetVisuals}
          variant="outline" // Estilo para ação secundária
          // Desabilita se um algoritmo estiver rodando (incentiva parar primeiro)
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