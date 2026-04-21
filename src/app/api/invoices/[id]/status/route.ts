import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/invoices/${invoiceId}`, {
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
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch invoice" }, { status: 500 });
  }
}

/**
 * PUT /api/invoices/[id] - Update invoice
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id;
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/invoices/${invoiceId}`, {
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
    console.error("Error updating invoice:", error);
    return NextResponse.json({ success: false, message: "Failed to update invoice" }, { status: 500 });
  }
}

/**
 * PATCH /api/invoices/[id]/status - Update invoice status
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id;
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/invoices/${invoiceId}/status`, {
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
    console.error("Error updating invoice status:", error);
    return NextResponse.json({ success: false, message: "Failed to update invoice status" }, { status: 500 });
  }
}

/**
 * DELETE /api/invoices/[id] - Delete invoice
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/invoices/${invoiceId}`, {
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
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ success: false, message: "Failed to delete invoice" }, { status: 500 });
  }
}
