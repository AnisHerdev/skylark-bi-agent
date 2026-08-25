import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  fetchAgentContext,
  buildSystemPrompt,
  buildUserPrompt,
} from "@/lib/agent";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    const ctx = await fetchAgentContext();
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(message, ctx);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const answer =
      completion.choices[0]?.message?.content ?? "No response generated.";

    return NextResponse.json({
      answer,
      dataQuality: {
        deals: ctx.dealsQuality,
        workOrders: ctx.workOrdersQuality,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
