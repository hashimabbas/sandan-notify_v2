const testTemplateSwap = async () => {
  try {
    const CHATBERRY_TOKEN = "2CI4SBwLm6XfkbxgIHj0AFPvWS3TXJGfZN8kd46V";
    const CHATBERRY_TEMPLATE_ENDPOINT = "https://dashboard.chatberry.net/api/send/template";
    
    // Using the WORKING template name instead of the failing one
    const TEMPLATE_NAME = "tenant_rent_invoice"; 
    
    const payload = {
      phone: "+96898552063",
      template: {
        name: TEMPLATE_NAME,
        language: { code: "en" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  link: "https://adnbvazgl6eukcvc.public.blob.vercel-storage.com/owner-credit-notes/CreditNote_test_clean_123.pdf",
                  filename: "Test_Template_Swap.pdf"
                }
              }
            ]
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: "TEST - TEMPLATE SWAP" },
              { type: "text", text: "UNIT-DIAGNOSTIC" },
              { type: "text", text: "July 2025" }
            ]
          }
        ]
      }
    };

    console.log(`Sending DIAGNOSTIC request using working template: ${TEMPLATE_NAME}...`);
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

testTemplateSwap();
