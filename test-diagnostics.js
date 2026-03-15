const testDiagnostics = async () => {
  try {
    const CHATBERRY_TOKEN = "2CI4SBwLm6XfkbxgIHj0AFPvWS3TXJGfZN8kd46V";
    const CHATBERRY_TEMPLATE_ENDPOINT = "https://dashboard.chatberry.net/api/send/template";
    
    // Using Arabic characters to test the fix
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
                  link: "https://adnbvazgl6eukcvc.public.blob.vercel-storage.com/owner-credit-notes/CreditNote_69b6803114087c812176ea63.pdf",
                  filename: "CreditNote_Test_Arabic.pdf",
                },
              },
            ],
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: "اختبار المالك" }, // Arabic name
              { type: "text", text: "G0091" },
              { type: "text", text: "يوليو 2025" } // Arabic month
            ],
          },
        ],
      },
    };

    console.log(`Sending Arabic Template request to +96898552063...`);
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

testDiagnostics();
