// /app/api/send_message_for_user/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { contacts, message } = await req.json();

  const sendMessage = async (contact: string) => {
    console.log("Sending message to:", contact);
    const response = await fetch(
      "https://api.ultramsg.com/instance97367/messages/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "ye55z7mgbjpfe3gw",
          to: "968" + contact,
          body: message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message to ${contact}`);
    }
  };

  // Set a delay between sending messages
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const interval = 2000; // Set delay interval (e.g., 2000 ms = 2 seconds)

  try {
    for (const contact of contacts) {
      await sendMessage(contact);
      await delay(interval); // Wait for the specified interval before sending the next message
    }

    return NextResponse.json(
      { message: "Messages sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending messages:", error);
    return NextResponse.json(
      { message: "Failed to send messages", error: error.message },
      { status: 500 }
    );
  }
}