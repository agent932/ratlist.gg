import { NextResponse } from 'next/server';
import { resend } from '@/lib/email/resend';

export async function GET() {
  try {
    // Test sending a simple email
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'notifications@ratlist.gg',
      to: 'delivered@resend.dev', // Resend test email
      subject: 'Test Email from Ratlist.gg',
      html: '<p>This is a test email to verify Resend configuration.</p>',
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      message: 'Test email sent successfully',
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 });
  }
}
