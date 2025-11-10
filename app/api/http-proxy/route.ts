import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, method = "GET", headers = "{}", body } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let validUrl = url.trim();
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = "https://" + validUrl;
    }

    let parsedHeaders: Record<string, string> = {};
    try {
      parsedHeaders = JSON.parse(headers);
    } catch {
      parsedHeaders = {};
    }

    let parsedBody: unknown;
    if (method !== "GET" && body) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body;
      }
    }

    const response = await fetch(validUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Minimal-n8n/1.0",
        ...parsedHeaders,
      },
      body: parsedBody ? JSON.stringify(parsedBody) : undefined,
    });

    const contentType = response.headers.get("content-type");
    let data: unknown;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = await response.text();
    } else {
      data = await response.text();
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    });
  } catch (error: unknown) {
    console.error("HTTP proxy error:", error);
    const message = error instanceof Error ? error.message : "HTTP request failed";
    const details =
      error instanceof Error && error.cause instanceof Error
        ? error.cause.message
        : undefined;
    return NextResponse.json(
      {
        error: message,
        details,
      },
      { status: 500 }
    );
  }
}
