import { NextRequest, NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * POST /api/auth/login/password - Proxy to backend auth login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_LOGIN_DOMAIN || "http://localhost:8088";

    const response = await fetch(`${baseUrl}/auth/login/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization") || "",
        }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Return response with CORS headers
    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { success: false, message: "Failed to authenticate" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
