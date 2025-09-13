import React, { useState, useEffect, useRef } from 'react';
import { IoMdSend, IoMdClose } from 'react-icons/io'; // Ícones de enviar e fechar

// O componente recebe a função 'closeChat' do componente pai (HomePage)
const ChatWindow = ({ closeChat }) => {
  // --- ESTADOS DO COMPONENTE ---

  // 1. Estado para guardar a lista de todas as mensagens da conversa
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Olá! Sou o assistente da Click & Connect. Como posso ajudar?' }
  ]);

  // 2. Estado para controlar o que está sendo digitado na caixa de texto
  const [inputValue, setInputValue] = useState('');

  // 3. Estado para mostrar um feedback de "carregando" enquanto o bot pensa
  const [isLoading, setIsLoading] = useState(false);
  
  // --- REFERÊNCIA PARA AUTO-SCROLL ---
  
  // Uma referência a um elemento do DOM (neste caso, o corpo do chat)
  const chatBodyRef = useRef(null);

  // Este "efeito" roda toda vez que a lista de 'messages' é atualizada
  useEffect(() => {
    if (chatBodyRef.current) {
      // Rola a div para o final, para que a última mensagem esteja sempre visível
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);


  // --- FUNÇÃO PRINCIPAL PARA ENVIAR MENSAGENS ---

  const handleSendMessage = async (e) => {
    e.preventDefault(); // Previne que o formulário recarregue a página
    const userMessage = inputValue.trim(); // Pega a mensagem e remove espaços em branco

    if (!userMessage) return; // Não faz nada se a mensagem estiver vazia

    // Adiciona a mensagem do usuário na tela instantaneamente para uma melhor experiência
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setInputValue(''); // Limpa a caixa de texto
    setIsLoading(true); // Ativa o indicador de "carregando"

    // Prepara o histórico para ser enviado para a API do Gemini
    let historyForApi = newMessages.map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));
    
    // Remove a última mensagem (que é a do usuário atual que estamos enviando separadamente)
    historyForApi.pop();

    // Lógica que corrige o erro "First content should be with role 'user'"
    if (historyForApi.length > 0 && historyForApi[0].role === 'model') {
      historyForApi.shift(); // Remove a mensagem de boas-vindas do histórico
    }

    try {
      // Envia a requisição para o nosso backend
      const apiResponse = await fetch('https://curly-fishstick-4w99q7prrq93765v-3001.app.github.dev/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: historyForApi }),
      });

      // Se a resposta do servidor não for OK (ex: erro 500), joga um erro
      if (!apiResponse.ok) {
        throw new Error('Falha na resposta da API');
      }

      // Pega a resposta do backend e a converte para JSON
      const data = await apiResponse.json();
      
      // Adiciona a resposta do bot na lista de mensagens
      setMessages(prevMessages => [...prevMessages, { role: 'bot', text: data.response }]);
    } catch (error) {
      // Se qualquer parte do 'try' falhar, o código entra aqui
      console.error("Erro ao enviar mensagem:", error);
      // Adiciona uma mensagem de erro amigável na tela
      setMessages(prevMessages => [...prevMessages, { role: 'bot', text: 'Desculpe, ocorreu um erro. Tente novamente.' }]);
    } finally {
      // Este bloco sempre executa, seja no sucesso ou no erro
      setIsLoading(false); // Desativa o indicador de "carregando"
    }
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (O QUE APARECE NA TELA) ---
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Suporte Online</h3>
        <button onClick={closeChat} className="chat-close-btn"><IoMdClose /></button>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {/* Mapeia a lista de mensagens e cria uma div para cada uma */}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {/* Mostra o indicador de "digitando" apenas se isLoading for true */}
        {isLoading && (
          <div className="message bot typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
      </div>

      {/* O rodapé com o campo de texto e o botão de enviar */}
      <form className="chat-footer" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading} // Desabilita o input enquanto o bot responde
        />
        <button type="submit" className="chat-send-btn" disabled={isLoading}>
          <IoMdSend />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;