const testTextOnly = async () => {
  try {
    const CHATBERRY_TOKEN = "2CI4SBwLm6XfkbxgIHj0AFPvWS3TXJGfZN8kd46V";
    const CHATBERRY_SEND_URL = "https://dashboard.chatberry.net/api/send/text";
    
    const payload = {
      phone: "+96898552063",
      message: "SYSTEM TEST: Please reply if you receive this basic text message."
    };

    console.log(`Sending BASIC TEXT request to +96898552063...`);
    const response = await fetch(CHATBERRY_SEND_URL, {
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

testTextOnly();
