// app/api/dashboard/certificates/[id]/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import PDFDocument from 'pdfkit';

export async function GET(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("bds_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;
    const {id} = await params;
    const eventId = id;

    // Verify user attended this event
    const { data: eventMember, error } = await supabase
      .from("event_members")
      .select(`
        id,
        checked_in,
        checked_in_at,
        events (
          title,
          start_datetime,
          end_datetime,
          venue_name
        ),
        users (
          full_name
        )
      `)
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .eq("checked_in", true)
      .single();

    if (error || !eventMember) {
      return NextResponse.json(
        { success: false, message: "Certificate not found or event not attended" },
        { status: 404 }
      );
    }

    // Generate PDF certificate
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      layout: 'landscape'
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="Certificate-${eventId}.pdf"`);

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    // Certificate border
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      .lineWidth(3)
      .stroke();

    // Certificate header
    doc.fontSize(36).text('CERTIFICATE OF ATTENDANCE', { align: 'center', y: 100 });
    doc.moveDown(2);

    // Main text
    doc.fontSize(18).text('This certifies that', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(28).font('Helvetica-Bold')
      .text(eventMember.users.full_name, { align: 'center' });
    
    doc.fontSize(18).font('Helvetica')
      .moveDown()
      .text('has successfully attended', { align: 'center' });
    
    doc.fontSize(22).font('Helvetica-Bold')
      .moveDown()
      .text(eventMember.events.title, { align: 'center' });
    
    doc.fontSize(18).font('Helvetica')
      .moveDown()
      .text(`held on ${new Date(eventMember.events.start_datetime).toLocaleDateString('en-BH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, { align: 'center' });
    
    if (eventMember.events.venue_name) {
      doc.text(`at ${eventMember.events.venue_name}`, { align: 'center' });
    }

    // Signature section
    doc.moveDown(4);
    
    const yPos = doc.y;
    
    // Left signature
    doc.fontSize(14)
      .text('________________________', 100, yPos)
      .text('Date', 100, yPos + 30, { align: 'center' })
      .text(new Date().toLocaleDateString('en-BH'), 100, yPos + 50, { align: 'center' });

    // Right signature
    doc.fontSize(14)
      .text('________________________', doc.page.width - 200, yPos)
      .text('Bahrain Dental Society', doc.page.width - 200, yPos + 30, { align: 'center' })
      .text('Official Seal', doc.page.width - 200, yPos + 50, { align: 'center' });

    // Certificate ID
    doc.fontSize(10)
      .text(`Certificate ID: CERT-${eventMember.id.slice(0, 8).toUpperCase()}`, 50, doc.page.height - 60);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(chunks);
        resolve(new NextResponse(pdfData, {
          status: 200,
          headers: headers
        }));
      });
    });

  } catch (error) {
    console.error("CERTIFICATE ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}