import clientPromise from "../../lib/mongodb";
import * as XLSX from "xlsx";
import { Decimal128 } from "mongodb"; // Ensure you're importing Decimal128

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("notify_app");

    // Get the file from the form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Read the Excel file from the buffer
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Format only specified fields to 3 decimal places and handle date fields
    const formattedData = data.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          // Check if the key is one of the date fields and format it
          if (
            key === "Lease_Start_Date" ||
            key === "Lease_End_Date" ||
            key === "Rent_start_month"
          ) {
            // Ensure value is a valid number before converting to date
          if (typeof value === "number" && value > 0 && value < 2958465) {
            const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000));
            const year = jsDate.getFullYear().toString(); // Get last two digits of year
            const month = (jsDate.getMonth() + 1).toString().padStart(2, '0'); // Corrected method call and added 1 to month
            const day = jsDate.getDate().toString().padStart(2, '0'); // Get day of the month and pad if necessary

            const formattedDate = `${day}-${month}-${year}`; // Corrected the formatting

            return [key, formattedDate];
          }
          } else if (key === "Against_month_of") {
            if (typeof value === "number" && value > 0 && value < 2958465) {
              const jsDate = new Date(
                Math.round((value - 25569) * 86400 * 1000)
              );
              // Format date to "Exp Apr-24"
              const month = jsDate.toLocaleString("default", {
                month: "short",
              });
              const year = jsDate.getFullYear().toString().slice(-2); // Get last two digits of year
              const formattedDate = ` ${month}-${year}`;
              return [key, formattedDate];
            }
          } else if (
            key === "Rent_Amount" ||
            key === "Amount" ||
            key === "Total_Amount"
          ) {
            // Store the value as a string as it appears in the Excel sheet
            return [key, Number(value).toFixed(3)];
          }
          return [key, value]; // Leave other fields as is
        })
      );
    });

    // Insert the formatted data into MongoDB
    const result = await db
      .collection("sheet_details_rent_receivables")
      .insertMany(formattedData);

    return new Response(
      JSON.stringify({
        message: "Data added successfully",
        insertedCount: result.insertedCount,
      }),
      { status: 201 }
    );
  } catch (e) {
    console.error("Error processing file:", e);
    return new Response(
      JSON.stringify({ error: "Failed to process file", details: e.message }),
      { status: 500 }
    );
  }
}