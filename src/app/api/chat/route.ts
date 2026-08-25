import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  fetchAgentContext,
  generateGeminiResponse,
} from "@/lib/agent";

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

    // Fetch dynamic context from Monday.com boards and run data normalizer
    const ctx = await fetchAgentContext();

    // Generate executive business intelligence answer using Google Gemini 2.0 Flash
    const answer = await generateGeminiResponse(message, ctx);

    return NextResponse.json({
      answer,
      dataQuality: {
        deals: ctx.dealsQuality,
        workOrders: ctx.workOrdersQuality,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
