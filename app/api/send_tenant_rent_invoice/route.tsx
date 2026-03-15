import { NextRequest, NextResponse } from "next/server";
import React from "react";
// ASSUMPTION: This is your Rent Invoice PDF Component
import { PDFDocumentComponent as RentInvoicePDF } from "../../../components/pdfDocumentRentInvoice"; 
import { renderToBuffer } from "@react-pdf/renderer";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";

// --- CHATBERRY CONFIGURATION (CONFIRMED CORRECT) ---
const CHATBERRY_BASE_URL = "https://dashboard.chatberry.net"; 
const CHATBERRY_TOKEN = "2CI4SBwLm6XfkbxgIHj0AFPvWS3TXJGfZN8kd46V";
const CHATBERRY_TEMPLATE_ENDPOINT = CHATBERRY_BASE_URL + "/api/send/template";

// VITAL: Approved Template for Tenants
const TEMPLATE_NAME = "tenant_rent_invoice"; 
const TEMPLATE_LANGUAGE_CODE = "en"; 

// NGROK / FILE SERVER CONFIGURATION (UPDATE WITH YOUR LIVE NGROK URL)
const NGROK_PUBLIC_URL = process.env.NGROK_PUBLIC_URL || "https://balsamiferous-gamogenetic-marilynn.ngrok-free.dev"; 
const TEMP_DIR = path.join(process.cwd(), 'temp_invoices');
// -------------------------------------------------------------------------

const sanitizeFilename = (unit: string) => {
    return unit ? unit.replace(/[^a-zA-Z0-9-.\s]/g, '_') : 'Unknown';
};

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db("notify_app");

  try {
    const { selectedRows } = await req.json();
    if (!selectedRows || selectedRows.length === 0) {
      return NextResponse.json({ message: "No rows selected" }, { status: 400 });
    }

    const log: any[] = [];

    for (const row of selectedRows) {
      const safeUnit = sanitizeFilename(row.BUT_ID || ''); // Use BUT_ID for Tenant
      const fileName = `RentInvoice-${safeUnit}.pdf`;
      const localFilePath = path.join(TEMP_DIR, fileName);
      const publicFileUrl = `${NGROK_PUBLIC_URL}/api/download/${fileName}`; 

      try {
        const pdfBuffer = await renderToBuffer(
          <RentInvoicePDF selectedRows={[row]} /> 
        );

        await fs.mkdir(TEMP_DIR, { recursive: true });
        await fs.writeFile(localFilePath, pdfBuffer);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${CHATBERRY_TOKEN}`);
        
        const payload = JSON.stringify({
          phone: "+968" + row.Contact,
          template: { 
            name: TEMPLATE_NAME,
            language: { code: TEMPLATE_LANGUAGE_CODE },
            components: [
              { type: "header", parameters: [{ type: "document", document: { link: publicFileUrl, filename: fileName } }] },
              {
                type: "body",
                parameters: [
                  { type: "text", text: row.Tenant_Name || "" },      // {{1}} Tenant Name
                  { type: "text", text: row.BUT_ID || "" },           // {{2}} Unit Number
                  { type: "text", text: row.Against_month_of || "" }  // {{3}} Month
                ]
              }
            ]
          }
        });

        const response = await fetch(CHATBERRY_TEMPLATE_ENDPOINT, { method: "POST", headers: myHeaders, body: payload });

        if (!response.ok) {
            const textResponse = await response.text();
            // ... (error handling) ...
            continue; 
        }

        const result = await response.json();
        const isSuccess = result.success === true || (result.data && result.data.success === true) || result.statusCode === 200;

        if (isSuccess) {
          // *** DELETE FROM RENT RECEIVABLES COLLECTION ***
          await db.collection("sheet_details_rent_receivables").deleteOne({ _id: new ObjectId(String(row._id)) }); 
          log.push({ contact: row.Contact, status: "Sent (Tenant Invoice)" });
        } else {
          // ... (error logging) ...
        }
        
      } catch (innerError: any) {
        // ... (catch errors) ...
      }
    }
    return NextResponse.json({ message: "Tenant Invoices processed", log });
  } catch (error) {
    // ... (catch errors) ...
    return NextResponse.json({ message: "Failed to process request", error: (error as Error).message }, { status: 500 });
  }
}