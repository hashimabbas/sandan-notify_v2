import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocumentComponent } from "./pdfDocument";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { put } from "@vercel/blob";

// Keep existing token if not in env, or use env if preferred. 
// The other file uses process.env, but here we stick to what was defined or use string for safety based on previous content.
// However, since we are mimicking the other file, let's try to use the same pattern but keep the hardcoded token if the user hasn't set the env var for this specific one, 
// OR simpler: just use the string we know works from previous file versions if valid, or process.env if that's the "pattern".
// The user said "use same pattern". The other file uses `process.env.CHATBERRY_TOKEN!`. 
// I will assume the environment is set up correctly since the other route works.
const CHATBERRY_TOKEN = process.env.CHATBERRY_TOKEN || "2CI4SBwLm6XfkbxgIHj0AFPvWS3TXJGfZN8kd46V";

const CHATBERRY_BASE_URL = "https://dashboard.chatberry.net";
const CHATBERRY_TEMPLATE_ENDPOINT = CHATBERRY_BASE_URL + "/api/send/template";

// Template Config
const TEMPLATE_NAME = "owner_credit_note";
const TEMPLATE_LANGUAGE_CODE = "en";

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db("notify_app");

  try {
    const { selectedRows } = await req.json();

    if (!selectedRows?.length) {
      return NextResponse.json({ message: "No rows selected" }, { status: 400 });
    }

    const log: any[] = [];

    for (const row of selectedRows) {
      try {
        // ----------------------------
        // 1️⃣ Generate PDF Buffer
        // ----------------------------
        const pdfBuffer = await renderToBuffer(
          <PDFDocumentComponent selectedRows={[row]} />
        );

        // ----------------------------
        // 2️⃣ Upload PDF to Vercel Blob
        // ----------------------------
        // Use a clean filename for the blob storage
        // row._id might be missing or object, handle safely
        const uniqueId = row._id || Date.now().toString();
        const blob = await put(
          `owner-credit-notes/CreditNote_${uniqueId}.pdf`,
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
        let phoneStr = String(row.Contact || "").trim();
        if (!phoneStr.startsWith("+")) {
          phoneStr = "+968" + phoneStr;
        }

        const safeUnit = row.Unit ? row.Unit.replace(/[^a-zA-Z0-9-.\s]/g, '_') : 'Unit';

        const payload = {
          phone: phoneStr,
          template: {
            name: TEMPLATE_NAME,
            language: { code: TEMPLATE_LANGUAGE_CODE },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "document",
                    document: {
                      link: blob.url,
                      filename: `CreditNote_${safeUnit}.pdf`,
                    },
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  { type: "text", text: row.Name_of_Owner || "Customer" }, // {{1}}
                  { type: "text", text: row.Unit || "Unit" },     // {{2}}
                  { type: "text", text: row.Against_month_of || "Month" }  // {{3}}
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
        const isSuccess = result.success === true || (result.data && result.data.success === true);

        if (isSuccess) {
          // Delete from DB only if _id is present and valid
          if (row._id) {
            await db
              .collection("sheet_details")
              .deleteOne({ _id: new ObjectId(String(row._id)) });
          }

          log.push({
            contact: row.Contact,
            status: "Sent (Template)",
            messageId: result?.data?.data?.messages?.[0]?.id || "sent",
            pdf: blob.url,
          });
        } else {
          console.error("Chatberry API Error Response:", JSON.stringify(result, null, 2));
          log.push({
            contact: row.Contact,
            status: "Failed (Template)",
            error: result.error || result.message || JSON.stringify(result),
          });
        }
      } catch (err: any) {
        console.error("Error processing row:", row.Contact, err);
        log.push({
          contact: row.Contact,
          status: "Error",
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      message: "Process completed",
      log,
    });
  } catch (e: any) {
    console.error("Fatal error:", e);
    return NextResponse.json({ message: "Fatal error", error: e.message }, { status: 500 });
  }
}