const request = require("supertest");
const express = require("express");
const dbHandler = require("./dbHandler");
const Category = require("../models/category");

jest.mock("../middlewares/basicAuth", () => (req, res, next) => next());

const categoryRoutes = require("../routes/categoryRoutes");

const app = express();
app.use(express.json());
app.use("/api/categories", categoryRoutes);

describe("Category API (BD real)", () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  beforeEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  test("GET /api/categories debe devolver lista vacía", async () => {

    const res = await request(app).get("/api/categories");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("POST /api/categories debe crear una categoría", async () => {

    const newCategory = { categoryID: 1, name: "Electrónica", description: "Productos electrónicos" };

    const res = await request(app).post("/api/categories").send(newCategory);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.name).toBe("Electrónica");

    const found = await Category.findById(res.body._id);
    expect(found).not.toBeNull();
  });

  test("POST /api/categories debe fallar si falta el nombre", async () => {
    const invalidCategory = { categoryID: 2, description: "Sin nombre" };

    const res = await request(app).post("/api/categories").send(invalidCategory);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("GET /api/categories después de crear debe devolver las categorías", async () => {
    await Category.create({ categoryID: 10, name: "Ropa", description: "Ropa y accesorios" });
    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some((c) => c.name === "Ropa")).toBe(true);
  });

  test("GET /api/categories permite múltiples categorías", async () => {

    await Category.create({ categoryID: 20, name: "Deportes", description: "Artículos deportivos" });
    await Category.create({ categoryID: 21, name: "Hogar", description: "Artículos para el hogar" });

    const res = await request(app).get("/api/categories");
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.some((c) => c.name === "Deportes")).toBe(true);
    expect(res.body.some((c) => c.name === "Hogar")).toBe(true);
  });

  test("GET /api/categories/:id debe devolver una categoría específica", async () => {
    // Arrange
    const created = await Category.create({ categoryID: 30, name: "Libros", description: "Libros y revistas" });

    // Act
    const res = await request(app).get(`/api/categories/${created._id}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Libros");
  });

  test("GET /api/categories/:id debe devolver 404 si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act
    const res = await request(app).get(`/api/categories/${fakeId}`);

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  test("PUT /api/categories/:id actualiza la categoría", async () => {
    // Arrange
    const created = await Category.create({ categoryID: 40, name: "Música", description: "Instrumentos" });

    // Act
    const res = await request(app)
      .put(`/api/categories/${created._id}`)
      .send({ name: "Música Actualizada", description: "Instrumentos y discos" });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Música Actualizada");

    // Verificar en BD
    const found = await Category.findById(created._id);
    expect(found.name).toBe("Música Actualizada");
  });

  test("PUT /api/categories/:id debe devolver 404 si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act
    const res = await request(app).put(`/api/categories/${fakeId}`).send({ name: "Test" });

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  test("DELETE /api/categories/:id elimina la categoría", async () => {
    // Arrange
    const created = await Category.create({ categoryID: 50, name: "Juguetes", description: "Juguetes y juegos" });

    // Act
    const res = await request(app).delete(`/api/categories/${created._id}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Category deleted");

    // Verificar que fue eliminada
    const found = await Category.findById(created._id);
    expect(found).toBeNull();
  });

  test("DELETE /api/categories/:id debe devolver 404 si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act
    const res = await request(app).delete(`/api/categories/${fakeId}`);

    // Assert
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  test("GET a una ruta inexistente devuelve 404", async () => {
    // Act
    const res = await request(app).get("/api/unknown");

    // Assert
    expect(res.statusCode).toBe(404);
  });
});
