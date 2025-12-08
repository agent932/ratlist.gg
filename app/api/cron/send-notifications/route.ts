import { createClient } from '@supabase/supabase-js';
import { render } from '@react-email/components';
import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/email/resend';
import { redactDiscriminator } from '@/lib/utils/redact-discriminator';
import IncidentNotificationEmail from '@/components/emails/IncidentNotificationEmail';
import React from 'react';

// Verify cron secret for security
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing CRON_SECRET' },
      { status: 401 }
    );
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Fetch pending notifications (max 100)
    const { data: notifications, error: fetchError } = await supabase
      .rpc('fn_send_pending_notifications');

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: fetchError.message,
          details: { phase: 'fetch_notifications', error_details: fetchError.message }
        },
        { status: 500 }
      );
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
        permanently_failed: 0,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    let permanentlyFailed = 0;

    // Process each notification
    for (const notification of notifications) {
      try {
        // Check rate limiting (5 emails per day per user)
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('notification_count_today')
          .eq('user_id', notification.user_id)
          .single();

        if (profileError) {
          console.error(`Error fetching user profile for ${notification.user_id}:`, profileError);
          failed++;
          continue;
        }

        // Skip if user has reached daily limit (5 emails/day)
        if (userProfile && userProfile.notification_count_today >= 5) {
          console.log(`User ${notification.user_id} has reached daily limit (${userProfile.notification_count_today}/5), skipping notification`);
          skipped++;
          continue;
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ratlist.gg';
        const dashboardUrl = `${appUrl}/dashboard`;
        const incidentUrl = `${appUrl}/dashboard#incident-${notification.incident_id}`;
        const preferencesUrl = `${appUrl}/dashboard#preferences`;

        // Redact discriminator for privacy compliance
        const redactedPlayerName = redactDiscriminator(notification.player_identifier);

        // Render email template
        const emailHtml = render(
          React.createElement(IncidentNotificationEmail, {
            userName: notification.user_name,
            playerIdentifier: redactedPlayerName,
            gameName: notification.game_name,
            categoryLabel: notification.category_label,
            description: notification.description,
            reportedAt: notification.reported_at,
            dashboardUrl,
            incidentUrl,
            preferencesUrl,
          })
        );

        // Send email via Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'notifications@ratlist.gg',
          to: notification.user_email,
          subject: `New ${notification.category_label} incident - ${redactedPlayerName} (${notification.game_name})`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send email for notification ${notification.notification_id}:`, emailError);
          
          // Mark as failed (will retry with exponential backoff)
          await supabase.rpc('fn_mark_notification_sent', {
            notification_id: notification.notification_id,
            success: false,
          });
          
          // Check if this was the final retry (retry_count was 2, now will be 3)
          if (notification.retry_count >= 2) {
            permanentlyFailed++;
          } else {
            failed++;
          }
        } else {
          // Mark as successfully sent
          await supabase.rpc('fn_mark_notification_sent', {
            notification_id: notification.notification_id,
            success: true,
          });
          
          // Increment user's daily notification count
          await supabase
            .from('user_profiles')
            .update({ 
              notification_count_today: (userProfile?.notification_count_today || 0) + 1 
            })
            .eq('user_id', notification.user_id);
          
          sent++;
          
          console.log(`Email sent successfully for notification ${notification.notification_id} to ${notification.user_email}`);
        }
      } catch (error) {
        console.error(`Error processing notification ${notification.notification_id}:`, error);
        
        // Mark as failed
        await supabase.rpc('fn_mark_notification_sent', {
          notification_id: notification.notification_id,
          success: false,
        });
        
        if (notification.retry_count >= 2) {
          permanentlyFailed++;
        } else {
          failed++;
        }
      }
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      processed: notifications.length,
      sent,
      failed,
      skipped,
      permanently_failed: permanentlyFailed,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Unexpected error in send-notifications cron:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { phase: 'unknown', error_details: String(error) }
      },
      { status: 500 }
    );
  }
}
