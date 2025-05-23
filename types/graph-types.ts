// types/graph-types.ts
import { DataSet } from "vis-data/peer";
import { Edge as VisEdge, Node as VisNodeOriginal, IdType } from "vis-network";

// Nossa interface Node customizada
export interface Node extends VisNodeOriginal {
  id: IdType;
  label: string; // Label obrigatório
  color?:
    | string
    | {
        border: string;
        background: string;
        highlight: {
          border: string;
          background: string;
        };
      };
  // Propriedade opcional para o algoritmo de componentes conectados
  component?: number;
}

// Nossa interface Edge customizada (sem pesos)
export interface Edge extends VisEdge {
  id: string; // ID da aresta (ex: "fromId-toId")
  from: IdType;
  to: IdType;
  color?:
    | string
    | {
        color: string; // Cor principal da aresta
        highlight: string; // Cor ao passar o mouse ou selecionar
      };
  // Propriedade opcional para destacar arestas (ex: em um ciclo)
  isHighlighted?: boolean;
}

export type NodesDataSet = DataSet<Node, "id">;
export type EdgesDataSet = DataSet<Edge, "id">;

export interface GraphData {
  nodes: NodesDataSet;
  edges: EdgesDataSet;
}

// Assinatura para as implementações dos algoritmos
export type AlgorithmImplementation = (
  nodes: NodesDataSet,
  edges: EdgesDataSet,
  // startNodeId pode ser opcional para algoritmos que processam o grafo inteiro
  startNodeId: IdType | null,
  options: {
    animationSpeed: number;
    updateNodeVisual: (id: IdType, updates: Partial<Node>) => void;
    updateEdgeVisual: (id: string, updates: Partial<Edge>) => void;
    // Callback para quando o algoritmo é concluído.
    // O parâmetro 'result' é opcional e do tipo 'unknown' para segurança de tipo.
    onAlgorithmComplete: (result?: unknown) => void; // CORRIGIDO: 'any' substituído por 'unknown'
  }
  // Retorna um objeto com uma função de cleanup (para limpar timers, etc.), ou void.
) => { cleanup: () => void } | void;
