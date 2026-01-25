const axios = require('axios');

async function testPdfGeneration() {
  try {
    const payload = {
      selectedRows: [
        {
          _id: "test_id_123",
          Unit: "TestUnit-101",
          Name_of_Owner: "John Doe",
          Owner_ID_No: "123456789",
          Contact: "12345678", // Short for testing, usually expects country code attached in backend or not
          Community_Charge_up_to_2025_End: "100.000",
          Rent_collected: "500.000",
          Against_month_of: "January 2026",
          Leasing_Commission: "10.000",
          Property_Management_Fee: "20.000",
          VAT_on_Management_Fee_and_Commission: "1.500",
          Municipality_Fee: "5.000",
          Community: "10.000",
          Maintenance: "5.000",
          Payable_to_Owner: "448.500",
          Community_charge_Carried_forward: "90.000",
          CR_Note: "CR-2026-001"
        }
      ]
    };

    console.log("Sending request to generate PDF...");
    const response = await axios.post('http://localhost:3000/api/generate_and_send_pdf', payload);
    
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

testPdfGeneration();
