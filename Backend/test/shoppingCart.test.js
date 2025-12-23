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

  test('GET /api/cart/:id debe devolver un carrito específico', async () => {
    const mockCart = { 
      idShoppingCart: 1, 
      customer: 'Sofia', 
      products: [{ idProduct: 'prod8', quantity: 1, price: 30 }], 
      total: 30 
    };
    shoppingCartService.getShoppingCartById.mockResolvedValue(mockCart);
    
    const res = await request(app).get('/api/cart/1');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.idShoppingCart).toBe(1);
    expect(res.body.customer).toBe('Sofia');
    expect(shoppingCartService.getShoppingCartById).toHaveBeenCalledWith('1');
  });

  test('GET /api/cart/:id debe devolver 404 si no existe', async () => {
    shoppingCartService.getShoppingCartById.mockResolvedValue(null);
    
    const res = await request(app).get('/api/cart/999');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /api/cart/:id debe devolver 404 si no existe', async () => {
    shoppingCartService.updateShoppingCart.mockResolvedValue(null);
    
    const res = await request(app).put('/api/cart/999').send({ total: 50 });
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /api/cart/:id debe devolver 404 si no existe', async () => {
    shoppingCartService.deleteShoppingCart.mockResolvedValue(null);
    
    const res = await request(app).delete('/api/cart/999');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/cart debe crear carrito con múltiples productos', async () => {
    const newCart = {
      customer: 'Ricardo',
      products: [
        { idProduct: 'prod9', quantity: 2, price: 10 },
        { idProduct: 'prod10', quantity: 1, price: 20 },
        { idProduct: 'prod11', quantity: 3, price: 5 }
      ],
      total: 55
    };
    const createdCart = { idShoppingCart: 5, ...newCart };
    shoppingCartService.createShoppingCart.mockResolvedValue(createdCart);
    
    const res = await request(app).post('/api/cart').send(newCart);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.products.length).toBe(3);
    expect(res.body.total).toBe(55);
  });

  test('PUT /api/cart/:id debe actualizar productos del carrito', async () => {
    const updatedCart = { 
      idShoppingCart: 2, 
      customer: 'Elena', 
      products: [
        { idProduct: 'prod12', quantity: 5, price: 8 }
      ], 
      total: 40 
    };
    shoppingCartService.updateShoppingCart.mockResolvedValue(updatedCart);
    
    const res = await request(app).put('/api/cart/2').send({ 
      products: [{ idProduct: 'prod12', quantity: 5, price: 8 }],
      total: 40 
    });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.products[0].quantity).toBe(5);
    expect(res.body.total).toBe(40);
  });

  test('GET /api/cart/customer/:customerId debe devolver carrito por cliente', async () => {
    const mockCart = { 
      idShoppingCart: 3, 
      customer: 'cliente123', 
      products: [{ idProduct: 'prod13', quantity: 2, price: 25 }], 
      total: 50 
    };
    shoppingCartService.getShoppingCartByCustomer.mockResolvedValue(mockCart);
    
    const res = await request(app).get('/api/cart/customer/cliente123');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.customer).toBe('cliente123');
    expect(shoppingCartService.getShoppingCartByCustomer).toHaveBeenCalledWith('cliente123');
  });

  test('GET /api/cart/customer/:customerId debe devolver 404 si no existe', async () => {
    shoppingCartService.getShoppingCartByCustomer.mockResolvedValue(null);
    
    const res = await request(app).get('/api/cart/customer/noexiste');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/cart debe fallar si productos está vacío', async () => {
    const invalidCart = { 
      customer: 'Pablo', 
      products: [], 
      total: 0 
    };
    shoppingCartService.createShoppingCart.mockRejectedValue(
      new Error('products cannot be empty')
    );
    
    const res = await request(app).post('/api/cart').send(invalidCart);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/cart debe crear carrito con total 0', async () => {
    const newCart = {
      customer: 'Gratis',
      products: [{ idProduct: 'prod14', quantity: 1, price: 0 }],
      total: 0
    };
    const createdCart = { idShoppingCart: 6, ...newCart };
    shoppingCartService.createShoppingCart.mockResolvedValue(createdCart);
    
    const res = await request(app).post('/api/cart').send(newCart);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.total).toBe(0);
  });

  test('PUT /api/cart/:id debe actualizar solo el total', async () => {
    const updatedCart = { 
      idShoppingCart: 1, 
      customer: 'Pedro', 
      products: [{ idProduct: 'prod6', quantity: 1, price: 8 }], 
      total: 20 
    };
    shoppingCartService.updateShoppingCart.mockResolvedValue(updatedCart);
    
    const res = await request(app).put('/api/cart/1').send({ total: 20 });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(20);
  });
});