import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { status: string } }
) {
  try {
    const status = params.status;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    const response = await fetch(
      `${baseUrl}/invoices/status/${status}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${request.headers.get("authorization")?.split(" ")[1] || ""}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching invoices by status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch invoices by status" },
      { status: 500 }
    );
  }
}
