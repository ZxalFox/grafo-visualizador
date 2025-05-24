// Cores Padrão
export const DEFAULT_NODE_COLOR = "#d3d3d3";
export const DEFAULT_NODE_BORDER_COLOR = "#a0a0a0";
export const DEFAULT_EDGE_COLOR = "#848484";

export const HIGHLIGHT_COLOR_BFS = "#ff8c00";
export const HIGHLIGHT_COLOR_DFS = "#9370db";

// Cores para Componentes Conectados
export const COMPONENT_COLORS = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

// Cores para Detecção de Ciclo
export const HIGHLIGHT_COLOR_CYCLE_EDGE = "#e51c23";
export const HIGHLIGHT_COLOR_CYCLE_NODE = "#ffc107";

// Cores de Destaque para Seleção e Interação na UI
export const SELECTED_NODE_COLOR_ALGORITHM = "#add8e6";
export const SELECTED_NODE_BORDER_ALGORITHM = "#007bff";
export const SELECTED_NODE_COLOR_EDGE_CREATION = "#ffdab9";
export const SELECTED_NODE_BORDER_EDGE_CREATION = "#ff7f50";

export const NODE_HIGHLIGHT_BACKGROUND = "#D2E5FF";
export const NODE_HIGHLIGHT_BORDER = "#2B7CE9";
export const EDGE_HIGHLIGHT_COLOR = "#f04a4a";

// Velocidade da Animação
export const ANIMATION_SPEED_MS = 550;

// Opções Padrão para a Visualização do Grafo (vis-network)
export const GRAPH_OPTIONS = {
  manipulation: {
    enabled: false,
  },
  interaction: {
    hover: true,
    selectConnectedEdges: false,
    tooltipDelay: 200,
    navigationButtons: true,
    keyboard: {
      enabled: true,
      speed: { x: 10, y: 10, zoom: 0.03 },
      bindToWindow: true,
    },
  },
  physics: {
    enabled: true,
    barnesHut: {
      gravitationalConstant: -10000,
      centralGravity: 0.25,
      springLength: 130,
      springConstant: 0.035,
      damping: 0.45,
      avoidOverlap: 0.1,
    },
    maxVelocity: 20,
    minVelocity: 0.1,
    solver: "barnesHut",
    stabilization: {
      iterations: 1000,
      fit: true,
    },
  },
  nodes: {
    shape: "ellipse",
    size: 18,
    borderWidth: 2,
    font: {
      size: 14,
      color: "#343434",
      face: "Arial, Helvetica, sans-serif",
      strokeWidth: 0,
    },
    color: {
      border: DEFAULT_NODE_BORDER_COLOR,
      background: DEFAULT_NODE_COLOR,
      highlight: {
        border: NODE_HIGHLIGHT_BORDER,
        background: NODE_HIGHLIGHT_BACKGROUND,
      },
      hover: {
        border: NODE_HIGHLIGHT_BORDER,
        background: NODE_HIGHLIGHT_BACKGROUND,
      },
    },
    shadow: {
      enabled: false,
    },
  },
  edges: {
    width: 2.5,
    color: {
      color: DEFAULT_EDGE_COLOR,
      highlight: EDGE_HIGHLIGHT_COLOR,
      hover: EDGE_HIGHLIGHT_COLOR,
      inherit: false,
    },
    smooth: {
      enabled: true,
      type: "dynamic",
    },
    arrows: {
      to: {
        enabled: false,
        scaleFactor: 1,
        type: "arrow",
      },
    },
  },
};
