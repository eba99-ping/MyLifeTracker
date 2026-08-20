import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST request required",
    });
  }

  try {
    const { message, tracker } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Асуулт хоосон байна.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY IS MISSING");

      return res.status(500).json({
        error: "GEMINI_API_KEY олдсонгүй.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const trackerInfo = JSON.stringify(
      tracker || {},
      null,
      2
    );

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: `
My Life Tracker мэдээлэл:

${trackerInfo}

Хэрэглэгч:
${message.trim()}
`,

      config: {
        systemInstruction: `
Чи бол My Life Tracker аппын AI Coach.

Монгол хэлээр байгалийн, ойлгомжтой хариул.

Дүрэм:
- Асуултад шууд хариул.
- Богино бөгөөд тодорхой бай.
- Tracker дээр байхгүй мэдээллийг зохиохгүй.
- Төлөвлөгөө асуувал бодитой алхам гарга.
- Хариултаа бүтэн дуусга.
- Хэрэггүй markdown тэмдэглэгээ ашиглахгүй.
- Энгийн асуултад 2-5 өгүүлбэр хангалттай.
`,
        maxOutputTokens: 1500,
      },
    });

    const reply = response.text?.trim();

    if (!reply) {
      console.error(
        "EMPTY GEMINI RESPONSE",
        JSON.stringify(response)
      );

      return res.status(500).json({
        error: "Gemini хоосон хариу буцаалаа.",
      });
    }

    return res.status(200).json({
      reply,
    });

  } catch (error) {
    console.error("GEMINI FULL ERROR:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Gemini API алдаа гарлаа.",
    });
  }
}
