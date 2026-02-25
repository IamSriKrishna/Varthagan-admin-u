import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";
    const search = searchParams.get("search") || "";

    const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN || 
                    process.env.NEXT_PUBLIC_API_URL || 
                    process.env.NEXT_PUBLIC_BASE_URL || 
                    "http://localhost:8088";

    const queryParams = new URLSearchParams({
      limit,
      offset,
      ...(search && { search }),
    });

    // Extract token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${baseUrl}/item-groups?${queryParams.toString()}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch item groups" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching item groups:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch item groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const response = await fetch(`${baseUrl}/item-groups`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to create item group" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating item group:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create item group" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";
    const token = request.headers.get("authorization")?.split(" ")[1] || "";

    // Extract id from URL if present
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const response = await fetch(`${baseUrl}/item-groups/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to update item group" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating item group:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update item group" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8088";
    const token = request.headers.get("authorization")?.split(" ")[1] || "";

    // Extract id from URL
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const response = await fetch(`${baseUrl}/item-groups/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to delete item group" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting item group:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete item group" },
      { status: 500 }
    );
  }
}
