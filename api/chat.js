import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST request required"
    });
  }

  try {

    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Асуулт хоосон байна."
      });
    }

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "GEMINI_API_KEY тохируулагдаагүй байна."
      });
    }

    const ai =
      new GoogleGenAI({
        apiKey: apiKey
      });


    const response =
      await ai.models.generateContent({

        model: "gemini-3.6-flash",

        contents: message,

        config: {

          systemInstruction: `
Чи бол хэрэглэгчийн хувийн AI Coach.

Чиний үүрэг:
- Монгол хэлээр хариулах
- Хичээл, код, AI, хэл сурах,
  өдөр тутмын төлөвлөгөө болон
  зорилгын талаар туслах
- Хэрэгжүүлэхэд амархан зөвлөгөө өгөх
- Хэт урт хариу өгөхгүй байх
- Хэрэглэгчийн зорилгыг дэмжих

Хэрэглэгчийн асуултад шууд хариул.
          `,

          temperature: 0.7,

          maxOutputTokens: 800

        }

      });


    const reply =
      response.text;


    if (!reply) {

      return res.status(500).json({
        error:
          "Gemini хариу буцаасангүй."
      });

    }


    return res.status(200).json({
      reply: reply
    });


  } catch (error) {

    console.error(
      "Gemini Error:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Gemini API алдаа гарлаа."
    });

  }

}
