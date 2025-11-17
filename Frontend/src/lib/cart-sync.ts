import { cartAPI, getCurrentUser } from "./api";
import { cartStore } from "./cart-store";

const SHOPPING_CART_ID_KEY = "shoppingCartId";

function getCustomerIdentifier(user: any | null): string | null {
  if (!user) return null;
  const id = user?.idCustomer ?? user?._id ?? user?.id ?? null;
  return id ? String(id) : null;
}

function buildPayload() {
  const items = cartStore.getItems();
  const total = cartStore.getTotal();
  const user = getCurrentUser();
  const customer = getCustomerIdentifier(user);

  return {
    customer, 
    products: items.map((i) => ({
      idProduct: i.productId,
      quantity: i.quantity,
      price: i.price,
    })),
    total: Number(total.toFixed(2)),
  };
}

interface ShoppingCartResponse {
  idShoppingCart?: string | number;
  _id?: string | number;
  id?: string | number;
}

function extractCartId(data: ShoppingCartResponse | null | undefined): string | null {
  const id = data?.idShoppingCart ?? data?._id ?? data?.id;
  return id ? String(id) : null;
}

async function findCartByCustomerId(customerId: string): Promise<string | null> {
  try {
    
    try {
      const cart = await cartAPI.getByCustomer?.(customerId);
      if (cart) {
        const cartId = extractCartId(cart);
        if (cartId) {
          return cartId;
        }
      }
    } catch (error) {
    }
    return null;
    
  } catch (error) {
    return null;
  }
}


export async function findOrCreateCartForCustomer(): Promise<string | null> {
  const user = getCurrentUser();
  const customer = getCustomerIdentifier(user);
  
  if (!customer) {
    return null;
  }

  try {
    let cartId = await findCartByCustomerId(customer);
    
    if (cartId) {
      sessionStorage.setItem(SHOPPING_CART_ID_KEY, cartId);
      return cartId;
    }

    const payload = buildPayload();
    
    const created = await cartAPI.create(payload);
    cartId = extractCartId(created);
    
    if (cartId) {
      sessionStorage.setItem(SHOPPING_CART_ID_KEY, cartId);
      return cartId;
    } else {

      return null;
    }
    
  } catch (error) {
    return null;
  }
}

export async function upsertCartForCurrentUser(): Promise<string | null> {
  const user = getCurrentUser();
  const customer = getCustomerIdentifier(user);
  
  if (!customer) return null;

  const payload = buildPayload();

  try {
    let cartId = await findCartByCustomerId(customer);
    
    if (cartId) {
      try {
        const updated = await cartAPI.update(cartId, payload);
        
        sessionStorage.setItem(SHOPPING_CART_ID_KEY, cartId);
        return cartId;
      } catch (updateError) {
        cartId = null;
      }
    }
    
    if (!cartId) {
      const created = await cartAPI.create(payload);
      cartId = extractCartId(created);
      
      if (cartId) {
        sessionStorage.setItem(SHOPPING_CART_ID_KEY, cartId);
        return cartId;
      }
    }
    
    return cartId;
  } catch (error) {
    return null;
  }
}

export async function loadCartForCurrentUser(): Promise<void> {
  const user = getCurrentUser();
  const customer = getCustomerIdentifier(user);
  
  if (!customer) {
    return;
  }

  try {
    const cartId = await findCartByCustomerId(customer);
    
    if (!cartId) {
      cartStore.clear();
      sessionStorage.removeItem(SHOPPING_CART_ID_KEY);
      return;
    }

    sessionStorage.setItem(SHOPPING_CART_ID_KEY, cartId);

    const data = await cartAPI.getById(cartId);
    
    const cartData = data as { product?: any[]; products?: any[] } | undefined;
    const products: Array<{ idProduct: string; quantity: number; price: number; name?: string }> =
      Array.isArray(cartData?.product) ? cartData.product : 
      Array.isArray(cartData?.products) ? cartData.products : [];


    cartStore.clear();

    products.forEach((p, index) => {
      const localId = `${p.idProduct}-${Date.now()}-${index}`;
      cartStore.addItem({
        id: localId,
        productId: p.idProduct,
        name: p.name || `Producto ${p.idProduct}`,
        price: Number(p.price) || 0,
        quantity: Number(p.quantity) || 1,
      } as any);
    });

    sessionStorage.setItem("cart", JSON.stringify(cartStore.getItems()));
    
    
  } catch (error) {
    console.error("Error al cargar carrito:", error);
    cartStore.clear();
    sessionStorage.removeItem(SHOPPING_CART_ID_KEY);
    sessionStorage.removeItem("cart");
  }
}

export async function ensureCartExists(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") return null;

  const customer = getCustomerIdentifier(user);
  if (!customer) return null;

  try {
    return await findOrCreateCartForCustomer();
  } catch (error) {
    console.error("Error en ensureCartExists:", error);
    return null;
  }
}

export async function clearUserCart(): Promise<void> {
  const user = getCurrentUser();
  const customer = getCustomerIdentifier(user);
  
  cartStore.clear();
  
  sessionStorage.removeItem("cart");
  sessionStorage.removeItem(SHOPPING_CART_ID_KEY);
  
  if (customer) {
    try {
      const cartId = await findCartByCustomerId(customer);
      if (cartId) {
        await cartAPI.delete(cartId);
      }
    } catch (error) {
      console.error("Error al eliminar carrito del backend:", error);
    }
  }
}

export function getCurrentCartInfo(): { 
  hasCart: boolean; 
  cartId: string | null; 
  itemCount: number; 
  total: number; 
} {
  const cartId = sessionStorage.getItem(SHOPPING_CART_ID_KEY);
  const items = cartStore.getItems();
  const total = cartStore.getTotal();
  
  return {
    hasCart: !!cartId,
    cartId,
    itemCount: items.length,
    total
  };
}

export async function initializeCart(): Promise<void> {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") {
    cartStore.clear();
    sessionStorage.removeItem("cart");
    sessionStorage.removeItem(SHOPPING_CART_ID_KEY);
    return;
  }


  try {
    await loadCartForCurrentUser();
  } catch (error) {
    console.error("Error al inicializar carrito:", error);
    
    const localCart = sessionStorage.getItem("cart");
    if (localCart) {
      try {
        const items = JSON.parse(localCart);
        if (Array.isArray(items)) {
          cartStore.clear();
          items.forEach(item => cartStore.addItem(item));
        }
      } catch (parseError) {
        console.error("Error al parsear carrito local:", parseError);
      }
    }
  }
}

export async function syncCart(): Promise<void> {
  const user = getCurrentUser();
  if (!user || user.role !== "customer") return;

  const items = cartStore.getItems();
  if (items.length === 0) {
    try {
      await upsertCartForCurrentUser();
    } catch (error) {
      console.error("Error al sincronizar carrito vacío:", error);
    }
    return;
  }

  try {
    const cartId = await ensureCartExists();
    if (cartId) {
      await upsertCartForCurrentUser();
    }
  } catch (error) {
    console.error("Error al sincronizar carrito:", error);
  }
}