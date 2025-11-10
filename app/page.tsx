"use client";

import React, { useCallback, useState, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  Panel,
  Node,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import Sidebar from "@/components/Sidebar";
import CustomNode from "@/components/CustomNode";
import NodeConfigPanel from "@/components/NodeConfigPanel";
import { useWorkflowStore } from "@/lib/store";
import { nodeDefinitions } from "@/lib/node-definitions";
import { WorkflowNode, NodeData, WorkflowEdge } from "@/lib/types";
import { WorkflowExecutor } from "@/lib/executor";
import { X, Lightbulb } from "lucide-react";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

let nodeIdCounter = 0;

export default function Home() {
  const { nodes, edges, addNode, addEdge, updateNode, setNodes, setEdges } =
    useWorkflowStore();
  const [, , onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [, , onEdgesChange] = useEdgesState<WorkflowEdge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }
      const edge: WorkflowEdge = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: "smoothstep",
        style: { stroke: "#7a7a7a", strokeWidth: 1.5 },
      };
      addEdge(edge);
    },
    [addEdge]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Update store with the changes
      changes.forEach((change) => {
        if (change.type === "remove") {
          const { nodes: currentNodes } = useWorkflowStore.getState();
          setNodes(currentNodes.filter((node) => node.id !== change.id));
        } else if (change.type === "position" && "position" in change) {
          const node = nodes.find((n) => n.id === change.id);
          if (node && change.position) {
            const updatedNodes = nodes.map((n) =>
              n.id === change.id ? { ...n, position: change.position! } : n
            );
            setNodes(updatedNodes);
          }
        }
      });
    },
    [nodes, onNodesChange, setNodes]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      // Update store with the changes
      changes.forEach((change) => {
        if (change.type === "remove") {
          const { edges: currentEdges } = useWorkflowStore.getState();
          setEdges(currentEdges.filter((edge) => edge.id !== change.id));
        }
      });
    },
    [onEdgesChange, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const definition = nodeDefinitions[type];
      if (!definition) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `node-${nodeIdCounter++}`,
        type: "custom",
        position,
        data: {
          label: definition.label,
          type: definition.type,
          config: { ...definition.defaultConfig, type: definition.type },
        } as NodeData,
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const handleQuickAddNode = useCallback(
    (nodeType: string) => {
      const definition = nodeDefinitions[nodeType];
      if (!definition) return;

      let position = { x: 0, y: 0 };

      if (reactFlowInstance && reactFlowWrapper.current) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const centerPoint = {
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        };
        const flowPosition = reactFlowInstance.screenToFlowPosition(centerPoint);
        position = {
          x: flowPosition.x + nodes.length * 24,
          y: flowPosition.y + nodes.length * 24,
        };
      } else {
        position = { x: nodes.length * 40, y: nodes.length * 40 };
      }

      const newNode: WorkflowNode = {
        id: `node-${nodeIdCounter++}`,
        type: "custom",
        position,
        data: {
          label: definition.label,
          type: definition.type,
          config: { ...definition.defaultConfig, type: definition.type },
        } as NodeData,
      };

      addNode(newNode);
    },
    [addNode, nodes.length, reactFlowInstance]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNodeId(node.id);
    },
    []
  );

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      alert("Add some nodes to the canvas first!");
      return;
    }

    setIsExecuting(true);
    const executor = new WorkflowExecutor();

    // Find trigger nodes (nodes with no incoming edges)
    const triggerNodes = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id)
    );

    if (triggerNodes.length === 0) {
      alert("Add a trigger node to start the workflow!");
      setIsExecuting(false);
      return;
    }

    // Reset all nodes
    nodes.forEach((node) => {
      updateNode(node.id, {
        output: undefined,
        error: undefined,
        isExecuting: false,
      });
    });

    // Execute nodes in order
    const executedNodes = new Set<string>();
    const nodeOutputs: Record<string, unknown> = {};

    const executeNodeChain = async (
      nodeId: string,
      input: unknown = null
    ): Promise<void> => {
      if (executedNodes.has(nodeId)) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      executedNodes.add(nodeId);
      updateNode(nodeId, { isExecuting: true, error: undefined });

      try {
        const nodeConfig = node.data.config ?? {};
        const result = await executor.executeNode({
          nodeId: node.id,
          input,
          config: nodeConfig,
          previousNodes: nodeOutputs,
        });

        if (result.success) {
          updateNode(nodeId, {
            output: result.output,
            isExecuting: false,
          });
          nodeOutputs[nodeId] = result.output;

          // Find and execute connected nodes
          const connectedEdges = edges.filter((edge) => edge.source === nodeId);
          for (const edge of connectedEdges) {
            await executeNodeChain(edge.target, result.output);
          }
        } else {
          updateNode(nodeId, {
            error: result.error,
            isExecuting: false,
          });
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Execution failed";
        updateNode(nodeId, {
          error: message,
          isExecuting: false,
        });
      }
    };

    // Execute from each trigger
    for (const triggerNode of triggerNodes) {
      await executeNodeChain(triggerNode.id);
    }

    setIsExecuting(false);
  };

  return (
    <div className="flex h-screen w-screen bg-white">
      <Sidebar
        onExecute={executeWorkflow}
        isExecuting={isExecuting}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        onQuickAdd={handleQuickAddNode}
      />

      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange as OnNodesChange}
          onEdgesChange={handleEdgesChange as OnEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-[#f7f7f8]"
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="#6b6b6b"
            size={1.3}
            gap={18}
          />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const definition = nodeDefinitions[node.data.type];
              return definition?.color.includes("gradient")
                ? "#8b5cf6"
                : definition?.color.replace("bg-", "") || "#6366f1";
            }}
            className="bg-white"
          />

          <Panel
            position="top-center"
            className="rounded-sm border border-[#e0e0e0] bg-white px-4 py-2 text-sm text-[#545454] shadow-sm"
          >
            <div>
              <span className="font-medium text-[#2d2d2d]">{nodes.length}</span> nodes •{' '}
              <span className="font-medium text-[#2d2d2d]">{edges.length}</span> connections
            </div>
          </Panel>

          {showTip && (
            <Panel
              position="top-right"
              className="w-60 rounded-sm border border-[#f2c7d3] bg-[#fff5f8] px-3 py-2 text-xs text-[#b12a4f] shadow-sm"
            >
              <div className="relative pr-5">
                <div className="flex items-center gap-2 text-[#e1325e]">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span className="text-[0.75rem] font-semibold">Quick tips</span>
                </div>
                <div className="mt-2 space-y-1">
                  <p>Drag nodes to build and double-click to drop instantly.</p>
                  <p>Connect the flow, then execute when you’re ready.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTip(false)}
                  aria-label="Dismiss tips"
                  className="absolute right-0 top-0 text-[#e1325e] transition-colors hover:text-[#b12a4f]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {selectedNodeId && (
        <NodeConfigPanel
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
