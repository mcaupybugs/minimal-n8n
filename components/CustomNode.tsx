"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { nodeDefinitions } from "@/lib/node-definitions";
import { WorkflowNode } from "@/lib/types";
import { Settings, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/lib/store";

function CustomNode({ data, selected, id }: NodeProps<WorkflowNode["data"]>) {
  const definition = nodeDefinitions[data.type];
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  if (!definition) return null;

  const Icon = definition.icon;
  const showInput = definition.category !== "trigger";

  return (
    <div
      className={cn(
        "relative min-w-[200px] rounded-sm border border-[#e0e0e0] bg-white shadow-sm transition-all",
        selected && "border-[var(--accent)]",
        data.isExecuting && "ring-2 ring-[#2d2d2d]/40",
        data.error && "ring-2 ring-[var(--accent)]"
      )}
    >
      {/* Input Handle */}
      {showInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !border-white !bg-[var(--accent)]"
        />
      )}

      <button
        type="button"
        aria-label="Remove node"
        onClick={(event) => {
          event.stopPropagation();
          deleteNode(id);
        }}
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[#8a8a8a] shadow-sm ring-1 ring-[#d9d9d9] transition-colors hover:text-[var(--accent)] hover:ring-[var(--accent)]"
      >
        <X className="h-2.5 w-2.5" strokeWidth={2.5} />
      </button>

      {/* Node Header */}
      <div
        className={`${definition.color} flex items-center gap-2 rounded-t-sm px-3 py-2`}
      >
        <Icon className="h-5 w-5 text-white" />
        <span className="flex-1 text-sm font-medium text-white">
          {definition.label}
        </span>

        {data.isExecuting && (
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        )}
        {data.output && !data.isExecuting && !data.error && (
          <CheckCircle className="h-4 w-4 text-white" />
        )}
        {data.error && <AlertCircle className="h-4 w-4 text-white" />}
      </div>

      {/* Node Body */}
      <div className="p-3">
        <div className="mb-2 text-xs text-[#5a5a5a]">
          {definition.description}
        </div>

        {data.config && Object.keys(data.config).length > 0 && (
          <div className="rounded-sm border border-[#e0e0e0] bg-[#f6f6f6] p-2 text-xs text-[#5a5a5a]">
            <div className="flex items-center gap-1 text-[#4a4a4a]">
              <Settings className="h-3 w-3" />
              <span>Configured</span>
            </div>
          </div>
        )}

        {data.error && (
          <div className="mt-2 rounded-sm border border-[#f3b8c6] bg-[#fff0f4] p-2 text-xs text-[var(--accent)]">
            {data.error}
          </div>
        )}

        {data.output && !data.error && (
          <div className="mt-2 rounded-sm border border-[#e0e0e0] bg-[#f6f6f6] p-2 text-xs text-[#2d2d2d]">
            ✓ Executed successfully
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-white !bg-[var(--accent)]"
      />
    </div>
  );
}

export default memo(CustomNode);
