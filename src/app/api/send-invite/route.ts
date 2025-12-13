/**
 * Calendar Invite API Route
 * 
 * Description:
 * - Generates .ics calendar file for events
 * - Sends email invitation with calendar attachment
 * - Integrates with guest management system
 */

import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error - nodemailer types not available
import nodemailer from "nodemailer";
import { createEvent } from "ics";
import { auth } from "@/lib/auth";
import db from "@/modules/db";

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

interface InviteRequest {
  guestId: string;
  eventId: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: InviteRequest = await req.json();
    const { guestId, eventId } = body;

    // Fetch event and guest details
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: true,
        guests: {
          where: { id: guestId }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Verify user is event creator
    if (event.createdById !== user.id) {
      return NextResponse.json(
        { error: "Only event creators can send invites" },
        { status: 403 }
      );
    }

    // Verify guest exists for this event
    const guest = event.guests[0];
    if (!guest) {
      return NextResponse.json(
        { error: "Guest not found for this event" },
        { status: 404 }
      );
    }

    // Prepare event data for .ics file
    const start = new Date(event.startAt);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration

    const icsEvent = {
      title: event.name,
      description: event.description || `You're invited to ${event.name}`,
      location: event.location || "Saskatoon, SK",
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ] as [number, number, number, number, number],
      end: [
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
        end.getHours(),
        end.getMinutes(),
      ] as [number, number, number, number, number],
      organizer: { 
        name: event.createdBy.name, 
        email: event.createdBy.email 
      },
      attendees: [{ 
        name: guest.name, 
        email: guest.email, 
        rsvp: true 
      }],
      status: "CONFIRMED" as const,
      busyStatus: "BUSY" as const,
      uid: `event-${event.id}-guest-${guest.id}@saskatoonevents.com`,
    };

    // Generate .ics file
    const { error: icsError, value: icsFile } = createEvent(icsEvent);
    
    if (icsError) {
      console.error("ICS generation error:", icsError);
      return NextResponse.json(
        { error: "Failed to generate calendar file" },
        { status: 500 }
      );
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to your preferred service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email with calendar attachment
    await transporter.sendMail({
      from: `${event.createdBy.name} via Saskatoon Events <${process.env.EMAIL_USER}>`,
      to: guest.email,
      subject: `Invitation: ${event.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You're Invited!</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #495057;">${event.name}</h3>
            <p style="margin: 5px 0; color: #6c757d;">
              <strong>Date:</strong> ${start.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p style="margin: 5px 0; color: #6c757d;">
              <strong>Time:</strong> ${start.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </p>
            ${event.location ? `<p style="margin: 5px 0; color: #6c757d;"><strong>Location:</strong> ${event.location}</p>` : ''}
            ${event.description ? `<p style="margin: 15px 0 5px 0; color: #6c757d;"><strong>Description:</strong></p><p style="margin: 5px 0; color: #6c757d;">${event.description}</p>` : ''}
          </div>
          
          <p style="color: #6c757d;">
            <strong>Organized by:</strong> ${event.createdBy.name}
          </p>
          
          <p style="color: #6c757d;">
            A calendar invitation is attached to this email. Click on the attachment to add this event to your calendar.
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="font-size: 12px; color: #adb5bd; text-align: center;">
            This invitation was sent via Saskatoon Events Platform
          </p>
        </div>
      `,
      text: `
You're invited to: ${event.name}

Date: ${start.toLocaleDateString()}
Time: ${start.toLocaleTimeString()}
${event.location ? `Location: ${event.location}` : ''}
${event.description ? `Description: ${event.description}` : ''}

Organized by: ${event.createdBy.name}

A calendar invitation is attached to this email.
      `,
      attachments: [
        {
          filename: `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`,
          content: icsFile,
          contentType: "text/calendar; charset=utf-8; method=REQUEST",
        },
      ],
    });

    return NextResponse.json({ 
      success: true, 
      message: "Calendar invitation sent successfully" 
    });

  } catch (error: unknown) {
    console.error("Send invite error:", error);
    
    // Handle specific email errors with detailed messages
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EAUTH') {
      return NextResponse.json(
        { 
          error: "Email authentication failed", 
          details: "Please check your email credentials. Make sure you're using an App Password, not your regular Gmail password.",
          troubleshooting: [
            "Verify EMAIL_USER and EMAIL_PASS in .env.local",
            "Use App Password (not regular password) for Gmail",
            "Ensure 2-Factor Authentication is enabled"
          ]
        },
        { status: 500 }
      );
    } else if (error && typeof error === 'object' && 'code' in error && (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT')) {
      return NextResponse.json(
        { 
          error: "Connection failed", 
          details: "Unable to connect to email server. Please check your internet connection.",
          troubleshooting: [
            "Check your internet connection",
            "Try again in a few minutes",
            "Verify Gmail SMTP is not blocked"
          ]
        },
        { status: 500 }
      );
    } else if (error && typeof error === 'object' && 'code' in error && error.code === 'EENVELOPE') {
      return NextResponse.json(
        { 
          error: "Invalid email configuration", 
          details: "Email address format is invalid.",
          troubleshooting: [
            "Check EMAIL_USER format (e.g., user@gmail.com)",
            "Verify guest email address is valid"
          ]
        },
        { status: 500 }
      );
    } else if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { 
          error: "Email not configured", 
          details: "Email credentials are missing from environment variables.",
          troubleshooting: [
            "Add EMAIL_USER to .env.local",
            "Add EMAIL_PASS to .env.local",
            "Restart your development server"
          ]
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to send calendar invitation", 
        details: (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') ? error.message : "Unknown error occurred",
        troubleshooting: [
          "Check server logs for more details",
          "Try the email configuration test at /test-email",
          "Verify all environment variables are set correctly"
        ]
      },
      { status: 500 }
    );
  }
}
