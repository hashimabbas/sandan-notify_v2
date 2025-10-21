import clientPromise from "../../lib/mongodb";
import * as XLSX from "xlsx";

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

    // Format number fields to 3 decimal places
    const formattedData = data.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          // Check if the key is the date field and format it
          if (key === "Against_month_of") {
            // Ensure value is a valid number before converting to date
            if (typeof value === "number" && value > 0 && value < 2958465) {
              const jsDate = new Date(
                Math.round((value - 25569) * 86400 * 1000)
              );
              // Format date to "Exp Apr-24"
              const month = jsDate.toLocaleString("default", {
                month: "short",
              });
              const year = jsDate.getFullYear().toString().slice(-2); // Get last two digits of year
              const formattedDate = `${month}-${year}`;
              return [key, formattedDate];
            }
          }
          // Check if the value is a number and format it
          else if (
            typeof value === "number" &&
            key !== "Contact" &&
            key !== "Unit" &&
            key !== "Owner_ID_No" &&
            key != "VAT_on_Management_Fee_and_Commission"
          ) {
            return [key, Number(value).toFixed(3)]; // Format to 3 decimal places
          }
          return [key, value];
        })
      );
    });

    // Insert data into MongoDB
    const result = await db
      .collection("sheet_details")
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
