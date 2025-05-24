"use client";

import React, { useEffect, useRef, memo } from "react";
import { Network, IdType, Options as VisOptions } from "vis-network/peer";
import { NodesDataSet, EdgesDataSet } from "@/types/graph-types";
import { GRAPH_OPTIONS } from "@/constants/graph-constants";

interface GraphVisualizationProps {
  nodes: NodesDataSet;
  edges: EdgesDataSet;
  onNodeClick: (nodeId: IdType) => void;
  setNetworkInstance: (network: Network | null) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  nodes,
  edges,
  onNodeClick,
  setNetworkInstance,
}) => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!graphContainerRef.current) {
      console.warn(
        "Graph container ref not available for network initialization.",
      );
      return;
    }

    const data = { nodes, edges };
    const newNetwork = new Network(
      graphContainerRef.current,
      data,
      GRAPH_OPTIONS as VisOptions,
    );

    // Listener para cliques nos nós
    newNetwork.on("click", (params) => {
      if (params.nodes.length > 0) {
        onNodeClick(params.nodes[0]);
      }
    });

    newNetwork.once("stabilizationIterationsDone", () => {
      newNetwork.setOptions({
        physics: {
          enabled: true,
          stabilization: false,
        },
      });
    });

    networkInstanceRef.current = newNetwork;
    if (typeof setNetworkInstance === "function") {
      setNetworkInstance(newNetwork);
    }

    return () => {
      if (networkInstanceRef.current) {
        // Remove todos os event listeners antes de destruir para evitar memory leaks
        networkInstanceRef.current.off("click");
        networkInstanceRef.current.off("stabilizationIterationsDone");
        networkInstanceRef.current.destroy();
        networkInstanceRef.current = null;
        if (typeof setNetworkInstance === "function") {
          setNetworkInstance(null);
        }
      }
    };
  }, [nodes, edges, onNodeClick, setNetworkInstance]);

  // Efeito para lidar com redimensionamento da janela
  useEffect(() => {
    const handleResize = () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.fit();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={graphContainerRef}
      className="h-[500px] w-full overflow-hidden rounded-2xl border-2 border-amber-400 bg-white shadow-lg md:h-[600px]"
      aria-label="Área de visualização do grafo interativo"
      role="application"
    />
  );
};

export default memo(GraphVisualization);
