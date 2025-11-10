"use client";

import React, { useState } from "react";
import { useWorkflowStore } from "@/lib/store";
import { nodeDefinitions } from "@/lib/node-definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { X } from "lucide-react";
import type { WorkflowNode, WorkflowState } from "@/lib/types";

interface NodeConfigPanelProps {
  nodeId: string;
  onClose: () => void;
}

export default function NodeConfigPanel({
  nodeId,
  onClose,
}: NodeConfigPanelProps) {
  const { nodes, updateNode } = useWorkflowStore();
  const node = nodes.find((n) => n.id === nodeId);

  if (!node) return null;

  return (
    <NodeConfigPanelContent
      key={nodeId}
      node={node}
      onClose={onClose}
      updateNode={updateNode}
    />
  );
}

interface NodeConfigPanelContentProps {
  node: WorkflowNode;
  onClose: () => void;
  updateNode: WorkflowState["updateNode"];
}

function NodeConfigPanelContent({
  node,
  onClose,
  updateNode,
}: NodeConfigPanelContentProps) {
  const definition = nodeDefinitions[node.data.type];
  const [config, setConfig] = useState<Record<string, unknown>>(
    () => ({ ...(node.data.config ?? {}) })
  );
  const output = node.data.output;

  if (!definition) return null;

  const handleSave = () => {
    updateNode(node.id, { config });
    onClose();
  };

  const handleChange = (name: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const getValue = (fieldName: string, fallback: unknown = "") => {
    const value = config[fieldName];
    return value ?? fallback;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-[#e0e0e0] z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-[#e0e0e0] p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#2d2d2d]">
            Configure Node
          </h3>
          <p className="mt-1 text-sm text-[#717171]">{definition.label}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#8a8a8a] transition-colors hover:text-[var(--accent)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5 space-y-5 text-[#2d2d2d]">
        {definition.configFields.map((field) => {
          const value = getValue(field.name, field.defaultValue ?? "");

          return (
            <div key={field.name}>
              <Label className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5a5a5a]">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === "text" && (
                <Input
                  type="text"
                  value={String(value ?? "")}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1"
                />
              )}

              {field.type === "number" && (
                <Input
                  type="number"
                  value={String(value ?? "")}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1"
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  value={String(value ?? "")}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1 font-mono text-sm"
                  rows={6}
                />
              )}

              {field.type === "select" && (
                <Select
                  value={String(value ?? "")}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  className="mt-1"
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          );
        })}

        <div className="flex gap-2 border-t border-[#e0e0e0] pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Configuration
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </div>

        {output !== undefined && output !== null && (
          <div className="mt-6 rounded-sm border border-[#e0e0e0] bg-[#f9f9f9] p-4">
            <h4 className="mb-2 text-sm font-medium text-[#454545]">
              Last Output
            </h4>
            <pre className="overflow-x-auto text-xs text-[#5a5a5a]">
              {JSON.stringify(output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
