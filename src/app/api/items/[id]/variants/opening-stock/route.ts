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

    console.log("Fetching variant opening stocks for item:", id);

    const response = await fetch(`${baseUrl}/items/${id}/variants/opening-stock`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Backend error response:", error);
      return NextResponse.json(
        { success: false, message: error.error || error.message || "Failed to fetch variant opening stocks", error: error.error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching variant opening stocks:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch variant opening stocks", error: String(error) },
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

    // Validate request body
    if (!Array.isArray(body.variants)) {
      return NextResponse.json(
        { success: false, error: "variants must be an array" },
        { status: 400 }
      );
    }

    // Validate each variant object
    for (const variant of body.variants) {
      if (!variant.variant_sku) {
        return NextResponse.json(
          { success: false, error: "Each variant must have a variant_sku" },
          { status: 400 }
        );
      }

      if (typeof variant.opening_stock !== "number" || variant.opening_stock < 0) {
        return NextResponse.json(
          { success: false, error: "opening_stock must be a non-negative number" },
          { status: 400 }
        );
      }

      if (typeof variant.opening_stock_rate_per_unit !== "number" || variant.opening_stock_rate_per_unit < 0) {
        return NextResponse.json(
          { success: false, error: "opening_stock_rate_per_unit must be a non-negative number" },
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

    console.log("Setting variant opening stock for item:", id, "Payload:", JSON.stringify(body, null, 2));

    const response = await fetch(`${baseUrl}/items/${id}/variants/opening-stock`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Backend error response:", error);
      return NextResponse.json(
        { success: false, message: error.error || error.message || "Failed to set variant opening stock", error: error.error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error setting variant opening stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to set variant opening stock", error: String(error) },
      { status: 500 }
    );
  }
}
