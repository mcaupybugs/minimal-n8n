import { NodeExecutionContext, NodeExecutionResult } from "./types";
import { nodeDefinitions } from "./node-definitions";

function replaceTemplateVariables(text: string, input: unknown): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match: string, path: string) => {
    const trimmedPath = path.trim();

    if (trimmedPath === "input") {
      if (typeof input === "object" && input !== null) {
        return JSON.stringify(input);
      }
      return input === undefined ? "" : String(input);
    }

    if (trimmedPath.startsWith("input.")) {
      const fields = trimmedPath.substring(6).split(".");
      let result: unknown = input;

      for (const field of fields) {
        if (
          result &&
          typeof result === "object" &&
          field in (result as Record<string, unknown>)
        ) {
          result = (result as Record<string, unknown>)[field];
        } else {
          return match;
        }
      }

      if (result === undefined || result === null) {
        return match;
      }

      return typeof result === "object" ? JSON.stringify(result) : String(result);
    }

    return match;
  });
}

export class WorkflowExecutor {
  private async executeAINode(
    type: string,
    config: Record<string, unknown>,
    input: unknown
  ): Promise<unknown> {
    try {
      const response = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, config, input }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "AI execution failed");
      }

      return await response.json();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to execute AI node";
      throw new Error(message);
    }
  }

  async executeNode(
    context: NodeExecutionContext
  ): Promise<NodeExecutionResult> {
    const { nodeId, input, config } = context;
    const type = config.type;

    if (typeof type !== "string") {
      return {
        success: false,
        error: `Node ${nodeId} is missing a valid type`,
      };
    }

    const definition = nodeDefinitions[type];

    if (!definition) {
      return {
        success: false,
        error: `Unknown node type: ${type}`,
      };
    }

    try {
      switch (definition.category) {
        case "trigger":
          return await this.executeTriggerNode(config, input);

        case "ai":
          return await this.executeAINodeType(config, input);

        case "action":
          return await this.executeActionNode(config, input);

        case "logic":
          return await this.executeLogicNode(config, input);

        default:
          return {
            success: false,
            error: `Unsupported node category: ${definition.category}`,
          };
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Execution failed",
      };
    }
  }

  private async executeTriggerNode(
    config: Record<string, unknown>,
    input: unknown
  ): Promise<NodeExecutionResult> {
    return {
      success: true,
      output: input || {
        triggeredAt: new Date().toISOString(),
        config,
      },
    };
  }

  private async executeAINodeType(
    config: Record<string, unknown>,
    input: unknown
  ): Promise<NodeExecutionResult> {
    const type = typeof config.type === "string" ? config.type : "";
    const result = await this.executeAINode(type, config, input);
    return {
      success: true,
      output: result,
    };
  }

  private async executeActionNode(
    config: Record<string, unknown>,
    input: unknown
  ): Promise<NodeExecutionResult> {
    const type = typeof config.type === "string" ? config.type : "";

    switch (type) {
      case "httpRequest":
        return await this.executeHttpRequest(config, input);

      case "dataTransform":
        return this.executeDataTransform(config, input);

      case "sendEmail":
        return this.executeSendEmail(config, input);

      default:
        return {
          success: false,
          error: `Unknown action node type: ${type}`,
        };
    }
  }

  private async executeHttpRequest(
    config: Record<string, unknown>,
    input: unknown
  ): Promise<NodeExecutionResult> {
    try {
      const method = typeof config.method === "string" ? config.method : "GET";
      const rawUrl = typeof config.url === "string" ? config.url : "";
      const rawHeaders =
        typeof config.headers === "string" ? config.headers : "{}";
      const rawBody = typeof config.body === "string" ? config.body : "{}";

      const url = replaceTemplateVariables(rawUrl, input);
      const headers = replaceTemplateVariables(rawHeaders, input);
      const body = replaceTemplateVariables(rawBody, input);

      if (!url || typeof url !== "string") {
        return {
          success: false,
          error: "URL is required",
        };
      }

      const response = await fetch("/api/http-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          method,
          headers,
          body: method !== "GET" ? body : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "HTTP request failed",
        };
      }

      return {
        success: true,
        output: result,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "HTTP request failed",
      };
    }
  }

  private executeDataTransform(
    config: Record<string, unknown>,
    input: unknown
  ): NodeExecutionResult {
    try {
      const code = typeof config.code === "string" ? config.code : "";

      const transformFunction = new Function("input", code);
      const output = transformFunction(input);

      return {
        success: true,
        output,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Data transformation failed",
      };
    }
  }

  private executeSendEmail(
    config: Record<string, unknown>,
    input: unknown
  ): NodeExecutionResult {
  const rawTo = typeof config.to === "string" ? config.to : "";
  const rawSubject = typeof config.subject === "string" ? config.subject : "";
  const rawBody = typeof config.body === "string" ? config.body : "";

  const to = replaceTemplateVariables(rawTo, input);
  const subject = replaceTemplateVariables(rawSubject, input);
  const body = replaceTemplateVariables(rawBody, input);

    return {
      success: true,
      output: {
        sent: true,
        to,
        subject,
        body,
        sentAt: new Date().toISOString(),
        message: "✉️ Email sent successfully (simulated)",
      },
    };
  }

  private async executeLogicNode(
    config: Record<string, unknown>,
    input: unknown
  ): Promise<NodeExecutionResult> {
    const type = typeof config.type === "string" ? config.type : "";

    switch (type) {
      case "ifElse":
        return this.executeIfElse(config, input);

      case "delay":
        return await this.executeDelay(config, input);

      default:
        return {
          success: false,
          error: `Unknown logic node type: ${type}`,
        };
    }
  }

  private executeIfElse(
    config: Record<string, unknown>,
    input: unknown
  ): NodeExecutionResult {
    try {
      const condition =
        typeof config.condition === "string" ? config.condition : "";
      const operator =
        typeof config.operator === "string" ? config.operator : "javascript";

      let result = false;

      if (operator === "javascript" && condition) {
        const evaluateFunction = new Function("input", `return ${condition}`);
        result = Boolean(evaluateFunction(input));
      }

      return {
        success: true,
        output: {
          condition: result,
          branch: result ? "true" : "false",
          input,
        },
      };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Condition evaluation failed",
      };
    }
  }

  private async executeDelay(
    config: Record<string, unknown>,
    input: unknown
  ): Promise<NodeExecutionResult> {
    const durationRaw =
      typeof config.duration === "string" ? config.duration : "0";
    const unit = typeof config.unit === "string" ? config.unit : "milliseconds";
    const parsedDuration = Number.parseInt(durationRaw, 10);
    const ms = Number.isNaN(parsedDuration)
      ? 0
      : unit === "seconds"
        ? parsedDuration * 1000
        : parsedDuration;

    await new Promise((resolve) => setTimeout(resolve, ms));

    return {
      success: true,
      output: {
        delayed: ms,
        input,
      },
    };
  }
}
