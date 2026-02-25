import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status && { status }),
    });

    const response = await fetch(
      `${baseUrl}/invoices?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${request.headers.get("authorization")?.split(" ")[1] || ""}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers.get("authorization")?.split(" ")[1] || ""}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
