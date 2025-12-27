import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'logo' or 'signature'

    if (!file || !type) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 });
    }

    if (!['logo', 'signature'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be logo or signature' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert to base64 data URL (using original file MIME type)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Connect to database and update user
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the appropriate field
    if (type === 'logo') {
      user.businessDetails.logo = base64Image;
    } else if (type === 'signature') {
      user.businessDetails.signature = base64Image;
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: `${type} uploaded successfully`,
      imageUrl: base64Image
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['logo', 'signature'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be logo or signature' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove the image
    if (type === 'logo') {
      user.businessDetails.logo = '';
    } else if (type === 'signature') {
      user.businessDetails.signature = '';
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: `${type} removed successfully`
    });

  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
