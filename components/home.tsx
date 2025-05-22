"use client";
import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data"; // Importa o DataSet do pacote correto

export default function Home() {
  const graphContainer = useRef(null);
  const [network, setNetwork] = useState(null);
  // Inicializamos os nós e arestas como DataSet
  const [nodes] = useState(
    new DataSet([
      { id: 1, label: "Nó 1", color: "#d3d3d3" },
      { id: 2, label: "Nó 2", color: "#d3d3d3" },
      { id: 3, label: "Nó 3", color: "#d3d3d3" },
    ])
  );
  const [edges] = useState(
    new DataSet([
      { id: "1-2", from: 1, to: 2, weight: 1 },
      { id: "2-3", from: 2, to: 3, weight: 1 },
    ])
  );

  // Estados para controle da seleção de nós
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!graphContainer.current) return;

    const data = { nodes, edges };
    const options = {
      manipulation: { enabled: true },
      interaction: { selectConnectedEdges: false },
    };

    const newNetwork = new Network(graphContainer.current, data, options);

    // Ao clicar em um nó, atualizamos a seleção para uso no BFS e para conexão de arestas
    newNetwork.on("click", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        setSelectedNode(nodeId);
        handleNodeSelection(nodeId);
      }
    });

    setNetwork(newNetwork);
    // Como nodes e edges são instâncias imutáveis (em termos de referência), a dependência aqui pode ser []
  }, []);

  // Gerencia a seleção de nós para criar uma nova aresta
  const handleNodeSelection = (nodeId) => {
    setSelectedNodes((prev) => {
      const newSelection = [...prev, nodeId];
      if (newSelection.length === 2) {
        addEdge(newSelection[0], newSelection[1]);
        return [];
      }
      return newSelection;
    });
  };

  // Adiciona uma aresta se ainda não existir (usa um id único baseado na ordem dos nós)
  const addEdge = (from, to) => {
    const exists = edges.get({
      filter: (edge) =>
        (edge.from === from && edge.to === to) ||
        (edge.from === to && edge.to === from),
    });
    if (exists.length === 0) {
      const edgeId = [from, to].sort((a, b) => a - b).join("-");
      edges.add({ id: edgeId, from, to });
    }
  };

  // Remove a última aresta adicionada
  const removeEdge = () => {
    const edgeArray = edges.get();
    if (edgeArray.length === 0) return;
    const lastEdge = edgeArray[edgeArray.length - 1];
    edges.remove(lastEdge.id);
  };

  // Adiciona um novo nó; usamos nodes.get() para contar os nós atuais
  const addNode = () => {
    const currentNodes = nodes.get();
    const newId = currentNodes.length + 1;
    nodes.add({ id: newId, label: `Nó ${newId}`, color: "#d3d3d3" });
  };

  // Remove o último nó e todas as arestas que o envolvem
  const removeNode = () => {
    const currentNodes = nodes.get();
    if (currentNodes.length === 0) return;
    const lastNode = currentNodes[currentNodes.length - 1];
    nodes.remove(lastNode.id);
    const currentEdges = edges.get();
    currentEdges.forEach((edge) => {
      if (edge.from === lastNode.id || edge.to === lastNode.id) {
        edges.remove(edge.id);
      }
    });
  };

  // Implementação do BFS com animação:
  // A função recebe o nó de partida e, a cada 500ms, atualiza a cor do nó visitado.
  const bfs = (startNode) => {
    if (!startNode || !network) return;

    const visited = new Set();
    const queue = [startNode];

    const interval = setInterval(() => {
      if (queue.length === 0) {
        clearInterval(interval);
        return;
      }

      const current = queue.shift();
      visited.add(current);

      // Atualiza a cor do nó diretamente na instância do DataSet
      nodes.update({ id: current, color: "#ff6600" });

      // Busca os vizinhos não visitados
      const allEdges = edges.get();
      allEdges.forEach((edge) => {
        if (edge.from === current && !visited.has(edge.to)) {
          queue.push(edge.to);
        } else if (edge.to === current && !visited.has(edge.from)) {
          queue.push(edge.from);
        }
      });
    }, 500);
  };

  const dijkstra = (startNode) => {
    if (!startNode || !network) return;

    // Reinicia as cores dos nós.
    const allNodes = nodes.get();
    allNodes.forEach((node) => {
      nodes.update({ id: node.id, color: "#d3d3d3" });
    });

    // Inicializa as distâncias.
    const distances = {};
    allNodes.forEach((node) => {
      distances[node.id] = Infinity;
    });
    distances[startNode] = 0;

    const visited = new Set();

    // Função auxiliar para obter o nó não visitado com a menor distância.
    const getMinDistanceNode = () => {
      let minDist = Infinity;
      let minNode = null;
      Object.keys(distances).forEach((nodeIdStr) => {
        const nodeId = Number(nodeIdStr);
        if (!visited.has(nodeId) && distances[nodeId] < minDist) {
          minDist = distances[nodeId];
          minNode = nodeId;
        }
      });
      return minNode;
    };

    const interval = setInterval(() => {
      const current = getMinDistanceNode();
      if (current === null) {
        clearInterval(interval);
        return;
      }
      visited.add(current);
      // Marca o nó atual como finalizado com a cor verde.
      nodes.update({ id: current, color: "#33cc33" });

      const allEdges = edges.get();
      allEdges.forEach((edge) => {
        if (edge.from === current && !visited.has(edge.to)) {
          const newDist = distances[current] + (edge.weight || 1);
          if (newDist < distances[edge.to]) {
            distances[edge.to] = newDist;
            // Atualiza o vizinho com cor amarela para indicar relaxamento.
            nodes.update({ id: edge.to, color: "#ffcc00" });
          }
        } else if (edge.to === current && !visited.has(edge.from)) {
          const newDist = distances[current] + (edge.weight || 1);
          if (newDist < distances[edge.from]) {
            distances[edge.from] = newDist;
            nodes.update({ id: edge.from, color: "#ffcc00" });
          }
        }
      });

      if (visited.size === allNodes.length) {
        clearInterval(interval);
      }
    }, 500);
  };

  // DFS (Busca em Profundidade): Utiliza uma pilha para visitar os nós e os destaca com cor roxa (#800080).
  const dfs = (startNode) => {
    if (!startNode || !network) return;
    const visited = new Set();
    const stack = [startNode];
    const interval = setInterval(() => {
      if (stack.length === 0) {
        clearInterval(interval);
        return;
      }
      const current = stack.pop();
      if (visited.has(current)) return;
      visited.add(current);
      nodes.update({ id: current, color: "#800080" });
      const allEdges = edges.get();
      allEdges.forEach((edge) => {
        if (edge.from === current && !visited.has(edge.to)) {
          stack.push(edge.to);
        } else if (edge.to === current && !visited.has(edge.from)) {
          stack.push(edge.from);
        }
      });
    }, 500);
  };

  // Prim (Algoritmo de Prim para Árvore Geradora Mínima):
  // Destaca, com cor azul (#0000ff), os nós e arestas que compõem o MST.
  const prim = (startNode) => {
    if (!startNode || !network) return;
    // Reseta cores dos nós e arestas
    nodes.get().forEach((node) => {
      nodes.update({ id: node.id, color: "#d3d3d3" });
    });
    edges.get().forEach((edge) => {
      edges.update({ id: edge.id, color: "#000000" });
    });

    // Inicializa o MST com o nó de início
    const inTree = new Set();
    inTree.add(startNode);
    nodes.update({ id: startNode, color: "#0000ff" });

    const interval = setInterval(() => {
      // Se todos os nós já estão no MST, encerra
      if (inTree.size === nodes.get().length) {
        clearInterval(interval);
        return;
      }
      let candidate = null;
      let candidateWeight = Infinity;
      // Re-obtemos as arestas atualizadas a cada iteração
      edges.get().forEach((edge) => {
        // Usa um peso padrão 1 se edge.weight não existir
        const weight = edge.weight ?? 1;
        if (
          inTree.has(edge.from) &&
          !inTree.has(edge.to) &&
          weight < candidateWeight
        ) {
          candidate = edge;
          candidateWeight = weight;
        } else if (
          inTree.has(edge.to) &&
          !inTree.has(edge.from) &&
          weight < candidateWeight
        ) {
          candidate = edge;
          candidateWeight = weight;
        }
      });
      if (!candidate) {
        clearInterval(interval);
        return;
      }
      // Atualiza a aresta do candidato com a cor azul (simples string)
      edges.update({ id: candidate.id, color: "#0000ff" });
      // Determina o novo nó a ser adicionado com base no candidato
      const newNodeId = inTree.has(candidate.from)
        ? candidate.to
        : candidate.from;
      inTree.add(newNodeId);
      nodes.update({ id: newNodeId, color: "#0000ff" });
    }, 1000);
  };

  // Função para resetar a execução: reseta a cor de todos os nós para seu estado original e limpa as seleções.
  const resetGraph = () => {
    nodes.get().forEach((node) => {
      nodes.update({ id: node.id, color: "#d3d3d3" });
    });
    edges.get().forEach((edge) => {
      edges.update({ id: edge.id, color: "#d3d3d3" });
    });
    setSelectedNode(null);
    setSelectedNodes([]);
  };

  return (
    <div>
      <button onClick={() => bfs(selectedNode)}>Executar BFS</button>
      <button onClick={() => dijkstra(selectedNode)}>Executar Dijkstra</button>
      <button onClick={() => dfs(selectedNode)}>Executar DFS</button>
      <button onClick={() => prim(selectedNode)}>Executar Prim (MST)</button>
      <button onClick={resetGraph}>Resetar Execução</button>
      <button onClick={addNode}>Adicionar Nó</button>
      <button onClick={removeNode}>Remover Nó</button>
      <button onClick={() => setSelectedNodes([])}>Limpar Seleção</button>
      <button onClick={removeEdge}>Remover Última Aresta</button>
      <div
        ref={graphContainer}
        style={{
          height: "500px",
          border: "1px solid black",
          marginTop: "10px",
        }}
      />
    </div>
  );
}
