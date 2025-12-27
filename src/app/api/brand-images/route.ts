import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import BrandImage from '@/models/BrandImage';

// GET: Fetch all brand images for the tenant
export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const brandImages = await BrandImage.find({ tenantId: session.user.tenantId })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ brandImages });
  } catch (error) {
    console.error('Error fetching brand images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Upload a new brand image with dimension validation
export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Convert file to buffer and base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Validate image dimensions (must be <= 500x500)
    // We'll decode the image to check dimensions
    const dimensions = await getImageDimensions(buffer, file.type);
    if (dimensions.width > 500 || dimensions.height > 500) {
      return NextResponse.json({ 
        error: `Image dimensions must be 500x500 or smaller. Your image is ${dimensions.width}x${dimensions.height}` 
      }, { status: 400 });
    }

    await connectDB();

    // Get the current max order for this tenant
    const maxOrderDoc = await BrandImage.findOne({ tenantId: session.user.tenantId })
      .sort({ order: -1 })
      .select('order')
      .lean() as { order?: number } | null;
    const nextOrder = (maxOrderDoc?.order ?? -1) + 1;

    // Create new brand image
    const brandImage = await BrandImage.create({
      tenantId: session.user.tenantId,
      imageUrl: base64Image,
      order: nextOrder,
    });

    return NextResponse.json({ 
      success: true, 
      brandImage: {
        _id: brandImage._id,
        imageUrl: brandImage.imageUrl,
        order: brandImage.order,
      }
    });
  } catch (error) {
    console.error('Error uploading brand image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

// DELETE: Remove a brand image by ID
export async function DELETE(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    await connectDB();

    // Delete the image, ensuring it belongs to this tenant
    const result = await BrandImage.deleteOne({
      _id: id,
      tenantId: session.user.tenantId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Image removed successfully' });
  } catch (error) {
    console.error('Error deleting brand image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

// Helper function to get image dimensions from buffer
async function getImageDimensions(buffer: Buffer, mimeType: string): Promise<{ width: number; height: number }> {
  // Simple dimension detection for common image formats
  // PNG
  if (mimeType === 'image/png' && buffer.length >= 24) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  
  // JPEG
  if ((mimeType === 'image/jpeg' || mimeType === 'image/jpg') && buffer.length >= 2) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      
      // SOF0, SOF1, SOF2 markers contain dimensions
      if (marker >= 0xc0 && marker <= 0xc3) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      
      // Skip to next marker
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }
  
  // GIF
  if (mimeType === 'image/gif' && buffer.length >= 10) {
    const width = buffer.readUInt16LE(6);
    const height = buffer.readUInt16LE(8);
    return { width, height };
  }
  
  // WebP
  if (mimeType === 'image/webp' && buffer.length >= 30) {
    // Check for VP8 or VP8L chunk
    const riffHeader = buffer.toString('ascii', 0, 4);
    if (riffHeader === 'RIFF') {
      const webpSignature = buffer.toString('ascii', 8, 12);
      if (webpSignature === 'WEBP') {
        const chunkType = buffer.toString('ascii', 12, 16);
        if (chunkType === 'VP8 ' && buffer.length >= 30) {
          // Lossy VP8
          const width = buffer.readUInt16LE(26) & 0x3fff;
          const height = buffer.readUInt16LE(28) & 0x3fff;
          return { width, height };
        } else if (chunkType === 'VP8L' && buffer.length >= 25) {
          // Lossless VP8L
          const bits = buffer.readUInt32LE(21);
          const width = (bits & 0x3fff) + 1;
          const height = ((bits >> 14) & 0x3fff) + 1;
          return { width, height };
        }
      }
    }
  }
  
  // Default: assume valid if we can't detect (shouldn't happen often)
  // Return large values to trigger validation error if detection fails  
  return { width: 0, height: 0 };
}
