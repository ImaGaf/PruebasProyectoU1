const request = require("supertest");
const express = require("express");

jest.mock("../services/shoppingCartService");
jest.mock("../middlewares/basicAuth", () => (req, res, next) => next());

const shoppingCartService = require("../services/shoppingCartService");
const shoppingCartRoutes = require("../routes/shoppingCartRoutes");

const app = express();
app.use(express.json());
app.use("/api/cart", shoppingCartRoutes);

describe('ShoppingCart API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/cart debe devolver lista vacía', async () => {
    shoppingCartService.getAllShoppingCarts.mockResolvedValue([]);
    
    const res = await request(app).get('/api/cart');
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
    expect(shoppingCartService.getAllShoppingCarts).toHaveBeenCalledTimes(1);
  });

  test('POST /api/cart debe crear un carrito', async () => {
    const newCart = {
      customer: 'dennison',
      products: [{ idProduct: 'prod1', quantity: 2, price: 10 }],
      total: 20
    };
    const createdCart = { idShoppingCart: 1, ...newCart };
    shoppingCartService.createShoppingCart.mockResolvedValue(createdCart);
    
    const res = await request(app).post('/api/cart').send(newCart);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('idShoppingCart');
    expect(res.body.customer).toBe('dennison');
    expect(shoppingCartService.createShoppingCart).toHaveBeenCalledWith(newCart);
  });

  test('POST /api/cart debe fallar si falta el cliente', async () => {
    const invalidCart = { 
      products: [{ idProduct: 'prod1', quantity: 2, price: 10 }], 
      total: 20 
    };
    shoppingCartService.createShoppingCart.mockRejectedValue(
      new Error('customer is required')
    );
    
    const res = await request(app).post('/api/cart').send(invalidCart);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /api/cart después de crear un carrito debe devolverlo', async () => {
    const mockCarts = [
      { idShoppingCart: 1, customer: 'Ana', products: [{ idProduct: 'prod2', quantity: 1, price: 15 }], total: 15 }
    ];
    shoppingCartService.getAllShoppingCarts.mockResolvedValue(mockCarts);
    
    const res = await request(app).get('/api/cart');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some(c => c.customer === 'Ana')).toBe(true);
  });

  test('POST /api/cart permite múltiples carritos', async () => {
    const mockCarts = [
      { idShoppingCart: 1, customer: 'Luis', products: [{ idProduct: 'prod3', quantity: 1, price: 5 }], total: 5 },
      { idShoppingCart: 2, customer: 'Maria', products: [{ idProduct: 'prod4', quantity: 3, price: 7 }], total: 21 }
    ];
    shoppingCartService.getAllShoppingCarts.mockResolvedValue(mockCarts);
    
    const res = await request(app).get('/api/cart');
    
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.some(c => c.customer === 'Luis')).toBe(true);
    expect(res.body.some(c => c.customer === 'Maria')).toBe(true);
  });

  test('POST /api/cart debe fallar si total está vacío', async () => {
    const invalidCart = { 
      customer: 'Juan', 
      products: [{ idProduct: 'prod5', quantity: 1, price: 10 }] 
    };
    shoppingCartService.createShoppingCart.mockRejectedValue(
      new Error('total is required')
    );
    
    const res = await request(app).post('/api/cart').send(invalidCart);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET a una ruta inexistente devuelve 404', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toBe(404);
  });

  test('PUT /api/cart/:id actualiza el carrito', async () => {
    const updatedCart = { 
      idShoppingCart: 1, 
      customer: 'Pedro', 
      products: [{ idProduct: 'prod6', quantity: 1, price: 8 }], 
      total: 16 
    };
    shoppingCartService.updateShoppingCart.mockResolvedValue(updatedCart);
    
    const res = await request(app).put('/api/cart/1').send({ total: 16 });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(16);
    expect(shoppingCartService.updateShoppingCart).toHaveBeenCalledWith('1', { total: 16 });
  });

  test('DELETE /api/cart/:id elimina el carrito', async () => {
    const deletedCart = { 
      idShoppingCart: 1, 
      customer: 'Carlos', 
      products: [{ idProduct: 'prod7', quantity: 2, price: 12 }], 
      total: 24 
    };
    shoppingCartService.deleteShoppingCart.mockResolvedValue(deletedCart);
    
    const res = await request(app).delete('/api/cart/1');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(shoppingCartService.deleteShoppingCart).toHaveBeenCalledWith('1');
  });
});