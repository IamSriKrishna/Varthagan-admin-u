import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/product-groups
 * Fetch all product groups with pagination and search support
 * Query params:
 *  - limit: number of results (default: 10, max: 100)
 *  - offset: pagination offset (default: 0)
 *  - search: search query
 */
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
      `${baseUrl}/product-groups?${queryParams.toString()}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch product groups" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching product groups:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product groups" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/product-groups
 * Create a new product group with components
 * 
 * Request body:
 * {
 *   name: string (required)
 *   description?: string
 *   status?: string
 *   is_active: boolean (required)
 *   products: [
 *     {
 *       product_id: string (required)
 *       quantity: number (required) - must be a whole number
 *       variant_sku?: string
 *       position?: number
 *       variant_details?: Record<string, string>
 *     }
 *   ] (required, min 1)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, message: "Product group name is required and must be a string" },
        { status: 400 }
      );
    }

    if (!body.products || !Array.isArray(body.products) || body.products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product group must have at least one product (component)" },
        { status: 400 }
      );
    }

    // Validate all components have required fields
    for (let i = 0; i < body.products.length; i++) {
      const comp = body.products[i];
      
      if (!comp.product_id || typeof comp.product_id !== "string") {
        return NextResponse.json(
          { success: false, message: `Component ${i + 1}: product_id is required` },
          { status: 400 }
        );
      }

      if (typeof comp.quantity !== "number" || comp.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: `Component ${i + 1}: quantity must be a positive number` },
          { status: 400 }
        );
      }

      // Check if quantity is a whole number
      if (!Number.isInteger(comp.quantity)) {
        return NextResponse.json(
          { success: false, message: `Component ${i + 1}: quantity must be a whole number (no decimals)` },
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

    console.log("Creating product group:", JSON.stringify(body, null, 2));

    const response = await fetch(`${baseUrl}/product-groups`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || "Failed to create product group",
          error: errorData.error
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating product group:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product group" },
      { status: 500 }
    );
  }
}
