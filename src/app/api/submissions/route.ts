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
      overall_target,
      print_target,
      digital_target,
      wonder_sponsorship,
      project_sponsorship,
      crusade_sponsorship,
      other_campaigns,
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
      zone: zone || '',
      overall_target: overall_target || '0',
      print_target: print_target || '0',
      digital_target: digital_target || '0',
      wonder_sponsorship: wonder_sponsorship || '',
      project_sponsorship: project_sponsorship || '',
      crusade_sponsorship: crusade_sponsorship || '',
      other_campaigns: other_campaigns || '',
    });

    return NextResponse.json({ success: true, data: partnership }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create submission' },
      { status: 500 }
    );
  }
}
