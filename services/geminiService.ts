
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Product } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for the development environment where process.env might not be configured.
  // In a real production build, the key should always be present.
  console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateProductDescription = async (keywords: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI service is currently unavailable. Please try again later.");
  }
  
  try {
    const prompt = `Generate a compelling and concise e-commerce product description for the Sierra Leone market. Be persuasive and highlight key benefits. The product is: "${keywords}". Do not use markdown or special formatting. Just return plain text.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 },
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "Failed to generate AI description. Please check your keywords and try again.";
  }
};

export const getRelatedProductIds = async (currentProduct: Product, allProducts: Product[]): Promise<number[]> => {
    if (!API_KEY) return [];

    const otherProducts = allProducts
        .filter(p => p.id !== currentProduct.id)
        .map(p => ({ id: p.id, name: p.name, category: p.category, description: p.description.substring(0, 100) }));

    if (otherProducts.length === 0) return [];
    
    const prompt = `
        You are a product recommendation engine for an e-commerce site in Sierra Leone called SaloneKart.
        Based on the current product, find the 3 most relevantly similar products from the provided list.
        Consider the product name, category, and description for relevance.
        
        Current Product:
        - Name: ${currentProduct.name}
        - Category: ${currentProduct.category}
        - Description: ${currentProduct.description}

        List of Other Products (JSON format):
        ${JSON.stringify(otherProducts, null, 2)}

        Return a JSON object with a single key "related_ids" which is an array of the top 3 most relevant product IDs. For example: {"related_ids": [12, 34, 56]}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        related_ids: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER }
                        }
                    }
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.related_ids || [];
    } catch (error) {
        console.error("Error getting related products from Gemini:", error);
        return [];
    }
};

export const createChatSession = (): Chat => {
    const systemInstruction = `You are a friendly and helpful customer service chatbot for SaloneKart, an e-commerce marketplace in Sierra Leone. Your name is Kadi.
    Your knowledge base consists ONLY of the following information:
    - **Payment Methods**: We accept Cash on Delivery, Orange Money, and Africell Money.
    - **Delivery**: We deliver to all parts of Sierra Leone. Customers can track their orders on the 'Track Your Order' page using their Order ID.
    - **Becoming a Seller**: Anyone can become a seller by clicking 'Seller Login' and then 'Sign Up'. The 'Vendor Hub' has resources and guides to help sellers succeed.
    - **Product Categories**: We sell a wide range of products including Electronics, Clothing, Groceries, Mobile Phones, and Beauty & Health items.
    - **Return Policy**: We have a 7-day return policy. Items must be unused and in their original packaging. Customers should contact support via the 'Help Center' page to start a return.
    
    Your instructions:
    - Be friendly, conversational, and concise. Use Sierra Leonean greetings like "Kushe!" or "How de body?" where appropriate.
    - If a user asks a question you cannot answer from your knowledge base, politely say "I'm sorry, I can only answer questions about SaloneKart's services like payments, delivery, and returns. Is there anything else I can help with?"
    - Do not make up information.
    - Keep your answers short and to the point.`;

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
            temperature: 0.8,
        },
    });
};
