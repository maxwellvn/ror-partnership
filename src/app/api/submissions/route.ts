import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Partnership from '@/models/Partnership';

// GET all submissions
export async function GET() {
  try {
    await connectDB();
    const submissions = await Partnership.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: submissions }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST create new submission
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      fullname,
      zone,
      zoneOther,
      num_groups,
      group,
      groupOther,
      overall_target,
      print_target,
      digital_target,
      campaigns,
      submission_type,
    } = body;

    // Validate required fields
    if (!fullname) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      );
    }

    const partnership = await Partnership.create({
      fullname,
      zone: zoneOther || zone || '',
      num_groups: num_groups || '0',
      group: groupOther || group || '',
      submission_type: submission_type || 'zonal',
      overall_target: overall_target || '0',
      print_target: print_target || '0',
      digital_target: digital_target || '0',
      campaigns: campaigns || '',
    });

    return NextResponse.json({ success: true, data: partnership }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create submission' },
      { status: 500 }
    );
  }
}
