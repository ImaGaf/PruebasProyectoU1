const request = require("supertest");
const express = require("express");
const dbHandler = require("./dbHandler");
const Product = require("../models/product");

jest.mock("../middlewares/basicAuth", () => (req, res, next) => next());

const productRoutes = require("../routes/productRoutes");

const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);

describe("Product API (BD real)", () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  // --- GET /productsAvailable ---
  test("GET /api/products/productsAvailable debe retornar productos disponibles", async () => {
    // Arrange
    await Product.create({ idProduct: "P001", name: "Producto 1", stock: 5, price: 10 });
    await Product.create({ idProduct: "P002", name: "Producto 2", stock: 0, price: 20 });

    // Act
    const res = await request(app).get("/api/products/productsAvailable");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Producto 1");
  });

  // --- GET /productsDiscounted ---
  test("GET /api/products/productsDiscounted debe retornar productos con descuento", async () => {
    // Arrange
    await Product.create({
      idProduct: "P010", name: "Custom Producto", price: 100, stock: 10, custom: true,
    });

    // Act
    const res = await request(app).get("/api/products/productsDiscounted");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].discountedPrice).toBe(90);
  });

  // --- POST /:idProduct/purchase ---
  test("POST /api/products/products/P020/purchase debe realizar compra exitosa", async () => {
    // Arrange
    await Product.create({ idProduct: "P020", name: "Laptop", stock: 10, price: 500 });

    // Act
    const res = await request(app)
      .post("/api/products/products/P020/purchase")
      .send({ quantity: 2 });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Compra realizada con éxito");
    expect(res.body.totalPrice).toBe(1000);

    // Verificar stock en BD
    const found = await Product.findOne({ idProduct: "P020" });
    expect(found.stock).toBe(8);
  });

  // --- GET / ---
  test("GET /api/products/ debe retornar todos los productos", async () => {
    // Arrange
    await Product.create({ idProduct: "P030", name: "Producto A", price: 10, stock: 5 });
    await Product.create({ idProduct: "P031", name: "Producto B", price: 20, stock: 3 });

    // Act
    const res = await request(app).get("/api/products/");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  // --- GET /:id ---
  test("GET /api/products/:id debe retornar un producto existente", async () => {
    // Arrange
    const created = await Product.create({ idProduct: "P040", name: "Mouse", price: 25, stock: 50 });

    // Act
    const res = await request(app).get(`/api/products/${created._id}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Mouse");
  });

  test("GET /api/products/:id debe retornar 404 si el producto no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act
    const res = await request(app).get(`/api/products/${fakeId}`);

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Producto no encontrado" });
  });

  // --- POST / ---
  test("POST /api/products/ debe crear un producto", async () => {
    // Arrange
    const newProduct = { idProduct: "P050", name: "Teclado", price: 60, stock: 20 };

    // Act
    const res = await request(app).post("/api/products/").send(newProduct);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Teclado");

    const found = await Product.findById(res.body._id);
    expect(found).not.toBeNull();
  });

  // --- PUT /:id ---
  test("PUT /api/products/:id debe actualizar un producto", async () => {
    // Arrange
    const created = await Product.create({ idProduct: "P060", name: "Monitor", price: 300, stock: 10 });

    // Act
    const res = await request(app)
      .put(`/api/products/${created._id}`)
      .send({ name: "Monitor Actualizado", price: 280 });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Monitor Actualizado");
    expect(res.body.price).toBe(280);
  });

  // --- DELETE /:id ---
  test("DELETE /api/products/:id debe eliminar un producto", async () => {
    // Arrange
    const created = await Product.create({ idProduct: "P070", name: "Cable", price: 10, stock: 100 });

    // Act
    const res = await request(app).delete(`/api/products/${created._id}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Producto eliminado", product: expect.objectContaining({ name: "Cable" }) });

    const found = await Product.findById(created._id);
    expect(found).toBeNull();
  });

  test("DELETE /api/products/:id debe retornar 404 si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act
    const res = await request(app).delete(`/api/products/${fakeId}`);

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  test("PUT /api/products/:id debe retornar 404 si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act
    const res = await request(app).put(`/api/products/${fakeId}`).send({ name: "Test" });

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  test("POST /api/products/ debe manejar errores de validación", async () => {
    // Arrange - falta idProduct requerido
    const invalidProduct = { name: "Sin ID" };

    // Act
    const res = await request(app).post("/api/products/").send(invalidProduct);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("POST /api/products/products/P999/purchase debe manejar cantidad inválida", async () => {
    // Arrange
    await Product.create({ idProduct: "P999", name: "Test", price: 10, stock: 5 });

    // Act
    const res = await request(app)
      .post("/api/products/products/P999/purchase")
      .send({ quantity: 0 });

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("POST /api/products/products/P100/purchase debe manejar stock insuficiente", async () => {
    // Arrange
    await Product.create({ idProduct: "P100", name: "Escaso", price: 50, stock: 2 });

    // Act
    const res = await request(app)
      .post("/api/products/products/P100/purchase")
      .send({ quantity: 100 });

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Stock insuficiente");
  });

  test("GET /api/products/productsAvailable debe manejar array vacío", async () => {
    // Arrange (BD vacía)

    // Act
    const res = await request(app).get("/api/products/productsAvailable");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("GET /api/products/productsDiscounted debe manejar array vacío", async () => {
    // Arrange (BD vacía)

    // Act
    const res = await request(app).get("/api/products/productsDiscounted");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("GET /api/products/ debe devolver array vacío si no hay productos", async () => {
    // Arrange (BD vacía)

    // Act
    const res = await request(app).get("/api/products/");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
