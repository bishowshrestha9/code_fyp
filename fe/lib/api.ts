// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kirsten-vaulted-margarita.ngrok-free.dev';

export const api = {
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
  me: `${API_BASE_URL}/api/me`,
  updateProfile: `${API_BASE_URL}/api/profile`,
  updatePassword: `${API_BASE_URL}/api/profile/password`,
  logout: `${API_BASE_URL}/api/logout`,
  customerOrders: `${API_BASE_URL}/api/customer/orders`,
  // Image upload
  uploadImage: `${API_BASE_URL}/api/upload/image`,
  deleteImage: `${API_BASE_URL}/api/upload/image`,
  // Addresses
  addresses: `${API_BASE_URL}/api/addresses`,
  address: (id: number) => `${API_BASE_URL}/api/addresses/${id}`,
  googleAuth: `${API_BASE_URL}/api/auth/google`,
  subscriptions: `${API_BASE_URL}/api/subscriptions`,
  storeRegister: `${API_BASE_URL}/api/stores/register`,
  myStore: `${API_BASE_URL}/api/stores/my-store`,
  updateStore: `${API_BASE_URL}/api/stores/my-store`,
  getStores: `${API_BASE_URL}/api/stores`,
  approveStore: (id: number) => `${API_BASE_URL}/api/stores/${id}/approve`,
  rejectStore: (id: number) => `${API_BASE_URL}/api/stores/${id}/reject`,
  blockStore: (id: number) => `${API_BASE_URL}/api/stores/${id}/block`,
  deleteStore: (id: number) => `${API_BASE_URL}/api/stores/${id}`,
  // Dashboard
  dashboardOverview: `${API_BASE_URL}/api/dashboard/overview`,
  // Products
  products: `${API_BASE_URL}/api/products`,
  product: (id: number) => `${API_BASE_URL}/api/products/${id}`,
  // Categories
  categories: `${API_BASE_URL}/api/categories`,
  category: (id: number) => `${API_BASE_URL}/api/categories/${id}`,
  // Orders
  orders: `${API_BASE_URL}/api/orders`,
  order: (id: number) => `${API_BASE_URL}/api/orders/${id}`,
  updateOrderStatus: (id: number) => `${API_BASE_URL}/api/orders/${id}/update-status`,
  // Public Product routes (for customers)
  publicProducts: `${API_BASE_URL}/api/public/products`,
  publicProduct: (id: number) => `${API_BASE_URL}/api/public/products/${id}`,
  relatedProducts: (id: number) => `${API_BASE_URL}/api/public/products/${id}/related`,
  // Public Store routes (for customers)
  publicStores: `${API_BASE_URL}/api/public/stores`,
  publicStore: (id: string | number) => `${API_BASE_URL}/api/public/stores/${id}`,
  storeProducts: (id: string | number) => `${API_BASE_URL}/api/public/stores/${id}/products`,
  // Checkout
  checkout: `${API_BASE_URL}/api/checkout`,
  // Reviews
  productReviews: (id: number) => `${API_BASE_URL}/api/products/${id}/reviews`,
  storeReviews: (id: number) => `${API_BASE_URL}/api/stores/${id}/reviews`,
  deleteProductReview: (id: number) => `${API_BASE_URL}/api/product-reviews/${id}`,
  deleteStoreReview: (id: number) => `${API_BASE_URL}/api/store-reviews/${id}`,
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Helper function to set auth token
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

// Helper function to remove auth token
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

// Helper function to get default headers (includes ngrok skip warning)
export const getDefaultHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) {
    return 'https://via.placeholder.com/400?text=No+Image'; // Default placeholder
  }
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Remove 'public/' prefix if present
  let cleanPath = path.replace(/^public\//, '');
  // Remove 'storage/' prefix if present (to avoid double prefix)
  cleanPath = cleanPath.replace(/^storage\//, '');
  // Construct the URL from the storage path
  return `${API_BASE_URL}/storage/${cleanPath}`;
};
