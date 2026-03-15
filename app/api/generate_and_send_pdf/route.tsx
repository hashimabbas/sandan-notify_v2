import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocumentComponent } from "./pdfDocument";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";

// Keep existing token if not in env, or use env if preferred. 
// The other file uses process.env, but here we stick to what was defined or use string for safety based on previous content.
// However, since we are mimicking the other file, let's try to use the same pattern but keep the hardcoded token if the user hasn't set the env var for this specific one, 
// OR simpler: just use the string we know works from previous file versions if valid, or process.env if that's the "pattern".
// The user said "use same pattern". The other file uses `process.env.CHATBERRY_TOKEN!`. 
// I will assume the environment is set up correctly since the other route works.
const CHATBERRY_TOKEN = process.env.CHATBERRY_TOKEN || "2CI4SBwLm6XfkbxgIHj0AFPvWS3TXJGfZN8kd46V";

const CHATBERRY_BASE_URL = "https://dashboard.chatberry.net";
const CHATBERRY_TEMPLATE_ENDPOINT = CHATBERRY_BASE_URL + "/api/send/template";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// NGROK / FILE SERVER CONFIGURATION
const NGROK_PUBLIC_URL = process.env.NGROK_PUBLIC_URL || "https://balsamiferous-gamogenetic-marilynn.ngrok-free.dev";
const TEMP_DIR = path.join(process.cwd(), "temp_invoices");

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
    let messageCount = 0;

    for (const row of selectedRows) {
      try {
        // ----------------------------
        // 1️⃣ Generate PDF Buffer
        // ----------------------------
        const pdfBuffer = await renderToBuffer(
          <PDFDocumentComponent selectedRows={[row]} />
        );

        // ----------------------------
        // 2️⃣ Save PDF locally for NGROK download
        // ----------------------------
        const safeUnit = row.Unit ? row.Unit.replace(/[^a-zA-Z0-9-.\s]/g, '_') : 'Unit';
        const fileName = `CreditNote_${row._id || Date.now()}.pdf`;
        const localFilePath = path.join(TEMP_DIR, fileName);
        const publicFileUrl = `${NGROK_PUBLIC_URL}/api/download/${fileName}`;

        await fs.mkdir(TEMP_DIR, { recursive: true });
        await fs.writeFile(localFilePath, pdfBuffer as any);

        // ----------------------------
        // 3️⃣ Prepare payload for ChatBerry
        // ----------------------------
        // Clean phone number: remove non-digits, then prefix with +968
        let cleanContact = String(row.Contact || "").replace(/\D/g, "");
        if (cleanContact.startsWith("968") && cleanContact.length > 8) {
          // Already has prefix, just ensure it doesn't have multiple
        } else if (!cleanContact.startsWith("968")) {
          cleanContact = "968" + cleanContact;
        }
        const phoneStr = "+" + cleanContact;

        const safeUnitForLink = row.Unit ? row.Unit.replace(/[^a-zA-Z0-9-.\s]/g, '_') : 'Unit';

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
                      link: publicFileUrl,
                      filename: `CreditNote_${safeUnitForLink}.pdf`,
                    },
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  { type: "text", text: String(row.Name_of_Owner || "Customer") }, // {{1}}
                  { type: "text", text: String(row.Unit || "Unit") },     // {{2}}
                  { type: "text", text: String(row.Against_month_of || "Month") }  // {{3}}
                ],
              },
            ],
          },
        };

        // ----------------------------
        // 4️⃣ Send PDF template
        // ----------------------------
        console.log(`Sending WhatsApp to ${phoneStr} with template ${TEMPLATE_NAME}`);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        const response = await fetch(CHATBERRY_TEMPLATE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CHATBERRY_TOKEN}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log("Chatberry API Response Summary:", {
          status: response.status,
          success: result.success,
          message: result.message,
          dataSuccess: result.data?.success,
          wamid: result?.data?.data?.messages?.[0]?.id
        });

        const isSuccess = result.success === true || (result.data && result.data.success === true) || result.statusCode === 200;

        if (isSuccess) {
          // Delete from DB only if _id is present and is a valid MongoDB ObjectId
          if (row._id && ObjectId.isValid(String(row._id))) {
            await db
              .collection("sheet_details")
              .deleteOne({ _id: new ObjectId(String(row._id)) });
          }

          log.push({
            contact: row.Contact,
            status: "Sent (Template)",
            messageId: result?.data?.data?.messages?.[0]?.id || "sent",
            pdf: publicFileUrl,
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
    console.error("Fatal error:", e);
    return NextResponse.json({ message: "Fatal error", error: e.message }, { status: 500 });
  }
}