// frontend/src/ProductCard.js
import React from 'react';

// Recebemos props (propriedades) com os dados do produto
const ProductCard = ({ image, title, price }) => {
  return (
    <div className="product-card">
      <h3>{title}</h3>
      <div className="product-image-container">
        <img src={image} alt={title} className="product-image" />
      </div>
      <div className="product-dots">
        <span></span>
        <span className="active"></span>
        <span></span>
      </div>
      <p className="product-price">{price}</p>
    </div>
  );
};

export default ProductCard;