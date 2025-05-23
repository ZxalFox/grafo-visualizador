// constants/graph-constants.ts

// Cores Padrão
export const DEFAULT_NODE_COLOR = "#d3d3d3"; // Cinza claro para nós
export const DEFAULT_NODE_BORDER_COLOR = "#a0a0a0"; // Borda um pouco mais escura para nós
export const DEFAULT_EDGE_COLOR = "#848484"; // Cinza para arestas

// Cores de Destaque para Nós em Algoritmos
export const HIGHLIGHT_COLOR_BFS = "#ff6600"; // Laranja para BFS
export const HIGHLIGHT_COLOR_DFS = "#800080"; // Roxo para DFS

// Cores de Destaque para Seleção e Interação (Exemplos)
export const SELECTED_NODE_COLOR_ALGORITHM = "lightblue"; // Azul claro para nó selecionado para iniciar algoritmo
export const SELECTED_NODE_BORDER_ALGORITHM = "blue";

export const SELECTED_NODE_COLOR_EDGE_CREATION = "orange"; // Laranja para nós selecionados para criar aresta
export const SELECTED_NODE_BORDER_EDGE_CREATION = "darkorange";

export const NODE_HIGHLIGHT_BACKGROUND = "#D2E5FF"; // Fundo do highlight padrão do nó (ex: ao passar o mouse)
export const NODE_HIGHLIGHT_BORDER = "#2B7CE9";   // Borda do highlight padrão do nó

export const EDGE_HIGHLIGHT_COLOR = "#ff0000"; // Vermelho para aresta destacada (ex: ao passar o mouse)

// Velocidade da Animação
export const ANIMATION_SPEED_MS = 500; // Velocidade padrão para animações de algoritmos (BFS, DFS)

// Opções Padrão para a Visualização do Grafo (vis-network)
export const GRAPH_OPTIONS = {
  manipulation: {
    enabled: false, // Desabilita a manipulação direta via UI do vis-network (adicionar/remover nós/arestas)
                    // já que controlamos isso via botões.
  },
  interaction: {
    hover: true, // Habilita o destaque ao passar o mouse
    selectConnectedEdges: false, // Não seleciona arestas conectadas ao selecionar um nó
    tooltipDelay: 200,
  },
  physics: {
    enabled: true, // Habilita a física para um layout mais orgânico
    barnesHut: {   // Algoritmo de física para melhor desempenho com muitos nós
      gravitationalConstant: -3000,
      centralGravity: 0.25,
      springLength: 100,
      springConstant: 0.05,
      damping: 0.09,
      avoidOverlap: 0.15, // Ajuda a evitar que os nós se sobreponham
    },
    solver: 'barnesHut',
    stabilization: { // Tenta estabilizar o grafo mais rapidamente ao carregar
      iterations: 1000,
      fit: true,
    }
  },
  nodes: {
    shape: "ellipse", // Formato dos nós (outros: 'dot', 'circle', 'box', 'database', etc.)
    size: 18,         // Tamanho dos nós
    borderWidth: 2,
    font: {
      size: 14,       // Tamanho da fonte do label do nó
      color: "#343434", // Cor da fonte do label do nó
      face: "Arial, sans-serif",
    },
    color: { // Cores padrão do nó (podem ser sobrescritas por nó individualmente)
      border: DEFAULT_NODE_BORDER_COLOR,
      background: DEFAULT_NODE_COLOR,
      highlight: {
        border: NODE_HIGHLIGHT_BORDER,
        background: NODE_HIGHLIGHT_BACKGROUND,
      },
      // hover: { // Cores específicas para o estado de hover, se diferentes do highlight
      //   border: '#yourHoverBorderColor',
      //   background: '#yourHoverBackgroundColor',
      // }
    },
    shadow: { // Adiciona uma leve sombra aos nós para profundidade
        enabled: true,
        size: 5,
        x: 2,
        y: 2
    }
  },
  edges: {
    width: 2, // Largura das arestas
    color: { // Cores padrão da aresta
      color: DEFAULT_EDGE_COLOR,
      highlight: EDGE_HIGHLIGHT_COLOR,
      // hover: '#yourEdgeHoverColor', // Cor da aresta ao passar o mouse, se diferente de highlight
      inherit: false, // Não herda cor dos nós conectados
    },
    smooth: { // Configurações para suavização das curvas das arestas
      enabled: true,
      type: "dynamic", // 'dynamic' ajusta a curvatura para evitar sobreposição de nós
      // roundness: 0.5, // Para tipos não dinâmicos como 'continuous' ou 'cubicBezier'
    },
    arrows: { // Configuração de setas (para grafos direcionados)
      to: {
        enabled: false, // Desabilitado por padrão (grafo não direcionado)
        scaleFactor: 1,
        type: "arrow",
      },
    },
    // A propriedade 'font' para labels de aresta foi removida pois não haverá labels de peso.
    // Se você precisar de outros tipos de labels em arestas no futuro, pode reintroduzir:
    // font: {
    //   size: 12,
    //   color: '#343434',
    //   align: 'middle' // ou 'top', 'bottom'
    // },
  },
};