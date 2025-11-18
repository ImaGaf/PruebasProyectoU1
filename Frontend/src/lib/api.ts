import bcrypt from 'bcryptjs';

const BASE_URL = 'http://localhost:3000/barroco';

async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization':     "Basic " +
    btoa(
      `${import.meta.env.VITE_API_USER}:${import.meta.env.VITE_API_PASS}`
    ),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const getCurrentUser = (): any | null => {
  const userStr = sessionStorage.getItem("user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const logoutUser = async () => {
  try {
    const { clearUserCart } = await import('./cart-sync');
    await clearUserCart();
    
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("shoppingCartId");
    sessionStorage.removeItem("cart");
    
    window.dispatchEvent(new CustomEvent('userLogout'));
    
    console.log("Sesión cerrada exitosamente");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("shoppingCartId");
    sessionStorage.removeItem("cart");
    
    window.dispatchEvent(new CustomEvent('userLogout'));
  }
};

export const customerAPI = {
  create: (data: any) => api('/customers', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => api('/customers'),
  getById: (id: string) => api(`/customers/${id}`),
  update: (id: string, data: any) => api(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/customers/${id}`, { method: 'DELETE' }),
};

export const productAPI = {
  create: (data: any) => api('/products', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => api('/products'),
  getById: (id: string) => api(`/products/${id}`),
  update: (id: string, data: any) => api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/products/${id}`, { method: 'DELETE' }),
};

export const cartAPI = {
  create: (data: any) => api('/shoppingCart', { method: 'POST', body: JSON.stringify(data) }),
  getById: (id: string) => api(`/shoppingCart/${id}`),
  update: (id: string, data: any) => api(`/shoppingCart/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/shoppingCart/${id}`, { method: 'DELETE' }),
  getByCustomer: (customerId: string) => api(`/shoppingCart/customer/${customerId}`),
};


export const categoryAPI = {
  create: (data: any) => api('/categories', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => api('/categories'),
  update: (id: string, data: any) => api(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/categories/${id}`, { method: 'DELETE' }),
};

export const LoginAPI = {
  login: async (email: string, password: string) => {
    try {
      const customersRaw = await customerAPI.getAll().catch(() => []);
      const customers = Array.isArray(customersRaw) ? customersRaw : [];

      const allUsers = [
        ...customers.map((u: any) => ({ ...u, role: "customer" })),
      ];

      const user = allUsers.find((u: any) => u.email === email);
      if (!user) throw new Error("Usuario no encontrado");

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) throw new Error("Contraseña incorrecta");

      sessionStorage.removeItem("shoppingCartId");
      sessionStorage.removeItem("cart");

      sessionStorage.setItem("user", JSON.stringify(user));
      
      window.dispatchEvent(new CustomEvent('userLogin', { detail: user }));

      if (user.role === "customer") {
        try {
          const { loadCartForCurrentUser } = await import('./cart-sync');
          setTimeout(async () => {
            try {
              await loadCartForCurrentUser();
              console.log("Carrito cargado exitosamente");
            } catch (error) {
              console.error("Error al cargar carrito del customer:", error);
            }
          }, 100);
        } catch (error) {
          console.error("Error al importar cart-sync:", error);
        }
      }

      return user;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  },
};

export const RegisterAPI = {
  registerCustomer: async (data: any) => {
    try {
      const user = await customerAPI.create({ ...data });
      const userWithRole = { ...(typeof user === 'object' && user !== null ? user : {}), role: "customer" };
      
      sessionStorage.removeItem("shoppingCartId");
      sessionStorage.removeItem("cart");

      sessionStorage.setItem("user", JSON.stringify(userWithRole));
      
      window.dispatchEvent(new CustomEvent('userLogin', { detail: userWithRole }));
      
      console.log("Nuevo customer registrado, carrito se creará cuando sea necesario");
      
      return userWithRole;
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  },
};