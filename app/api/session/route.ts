import { NextResponse } from "next/server"

import {
  flattenSearchParams,
  parseApiBody,
  requestOrigin,
} from "@/lib/session"

export const dynamic = "force-dynamic"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: CORS_HEADERS })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(request: Request) {
  const origin = requestOrigin(request)
  const params = Object.fromEntries(new URL(request.url).searchParams.entries())
  return respond(params, origin)
}

export async function POST(request: Request) {
  const origin = requestOrigin(request)
  let body: unknown = {}
  const text = await request.text()
  if (text.trim()) {
    try {
      body = JSON.parse(text)
    } catch {
      return json({ ok: false, error: "Invalid JSON body." }, 400)
    }
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, error: "JSON body must be an object." }, 400)
  }
  return respond(body as Record<string, unknown>, origin)
}

function respond(raw: Record<string, unknown>, origin: string) {
  const result = parseApiBody(flattenSearchParamsIfNeeded(raw), origin)
  if (!result.ok) return json(result, 400)
  return json(result)
}

function flattenSearchParamsIfNeeded(raw: Record<string, unknown>) {
  const looksLikeSearchParams = Object.values(raw).every(
    (value) =>
      value === undefined ||
      typeof value === "string" ||
      (Array.isArray(value) && value.every((item) => typeof item === "string"))
  )
  if (!looksLikeSearchParams) return raw
  return flattenSearchParams(
    raw as Record<string, string | string[] | undefined>
  )
}
