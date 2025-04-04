const GoogleGenerativeAI = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Gemini Model
const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(
  "AIzaSyBU4zBok2TpiniErSwtKBDevJP7FW5Epi0"
);

async function getDetectorText(query) {
  const prompt = `
   Analyze the given investment details and provide a structured, concise response. The user will input details about a stock, mutual fund, or SIP along with the investment amount (one-time or recurring). Based on historical performance, generate the following:

Investment Summary: A brief but informative summary.
Risk Metrics: Present risk factors such as volatility, past downturns, and overall risk level. Keep this in a separate section.
Risk Advisory (If Applicable): If the investment has a high-risk profile, provide practical and concise advice on managing risk.
Ensure the response is well-structured, easy to read, and avoids unnecessary details. Format the output clearly with bullet points where needed.
question 1:
Stock Investment (One-Time Investment in Tesla)
User Input:
"I want to invest $5,000 in Tesla (TSLA) as a one-time investment. Can you analyze the risk and potential gains?"

Chatbot Response:

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

Chatbot Response:

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
`;
  console.log("Prompt:", query);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const response = await model.generateContent(prompt);

    // Extract the response correctly
    const resultText = response.response.candidates[0].content.parts[0].text;

    return resultText;
  } catch (error) {
    console.error("Error details:", error.message, error.stack);
    return "Error: Unable to fetch AI response";
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
