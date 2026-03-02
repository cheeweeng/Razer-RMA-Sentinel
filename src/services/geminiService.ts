import { GoogleGenAI } from "@google/genai";
import { ProductStats, OverviewStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getProductAIInsights = async (stats: ProductStats) => {
  const prompt = `
    As a Senior Quality Engineer at Razer, analyze the following RMA data for the product: ${stats.product.name} (${stats.product.category}).
    
    RMA History (Monthly):
    ${JSON.stringify(stats.rmas)}
    
    Defect Distribution:
    ${JSON.stringify(stats.defectDistribution)}
    
    Existing Improvements:
    ${JSON.stringify(stats.improvements)}
    
    Please provide a concise "Sentinel Analysis" in Markdown format with the following sections:
    1. **Root Cause Hypothesis**: Based on the defect types, what is the most likely engineering or manufacturing flaw?
    2. **Effectiveness Audit**: Are the existing improvements working based on the RMA trend?
    3. **Strategic Recommendation**: What specific action should the engineering team take next (e.g., supplier change, firmware patch, structural redesign)?
    4. **Risk Level**: (Low/Medium/High/Critical) and why.
    
    Keep the tone professional, technical, and direct.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insights at this time. Please check your connection or API configuration.";
  }
};

export const getGlobalAIInsights = async (stats: OverviewStats) => {
  const prompt = `
    Analyze the global RMA trends for Razer's product lineup:
    
    Total RMAs: ${stats.totalRMAs}
    Top Defects: ${JSON.stringify(stats.topDefects)}
    Monthly Trend: ${JSON.stringify(stats.monthlyTrend)}
    
    Provide a high-level executive summary (Markdown) focusing on:
    1. **Emerging Quality Risks**: Any alarming trends in specific defect types?
    2. **Operational Efficiency**: Is the resolution speed keeping up with volume?
    3. **Global Quality Outlook**: One sentence summary of the current state of Razer's product quality.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Global AI analysis unavailable.";
  }
};
