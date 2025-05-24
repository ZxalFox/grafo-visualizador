import React from "react";
import Button from "./ui/button";

interface GraphEditorControlsProps {
  onAddNode: () => void;
  onRemoveNode: () => void;
  onRemoveLastEdge: () => void;
  onClearSelection: () => void;
  onClearGraph: () => void;
  nodesForNewEdgeCount: number;
  isGraphEmpty: boolean;
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
    <div className="p-4 bg-amber-500 border-2 border-amber-600 rounded-lg shadow-md space-y-3">
      <h3 className="text-xl font-semibold text-neutral-800 mb-4">
        Controles do Grafo
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onAddNode} className="w-full">
          Adicionar Nó
        </Button>
        <Button
          onClick={onRemoveNode}
          variant="outline"
          className="w-full"
          disabled={isGraphEmpty}
          aria-label="Remover o último nó adicionado"
        >
          Remover Nó
        </Button>
        <Button
          onClick={onRemoveLastEdge}
          variant="outline"
          className="w-full"
          disabled={isGraphEmpty}
          aria-label="Remover a última aresta adicionada"
        >
          Remover Aresta
        </Button>
        <Button
          onClick={onClearSelection}
          className="w-full"
          disabled={nodesForNewEdgeCount === 0}
          aria-label="Limpar seleção de nós para criar nova aresta"
        >
          Limpar Seleção ({nodesForNewEdgeCount}/2)
        </Button>
      </div>
      <div className="pt-3 mt-3 border-t border-slate-200">
        <Button
          onClick={onClearGraph}
          variant="destructive"
          className="w-full"
          disabled={isGraphEmpty}
          aria-label="Remover todos os nós e arestas do grafo"
        >
          Limpar Grafo
        </Button>
      </div>
    </div>
  );
};

export default GraphEditorControls;
