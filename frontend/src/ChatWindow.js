// frontend/src/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { IoMdSend, IoMdClose } from 'react-icons/io';

const ChatWindow = ({ closeChat }) => {
  // Estado para guardar todas as mensagens da conversa
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Olá! Sou o assistente da Click & Connect. Como posso ajudar?' }
  ]);
  // Estado para o que o usuário está digitando no input
  const [inputValue, setInputValue] = useState('');
  // Estado para mostrar um indicador de "digitando..."
  const [isLoading, setIsLoading] = useState(false);
  
  // Referência para o corpo do chat para fazer o scroll automático
  const chatBodyRef = useRef(null);

  // Efeito para rolar para a última mensagem sempre que 'messages' mudar
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página ao enviar form
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    // 1. Adiciona a mensagem do usuário na tela imediatamente
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    // Formata o histórico para a API do Gemini
    const historyForApi = newMessages
      .filter(msg => msg.role !== 'info') // Filtra mensagens de sistema se houver
      .map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      }));
    
    // Remove a última mensagem (que é a do usuário atual) para enviar separado
    historyForApi.pop();

    try {
      // 2. Envia a mensagem para o nosso backend
      const apiResponse = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: historyForApi }),
      });

      if (!apiResponse.ok) {
        throw new Error('Falha na resposta da API');
      }

      const data = await apiResponse.json();
      
      // 3. Adiciona a resposta do bot na tela
      setMessages(prevMessages => [...prevMessages, { role: 'bot', text: data.response }]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages(prevMessages => [...prevMessages, { role: 'bot', text: 'Desculpe, não consegui me conectar. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Suporte Online</h3>
        <button onClick={closeChat} className="chat-close-btn"><IoMdClose /></button>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="message bot typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
      </div>

      <form className="chat-footer" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="chat-send-btn" disabled={isLoading}>
          <IoMdSend />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;