const dotenv = require("dotenv");
dotenv.config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzeTaller = async (req, res) => {
  try {
    const { compania, industriaSector, sector, areaDesempeno, puntuaciones, promptPersonalizado } = req.body;

    const prompt = promptPersonalizado || `
Eres un consultor experto en branding e identidad. A partir de las puntuaciones de cada fase (1-10), realiza un diagnóstico breve pero detallado.

Si la puntuación es baja (1-4), explica por qué está mal y da recomendaciones para mejorar.

Si la puntuación es media (5-7), sugiere mejoras.

Si la puntuación es alta (8-10), valida lo que está bien y cómo mantenerlo.

Incluye el contexto de la empresa: ${compania} (${industriaSector}, ${sector}) y el área de desempeño: ${areaDesempeno}.
Puntuaciones: ${JSON.stringify(puntuaciones)}
    `;

    const response = await ai.models.generateContent({
      model: process.env.DEFAULT_MODEL || "gemini-1.5-flash",
      contents: prompt,
    });

    res.status(200).json({
      compania,
      areaDesempeno,
      analisis: response.text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al analizar con Gemini",
      details: error.message,
    });
  }
};

module.exports = { analyzeTaller };
