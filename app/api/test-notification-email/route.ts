import { NextResponse } from 'next/server';
import { render } from '@react-email/components';
import { resend } from '@/lib/email/resend';
import { redactDiscriminator } from '@/lib/utils/redact-discriminator';
import IncidentNotificationEmail from '@/components/emails/IncidentNotificationEmail';
import React from 'react';

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Test data from your notification
    const testNotification = {
      user_email: 'don@atomicit.ca',
      user_name: 'Agent932',
      incident_id: '0a3688bd-06df-474a-a455-bc82a0b8672a',
      player_identifier: 'Agent932#9153',
      game_name: 'Arc Raiders',
      category_label: 'Clutch Save',
      description: 'Helped out in the last seconds of a game while i was under attack from a rocketeer!!!',
      reported_at: '2025-12-08T16:02:07.174Z',
    };

    const dashboardUrl = `${appUrl}/dashboard`;
    const incidentUrl = `${dashboardUrl}#incident-${testNotification.incident_id}`;
    const preferencesUrl = `${dashboardUrl}#preferences`;
    const redactedPlayerName = redactDiscriminator(testNotification.player_identifier);

    // Render email template
    const emailHtml = render(
      React.createElement(IncidentNotificationEmail, {
        userName: testNotification.user_name,
        playerIdentifier: redactedPlayerName,
        gameName: testNotification.game_name,
        categoryLabel: testNotification.category_label,
        description: testNotification.description,
        reportedAt: testNotification.reported_at,
        dashboardUrl,
        incidentUrl,
        preferencesUrl,
      })
    );

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'notifications@ratlist.gg',
      to: testNotification.user_email,
      subject: `New ${testNotification.category_label} incident - ${redactedPlayerName} (${testNotification.game_name})`,
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        emailData: {
          from: process.env.EMAIL_FROM,
          to: testNotification.user_email,
          redactedPlayerName,
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      message: 'Notification email sent successfully',
      redactedPlayerName,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 });
  }
}
