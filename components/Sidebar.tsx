"use client";

import React from "react";
import { nodeDefinitions, NodeDefinition } from "@/lib/node-definitions";
import { Play, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onExecute: () => void;
  isExecuting: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onQuickAdd: (type: string) => void;
}

export default function Sidebar({
  onExecute,
  isExecuting,
  collapsed,
  onToggle,
  onQuickAdd,
}: SidebarProps) {
  const { clearWorkflow } = useWorkflowStore();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const categories = {
    trigger: "Trigger Nodes",
    ai: "AI Nodes",
    action: "Action Nodes",
    logic: "Logic Nodes",
  };

  const groupedNodes = Object.values(nodeDefinitions).reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, NodeDefinition[]>);

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col overflow-hidden border-r border-[#e4e4e4] bg-white text-[var(--foreground)] transition-all duration-200 ease-out",
        collapsed ? "w-20" : "w-80"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-[#f0f0f0]",
          collapsed ? "justify-center px-3 py-4" : "justify-between px-6 py-6"
        )}
      >
        {!collapsed && <h2 className="text-xl font-semibold">Minimal n8n</h2>}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#e4e4e4] text-[#555] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed ? (
        <>
          <div className="px-6 py-6">
            <div className="flex gap-2">
              <Button
                onClick={onExecute}
                disabled={isExecuting}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                {isExecuting ? "Running..." : "Execute"}
              </Button>

              <Button onClick={clearWorkflow} variant="outline">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pr-4 scrollbar-hide">
            {Object.entries(categories).map(([category, title]) => (
              <div key={category} className="mb-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#656565]">
                  {title}
                </h3>

                <div className="space-y-2">
                  {groupedNodes[category]?.map((node) => (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(event) => onDragStart(event, node.type)}
                      onDoubleClick={(event) => {
                        event.preventDefault();
                        onQuickAdd(node.type);
                      }}
                      className="cursor-move rounded-sm border border-[#e4e4e4] bg-[#f9f9f9] p-3 transition-all hover:border-[var(--accent)] hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${node.color} rounded-sm p-2`}>
                          <node.icon className="h-4 w-4 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[var(--foreground)]">
                            {node.label}
                          </div>
                          <div className="mt-1 text-xs leading-relaxed text-[#707070]">
                            {node.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-4 px-3 py-4">
          <Button
            onClick={onExecute}
            disabled={isExecuting}
            size="icon"
            className="h-10 w-10"
            aria-label="Execute workflow"
          >
            <Play className="h-4 w-4" />
          </Button>

          <Button
            onClick={clearWorkflow}
            variant="outline"
            size="icon"
            className="h-10 w-10"
            aria-label="Clear workflow"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </aside>
  );
}
