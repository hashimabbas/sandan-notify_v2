import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocumentComponent } from "./pdfDocument";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { put } from "@vercel/blob";

const CHATBERRY_TOKEN = process.env.CHATBERRY_TOKEN!;
const CHATBERRY_TEMPLATE_ENDPOINT =
  "https://dashboard.chatberry.net/api/send/template";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db("notify_app");

  try {
    const { selectedRows } = await req.json();

    if (!selectedRows?.length) {
      return NextResponse.json({ message: "No rows selected" }, { status: 400 });
    }

    const log: any[] = [];
    let messageCount = 0;

    for (const row of selectedRows) {
      try {
        // ----------------------------
        // 1️⃣ Generate PDF for WhatsApp DOCUMENT header
        // ----------------------------
        const pdfBuffer = await renderToBuffer(
          <PDFDocumentComponent selectedRows={[row]} />
        );

        // ----------------------------
        // 2️⃣ Upload PDF to Vercel Blob
        // ----------------------------
        const blob = await put(
          `rent-invoices/invoice_${row._id}.pdf`,
          pdfBuffer,
          {
            access: "public",
            contentType: "application/pdf",
            allowOverwrite: true,
          }
        );

        // ----------------------------
        // 3️⃣ Prepare payload for ChatBerry
        // ----------------------------
        // ----------------------------
        // 3️⃣ Prepare payload for ChatBerry
        // ----------------------------

        let phoneStr = String(row.Contact || "").trim();
        if (!phoneStr.startsWith("+")) {
          phoneStr = "+968" + phoneStr;
        }

        const payload = {
          phone: phoneStr,
          template: {
            name: "tenant_rent_invoice",
            language: { code: "en" },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "document",
                    document: {
                      link: blob.url,
                      filename: `rent_invoice_${row.BUT_ID || "unit"}.pdf`,
                    },
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  { type: "text", text: String(row.Tenant_Name || "Customer") },
                  { type: "text", text: String(row.BUT_ID || "N/A") },
                  { type: "text", text: String(row.Against_month_of || "Period") },
                ],
              },
            ],
          },
        };


        // ----------------------------
        // 4️⃣ Send PDF template
        // ----------------------------
        const response = await fetch(CHATBERRY_TEMPLATE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CHATBERRY_TOKEN}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        // Inspect the response structure. Based on logs, it is nested: { statusCode: 200, data: { success: true, ... } }
        const isSuccess = result.success === true || (result.data && result.data.success === true);

        if (isSuccess) {
          // Delete row from DB after successful send
          await db
            .collection("sheet_details_rent_receivables")
            .deleteOne({ _id: new ObjectId(String(row._id)) });

          log.push({
            contact: row.Contact,
            status: "PDF-Success",
            messageId: result?.data?.data?.messages?.[0]?.id || "sent",
            pdf: blob.url,
          });
        } else {
          console.error("Chatberry API Error Response:", JSON.stringify(result, null, 2));
          log.push({
            contact: row.Contact,
            status: "PDF-Failed",
            error: result.error || result.message || JSON.stringify(result),
          });
        }
      } catch (err: any) {
        log.push({
          contact: row.Contact,
          status: "Error",
          error: err.message,
        });
      }

      messageCount++;

      // ----------------------------
      // 5️⃣ Randomized Throttling
      // ----------------------------
      // Normal delay between messages: 5 to 15 seconds
      let delayTime = Math.floor(Math.random() * 10000) + 5000;

      // Long break every 15 messages: 60 to 120 seconds
      if (messageCount % 15 === 0 && messageCount < selectedRows.length) {
        const longBreak = Math.floor(Math.random() * 60000) + 60000;
        console.log(`Sent 15 messages. Taking a strategic break for ${longBreak / 1000} seconds...`);
        delayTime += longBreak;
      }

      await delay(delayTime);
    }

    return NextResponse.json({
      message: "Process completed",
      log,
    });
  } catch (e: any) {
    return NextResponse.json({ message: "Fatal error", error: e.message }, { status: 500 });
  }
}
