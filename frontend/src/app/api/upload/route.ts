import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'articles';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Verify file type is image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed (JPG, PNG, WEBP, GIF, SVG)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize folder and filename
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename: sanitized name + timestamp
    const extension = path.extname(file.name) || '.jpg';
    const cleanBaseName = path
      .basename(file.name, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    const uniqueFilename = `${cleanBaseName}-${Date.now().toString().slice(-6)}${extension}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Save to disk
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeFolder}/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      size: file.size,
      type: file.type,
      message: 'Image uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save uploaded file' },
      { status: 500 }
    );
  }
}
