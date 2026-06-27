import { NextResponse } from "next/server";
import { BackendError, callBackend } from "@/lib/api/backend";
import { normalizeVaccine } from "@/lib/api/normalizer-vaccine";
import { getAccessToken } from "@/lib/auth/session";

interface PaginatedRaw {
  items: Parameters<typeof normalizeVaccine>[0][];
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

export async function GET(request: Request, { params }: { params: Promise<{ memberId: string }> }) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  const { memberId } = await params;
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  const backendUrl = `/api/v1/members/${memberId}/vaccines${qs ? `?${qs}` : ""}`;

  try {
    const raw = await callBackend<PaginatedRaw>(backendUrl, { accessToken });
    return NextResponse.json({
      items: raw.items.map(normalizeVaccine),
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[GET /members/[memberId]/vaccines] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { type: "about:blank", title: "Not authenticated", status: 401 },
      { status: 401 }
    );
  }

  const { memberId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { type: "about:blank", title: "Invalid JSON body", status: 400 },
      { status: 400 }
    );
  }

  try {
    await callBackend(`/api/v1/members/${memberId}/vaccines`, {
      method: "POST",
      body,
      accessToken,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.problem, { status: error.status });
    }
    console.error("[POST /members/[memberId]/vaccines] unexpected error:", error);
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500 },
      { status: 500 }
    );
  }
}
