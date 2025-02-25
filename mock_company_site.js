// File: src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './redux/store';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// File: src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProductListingPage from './pages/ProductListingPage';
import ShoppingCartPage from './pages/ShoppingCartPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/cart" element={<ShoppingCartPage />} />
      </Routes>
    </div>
  );
}

export default App;

// File: src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export default store;

// File: src/redux/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalQuantity: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (!existingItem) {
        state.items.push({
          id: newItem.id,
          name: newItem.name,
          price: newItem.price,
          image: newItem.image,
          quantity: 1,
          category: newItem.category,
        });
      } else {
        existingItem.quantity++;
      }
      state.totalQuantity++;
    },
    removeFromCart(state, action) {
      const id = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      if (existingItem.quantity === 1) {
        state.items = state.items.filter(item => item.id !== id);
      } else {
        existingItem.quantity--;
      }
      state.totalQuantity--;
    },
    deleteFromCart(state, action) {
      const id = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      state.totalQuantity -= existingItem.quantity;
      state.items = state.items.filter(item => item.id !== id);
    }
  }
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;

// File: src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Header.css';

const Header = () => {
  const cartQuantity = useSelector(state => state.cart.totalQuantity);
  
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Green Haven</Link>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <Link to="/products">Products</Link>
          </li>
          <li>
            <Link to="/cart" className="cart-icon">
              🛒 <span className="cart-count">{cartQuantity}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

// File: src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Green Haven</h1>
        <p>
          At Green Haven, we believe in bringing the beauty of nature into your home. 
          Our carefully curated selection of houseplants is perfect for plant enthusiasts
          and beginners alike. Founded in 2023, our mission is to make plant parenthood
          accessible and enjoyable for everyone while promoting sustainability and wellness
          through connecting with nature.
        </p>
        <Link to="/products" className="get-started-btn">
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;

// File: src/pages/ProductListingPage.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions } from '../redux/cartSlice';
import Header from '../components/Header';
import './ProductListingPage.css';

const plants = [
  // Foliage Plants
  {
    id: 'p1',
    name: 'Monstera Deliciosa',
    price: 29.99,
    image: '/plant1.jpg',
    category: 'Foliage Plants'
  },
  {
    id: 'p2',
    name: 'Fiddle Leaf Fig',
    price: 34.99,
    image: '/plant2.jpg',
    category: 'Foliage Plants'
  },
  // Succulents
  {
    id: 'p3',
    name: 'Aloe Vera',
    price: 15.99,
    image: '/plant3.jpg',
    category: 'Succulents'
  },
  {
    id: 'p4',
    name: 'Echeveria',
    price: 12.99,
    image: '/plant4.jpg',
    category: 'Succulents'
  },
  // Flowering Plants
  {
    id: 'p5',
    name: 'Peace Lily',
    price: 24.99,
    image: '/plant5.jpg',
    category: 'Flowering Plants'
  },
  {
    id: 'p6',
    name: 'Orchid',
    price: 38.99,
    image: '/plant6.jpg',
    category: 'Flowering Plants'
  }
];

const ProductListingPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  
  // Group plants by category
  const plantsByCategory = plants.reduce((acc, plant) => {
    if (!acc[plant.category]) {
      acc[plant.category] = [];
    }
    acc[plant.category].push(plant);
    return acc;
  }, {});
  
  const addToCartHandler = (plant) => {
    dispatch(cartActions.addToCart(plant));
  };
  
  const isInCart = (plantId) => {
    return cartItems.some(item => item.id === plantId);
  };
  
  return (
    <>
      <Header />
      <main className="products-page">
        <h1>Our Houseplants</h1>
        
        {Object.entries(plantsByCategory).map(([category, categoryPlants]) => (
          <div key={category} className="category-section">
            <h2>{category}</h2>
            <div className="products-grid">
              {categoryPlants.map(plant => (
                <div key={plant.id} className="product-card">
                  <div className="product-image">
                    <img src={plant.image || "/api/placeholder/150/150"} alt={plant.name} />
                  </div>
                  <div className="product-details">
                    <h3>{plant.name}</h3>
                    <p className="price">${plant.price.toFixed(2)}</p>
                    <button
                      onClick={() => addToCartHandler(plant)}
                      disabled={isInCart(plant.id)}
                      className="add-to-cart-btn"
                    >
                      {isInCart(plant.id) ? 'Added to Cart' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  );
};

export default ProductListingPage;

// File: src/pages/ShoppingCartPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { cartActions } from '../redux/cartSlice';
import Header from '../components/Header';
import './ShoppingCartPage.css';

const ShoppingCartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const totalQuantity = useSelector(state => state.cart.totalQuantity);
  
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const increaseQuantityHandler = (id) => {
    dispatch(cartActions.addToCart({ id }));
  };

  const decreaseQuantityHandler = (id) => {
    dispatch(cartActions.removeFromCart(id));
  };

  const deleteItemHandler = (id) => {
    dispatch(cartActions.deleteFromCart(id));
  };

  return (
    <>
      <Header />
      <main className="cart-page">
        <h1>Your Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <Link to="/products" className="continue-shopping-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-summary">
              <p>Total Items: <span>{totalQuantity}</span></p>
              <p>Total Cost: <span>${totalAmount.toFixed(2)}</span></p>
            </div>
            
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image || "/api/placeholder/80/80"} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="price">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => decreaseQuantityHandler(item.id)}
                        className="decrease-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => increaseQuantityHandler(item.id)}
                        className="increase-btn"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => deleteItemHandler(item.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-actions">
              <Link to="/products" className="continue-shopping-btn">
                Continue Shopping
              </Link>
              <button className="checkout-btn" onClick={() => alert('Checkout Coming Soon!')}>
                Checkout
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default ShoppingCartPage;

// File: src/index.css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f8f8;
}

button {
  cursor: pointer;
}

// File: src/App.css
.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// File: src/components/Header.css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c7d4b;
  color: white;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav ul {
  display: flex;
  list-style: none;
}

.nav li {
  margin-left: 2rem;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.cart-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.cart-count {
  background-color: #ffcc00;
  color: #333;
  border-radius: 50%;
  padding: 0.1rem 0.4rem;
  font-size: 0.8rem;
  margin-left: 0.3rem;
}

// File: src/pages/LandingPage.css
.landing-page {
  height: 100vh;
  background-image: url('/api/placeholder/1920/1080');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}

.landing-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.landing-content {
  position: relative;
  max-width: 600px;
  padding: 2rem;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
}

.landing-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.landing-content p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.get-started-btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  background-color: #2c7d4b;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.get-started-btn:hover {
  background-color: #215c37;
}

// File: src/pages/ProductListingPage.css
.products-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.products-page h1 {
  margin-bottom: 2rem;
  text-align: center;
  color: #2c7d4b;
}

.category-section {
  margin-bottom: 3rem;
}

.category-section h2 {
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #2c7d4b;
  color: #2c7d4b;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  padding: 1.5rem;
}

.product-details h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.price {
  color: #2c7d4b;
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #2c7d4b;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #215c37;
}

.add-to-cart-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

// File: src/pages/ShoppingCartPage.css
.cart-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.cart-page h1 {
  margin-bottom: 2rem;
  text-align: center;
  color: #2c7d4b;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-cart p {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: #666;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.cart-summary p {
  font-size: 1.2rem;
  font-weight: bold;
}

.cart-summary span {
  color: #2c7d4b;
}

.cart-items {
  margin-bottom: 2rem;
}

.cart-item {
  display: flex;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.item-image {
  width: 100px;
  height: 100px;
  overflow: hidden;
  margin-right: 1.5rem;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.item-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.decrease-btn,
.increase-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  font-weight: bold;
}

.quantity {
  margin: 0 1rem;
  font-weight: bold;
}

.delete-btn {
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.continue-shopping-btn,
.checkout-btn {
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
  text-decoration: none;
}

.continue-shopping-btn {
  background-color: #f0f0f0;
  color: #333;
}

.continue-shopping-btn:hover {
  background-color: #e0e0e0;
}

.checkout-btn {
  background-color: #2c7d4b;
  color: white;
  border: none;
}

.checkout-btn:hover {
  background-color: #215c37;
}
