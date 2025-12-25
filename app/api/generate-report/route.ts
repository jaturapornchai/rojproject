import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const API_BASE_URL = process.env.BACKEND_URL || 'https://smlgoapi.dedepos.com/v1';

interface ResultGetRow {
    querynumber?: number;
    linenumber?: number;
    level?: number;
    typejson?: number;
    datajson?: Record<string, unknown>;
    data?: Record<string, unknown>;
    alias?: string;
    is_summary?: boolean;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            limit = 2000,
            offset = 0,
            guid: incomingGuid,
            ...payload
        } = body ?? {};

        const guid = typeof incomingGuid === 'string' && incomingGuid.trim().length > 0
            ? incomingGuid.trim()
            : randomUUID();

        if (!payload?.shopid) {
            return NextResponse.json(
                { success: false, error: 'Missing required field: shopid' },
                { status: 400 }
            );
        }

        if (!Array.isArray(payload?.query_items) || payload.query_items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Missing query_items for resultfromquery' },
                { status: 400 }
            );
        }

        const resultFromQueryPayload = { ...payload, guid };

        console.log(`[generate-report] Calling: ${API_BASE_URL}/resultfromquery`);

        const resultFromQueryResponse = await fetch(`${API_BASE_URL}/resultfromquery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resultFromQueryPayload),
            cache: 'no-store',
        });

        const resultFromQueryJson = await resultFromQueryResponse.json().catch(() => null);
        const resultStatus = typeof resultFromQueryJson?.status === 'string' ? resultFromQueryJson.status.toLowerCase() : undefined;
        const isResultFromQuerySuccess = resultFromQueryJson?.success === true || resultStatus === 'success';

        if (!resultFromQueryResponse.ok || !isResultFromQuerySuccess) {
            const message = resultFromQueryJson?.error || resultFromQueryJson?.message || resultFromQueryResponse.statusText;
            return NextResponse.json(
                {
                    success: false,
                    error: message || 'Failed to execute resultfromquery',
                    details: resultFromQueryJson,
                    status: resultFromQueryResponse.status,
                    guid,
                },
                { status: resultFromQueryResponse.ok ? 400 : resultFromQueryResponse.status }
            );
        }

        const effectiveGuid = typeof resultFromQueryJson?.guid === 'string' && resultFromQueryJson.guid.trim().length > 0
            ? resultFromQueryJson.guid.trim()
            : guid;

        console.log(`[generate-report] Calling: ${API_BASE_URL}/resultget`);

        const resultGetResponse = await fetch(`${API_BASE_URL}/resultget`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                shopid: resultFromQueryPayload.shopid,
                guid: effectiveGuid,
                limit,
                offset,
            }),
            cache: 'no-store',
        });

        if (!resultGetResponse.ok) {
            const errorText = await resultGetResponse.text();
            return NextResponse.json(
                {
                    success: false,
                    error: `Failed to retrieve result data: ${resultGetResponse.statusText}`,
                    details: errorText,
                    status: resultGetResponse.status,
                    guid: effectiveGuid,
                },
                { status: resultGetResponse.status }
            );
        }

        const resultGetJson = await resultGetResponse.json();
        const resultGetStatus = typeof resultGetJson?.status === 'string' ? resultGetJson.status.toLowerCase() : undefined;
        const isResultGetSuccess = resultGetJson?.success === true || resultGetStatus === 'success';

        if (!isResultGetSuccess) {
            return NextResponse.json(
                {
                    success: false,
                    error: resultGetJson?.error || 'Result retrieval returned success=false',
                    details: resultGetJson,
                    guid: effectiveGuid,
                },
                { status: 400 }
            );
        }

        const rawRowsInput: ResultGetRow[] = Array.isArray(resultGetJson.rows)
            ? resultGetJson.rows
            : Array.isArray(resultGetJson.data)
                ? resultGetJson.data
                : [];

        const seenRowKeys = new Set<string>();
        const rows: ResultGetRow[] = [];

        for (const raw of rawRowsInput) {
            const dataPayload = raw.datajson ?? raw.data ?? undefined;
            const dedupeKey = [
                raw.alias ?? '',
                raw.querynumber ?? '',
                raw.linenumber ?? '',
                raw.typejson ?? '',
                JSON.stringify(dataPayload ?? {}),
            ].join('|');

            if (seenRowKeys.has(dedupeKey)) {
                continue;
            }
            seenRowKeys.add(dedupeKey);

            rows.push({ ...raw, datajson: dataPayload });
        }
        const queryItems = Array.isArray(resultFromQueryPayload.query_items) ? resultFromQueryPayload.query_items : [];
        const aliasByIndex = queryItems.map((item: any, index: number) => item?.alias || `query_${index}`);

        const grouped: Record<string, { detail: Record<string, unknown>[]; summary: Array<{ linenumber?: number; level?: number; typejson?: number; data: Record<string, unknown> | undefined }>; raw: ResultGetRow[] }> = {};

        for (const row of rows) {
            const indexRaw = typeof row.querynumber === 'number' ? row.querynumber : 0;
            const index = indexRaw > 0 ? indexRaw - 1 : indexRaw;
            const alias = (row.alias as string | undefined) ?? aliasByIndex[index] ?? `query_${index}`;

            if (!grouped[alias]) {
                grouped[alias] = { detail: [], summary: [], raw: [] };
            }

            grouped[alias].raw.push(row);

            const normalizedEntry = {
                linenumber: row.linenumber,
                level: row.level,
                typejson: row.typejson,
                data: row.datajson,
            };

            // typejson === 0 indicates detail rows; other values are treated as summary/metadata.
            if (row.typejson === 0) {
                if (row.datajson) {
                    grouped[alias].detail.push(row.datajson);
                }
            } else {
                grouped[alias].summary.push(normalizedEntry);
            }
        }

        const detailRowCount = typeof resultFromQueryJson?.count === 'number'
            ? resultFromQueryJson.count
            : typeof resultGetJson?.pagination?.count === 'number'
                ? resultGetJson.pagination.count
                : rows.filter((row) => row.typejson === 0).length;

        return NextResponse.json({
            success: true,
            message: resultFromQueryJson?.message || 'Query processed successfully',
            guid: effectiveGuid,
            detailRowCount,
            meta: {
                limit,
                offset,
                totalRows: rows.length,
                pagination: resultGetJson?.pagination,
            },
            data: grouped,
        });
    } catch (error) {
        console.error('Error in generate-report proxy:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
