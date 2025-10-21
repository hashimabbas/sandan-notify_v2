import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("notify_app");

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    // Format data and ensure 'Remarks' field is handled
    const formattedData = data.map((row) => {
      const newRow: { [key: string]: any } = {};

      for (const [key, value] of Object.entries(row)) {
        // Handle Date Fields
        if (
          key === "Lease_Start_Date" ||
          key === "Lease_End_Date" ||
          key === "Rent_start_month"
        ) {
          if (typeof value === "number" && value > 0 && value < 2958465) {
            const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000));
            const year = jsDate.getFullYear().toString();
            const month = (jsDate.getMonth() + 1).toString().padStart(2, "0");
            const day = jsDate.getDate().toString().padStart(2, "0");
            newRow[key] = `${day}-${month}-${year}`;
          } else {
            newRow[key] = value; // Keep original value if not a valid Excel date number
          }
        } else if (key === "Against_month_of") {
          if (typeof value === "number" && value > 0 && value < 2958465) {
            const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000));
            const month = jsDate.toLocaleString("default", { month: "short" });
            const year = jsDate.getFullYear().toString().slice(-2);
            newRow[key] = `${month}-${year}`;
          } else {
            newRow[key] = value;
          }
        } else if (
          key === "Rent_Amount" ||
          key === "Amount" ||
          key === "Total_Amount"
        ) {
          // Store numeric values as strings with 3 decimal places
          newRow[key] = Number(value).toFixed(3);
        } else {
          // Keep all other fields as they are
          newRow[key] = value;
        }
      }

      // --- ** THE CRITICAL FIX IS HERE ** ---
      // Ensure the 'Remarks' field exists, defaulting to "-" if not present or empty.
      if (!newRow.Remarks || newRow.Remarks === "") {
        newRow.Remarks = "-";
      }

      return newRow;
    });

    // Clean collection before inserting new data (optional, but good practice)
    await db.collection("sheet_details_rent_receivables").deleteMany({});

    // Insert the formatted data into MongoDB
    const result = await db
      .collection("sheet_details_rent_receivables")
      .insertMany(formattedData);

    return NextResponse.json(
      {
        message: "Data added successfully",
        insertedCount: result.insertedCount,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Error processing file:", e);
    return NextResponse.json(
      { error: "Failed to process file", details: e.message },
      { status: 500 }
    );
  }
}
