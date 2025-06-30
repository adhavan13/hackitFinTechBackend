const GoogleGenerativeAI = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Gemini Model with environment variable
const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyCJ7PuwxKU0bMXAqu1RvaVOE8zgH_81gPc";

if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY not found in environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);

async function getDetectorText(query) {
  const prompt = `
   Analyze the given investment details and provide a structured, concise response. The user will input details about a stock, mutual fund, or SIP along with the investment amount (one-time or recurring). Based on historical performance, generate the following:

Investment Summary: A brief but informative summary.
Risk Metrics: Present risk factors such as volatility, past downturns, and overall risk level. Keep this in a separate section.
Risk Advisory (If Applicable): If the investment has a high-risk profile, provide practical and concise advice on managing risk.
Ensure the response is well-structured, easy to read, and avoids unnecessary details. Format the output clearly with bullet points where needed.

IMPORTANT: Always respond in the exact format shown below. Do not include "Chatbot Response:" or any similar prefixes in your response.

question 1:
Stock Investment (One-Time Investment in Tesla)
User Input:
"I want to invest $5,000 in Tesla (TSLA) as a one-time investment. Can you analyze the risk and potential gains?"

📌 Investment Summary:

Stock: Tesla, Inc. (TSLA)
Investment Amount: $5,000 (One-time)
Sector: Electric Vehicles & Tech
5-Year Average Return: +32% annually

⚠️ Risk Metrics:

Volatility: High (Average price swings of ±5% daily)
Drawdowns: Experienced a 60% decline in 2022
Market Sensitivity (Beta): 2.1 (Highly reactive to market trends)

💡 Risk Advisory:

Tesla is a high-growth stock but highly volatile.
Consider diversifying with stable assets.
If holding long-term, be prepared for market fluctuations.

question 2:
 Mutual Fund (SIP in HDFC Equity Fund)
User Input:
"I want to invest $200 monthly in HDFC Equity Fund SIP. What are the risks and potential gains?"

📌 Investment Summary:

Fund: HDFC Equity Fund - Direct Plan (Growth)
SIP Amount: $200/month
Category: Large & Mid Cap Equity Fund
10-Year CAGR: 14.8%

⚠️ Risk Metrics:

Risk Level: Moderately High
Standard Deviation: 18.3% (Indicates fluctuations)
Past Corrections: Dropped 25% in market downturns

💡 Risk Advisory:

Suitable for long-term (5+ years) investment horizon.
Keep emergency funds separate before investing.
Market-linked, so short-term losses are possible.

question 3:

User input:

${query}

Remember: Respond ONLY with the structured format (📌 Investment Summary, ⚠️ Risk Metrics, 💡 Risk Advisory) without any prefixes like "Chatbot Response:".
`;
  console.log("Prompt:", query);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);

    // Improved response parsing with better error handling
    if (!response || !response.response) {
      throw new Error("Invalid response structure from Gemini API");
    }

    let resultText;

    // Try different response structures
    if (response.response.text) {
      resultText = response.response.text();
    } else if (response.response.candidates && response.response.candidates[0]) {
      const candidate = response.response.candidates[0];
      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts[0]
      ) {
        resultText = candidate.content.parts[0].text;
      } else {
        throw new Error("Unexpected response format from Gemini API");
      }
    } else {
      throw new Error("No valid response content found");
    }

    return resultText;
  } catch (error) {
    console.error("Gemini API Error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || "No response data",
    });

    // Return a more specific error message
    if (error.message.includes("API key")) {
      return "Error: Invalid API key. Please check your Gemini API key.";
    } else if (error.message.includes("quota")) {
      return "Error: API quota exceeded. Please try again later.";
    } else {
      return `Error: Unable to fetch AI response - ${error.message}`;
    }
  }
}

const fundAnalyzer = async (req, res) => {
  try {
    const { asset_type, asset_name, forecast_years } = req.body;

    // if (!prompt) {
    //   return res.status(400).json({ message: "Text input is required" });
    // }

    const prompt = `I am goind to invest in ${asset_type} ${asset_name} for ${forecast_years} years. Can you analyze the risk and potential gains?`;

    const response = await getDetectorText(prompt);
    res.json({ response });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { fundAnalyzer };
