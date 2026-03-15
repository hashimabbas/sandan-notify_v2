const testUltraMsg = async () => {
  try {
    const contact = "98552063";
    const token = "ye55z7mgbjpfe3gw";
    const instance = "instance97367";
    const url = `https://api.ultramsg.com/${instance}/messages/chat`;
    
    console.log(`Sending UltraMsg BASIC TEXT to +968${contact}...`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token,
        to: "968" + contact,
        body: "DIAGNOSTIC TEST: This is a test from the UltraMsg provider. Did you receive this?",
      }),
    });
    
    const result = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Error:", error.message);
  }
};

testUltraMsg();
