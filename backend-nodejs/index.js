// backend-nodejs/index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SpeechClient } = require('@google-cloud/speech');
const gTTS = require('gtts');
const stream = require('stream');
const util = require('util');

dotenv.config();

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json()); // Essencial para receber JSON do frontend

const upload = multer({ storage: multer.memoryStorage() });

// --- Clientes das APIs do Google ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const speechClient = new SpeechClient();

// --- Endpoint de Áudio (Já existente, sem alterações) ---
app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
    // ... seu código de processamento de áudio continua aqui ...
});

// ==========================================================
// ===== NOVO ENDPOINT PARA O CHAT DE TEXTO =====
// ==========================================================
app.post('/api/chat', async (req, res) => {
  try {
    // 1. Especificamos o modelo Gemini desejado
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); 
    // NOTA: Usei "gemini-1.5-flash-latest" que é o nome oficial atual para a família Flash.
    // Se um modelo "2.5-flash-lite" for lançado, basta atualizar esta string.

    // 2. Recebemos a mensagem atual e o histórico do frontend
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Nenhuma mensagem recebida.' });
    }
    
    // 3. Iniciamos o chat com o histórico para que o Gemini tenha contexto
    const chat = model.startChat({
        history: history || [], // Usa o histórico recebido, se houver
        generationConfig: {
          maxOutputTokens: 500,
        },
    });

    // 4. Enviamos a nova mensagem para o Gemini
    const result = await chat.sendMessage(message);
    const response = result.response;
    const botResponseText = response.text();

    // 5. Devolvemos a resposta do bot para o frontend
    res.json({ response: botResponseText });

  } catch (error) {
    console.error("Erro no endpoint de chat:", error);
    res.status(500).json({ error: "Ocorreu um erro ao processar sua mensagem." });
  }
});


app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});