import { NextResponse } from "next/server";

export async function GET() {
  // For staging/production environments, prefer VERSION (CalVer tag) over GIT_COMMIT (SHA)
  // For development, use GIT_COMMIT (SHA) for better traceability
  const environment = process.env.ENVIRONMENT || process.env.NODE_ENV || "development";
  const isProduction = environment === "production" || environment === "staging";

  const version = isProduction
    ? process.env.VERSION || process.env.GIT_COMMIT || "development"
    : process.env.GIT_COMMIT || process.env.VERSION || "development";

  return NextResponse.json({
    service: "admin-ui",
    version: version,
  });
}
