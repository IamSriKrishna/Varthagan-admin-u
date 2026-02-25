import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN || 
                    process.env.NEXT_PUBLIC_API_URL || 
                    process.env.NEXT_PUBLIC_BASE_URL || 
                    "http://localhost:8088";

    // Extract token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/items/${id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN || 
                    process.env.NEXT_PUBLIC_API_URL || 
                    process.env.NEXT_PUBLIC_BASE_URL || 
                    "http://localhost:8088";

    // Extract token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/items/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: error.error || "Failed to update item" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN || 
                    process.env.NEXT_PUBLIC_API_URL || 
                    process.env.NEXT_PUBLIC_BASE_URL || 
                    "http://localhost:8088";

    // Extract token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/items/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: error.error || "Failed to delete item" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete item" },
      { status: 500 }
    );
  }
}
