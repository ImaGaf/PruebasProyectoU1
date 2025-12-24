const request = require("supertest");
const express = require("express");

jest.mock("../services/customerService");
jest.mock("../middlewares/basicAuth", () => (req, res, next) => next());

const customerService = require("../services/customerService");
const customerRoutes = require("../routes/customerRoutes");

const app = express();
app.use(express.json());
app.use("/barroco/customers", customerRoutes);

describe("Rutas de /barroco/customers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /barroco/customers debe retornar todos los clientes", async () => {
    const mockCustomers = [
      { _id: "1", name: "Juan" },
      { _id: "2", name: "Ana" },
    ];
    customerService.findAll.mockResolvedValue(mockCustomers);

    const res = await request(app).get("/barroco/customers");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockCustomers);
    expect(customerService.findAll).toHaveBeenCalledTimes(1);
  });

  test("POST /barroco/customers debe crear un cliente", async () => {
    const newCustomer = { name: "Lucía" };
    const createdCustomer = { _id: "3", ...newCustomer };
    customerService.create.mockResolvedValue(createdCustomer);

    const res = await request(app)
      .post("/barroco/customers")
      .send(newCustomer);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(createdCustomer);
    expect(customerService.create).toHaveBeenCalledWith(newCustomer);
  });

  test("PUT /barroco/customers/:id debe actualizar un cliente", async () => {
    customerService.update.mockResolvedValue({
      _id: "1",
      name: "Pedro Actualizado",
    });

    const res = await request(app)
      .put("/barroco/customers/1")
      .send({ name: "Pedro Actualizado" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Customer updated successfully" });
    expect(customerService.update).toHaveBeenCalledWith("1", {
      name: "Pedro Actualizado",
    });
  });

  test("DELETE /barroco/customers/:id debe eliminar un cliente", async () => {
    customerService.remove.mockResolvedValue({ _id: "1" });

    const res = await request(app).delete("/barroco/customers/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Customer deleted successfully" });
    expect(customerService.remove).toHaveBeenCalledWith("1");
  });

  test("GET /barroco/customers/:id debe retornar un cliente específico", async () => {
    const mockCustomer = { _id: "1", name: "Juan", email: "juan@test.com" };
    customerService.findById = jest.fn().mockResolvedValue(mockCustomer);

    const res = await request(app).get("/barroco/customers/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockCustomer);
    expect(customerService.findById).toHaveBeenCalledWith("1");
  });

  test("GET /barroco/customers/:id debe retornar 404 si no existe", async () => {
    customerService.findById = jest.fn().mockResolvedValue(null);

    const res = await request(app).get("/barroco/customers/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  test("PUT /barroco/customers/:id debe manejar error si no existe", async () => {
    customerService.update.mockRejectedValue(new Error("Customer not found"));

    const res = await request(app)
      .put("/barroco/customers/999")
      .send({ name: "Test" });

    expect(res.statusCode).toBe(500);
  });

  test("DELETE /barroco/customers/:id debe manejar error si no existe", async () => {
    customerService.remove.mockRejectedValue(new Error("Customer not found"));

    const res = await request(app).delete("/barroco/customers/999");

    expect(res.statusCode).toBe(500);
  });

  test("POST /barroco/customers debe manejar errores de validación", async () => {
    customerService.create.mockRejectedValue(new Error("Validation error"));

    const res = await request(app)
      .post("/barroco/customers")
      .send({ name: "" });

    expect(res.statusCode).toBe(500);
  });

  test("GET /barroco/customers debe devolver array vacío si no hay clientes", async () => {
    customerService.findAll.mockResolvedValue([]);

    const res = await request(app).get("/barroco/customers");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
