const testPdfGeneration = async () => {
  try {
    const payload = {
      selectedRows: [
        {
          _id: "test_clean_123",
          Unit: "Unit-07-G0091",
          Name_of_Owner: "NASSER MOHAMED KHALIFA",
          Owner_ID_No: "123456789",
          Contact: "98552063", // Target contact
          Community_Charge_up_to: "100.000",
          Rent_collected: "300.000",
          Against_month_of: "July 2025",
          Leasing_Commission: "10.000",
          Property_Management_Fee: "20.000",
          VAT_on_Management_Fee_and_Commission: "1.500",
          Municipality_Fee: "5.000",
          Community: "10.000",
          Maintenance: "5.000",
          Payable_to_Owner: "248.500",
          Community_charge_Carried_forward: "90.000",
          CR_Note: "CR-2025-001"
        }
      ]
    };

    console.log("Sending CLEAN request to generate PDF... (No & or / in parameters)");
    const response = await fetch('http://localhost:8000/api/generate_and_send_pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("Error:", error.message);
  }
};

testPdfGeneration();
