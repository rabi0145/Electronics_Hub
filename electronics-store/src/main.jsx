import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProductProvider } from './context/ProductContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <OrderProvider>
                <App />
              </OrderProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)