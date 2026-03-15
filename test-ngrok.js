const testNgrokPdf = async () => {
  try {
    const CHATBERRY_TOKEN = "2CI4SBwLm6XfkbxgIHj0AFPvWS3TXJGfZN8kd46V";
    const CHATBERRY_TEMPLATE_ENDPOINT = "https://dashboard.chatberry.net/api/send/template";
    const NGROK_PUBLIC_URL = "https://balsamiferous-gamogenetic-marilynn.ngrok-free.dev";
    
    // We assume a file named 'test.pdf' might exist or we just test the URL construction
    const fileName = "CreditNote_test.pdf";
    const publicFileUrl = `${NGROK_PUBLIC_URL}/api/download/${fileName}`;

    const payload = {
      phone: "+96898552063",
      template: {
        name: "owner_credit_note",
        language: { code: "en" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  link: publicFileUrl,
                  filename: "CreditNote_Test_NGROK.pdf",
                },
              },
            ],
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: "اختبار نغروك" }, // Arabic name
              { type: "text", text: "G0091" },
              { type: "text", text: "مارس 2026" } // Arabic month
            ],
          },
        ],
      },
    };

    console.log(`Sending NGROK PDF Template request to +96898552063...`);
    console.log(`PDF URL: ${publicFileUrl}`);
    
    const response = await fetch(CHATBERRY_TEMPLATE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHATBERRY_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Error:", error.message);
  }
};

testNgrokPdf();
