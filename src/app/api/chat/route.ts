import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  fetchAgentContext,
  generateGeminiResponse,
} from "@/lib/agent";
import { buildCombinedDataQuality } from "@/lib/analytics";

const requestSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message } = parsed.data;

    // 100% Dynamic fetch from Monday.com boards with on-the-fly normalization
    const ctx = await fetchAgentContext();

    // Generate executive BI answer and contextual follow-up drill-downs via Gemini 2.5 Flash
    const { answer, suggestions } = await generateGeminiResponse(message, ctx);

    // Generate comprehensive, explainable data quality & audit metrics
    const dataQuality = buildCombinedDataQuality(
      ctx.dealsQuality,
      ctx.workOrdersQuality
    );

    return NextResponse.json({
      answer,
      suggestions,
      dataQuality,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
