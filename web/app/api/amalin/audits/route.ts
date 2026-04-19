import { NextResponse } from "next/server"

import { readSession } from "@/lib/auth/session"
import { connectToDatabase } from "@/lib/mongodb"
import { AuditRunModel } from "@/lib/models/audit-run"

type CreateAuditBody = {
  prompt?: string
  analysisDepth?: string
  result?: unknown
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function GET(request: Request) {
  const session = await readSession()
  if (!session?.userId) {
    return unauthorizedResponse()
  }

  const url = new URL(request.url)
  const pageParam = Number.parseInt(url.searchParams.get("page") || "1", 10)
  const limitParam = Number.parseInt(url.searchParams.get("limit") || "10", 10)
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, 50)
      : 10
  const skip = (page - 1) * limit

  await connectToDatabase()
  const [audits, total] = await Promise.all([
    AuditRunModel.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(),
    AuditRunModel.countDocuments({ userId: session.userId }),
  ])

  return NextResponse.json({
    audits: audits.map((audit) => ({
      id: String(audit._id),
      prompt: audit.prompt,
      analysisDepth: audit.analysisDepth,
      inquiryIntent: audit.inquiryIntent,
      consultedAgents: audit.consultedAgents,
      result: audit.result,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
    })),
    pagination: {
      page,
      limit,
      total,
      hasMore: skip + audits.length < total,
    },
  })
}

export async function POST(request: Request) {
  const session = await readSession()
  if (!session?.userId) {
    return unauthorizedResponse()
  }

  let body: CreateAuditBody
  try {
    body = (await request.json()) as CreateAuditBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const prompt = body.prompt?.trim()
  if (!prompt || !body.result) {
    return NextResponse.json(
      { error: "Missing required fields: prompt, result" },
      { status: 400 }
    )
  }

  await connectToDatabase()
  const created = await AuditRunModel.create({
    userId: session.userId,
    prompt,
    analysisDepth: body.analysisDepth || "comprehensive",
    inquiryIntent:
      typeof body.result === "object" && body.result
        ? (body.result as { inquiry_intent?: string }).inquiry_intent || "comprehensive"
        : "comprehensive",
    consultedAgents:
      typeof body.result === "object" && body.result
        ? (body.result as { consulted_agents?: string[] }).consulted_agents || []
        : [],
    result: body.result,
  })

  return NextResponse.json(
    {
      audit: {
        id: String(created._id),
        prompt: created.prompt,
        analysisDepth: created.analysisDepth,
        inquiryIntent: created.inquiryIntent,
        consultedAgents: created.consultedAgents,
        result: created.result,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    },
    { status: 201 }
  )
}
