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
    You are an AI financial analyst. Your task is to analyze an investment offer and determine whether it is a scam or a legitimate opportunity. 
    
    ### Instructions:
    1. **Scam Detection:**  
       - Identify red flags such as unrealistic returns, urgency, lack of regulation, or unverified sources.  
       - If it's a scam, label it as **"Scam Alert"** and explain why.  
    
    2. **Summarization:**  
       - Summarize the investment offer concisely while retaining key details.  
    
    3. **Benefit Extraction (If Legitimate):**  
       - If it's a good investment, highlight its benefits like security, growth potential, and credibility.  
    
    ### Output Format:
    - **Category:** ["Scam Alert" / "Legitimate Investment"]  
    - **Summary:** [Shortened version of the offer]  
    - **Analysis:** [Why it's a scam or why it's a good investment]  
    - **Benefits (If Legitimate):** [List benefits]  
    
    ### Example Inputs & Outputs:  
    #### **Example 1: Scam Investment Offer**  
    **Input:**  
    "Earn 500% profit in 7 days! No verification needed. Limited-time crypto deal—act fast!"  
    
    **Output:**  
    - **Category:** 🚨 Scam Alert  
    - **Summary:** Claims 500% profit in 7 days with no verification and urgency.  
    - **Analysis:**  
      - Unrealistic high returns.  
      - No verification (common scam sign).  
      - Uses urgency to manipulate decisions.  
    - **Final Verdict:** Likely a scam. Avoid!  
    
    #### **Example 2: Legitimate Investment Offer**  
    **Input:**  
    "Our government-approved mutual fund offers 7-10% annual returns with RBI regulation for safety."  
    
    **Output:**  
    - **Category:** ✅ Legitimate Investment  
    - **Summary:** A government-backed mutual fund with stable 7-10% returns.  
    - **Analysis:**  
      - Regulated by RBI (ensures credibility).  
      - Realistic returns over time.  
    - **Benefits:**  
      - **Secure:** Government-backed and RBI regulated.  
      - **Stable Growth:** Predictable returns.  
      - **Low Risk:** Ideal for long-term investment.  
    
    Analyze the following investment offer:
    **Input:**  
    ${query}
  `;

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

const textChecker = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Text input is required" });
    }

    const response = await getDetectorText(prompt);
    res.json({ response });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { textChecker };
