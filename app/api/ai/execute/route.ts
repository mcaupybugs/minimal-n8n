import { NextRequest, NextResponse } from "next/server";
import { AzureOpenAI } from "openai";

function replaceTemplateVariables(text: unknown, input: unknown): string {
  if (!text || typeof text !== "string") return String(text ?? "");

  let result = text.replace(
    /\{\{input\}\}/g,
    typeof input === "object" ? JSON.stringify(input) : String(input ?? "")
  );

  result = result.replace(
    /\{\{input\.([^}]+)\}\}/g,
    (match: string, path: string) => {
      const fields = path.split(".");
      let value: unknown = input;

      for (const field of fields) {
        if (value && typeof value === "object" && field in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[field];
        } else {
          return match;
        }
      }

      return typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
    }
  );

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { type, config, input } = await request.json();

    if (
      !process.env.AZURE_OPENAI_API_KEY ||
      !process.env.AZURE_OPENAI_ENDPOINT ||
      !process.env.AZURE_OPENAI_DEPLOYMENT_ID
    ) {
      return NextResponse.json(
        {
          error:
            "Azure OpenAI credentials not configured. Add AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT_ID to .env",
        },
        { status: 500 }
      );
    }

    const openai = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: "2024-08-01-preview",
    });

    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID as string;

  let result;

    switch (type) {
      case "aiTextGenerator":
        result = await executeTextGenerator(config, input, openai, deploymentId);
        break;

      case "aiAnalyzer":
        result = await executeAnalyzer(config, input, openai, deploymentId);
        break;

      case "aiChatbot":
        result = await executeChatbot(config, input, openai, deploymentId);
        break;

      case "aiDataExtractor":
        result = await executeDataExtractor(config, input, openai, deploymentId);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown AI node type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("AI execution error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "AI execution failed",
      },
      { status: 500 }
    );
  }
}

async function executeTextGenerator(
  config: Record<string, unknown>,
  input: unknown,
  openai: AzureOpenAI,
  deploymentId: string
) {
  const configRecord = config as Record<string, unknown>;
  const prompt = replaceTemplateVariables(configRecord.prompt, input);
  const temperatureValue = Number(configRecord.temperature ?? 0.7) || 0.7;
  const maxTokensValue = Number(configRecord.maxTokens ?? 500) || 500;

  const completion = await openai.chat.completions.create({
    model: deploymentId,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: temperatureValue,
    max_tokens: maxTokensValue,
  });

  return {
    generatedText: completion.choices[0].message.content,
    model: deploymentId,
    usage: completion.usage,
  };
}

async function executeAnalyzer(
  config: Record<string, unknown>,
  input: unknown,
  openai: AzureOpenAI,
  deploymentId: string
) {
  const configRecord = config as Record<string, unknown>;
  const text = replaceTemplateVariables(configRecord.text, input);
  const analysisType = String(configRecord.analysisType ?? "sentiment");

  let systemPrompt = "";
  switch (analysisType) {
    case "sentiment":
      systemPrompt =
        "Analyze the sentiment of the following text. Respond with: Positive, Negative, or Neutral, followed by a confidence score (0-1) and brief explanation.";
      break;
    case "keywords":
      systemPrompt =
        "Extract the most important keywords and phrases from the following text. Return them as a JSON array.";
      break;
    case "summary":
      systemPrompt =
        "Provide a concise summary of the following text in 2-3 sentences.";
      break;
  }

  const completion = await openai.chat.completions.create({
    model: deploymentId,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.3,
  });

  return {
    analysisType,
    result: completion.choices[0].message.content,
    usage: completion.usage,
  };
}

async function executeChatbot(
  config: Record<string, unknown>,
  input: unknown,
  openai: AzureOpenAI,
  deploymentId: string
) {
  const configRecord = config as Record<string, unknown>;
  const systemPrompt = replaceTemplateVariables(configRecord.systemPrompt, input);
  const userMessage = replaceTemplateVariables(configRecord.userMessage, input);
  const personality = String(configRecord.personality ?? "professional");

  const personalityPrompts: Record<string, string> = {
    professional: "Respond in a professional and formal manner.",
    friendly: "Respond in a warm, friendly, and conversational manner.",
    concise: "Respond with brief, to-the-point answers.",
  };

  const fullSystemPrompt = `${systemPrompt}\n\n${
    personalityPrompts[personality as keyof typeof personalityPrompts] || ""
  }`;

  const completion = await openai.chat.completions.create({
    model: deploymentId,
    messages: [
      { role: "system", content: fullSystemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
  });

  return {
    response: completion.choices[0].message.content,
    personality,
    usage: completion.usage,
  };
}

async function executeDataExtractor(
  config: Record<string, unknown>,
  input: unknown,
  openai: AzureOpenAI,
  deploymentId: string
) {
  const configRecord = config as Record<string, unknown>;
  const text = replaceTemplateVariables(configRecord.text, input);
  const schema = replaceTemplateVariables(configRecord.schema, input);

  const systemPrompt = `Extract information from the text according to this schema: ${schema}. Return ONLY a valid JSON object matching the schema, with no additional text or explanation.`;

  const completion = await openai.chat.completions.create({
    model: deploymentId,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    temperature: 0.1,
  });

  const extractedData = completion.choices[0].message.content;

  try {
    const parsed = JSON.parse(extractedData || "{}");
    return {
      extractedData: parsed,
      schema,
      usage: completion.usage,
    };
  } catch {
    return {
      extractedData,
      schema,
      usage: completion.usage,
      note: "Could not parse as JSON, returning raw text",
    };
  }
}
