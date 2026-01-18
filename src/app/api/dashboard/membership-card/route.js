// app/api/dashboard/membership-card/route.js
import { supabase } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import PDFDocument from 'pdfkit';

export async function GET(req) {
  try {
    /* ---------- AUTHENTICATION ---------- */
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

    /* ---------- FETCH USER DATA ---------- */
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        full_name,
        membership_code,
        membership_type,
        membership_status,
        membership_expiry_date,
        member_profiles (
          specialty,
          position,
          employer
        )
      `)
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    /* ---------- GENERATE PDF ---------- */
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers for PDF
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="BDS-Membership-Card-${user.membership_code}.pdf"`);

    // Collect PDF data
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      // This is handled by Next.js response
    });

    // Add content to PDF
    // Add BDS logo or header
    doc.fontSize(24).text('Bahrain Dental Society', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text('MEMBERSHIP CARD', { align: 'center' });
    doc.moveDown(2);
    
    // Member info
    doc.fontSize(14).text(`Member Name: ${user.full_name}`);
    doc.moveDown();
    doc.text(`Membership ID: ${user.membership_code}`);
    doc.moveDown();
    doc.text(`Membership Type: ${user.membership_type === 'paid' ? 'Premium' : 'Standard'}`);
    doc.moveDown();
    doc.text(`Status: ${user.membership_status === 'active' ? 'Active' : 'Inactive'}`);
    
    if (user.membership_expiry_date) {
      doc.moveDown();
      const expiryDate = new Date(user.membership_expiry_date).toLocaleDateString('en-BH', { timeZone: 'Asia/Bahrain' });
      doc.text(`Valid Until: ${expiryDate}`);
    }
    
    doc.moveDown();
    doc.text(`Specialty: ${user.member_profiles?.[0]?.specialty || 'Not specified'}`);
    doc.moveDown();
    doc.text(`Position: ${user.member_profiles?.[0]?.position || 'Not specified'}`);
    doc.moveDown();
    doc.text(`Employer: ${user.member_profiles?.[0]?.employer || 'Not specified'}`);
    
    // QR Code placeholder
    doc.moveDown(3);
    doc.fontSize(12).text('Scan QR code for verification:', { align: 'center' });
    doc.moveDown();
    doc.rect(200, doc.y, 200, 200).stroke(); // Placeholder for QR code
    doc.fontSize(10).text(user.membership_code, 200, doc.y + 210, { width: 200, align: 'center' });
    
    // Footer
    doc.moveDown(4);
    doc.fontSize(10).text('This is an official membership card of Bahrain Dental Society.', { align: 'center' });
    doc.text('For verification, visit: bds.bh/verify', { align: 'center' });

    doc.end();

    // Wait for PDF generation to complete
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
    console.error("MEMBERSHIP CARD ERROR:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to generate membership card" },
      { status: 500 }
    );
  }
}