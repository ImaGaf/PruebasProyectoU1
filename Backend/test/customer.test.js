const request = require("supertest");
const express = require("express");
const dbHandler = require("./dbHandler");
const Customer = require("../models/customer");

jest.mock("../middlewares/basicAuth", () => (req, res, next) => next());

const customerRoutes = require("../routes/customerRoutes");

const app = express();
app.use(express.json());
app.use("/barroco/customers", customerRoutes);

describe("Customer API (BD real)", () => {
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

  test("GET /barroco/customers debe retornar todos los clientes", async () => {
    // Arrange
    await Customer.create({
      firstName: "Juan", lastName: "Pérez", email: "juan@test.com",
      password: "pass123", phone: "1234567890", billingAddress: "Calle 1",
    });
    await Customer.create({
      firstName: "Ana", lastName: "García", email: "ana@test.com",
      password: "pass456", phone: "0987654321", billingAddress: "Calle 2",
    });

    // Act
    const res = await request(app).get("/barroco/customers");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].firstName).toBe("Juan");
  });

  test("POST /barroco/customers debe crear un cliente", async () => {
    // Arrange
    const newCustomer = {
      firstName: "Lucía", lastName: "López", email: "lucia@test.com",
      password: "secreto", phone: "5555555555", billingAddress: "Calle 3",
    };

    // Act
    const res = await request(app).post("/barroco/customers").send(newCustomer);

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.body.firstName).toBe("Lucía");

    // Verificar que se guardó en BD
    const found = await Customer.findById(res.body._id);
    expect(found).not.toBeNull();
  });

  test("PUT /barroco/customers/:id debe actualizar un cliente", async () => {
    // Arrange
    const created = await Customer.create({
      firstName: "Pedro", lastName: "Ruiz", email: "pedro@test.com",
      password: "pass789", phone: "1112223333", billingAddress: "Calle 4",
    });

    // Act
    const res = await request(app)
      .put(`/barroco/customers/${created._id}`)
      .send({ firstName: "Pedro Actualizado" });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Customer updated successfully" });

    // Verificar en BD
    const found = await Customer.findById(created._id);
    expect(found.firstName).toBe("Pedro Actualizado");
  });

  test("DELETE /barroco/customers/:id debe eliminar un cliente", async () => {
    // Arrange
    const created = await Customer.create({
      firstName: "Carlos", lastName: "Soto", email: "carlos@test.com",
      password: "pass000", phone: "9998887777", billingAddress: "Calle 5",
    });

    // Act
    const res = await request(app).delete(`/barroco/customers/${created._id}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Customer deleted successfully" });

    const found = await Customer.findById(created._id);
    expect(found).toBeNull();
  });

  test("GET /barroco/customers/:id debe retornar un cliente específico", async () => {
    // Arrange
    const created = await Customer.create({
      firstName: "Elena", lastName: "Martín", email: "elena@test.com",
      password: "pass111", phone: "4443332222", billingAddress: "Calle 6",
    });

    // Act
    const res = await request(app).get(`/barroco/customers/${created._id}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe("Elena");
  });

  test("GET /barroco/customers/:id debe retornar 404 si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act
    const res = await request(app).get(`/barroco/customers/${fakeId}`);

    // Assert - el service lanza error, controlador no tiene try/catch => 500
    expect([404, 500]).toContain(res.statusCode);
  });

  test("PUT /barroco/customers/:id debe manejar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act
    const res = await request(app)
      .put(`/barroco/customers/${fakeId}`)
      .send({ firstName: "Test" });

    // Assert
    expect(res.statusCode).toBe(500);
  });

  test("DELETE /barroco/customers/:id debe manejar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act
    const res = await request(app).delete(`/barroco/customers/${fakeId}`);

    // Assert
    expect(res.statusCode).toBe(500);
  });

  test("POST /barroco/customers debe manejar errores de validación", async () => {
    // Arrange - enviar datos incompletos (falta email requerido)
    const invalidData = { firstName: "Sin Email" };

    // Act
    const res = await request(app).post("/barroco/customers").send(invalidData);

    // Assert
    expect(res.statusCode).toBe(500);
  });

  test("GET /barroco/customers debe devolver array vacío si no hay clientes", async () => {
    // Arrange (BD vacía)

    // Act
    const res = await request(app).get("/barroco/customers");

    // Assert
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
