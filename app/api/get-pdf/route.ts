import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === 'true')
    ? (process.env.BACKEND_URL || 'http://localhost:8108/v1')
    : 'https://smlgoapi.dedepos.com/v1';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { shopid, guid } = body ?? {};

        console.log(`[get-pdf] Calling: ${API_BASE_URL}/resulttopdf`);

        if (!shopid || !guid) {
            return NextResponse.json(
                { error: 'Missing required fields: shopid and guid are required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/resulttopdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        });

        console.log('[get-pdf] Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('[get-pdf] Error response text:', errorText);
            let parsedError: unknown = null;
            try {
                parsedError = JSON.parse(errorText);
            } catch {
                parsedError = errorText;
            }

            console.log('[get-pdf] Parsed error:', parsedError);

            return NextResponse.json(
                {
                    error: `API error: ${response.statusText}`,
                    details: parsedError,
                    status: response.status,
                },
                { status: response.status }
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="report.pdf"',
            },
        });
    } catch (error) {
        console.error('Error in get-pdf proxy:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
