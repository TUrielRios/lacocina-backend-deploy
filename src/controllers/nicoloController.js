const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🧠 Almacenamiento en memoria para el entrenamiento
let nicoloEntrenamiento = null;

/**
 * POST /api/nicolo/train
 * Entrena a Nicolo con un prompt base y ejemplos
 */
const trainNicolo = async (req, res) => {
  try {
    const { promptBase, ejemplos } = req.body;

    if (!promptBase) {
      return res.status(400).json({ error: "Debes proporcionar un promptBase para el entrenamiento" });
    }

    nicoloEntrenamiento = {
      promptBase,
      ejemplos: ejemplos || [],
      updatedAt: new Date(),
    };

    res.status(200).json({
      message: "Entrenamiento de Nicolo actualizado correctamente",
      entrenamiento: nicoloEntrenamiento,
    });
  } catch (error) {
    console.error("Error en trainNicolo:", error);
    res.status(500).json({ error: "Error al entrenar a Nicolo", details: error.message });
  }
};

/**
 * GET /api/nicolo/train
 * Devuelve el entrenamiento actual de Nicolo
 */
const getEntrenamientoNicolo = (req, res) => {
  if (!nicoloEntrenamiento) {
    return res.status(404).json({ error: "Nicolo aún no ha sido entrenado" });
  }

  res.status(200).json({ entrenamiento: nicoloEntrenamiento });
};

/**
 * POST /api/nicolo/analyze
 * Genera un análisis usando el entrenamiento y los datos del taller
 */
const analyzeWithNicolo = async (req, res) => {
  try {
    const { compania, industriaSector, sector, areaDesempeno } = req.body;

    if (!nicoloEntrenamiento) {
      return res.status(400).json({ error: "Nicolo no está entrenado aún" });
    }

    // Obtener datos del taller desde la API externa
    const response = await axios.get("https://lacocina-backend-deploy.vercel.app/usuarios/taller");
    const datosFiltrados = response.data.filter((taller) =>
      taller.compania === compania &&
      taller.industriaSector === industriaSector &&
      taller.sector === sector &&
      taller.areaDesempeno === areaDesempeno
    );

    if (!datosFiltrados.length) {
      return res.status(404).json({ error: "No se encontraron datos del taller para esos parámetros" });
    }

    // Construir el prompt
    const prompt = `
${nicoloEntrenamiento.promptBase}

Contexto del cliente:
- Compañía: ${compania}
- Industria: ${industriaSector}
- Sector: ${sector}
- Área de desempeño: ${areaDesempeno}

Datos del taller:
${JSON.stringify(datosFiltrados, null, 2)}

Genera un análisis detallado siguiendo las instrucciones del entrenamiento.
    `;

    // Llamada a Gemini
    const result = await ai.models.generateContent({
      model: process.env.DEFAULT_MODEL || "gemini-1.5-flash",
      contents: prompt,
    });

    res.status(200).json({
      compania,
      analisis: result.text,
    });
  } catch (error) {
    console.error("Error en analyzeWithNicolo:", error);
    res.status(500).json({
      error: "Error al generar el análisis con Nicolo",
      details: error.message,
    });
  }
};

module.exports = {
  trainNicolo,
  getEntrenamientoNicolo,
  analyzeWithNicolo,
};