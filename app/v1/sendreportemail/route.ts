import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8108/v1';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Proxying sendreportemail request:', JSON.stringify(body, null, 2));

        const response = await fetch(`${BACKEND_URL}/sendreportemail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log('Backend response:', response.status, JSON.stringify(data, null, 2));

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || 'Failed to send email' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Send report email error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
