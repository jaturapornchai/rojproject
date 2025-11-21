import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.DEBUG === 'true' || process.env.NEXT_PUBLIC_DEBUG === 'true')
    ? 'http://localhost:8108/v1' 
    : 'https://smlgoapi.dedepos.com/v1';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${API_BASE_URL}/resulttopdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `API error: ${response.statusText}`, details: errorText },
                { status: response.status }
            );
        }

        // Get the PDF blob
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Return the PDF with appropriate headers
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
