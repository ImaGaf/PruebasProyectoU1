interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  customization?: Record<string, any>;
}

let cartItems: CartItem[] = [];
let listeners: (() => void)[] = [];

export const cartStore = {
  getItems: () => cartItems,
  
  addItem: (item: CartItem) => {
    const existingIndex = cartItems.findIndex(ci => ci.id === item.id);
    if (existingIndex >= 0) {
      cartItems[existingIndex].quantity += item.quantity;
    } else {
      cartItems.push(item);
    }
    notifyListeners();
  },
  
  removeItem: (id: string) => {
    cartItems = cartItems.filter(item => item.id !== id);
    notifyListeners();
  },
  
  updateQuantity: (id: string, quantity: number) => {
    const item = cartItems.find(ci => ci.id === id);
    if (item) {
      item.quantity = quantity;
      notifyListeners();
    }
  },
  
  clear: () => {
    cartItems = [];
    notifyListeners();
  },
  
  getTotal: () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  getCount: () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};

function notifyListeners() {
  listeners.forEach(listener => listener());
}