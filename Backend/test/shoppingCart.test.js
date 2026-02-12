const request = require("supertest");
const express = require("express");
const dbHandler = require("./dbHandler");
const ShoppingCart = require("../models/shoppingCart");

jest.mock("../middlewares/basicAuth", () => (req, res, next) => next());

const shoppingCartRoutes = require("../routes/shoppingCartRoutes");

const app = express();
app.use(express.json());
app.use("/api/cart", shoppingCartRoutes);

describe("ShoppingCart API (BD real)", () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  test("GET /api/cart debe devolver lista vacía", async () => {
    // Arrange (BD vacía)

    // Act
    const res = await request(app).get("/api/cart");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("POST /api/cart debe crear un carrito", async () => {
    // Arrange
    const newCart = {
      customer: "dennison",
      products: [{ idProduct: "prod1", quantity: 2, price: 10 }],
      total: 20,
    };

    // Act
    const res = await request(app).post("/api/cart").send(newCart);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("idShoppingCart");
    expect(res.body.customer).toBe("dennison");

    // Verificar en BD
    const found = await ShoppingCart.findOne({ idShoppingCart: res.body.idShoppingCart });
    expect(found).not.toBeNull();
  });

  test("POST /api/cart debe fallar si falta el cliente", async () => {
    // Arrange
    const invalidCart = {
      products: [{ idProduct: "prod1", quantity: 2, price: 10 }],
      total: 20,
    };

    // Act
    const res = await request(app).post("/api/cart").send(invalidCart);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /api/cart después de crear un carrito debe devolverlo", async () => {
    // Arrange
    await ShoppingCart.create({
      customer: "Ana",
      products: [{ idProduct: "prod2", quantity: 1, price: 15 }],
      total: 15,
    });

    // Act
    const res = await request(app).get("/api/cart");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some((c) => c.customer === "Ana")).toBe(true);
  });

  test("POST /api/cart permite múltiples carritos", async () => {
    // Arrange
    await ShoppingCart.create({
      customer: "Luis",
      products: [{ idProduct: "prod3", quantity: 1, price: 5 }],
      total: 5,
    });
    await ShoppingCart.create({
      customer: "Maria",
      products: [{ idProduct: "prod4", quantity: 3, price: 7 }],
      total: 21,
    });

    // Act
    const res = await request(app).get("/api/cart");

    // Assert
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.some((c) => c.customer === "Luis")).toBe(true);
    expect(res.body.some((c) => c.customer === "Maria")).toBe(true);
  });

  test("POST /api/cart debe fallar si falta el total", async () => {
    // Arrange
    const invalidCart = {
      customer: "Juan",
      products: [{ idProduct: "prod5", quantity: 1, price: 10 }],
    };

    // Act
    const res = await request(app).post("/api/cart").send(invalidCart);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("GET a una ruta inexistente devuelve 404", async () => {
    // Act
    const res = await request(app).get("/api/unknown");

    // Assert
    expect(res.statusCode).toBe(404);
  });

  test("PUT /api/cart/:id actualiza el carrito", async () => {
    // Arrange
    const created = await ShoppingCart.create({
      customer: "Pedro",
      products: [{ idProduct: "prod6", quantity: 1, price: 8 }],
      total: 8,
    });

    // Act
    const res = await request(app)
      .put(`/api/cart/${created.idShoppingCart}`)
      .send({ total: 16 });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(16);

    // Verificar en BD
    const found = await ShoppingCart.findOne({ idShoppingCart: created.idShoppingCart });
    expect(found.total).toBe(16);
  });

  test("DELETE /api/cart/:id elimina el carrito", async () => {
    // Arrange
    const created = await ShoppingCart.create({
      customer: "Carlos",
      products: [{ idProduct: "prod7", quantity: 2, price: 12 }],
      total: 24,
    });

    // Act
    const res = await request(app).delete(`/api/cart/${created.idShoppingCart}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");

    const found = await ShoppingCart.findOne({ idShoppingCart: created.idShoppingCart });
    expect(found).toBeNull();
  });

  test("GET /api/cart/:id debe devolver un carrito específico", async () => {
    // Arrange
    const created = await ShoppingCart.create({
      customer: "Sofia",
      products: [{ idProduct: "prod8", quantity: 1, price: 30 }],
      total: 30,
    });

    // Act
    const res = await request(app).get(`/api/cart/${created.idShoppingCart}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.customer).toBe("Sofia");
  });

  test("GET /api/cart/:id debe devolver 404 si no existe", async () => {
    // Act
    const res = await request(app).get("/api/cart/99999");

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("PUT /api/cart/:id debe devolver 404 si no existe", async () => {
    // Act
    const res = await request(app).put("/api/cart/99999").send({ total: 50 });

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("DELETE /api/cart/:id debe devolver 404 si no existe", async () => {
    // Act
    const res = await request(app).delete("/api/cart/99999");

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /api/cart debe crear carrito con múltiples productos", async () => {
    // Arrange
    const newCart = {
      customer: "Ricardo",
      products: [
        { idProduct: "prod9", quantity: 2, price: 10 },
        { idProduct: "prod10", quantity: 1, price: 20 },
        { idProduct: "prod11", quantity: 3, price: 5 },
      ],
      total: 55,
    };

    // Act
    const res = await request(app).post("/api/cart").send(newCart);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.products.length).toBe(3);
    expect(res.body.total).toBe(55);
  });

  test("PUT /api/cart/:id debe actualizar productos del carrito", async () => {
    // Arrange
    const created = await ShoppingCart.create({
      customer: "Elena",
      products: [{ idProduct: "prod12", quantity: 1, price: 8 }],
      total: 8,
    });

    // Act
    const res = await request(app)
      .put(`/api/cart/${created.idShoppingCart}`)
      .send({
        products: [{ idProduct: "prod12", quantity: 5, price: 8 }],
        total: 40,
      });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.products[0].quantity).toBe(5);
    expect(res.body.total).toBe(40);
  });

  test("GET /api/cart/customer/:customerId debe devolver carrito por cliente", async () => {
    // Arrange
    await ShoppingCart.create({
      customer: "cliente123",
      products: [{ idProduct: "prod13", quantity: 2, price: 25 }],
      total: 50,
    });

    // Act
    const res = await request(app).get("/api/cart/customer/cliente123");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.customer).toBe("cliente123");
  });

  test("GET /api/cart/customer/:customerId debe devolver 404 si no existe", async () => {
    // Act
    const res = await request(app).get("/api/cart/customer/noexiste");

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("POST /api/cart debe crear carrito con total 0", async () => {
    // Arrange
    const newCart = {
      customer: "Gratis",
      products: [{ idProduct: "prod14", quantity: 1, price: 0 }],
      total: 0,
    };

    // Act
    const res = await request(app).post("/api/cart").send(newCart);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.total).toBe(0);
  });

  test("PUT /api/cart/:id debe actualizar solo el total", async () => {
    // Arrange
    const created = await ShoppingCart.create({
      customer: "Pedro",
      products: [{ idProduct: "prod6", quantity: 1, price: 8 }],
      total: 8,
    });

    // Act
    const res = await request(app)
      .put(`/api/cart/${created.idShoppingCart}`)
      .send({ total: 20 });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(20);
  });
});
