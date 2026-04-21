import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/product-groups/[id]
 * Fetch a single product group by ID with all components
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product group ID is required" },
        { status: 400 }
      );
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

    const response = await fetch(`${baseUrl}/product-groups/${id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: "Product group not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Failed to fetch product group" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching product group:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product group" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/product-groups/[id]
 * Update an existing product group
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product group ID is required" },
        { status: 400 }
      );
    }

    // Validate components if provided
    if (body.products && Array.isArray(body.products)) {
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

        if (!Number.isInteger(comp.quantity)) {
          return NextResponse.json(
            { success: false, message: `Component ${i + 1}: quantity must be a whole number` },
            { status: 400 }
          );
        }
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

    console.log("Updating product group:", id, JSON.stringify(body, null, 2));

    const response = await fetch(`${baseUrl}/product-groups/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: "Product group not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || "Failed to update product group",
          error: errorData.error
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating product group:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product group" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/product-groups/[id]
 * Delete a product group
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product group ID is required" },
        { status: 400 }
      );
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

    const response = await fetch(`${baseUrl}/product-groups/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: "Product group not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Failed to delete product group" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting product group:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product group" },
      { status: 500 }
    );
  }
}
