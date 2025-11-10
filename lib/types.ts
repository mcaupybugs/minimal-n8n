import { Node, Edge } from "reactflow";

export type NodeType =
  | "webhook"
  | "schedule"
  | "aiTextGenerator"
  | "aiAnalyzer"
  | "aiChatbot"
  | "aiDataExtractor"
  | "httpRequest"
  | "dataTransform"
  | "sendEmail"
  | "ifElse"
  | "delay";

export interface NodeData {
  label: string;
  type: NodeType;
  config?: Record<string, unknown>;
  output?: unknown;
  isExecuting?: boolean;
  error?: string;
}

export type WorkflowNode = Node<NodeData>;

export type WorkflowEdge = Edge;

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  deleteEdge: (id: string) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  clearWorkflow: () => void;
}

export interface NodeExecutionContext {
  nodeId: string;
  input: unknown;
  config: Record<string, unknown>;
  previousNodes: Record<string, unknown>;
}

export interface NodeExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
}
