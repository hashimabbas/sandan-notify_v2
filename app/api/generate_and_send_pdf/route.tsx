import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { PDFDocumentComponent } from "./pdfDocument";
import { renderToBuffer } from "@react-pdf/renderer";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db("notify_app");

  try {
    const { selectedRows } = await req.json();
    if (!selectedRows || selectedRows.length === 0) {
      return NextResponse.json({ message: "No rows selected" }, { status: 400 });
    }

    const log: any[] = [];

    // Loop through each selected row to generate and send a unique PDF
    for (const row of selectedRows) {
      try {
        // Generate a PDF specifically for the current 'row'
        const pdfBuffer = await renderToBuffer(
          <PDFDocumentComponent selectedRows={[row]} />
        );
        const base64Pdf = pdfBuffer.toString("base64");

        // Send this unique PDF to the contact in the current 'row'
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        const urlencoded = new URLSearchParams();
        urlencoded.append("token", "ye55z7mgbjpfe3gw");
        urlencoded.append("to", "968" + row.Contact);
        urlencoded.append("body", "Intaj Notify App");
        // Use a more descriptive filename
        urlencoded.append("filename", `CreditNote-${row.Unit}.pdf`);
        urlencoded.append("document", base64Pdf);

        const response = await fetch("https://api.ultramsg.com/instance97367/messages/document", { method: "POST", headers: myHeaders, body: urlencoded });
        const result = await response.json();

        if (result.sent === "true") {
          await db.collection("sheet_details").deleteOne({ _id: new ObjectId(String(row._id)) });
          log.push({ contact: row.Contact, status: "Sent" });
        } else {
          log.push({ contact: row.Contact, status: "Failed", error: result.error || "Unknown error" });
        }
      } catch (innerError: any) {
        console.error("Error processing row for:", row.Contact, innerError);
        log.push({ contact: row.Contact, status: "Failed", error: innerError.message });
      }
    }

    return NextResponse.json({ message: "Messages processed", log });

  } catch (error) {
    console.error("Failed to process request:", error);
    return NextResponse.json(
      { message: "Failed to process request", error: (error as Error).message },
      { status: 500 }
    );
  }
}