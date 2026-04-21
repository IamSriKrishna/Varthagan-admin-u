import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/bills/[id]/status - Get bill
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/bills/${billId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers.get("authorization")?.split(" ")[1] || ""}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bill:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch bill" }, { status: 500 });
  }
}

/**
 * PATCH /api/bills/[id]/status - Update bill status
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id;
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/bills/${billId}/status`, {
      method: "PATCH",
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
    console.error("Error updating bill status:", error);
    return NextResponse.json({ success: false, message: "Failed to update bill status" }, { status: 500 });
  }
}

/**
 * PUT /api/bills/[id] - Update bill
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id;
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/bills/${billId}`, {
      method: "PUT",
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
    console.error("Error updating bill:", error);
    return NextResponse.json({ success: false, message: "Failed to update bill" }, { status: 500 });
  }
}

/**
 * DELETE /api/bills/[id] - Delete bill
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/bills/${billId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers.get("authorization")?.split(" ")[1] || ""}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting bill:", error);
    return NextResponse.json({ success: false, message: "Failed to delete bill" }, { status: 500 });
  }
}
