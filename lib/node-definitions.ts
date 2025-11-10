import {
  Webhook,
  Clock,
  Sparkles,
  Brain,
  MessageSquare,
  FileSearch,
  Globe,
  Code,
  Mail,
  GitBranch,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NodeDefinition {
  type: string;
  label: string;
  description: string;
  category: "trigger" | "ai" | "action" | "logic";
  icon: LucideIcon;
  color: string;
  defaultConfig: Record<string, unknown>;
  configFields: ConfigField[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: unknown;
}

export const nodeDefinitions: Record<string, NodeDefinition> = {
  webhook: {
    type: "webhook",
    label: "Webhook Trigger",
    description: "Triggers workflow when receiving HTTP request",
    category: "trigger",
    icon: Webhook,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      method: "POST",
      path: "/webhook",
    },
    configFields: [
      {
        name: "method",
        label: "HTTP Method",
        type: "select",
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
        ],
        defaultValue: "POST",
      },
      {
        name: "path",
        label: "Webhook Path",
        type: "text",
        placeholder: "/webhook",
        defaultValue: "/webhook",
      },
    ],
  },

  schedule: {
    type: "schedule",
    label: "Schedule Trigger",
    description: "Runs workflow on a schedule",
    category: "trigger",
    icon: Clock,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      interval: "5",
      unit: "minutes",
    },
    configFields: [
      {
        name: "interval",
        label: "Interval",
        type: "number",
        placeholder: "5",
        defaultValue: "5",
      },
      {
        name: "unit",
        label: "Unit",
        type: "select",
        options: [
          { value: "minutes", label: "Minutes" },
          { value: "hours", label: "Hours" },
          { value: "days", label: "Days" },
        ],
        defaultValue: "minutes",
      },
    ],
  },

  aiTextGenerator: {
    type: "aiTextGenerator",
    label: "AI Text Generator",
    description: "Generate text using Azure OpenAI",
    category: "ai",
    icon: Sparkles,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      prompt: "Write a professional email",
      temperature: "0.7",
      maxTokens: "500",
    },
    configFields: [
      {
        name: "prompt",
        label: "Prompt",
        type: "textarea",
        placeholder: "Enter your prompt here...",
        required: true,
      },
      {
        name: "temperature",
        label: "Temperature",
        type: "number",
        placeholder: "0.7",
        defaultValue: "0.7",
      },
      {
        name: "maxTokens",
        label: "Max Tokens",
        type: "number",
        placeholder: "500",
        defaultValue: "500",
      },
    ],
  },

  aiAnalyzer: {
    type: "aiAnalyzer",
    label: "AI Content Analyzer",
    description: "Analyze content with Azure OpenAI (sentiment, keywords, summary)",
    category: "ai",
    icon: Brain,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      analysisType: "sentiment",
      text: "",
    },
    configFields: [
      {
        name: "text",
        label: "Text to Analyze",
        type: "textarea",
        placeholder: "Enter text to analyze...",
        required: true,
      },
      {
        name: "analysisType",
        label: "Analysis Type",
        type: "select",
        options: [
          { value: "sentiment", label: "Sentiment Analysis" },
          { value: "keywords", label: "Extract Keywords" },
          { value: "summary", label: "Summarize" },
        ],
        defaultValue: "sentiment",
      },
    ],
  },

  aiChatbot: {
    type: "aiChatbot",
    label: "AI Chatbot",
    description: "Generate chatbot responses",
    category: "ai",
    icon: MessageSquare,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      systemPrompt: "You are a helpful assistant.",
      userMessage: "",
      personality: "professional",
    },
    configFields: [
      {
        name: "systemPrompt",
        label: "System Prompt",
        type: "textarea",
        placeholder: "You are a helpful assistant...",
        defaultValue: "You are a helpful assistant.",
      },
      {
        name: "userMessage",
        label: "User Message",
        type: "textarea",
        placeholder: "User message...",
        required: true,
      },
      {
        name: "personality",
        label: "Personality",
        type: "select",
        options: [
          { value: "professional", label: "Professional" },
          { value: "friendly", label: "Friendly" },
          { value: "concise", label: "Concise" },
        ],
        defaultValue: "professional",
      },
    ],
  },

  aiDataExtractor: {
    type: "aiDataExtractor",
    label: "AI Data Extractor",
    description: "Extract structured data from text",
    category: "ai",
    icon: FileSearch,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      text: "",
      schema: '{"name": "string", "email": "string"}',
    },
    configFields: [
      {
        name: "text",
        label: "Text Input",
        type: "textarea",
        placeholder: "Enter unstructured text...",
        required: true,
      },
      {
        name: "schema",
        label: "Expected Schema (JSON)",
        type: "textarea",
        placeholder: '{"name": "string", "email": "string"}',
        required: true,
      },
    ],
  },

  httpRequest: {
    type: "httpRequest",
    label: "HTTP Request",
    description: "Make HTTP requests to APIs",
    category: "action",
    icon: Globe,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      method: "GET",
      url: "https://api.example.com",
      headers: "{}",
      body: "{}",
    },
    configFields: [
      {
        name: "method",
        label: "Method",
        type: "select",
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "DELETE", label: "DELETE" },
        ],
        defaultValue: "GET",
      },
      {
        name: "url",
        label: "URL",
        type: "text",
        placeholder: "https://api.example.com",
        required: true,
      },
      {
        name: "headers",
        label: "Headers (JSON)",
        type: "textarea",
        placeholder: '{"Content-Type": "application/json"}',
        defaultValue: "{}",
      },
      {
        name: "body",
        label: "Body (JSON)",
        type: "textarea",
        placeholder: '{"key": "value"}',
        defaultValue: "{}",
      },
    ],
  },

  dataTransform: {
    type: "dataTransform",
    label: "Data Transform",
    description: "Transform data using JavaScript",
    category: "action",
    icon: Code,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      code: "return { ...input, transformed: true };",
    },
    configFields: [
      {
        name: "code",
        label: "Transformation Code",
        type: "textarea",
        placeholder: "return { ...input, transformed: true };",
        required: true,
      },
    ],
  },

  sendEmail: {
    type: "sendEmail",
    label: "Send Email",
    description: "Send email (simulated)",
    category: "action",
    icon: Mail,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      to: "user@example.com",
      subject: "Hello",
      body: "Email body",
    },
    configFields: [
      {
        name: "to",
        label: "To",
        type: "text",
        placeholder: "user@example.com",
        required: true,
      },
      {
        name: "subject",
        label: "Subject",
        type: "text",
        placeholder: "Email subject",
        required: true,
      },
      {
        name: "body",
        label: "Body",
        type: "textarea",
        placeholder: "Email body...",
        required: true,
      },
    ],
  },

  ifElse: {
    type: "ifElse",
    label: "If/Else",
    description: "Conditional logic",
    category: "logic",
    icon: GitBranch,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      condition: "input.value > 10",
      operator: "javascript",
    },
    configFields: [
      {
        name: "condition",
        label: "Condition",
        type: "text",
        placeholder: "input.value > 10",
        required: true,
      },
      {
        name: "operator",
        label: "Operator",
        type: "select",
        options: [
          { value: "javascript", label: "JavaScript Expression" },
          { value: "equals", label: "Equals" },
          { value: "contains", label: "Contains" },
        ],
        defaultValue: "javascript",
      },
    ],
  },

  delay: {
    type: "delay",
    label: "Delay",
    description: "Wait for specified time",
    category: "logic",
    icon: Timer,
    color: "bg-[#2d2d2d]",
    defaultConfig: {
      duration: "1000",
      unit: "milliseconds",
    },
    configFields: [
      {
        name: "duration",
        label: "Duration",
        type: "number",
        placeholder: "1000",
        required: true,
      },
      {
        name: "unit",
        label: "Unit",
        type: "select",
        options: [
          { value: "milliseconds", label: "Milliseconds" },
          { value: "seconds", label: "Seconds" },
        ],
        defaultValue: "milliseconds",
      },
    ],
  },
};
