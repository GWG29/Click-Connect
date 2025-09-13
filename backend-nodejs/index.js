// 1. Importação dos Módulos Necessários
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 2. Configuração Inicial
dotenv.config();
const app = express();
const port = 3001;

// 3. Middlewares
app.use(cors());
app.use(express.json());

// --- BASE DE CONHECIMENTO DE PRODUTOS ---
// Esta lista simula um "banco de dados" dos produtos em destaque na sua loja.
// O assistente usará esta informação para responder aos clientes.
const products = [
    { name: 'Ideapad i5', category: 'Notebook', price: 'R$ 3.000', description: 'Um notebook versátil para trabalho e estudos, com processador Intel Core i5 e bom desempenho.' },
    { name: 'Poco C65', category: 'Smartphone', price: 'R$ 3.000', description: 'Um smartphone com ótimo custo-benefício, tela grande e boa bateria para o dia a dia.' },
    { name: 'Cloudmix', category: 'Headset Gamer', price: 'R$ 3.000', description: 'Headset para jogos da HyperX com áudio imersivo, confortável e microfone de alta qualidade.' },
    { name: 'Mouse Gamer', category: 'Mouse', price: 'R$ 3.000', description: 'Mouse com sensor de alta precisão, design ergonômico e iluminação RGB para jogadores.' },
    { name: 'Macbook Pro', category: 'Notebook Premium', price: 'Preço sob consulta', description: 'O notebook de alta performance da Apple, ideal para profissionais criativos, edição de vídeo e programação.' }
];

// Transforma a lista de produtos em um texto formatado para a IA entender.
const productCatalog = products.map(p => `- ${p.name} (${p.category}): ${p.description}. Preço: ${p.price}.`).join('\n');


// 4. Inicialização e Configuração do Cliente da API do Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// --- CONFIGURAÇÃO DA IA: INSTRUÇÃO DE SISTEMA (ATUALIZADA) ---
const systemInstruction = {
  role: "model",
  parts: [{ text: `
    Você é um assistente virtual especialista e amigável da "Click & Connect", uma loja de eletrônicos.
    Sua principal função é ajudar os clientes a encontrar os melhores produtos para suas necessidades.
    Seja sempre educado, prestativo e use uma linguagem clara.
    
    CRITICO: Você DEVE basear suas respostas e recomendações APENAS nos produtos da lista abaixo. Não invente produtos ou especificações.
    
    CATÁLOGO DE PRODUTOS DISPONÍVEIS:
    ${productCatalog}

    Se o cliente perguntar sobre algo que não está na lista, informe que no momento você só tem informações sobre os produtos em destaque e pergunte se ele tem interesse em algum deles.
  `}],
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: systemInstruction,
});


// 5. Definição da Rota da API de Chat
app.post('/api/chat', async (req, res) => {
  try {
    console.log('>>> Requisição recebida no endpoint /api/chat.');

    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Nenhuma mensagem recebida.' });
    }
    
    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 500,
    };
    
    const chat = model.startChat({
        history: history || [],
        generationConfig: generationConfig,
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const botResponseText = response.text();

    res.json({ response: botResponseText });

  } catch (error) {
    console.error('### ERRO DETALHADO NO ENDPOINT DE CHAT:', error);
    res.status(500).json({ error: "Ocorreu um erro no servidor ao tentar processar sua mensagem." });
  }
});

// 6. Inicialização do Servidor
app.listen(port, () => {
  console.log(`✅ Servidor backend de CHAT DE TEXTO rodando em http://localhost:${port}`);
});

