const TELEGRAM_API = `https://api.telegram.org/botYour-Bot-Token`;
const CHAT_ID = '-1002*****'; // Your group's chat ID
const HF_API_URL = "https://api-inference.huggingface.co/models/gpt2"; // Model endpoint from Hugging Face
const HF_API_KEY = "hf_jYXIQFcWa*****"; // Your Hugging Face API key

async function handleRequest(request) {
  const data = await request.json();
  
  if (data.message && data.message.text) {
    const userMessage = data.message.text;
    try {
      // Get AI response from Hugging Face
      const aiResponse = await getAIResponse(userMessage);
      
      if (aiResponse) {
        // Send AI response back to the Telegram group
        await sendMessageToTelegram(data.message.chat.id, aiResponse);
      }
    } catch (error) {
      console.error("Error in AI response:", error);
      await sendMessageToTelegram(data.message.chat.id, "Sorry, there was an error processing your request.");
    }
  }

  return new Response("ok");
}

// Fetch the AI response from Hugging Face's GPT-2 model
async function getAIResponse(userMessage) {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: userMessage
    })
  });

  const result = await response.json();
  
  if (result && result.length > 0) {
    return result[0].generated_text;
  } else {
    throw new Error("Invalid AI response");
  }
}

// Function to send a message to Telegram
async function sendMessageToTelegram(chatId, text) {
  const url = `${TELEGRAM_API}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });

  return response.json();
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});
