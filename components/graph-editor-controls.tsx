// components/graph-editor-controls.tsx
import React from "react";
import Button from "./ui/button"; // Seu componente de botão Tailwind estilizado

interface GraphEditorControlsProps {
  onAddNode: () => void;
  onRemoveNode: () => void;
  onRemoveLastEdge: () => void;
  onClearSelection: () => void; // Para limpar a seleção de nós para uma nova aresta
  onClearGraph: () => void;
  nodesForNewEdgeCount: number; // Para dar feedback visual ao usuário (ex: "Selecionado 1/2 nós")
  isGraphEmpty: boolean; // Para desabilitar botões de remoção se o grafo estiver vazio
}

const GraphEditorControls: React.FC<GraphEditorControlsProps> = ({
  onAddNode,
  onRemoveNode,
  onRemoveLastEdge,
  onClearSelection,
  onClearGraph,
  nodesForNewEdgeCount,
  isGraphEmpty,
}) => {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-md space-y-3">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">
        Controles do Grafo
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onAddNode} className="w-full">
          Adicionar Nó
        </Button>
        <Button
          onClick={onRemoveNode}
          variant="outline" // Mudado para outline para diferenciar de "Limpar Grafo"
          className="w-full"
          disabled={isGraphEmpty} // Desabilita se não houver nós para remover
          aria-label="Remover o último nó adicionado"
        >
          Remover Nó
        </Button>
        <Button
          onClick={onRemoveLastEdge}
          variant="outline"
          className="w-full"
          disabled={isGraphEmpty} // Ou uma verificação mais específica se há arestas
          aria-label="Remover a última aresta adicionada"
        >
          Remover Aresta
        </Button>
        <Button
          onClick={onClearSelection}
          className="w-full"
          disabled={nodesForNewEdgeCount === 0} // Desabilita se não houver seleção para limpar
          aria-label="Limpar seleção de nós para criar nova aresta"
        >
          Limpar Seleção ({nodesForNewEdgeCount}/2)
        </Button>
      </div>
      <div className="pt-3 mt-3 border-t border-slate-200">
        <Button
          onClick={onClearGraph}
          variant="destructive" // Cor destrutiva para uma ação impactante
          className="w-full"
          disabled={isGraphEmpty} // Desabilita se o grafo já estiver limpo
          aria-label="Remover todos os nós e arestas do grafo"
        >
          Limpar Grafo
        </Button>
      </div>
    </div>
  );
};

export default GraphEditorControls;