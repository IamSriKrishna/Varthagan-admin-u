import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "1000";
    const search = searchParams.get("search") || "";

    const baseUrl = process.env.NEXT_PUBLIC_API_DOMAIN || 
                    process.env.NEXT_PUBLIC_API_URL || 
                    process.env.NEXT_PUBLIC_BASE_URL || 
                    "http://localhost:8088";

    const queryParams = new URLSearchParams({
      page,
      limit,
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
      `${baseUrl}/items?${queryParams.toString()}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch items" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate payload structure for variant items
    if (body.item_details?.structure === "variants") {
      if (!body.item_details.attribute_definitions || body.item_details.attribute_definitions.length === 0) {
        console.error("Variant item missing attribute_definitions:", body.item_details);
        return NextResponse.json(
          { success: false, error: "variant items must define attributes", message: "Variant items require attribute_definitions" },
          { status: 400 }
        );
      }
      if (!body.item_details.variants || body.item_details.variants.length === 0) {
        return NextResponse.json(
          { success: false, error: "variant items must have variants", message: "At least one variant is required" },
          { status: 400 }
        );
      }
    }

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

    console.log("Creating item:", JSON.stringify(body, null, 2));

    const response = await fetch(`${baseUrl}/items`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Backend error response:", error);
      return NextResponse.json(
        { success: false, message: error.error || error.message || "Failed to create item", error: error.error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create item", error: String(error) },
      { status: 500 }
    );
  }
}
