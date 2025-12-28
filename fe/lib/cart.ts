// Cart utility functions for localStorage management

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  vendor: string;
  store_id: number;
  quantity: number;
}

// Get user-specific cart key
const getCartStorageKey = (): string => {
  if (typeof window === 'undefined') return 'pasaloo_cart';

  // Try to get user from localStorage
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // Use user ID to make cart user-specific
      return `pasaloo_cart_${user.id}`;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }

  // Fallback to guest cart
  return 'pasaloo_cart_guest';
};

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const cart = localStorage.getItem(getCartStorageKey());
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
};

export const addToCart = (product: {
  id: number;
  name: string;
  price: number;
  image: string;
  vendor?: string;
  store?: { id: number; store_name: string };
  store_id?: number;
}, quantity: number = 1): void => {
  if (typeof window === 'undefined') return;

  try {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        vendor: product.vendor || product.store?.store_name || 'Unknown',
        store_id: product.store_id || product.store?.id || 0,
        quantity: quantity,
      });
    }

    localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};

export const removeFromCart = (productId: number): void => {
  if (typeof window === 'undefined') return;

  try {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem(getCartStorageKey(), JSON.stringify(updatedCart));
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  } catch (error) {
    console.error('Error removing from cart:', error);
  }
};

export const updateCartQuantity = (productId: number, quantity: number): void => {
  if (typeof window === 'undefined') return;

  try {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        item.quantity = quantity;
        localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
        // Dispatch custom event for cart updates
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    }
  } catch (error) {
    console.error('Error updating cart quantity:', error);
  }
};

export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

export const clearCart = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getCartStorageKey());
};

// Clear all cart data for all users (useful for complete cleanup)
export const clearAllUserCarts = (): void => {
  if (typeof window === 'undefined') return;

  // Get all keys from localStorage
  const keys = Object.keys(localStorage);

  // Remove all cart-related keys
  keys.forEach(key => {
    if (key.startsWith('pasaloo_cart')) {
      localStorage.removeItem(key);
    }
  });
};
