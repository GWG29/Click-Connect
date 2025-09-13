// frontend/src/HomePage.js
import React, { useState } from 'react';
import './HomePage.css'; // Importando nosso CSS
import ProductCard from './ProductCard'; // Importando o card de produto
import ChatWindow from './ChatWindow';

// Importando os ícones que instalamos
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { BiSupport } from 'react-icons/bi';

// Importando as imagens (substitua pelos nomes dos seus arquivos)
import ideapad from './assets/ideapad.png';
import pocoC65 from './assets/poco-c65.png';
import headset from './assets/headset.png';
import mouse from './assets/mouse.png';
import macbookBanner from './assets/macbook-banner.png';
import logo from './assets/logo.png'; // Crie ou baixe um logo

const HomePage = () => {
  // Criamos uma lista de produtos para não repetir código
  const products = [
    { title: 'Ideapad i5', image: ideapad, price: 'R$ 3.000' },
    { title: 'Poco C65', image: pocoC65, price: 'R$ 3.000' },
    { title: 'Cloudmix', image: headset, price: 'R$ 3.000' },
    { title: 'Mouse', image: mouse, price: 'R$ 3.000' },
  ];

  const [isChatOpen, setIsChatOpen] = useState(false); // <--- 3. CRIA O ESTADO (começa fechado)

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen); // <--- 4. FUNÇÃO QUE INVERTE O ESTADO (abre/fecha)
  };

  return (
    <div className="homepage-container">
      {/* ===== HEADER / NAVBAR ===== */}
      <header className="navbar">
        <div className="logo">
          {/* Você pode usar uma imagem de logo ou texto */}
          <img src={logo} alt="Click & Connect Logo" className="logo-img"/>
          <div className="logo-text">
            <span className="logo-click">Click</span>
            <span className="logo-connect">& Connect</span>
          </div>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Pesquisar..." />
          <FaSearch className="search-icon" />
        </div>
        <div className="nav-icons">
          <FaShoppingCart className="nav-icon" />
          <FaUser className="nav-icon" />
        </div>
      </header>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <main className="main-content">
        <section className="product-grid">
          {/* Usamos .map() para criar um ProductCard para cada item da nossa lista */}
          {products.map((product, index) => (
            <ProductCard
              key={index}
              title={product.title}
              image={product.image}
              price={product.price}
            />
          ))}
        </section>

        <section className="promo-banner">
          <img src={macbookBanner} alt="Macbook Pro Banner" className="banner-image"/>
          <h2 className="banner-text">Macbook Pro</h2>
        </section>
      </main>

      {/* ===== WIDGET DE SUPORTE ===== */}
      <div className="support-widget" onClick={toggleChat}>
        <span>Precisa de suporte?</span>
        <div className="support-icon-container">
          <BiSupport />
        </div>
      </div>

      {isChatOpen && <ChatWindow closeChat={toggleChat}/>}
    </div>
  );
};

export default HomePage;