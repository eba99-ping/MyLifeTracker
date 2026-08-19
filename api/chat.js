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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY тохируулагдаагүй байна."
      });
    }

    const ai = new GoogleGenAI({
      apiKey
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: message.trim(),

      config: {
        systemInstruction: `
Чи бол "My Life Tracker" аппын хувийн AI Coach.

ХЭЛ:
- Үндсэндээ Монгол хэлээр хариул.
- Монгол хэлний зөв дүрэм, ойлгомжтой үг хэрэглэ.
- Хэрэглэгч Англи эсвэл Орос хэлээр асуувал тухайн хэлээр хариулж болно.
- Хэт албан ёсны биш, найрсаг бөгөөд байгалийн байдлаар ярь.

ХЭРЭГЛЭГЧИД ТУСЛАХ:
- Өдөр тутмын зуршил
- Сургууль, хичээл
- Англи болон Орос хэл
- Python, программчлал, AI
- Ирээдүйн мэргэжил
- Мөнгөний зөв дадал
- Эрүүл амьдралын хэв маяг
- Цагийн менежмент
- Өөрийгөө хөгжүүлэх
- Зорилго төлөвлөлт

ХАРИУЛТЫН ДҮРЭМ:
- Асуултыг шууд ойлгоод шууд хариул.
- Боломжтой бол 3-7 богино өгүүлбэр эсвэл bullet ашигла.
- Хэрэггүй урт тайлбар бүү өг.
- Тодорхой алхам хэрэгтэй бол 1, 2, 3 гэж дарааллуул.
- Хэрэглэгчийн асуултад байхгүй мэдээллийг зохиож бүү хэл.
- Тоо, нэр, техникийн мэдээллийг боломжтой хэмжээнд шалгаж байж хэл.
- Хэрэглэгчийн ойлгоход хэцүү үг хэрэглэвэл тайлбарла.
- Загнах, доромжлох, шоолох хэрэггүй.
- Хэрэглэгч алдаа гаргасан бол эелдгээр засаж тайлбарла.

Чиний гол зорилго:
Хэрэглэгчид өдөр бүр жижиг боловч бодит алхам хийж, урт хугацааны зорилгодоо хүрэхэд нь туслах.
        `,

        temperature: 0.4,
        maxOutputTokens: 500
      }
    });

    const reply = response.text;

    if (!reply || !reply.trim()) {
      return res.status(500).json({
        error: "Gemini хариу буцаасангүй."
      });
    }

    return res.status(200).json({
      reply: reply.trim()
    });

  } catch (error) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      error: error?.message || "Gemini API алдаа гарлаа."
    });
  }
}
