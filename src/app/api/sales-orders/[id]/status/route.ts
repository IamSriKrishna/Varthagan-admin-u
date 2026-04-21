import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/sales-orders/[id]/status - Get sales order
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const salesOrderId = params.id;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/sales-orders/${salesOrderId}`, {
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
    console.error("Error fetching sales order:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch sales order" }, { status: 500 });
  }
}

/**
 * PATCH /api/sales-orders/[id]/status - Update sales order status
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const salesOrderId = params.id;
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    console.log("Updating sales order status:", {
      salesOrderId,
      body,
      baseUrl,
    });

    const response = await fetch(`${baseUrl}/sales-orders/${salesOrderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers.get("authorization")?.split(" ")[1] || ""}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend error response:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating sales order status:", error);
    return NextResponse.json({ success: false, message: "Failed to update sales order status" }, { status: 500 });
  }
}

/**
 * PUT /api/sales-orders/[id] - Update sales order
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const salesOrderId = params.id;
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/sales-orders/${salesOrderId}`, {
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
    console.error("Error updating sales order:", error);
    return NextResponse.json({ success: false, message: "Failed to update sales order" }, { status: 500 });
  }
}

/**
 * DELETE /api/sales-orders/[id] - Delete sales order
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const salesOrderId = params.id;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/sales-orders/${salesOrderId}`, {
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
    console.error("Error deleting sales order:", error);
    return NextResponse.json({ success: false, message: "Failed to delete sales order" }, { status: 500 });
  }
}
