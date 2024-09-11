import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";

export async function POST(req: NextRequest) {
  await dbConnect();

  const formData = await req.json();

  // Save client data to MongoDB
  const client = new Client(formData);
  await client.save();

  // Load the PDF template
  const templatePath = path.join(process.cwd(), "public", "pdf-template.pdf");
  const templatePdfBytes = fs.readFileSync(templatePath);

  // Load the PDF document
  const pdfDoc = await PDFDocument.load(templatePdfBytes);

  // Get the first page of the document
  const page = pdfDoc.getPages()[0];

  // Get the font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Add static content
  page.drawText("Client Details", { x: 50, y: 750, size: 24, font });
  page.drawText("Company: ACME Corporation", { x: 50, y: 700, size: 12, font });
  page.drawText("Address: 123 Business St, City, Country", {
    x: 50,
    y: 680,
    size: 12,
    font,
  });

  // Add dynamic content (client details)
  page.drawText(`Name: ${formData.name}`, { x: 50, y: 620, size: 12, font });
  page.drawText(`Email: ${formData.email}`, { x: 50, y: 600, size: 12, font });
  page.drawText(`Phone: ${formData.phone}`, { x: 50, y: 580, size: 12, font });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();

  // Return the PDF as a response
  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="client-details.pdf"',
    },
  });
}
