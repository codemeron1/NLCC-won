import { query } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const PREDEFINED_ICONS = {
    'NLLCTeachHalf1.png': '/Character/NLLCTeachHalf1.png',
    'NLLCTeachHalf2.png': '/Character/NLLCTeachHalf2.png',
    'NLLCTeachHalf3.png': '/Character/NLLCTeachHalf3.png',
    'NLLCTeachHalf4.png': '/Character/NLLCTeachHalf4.png'
};

function getSupabaseClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const bahagiId = searchParams.get('bahagiId');

        if (!bahagiId) {
            return Response.json(
                { error: 'bahagiId required', code: 'MISSING_PARAM' },
                { status: 400 }
            );
        }

        const result = await query(
            `SELECT icon_path, icon_type FROM bahagi WHERE id = $1`,
            [bahagiId]
        );

        if (result.rows.length === 0) {
            return Response.json(
                { error: 'Bahagi not found', code: 'NOT_FOUND' },
                { status: 404 }
            );
        }

        const { icon_path, icon_type } = result.rows[0];

        return Response.json({
            success: true,
            icon_path,
            icon_type,
            predefinedIcons: Object.entries(PREDEFINED_ICONS).map(([name, path]) => ({
                name,
                path,
                type: 'default'
            }))
        });

    } catch (err: any) {
        console.error('Get Bahagi Icon Error:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });
        return Response.json(
            {
                error: 'Failed to fetch Bahagi icon',
                message: err.message,
                code: 'DB_ERROR'
            },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { bahagiId, iconType, iconPath, uploadedFile } = body;

        if (!bahagiId || !iconType) {
            return Response.json(
                { error: 'bahagiId and iconType required', code: 'MISSING_PARAM' },
                { status: 400 }
            );
        }

        if (!['default', 'custom'].includes(iconType)) {
            return Response.json(
                { error: 'iconType must be "default" or "custom"', code: 'INVALID_TYPE' },
                { status: 400 }
            );
        }

        let finalIconPath = iconPath;

        // Validate predefined icon
        if (iconType === 'default') {
            const iconKey = iconPath as keyof typeof PREDEFINED_ICONS;
            if (!PREDEFINED_ICONS[iconKey]) {
                return Response.json(
                    { error: 'Invalid predefined icon', code: 'INVALID_ICON' },
                    { status: 400 }
                );
            }
            finalIconPath = PREDEFINED_ICONS[iconKey];
        }

        // Handle custom icon upload if provided
        if (iconType === 'custom' && uploadedFile) {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('fileType', 'image');

            const uploadRes = await fetch(
                `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/teacher/upload-media`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!uploadRes.ok) {
                return Response.json(
                    { error: 'Failed to upload custom icon', code: 'UPLOAD_ERROR' },
                    { status: 500 }
                );
            }

            const uploadData = await uploadRes.json();
            finalIconPath = uploadData.url;
        }

        // Update bahagi with icon
        await query(
            `UPDATE bahagi 
             SET icon_path = $1, icon_type = $2, updated_at = NOW()
             WHERE id = $3`,
            [finalIconPath, iconType, bahagiId]
        );

        return Response.json({
            success: true,
            message: 'Bahagi icon updated successfully',
            bahagiId,
            iconPath: finalIconPath,
            iconType
        });

    } catch (err: any) {
        console.error('Update Bahagi Icon Error:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });
        return Response.json(
            {
                error: 'Failed to update Bahagi icon',
                message: err.message,
                code: 'DB_ERROR'
            },
            { status: 500 }
        );
    }
}

// GET endpoint to list predefined icons
export async function GET_ICONS(req: NextRequest) {
    return Response.json({
        success: true,
        predefinedIcons: Object.entries(PREDEFINED_ICONS).map(([name, path]) => ({
            name,
            path,
            type: 'default'
        }))
    });
}
