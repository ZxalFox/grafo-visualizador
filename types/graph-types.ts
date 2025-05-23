// types/graph-types.ts
import { DataSet } from "vis-data/peer";
import { Edge as VisEdge, Node as VisNodeOriginal, IdType } from "vis-network";

// Nossa interface Node customizada
export interface Node extends VisNodeOriginal {
  id: IdType;
  label: string; // Tornamos o label obrigatório
  color?: string | { // Estrutura de cor compatível com vis-network
    border: string;
    background: string;
    highlight: {
      border: string;
      background: string;
    };
  };
  // Outras propriedades customizadas ou herdadas de VisNodeOriginal podem ser adicionadas/sobrescritas aqui
  // Ex: x, y, shape, size são herdados.
}

// Nossa interface Edge customizada, agora sem pesos
export interface Edge extends VisEdge {
  id: string; // Mantemos string para IDs compostos "from-to"
  from: IdType;
  to: IdType;
  color?: string | { // Estrutura de cor para arestas
    color: string; // Cor principal da aresta
    highlight: string; // Cor ao passar o mouse ou selecionar
    // hover?: string; // Cor para hover, se diferente de highlight
    // inherit?: boolean | string;
    // opacity?: number;
  };
  // 'label' para pesos foi removido
  // 'weight' foi removido
}

export type NodesDataSet = DataSet<Node, "id">;
export type EdgesDataSet = DataSet<Edge, "id">;

export interface GraphData {
  nodes: NodesDataSet;
  edges: EdgesDataSet;
}

// Assinatura simplificada para os algoritmos (BFS, DFS)
export type AlgorithmImplementation = (
  nodes: NodesDataSet,
  edges: EdgesDataSet,
  startNodeId: IdType,
  options: {
    animationSpeed: number;
    // Callback para atualizar o visual do nó (principalmente a cor)
    updateNodeVisual: (id: IdType, updates: Partial<Node>) => void;
    // Callback para indicar que o algoritmo terminou
    onAlgorithmComplete: () => void;
  }
  // Retorna uma função de limpeza para o intervalo da animação, se houver
) => { cleanup: () => void } | void;