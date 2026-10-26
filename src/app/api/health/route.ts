import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";

export async function GET() {
  try {
    const connection = await connectDb();
    await connection.connection.db?.admin().ping();
    return NextResponse.json({
      success: true,
      data: {
        status: "ok",
        service: "elite-coding-school",
        database: "ok",
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: "Database health check failed." },
      },
      { status: 503 },
    );
  }
}
