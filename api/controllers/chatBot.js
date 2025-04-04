const GoogleGenerativeAI = require("@google/generative-ai");
const dotenv = require("dotenv");
const priviousMessageSchema = require("../model/chatBot");
const ChathistorySchema = require("../model/chatHistory");
dotenv.config();

// Initialize Gemini Model
const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(
  "AIzaSyD9S5iZ8PCCQKyJyMDb1LjWINDRqjc2CrQ"
);

async function getPreviousMessage() {
  try {
    const previousMessages = await priviousMessageSchema
      .find()
      .sort({ createdAt: -1 });
    return previousMessages;
  } catch (error) {
    console.error(
      "Error fetching previous messages:",
      error.message,
      error.stack
    );
    return [];
  }
}
async function saveMessage(message) {
  try {
    const newMessage = new priviousMessageSchema({ message });
    await newMessage.save();
    console.log("Message saved successfully:", message);
  } catch (error) {
    console.error("Error saving message:", error.message, error.stack);
  }
}
async function saveChatHistory(user, model) {
  try {
    const newMessage = new ChathistorySchema({ user, model });
    await newMessage.save();
  } catch (error) {
    console.error("Error saving message:", error.message, error.stack);
  }
}
async function combineMessages(messages) {
  let priviousMessages = await getPreviousMessage();
  console.log(priviousMessages);

  const queryToCombine = `Here is the previous chat history between the user and the assistant. Please take this into account along with the current user question, and generate a query that is contextually relevant and coherent with the ongoing conversation.

    Chat History:
    ${priviousMessages.length > 0 ? priviousMessages : ""}
    
    Current Query:
    ${messages}
    
    Based on both the history and the current query, provide a well-formed and context-aware response.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const response = await model.generateContent(queryToCombine);
    const resultText = response.response.candidates[0].content.parts[0].text;

    return resultText;
  } catch (error) {
    console.error("Error details:", error.message, error.stack);
    return "Error: Unable to fetch AI response";
  }
}

async function getResponseText(query) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Extract the response correctly
    const final_query = await combineMessages(query);
    console.log("Final Query:", final_query);
    const main_query = `You are a smart and knowledgeable chatbot capable of answering both financial and general questions. Your responses should be brief, clear, and accurate. When users ask financial questions, provide concise yet informative answers. For general questions, respond with helpful and relevant information. Always ensure your answers are easy to understand and directly address the user's query.

    Guidelines:
    Answer briefly but accurately.
    
    Focus on clarity and relevance.
    
    Support financial queries with facts or definitions if needed.
    
    Be adaptable for both specific and general questions.
    
    Examples:
    User: What is a mutual fund?
    Chatbot: A mutual fund is a pool of money collected from investors to invest in stocks, bonds, or other assets, managed by a professional.
    
    User: What’s the capital of France?
    Chatbot: The capital of France is Paris.
    
    User: Should I invest in stocks or real estate?
    Chatbot: It depends on your goals. Stocks offer higher liquidity and potential returns, while real estate provides stability and passive income.
    
    User: How does compound interest work?
    Chatbot: Compound interest is interest calculated on the initial principal and also on the accumulated interest from previous periods.
    
    Now you have to answer
    
    User${final_query}
    `;
    const finalResponse = await model.generateContent(main_query);
    const finalText =
      finalResponse.response.candidates[0].content.parts[0].text;
    // await saveMessage(query, finalText); // Save the user query and AI response to the database
    await saveMessage(finalText);
    await saveChatHistory(final_query, finalText); // Save the chat history to the database
    return finalText;
  } catch (error) {
    console.error("Error details:", error.message, error.stack);
    return "Error: Unable to fetch AI response";
  }
}

const getChatResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Text input is required" });
    }

    const response = await getResponseText(prompt);
    res.json({ response });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { getChatResponse };
