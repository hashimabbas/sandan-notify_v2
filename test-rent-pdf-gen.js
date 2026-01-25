const axios = require('axios');

async function testRentPdfGeneration() {
  try {
    const payload = {
      selectedRows: [
        {
          _id: "test_rent_id_101",
          BUT_ID: "BUT-101",
          Tenant_Name: "Mohammed",
          Contact: "12345678", // Short number to test prefix addition
          Lease_Start_Date: "2024-01-01",
          Lease_End_Date: "2025-01-01",
          Rent_start_month: "July 2025",
          Against_month_of: "July 2025",
          Rent_Amount: "250.000",
          Number_of_Months: "1",
          Amount: "250.000",
          Total_Amount: "250.000",
          Remarks: "The lease will expire soon..."
        }
      ]
    };

    console.log("Sending request to generate Rent PDF...");
    const response = await axios.post('http://localhost:8000/api/generate_send_rent_receivables', payload);
    
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response.status, error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testRentPdfGeneration();
