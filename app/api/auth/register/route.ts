import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8108/v1";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("Registration request received:", { username: body.username });
        console.log("Backend URL:", BACKEND_URL);

        const backendUrl = `${BACKEND_URL}/auth/register`;
        console.log("Calling backend at:", backendUrl);

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        console.log("Backend response status:", response.status);

        const data = await response.json();
        console.log("Backend response data:", data);

        if (!response.ok) {
            console.error("Backend error:", data);
            return NextResponse.json(
                { error: data.error || "Registration failed" },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Registration API error:", error);
        console.error("Error stack:", error.stack);
        return NextResponse.json(
            { error: "Internal server error: " + error.message },
            { status: 500 }
        );
    }
}
