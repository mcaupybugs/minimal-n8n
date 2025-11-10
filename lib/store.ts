import { create } from "zustand";
import { WorkflowState, WorkflowNode, WorkflowEdge } from "./types";
import { addEdge as addReactFlowEdge, Connection } from "reactflow";

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],

  addNode: (node: WorkflowNode) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },

  updateNode: (id: string, data: Partial<WorkflowNode["data"]>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },

  deleteNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    }));
  },

  addEdge: (edge: WorkflowEdge) => {
    set((state) => ({
      edges: addReactFlowEdge(edge as Connection, state.edges),
    }));
  },

  deleteEdge: (id: string) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  },

  setNodes: (nodes: WorkflowNode[]) => {
    set({ nodes });
  },

  setEdges: (edges: WorkflowEdge[]) => {
    set({ edges });
  },

  clearWorkflow: () => {
    set({ nodes: [], edges: [] });
  },
}));
