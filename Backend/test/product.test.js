const request = require("supertest");
const express = require("express");

jest.mock("../services/productService");
jest.mock("../middlewares/basicAuth", () => (req, res, next) => next());

const productService = require("../services/productService");
const productRoutes = require("../routes/productRoutes");

const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);

describe("Rutas de /barroco/products", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test GET /productsAvailable
  test("GET /api/products/productsAvailable debe retornar productos disponibles", async () => {
    const mockProducts = [
      { _id: "1", name: "Producto 1", stock: 5, available: true },
      { _id: "2", name: "Producto 2", stock: 3, available: true },
    ];
    productService.getAvailableProducts.mockResolvedValue(mockProducts);

    const res = await request(app).get("/api/products/productsAvailable");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.every(p => p.available === true)).toBeTruthy();
    expect(productService.getAvailableProducts).toHaveBeenCalledTimes(1);
  });

  // Test GET /productsDiscounted
  test("GET /api/products/productsDiscounted debe retornar productos con descuento", async () => {
    const mockDiscountedProducts = [
      { idProduct: "1", name: "Producto Personalizado", originalPrice: 100, discountedPrice: 90 },
    ];
    productService.getCustomDiscountedProducts.mockResolvedValue(mockDiscountedProducts);

    const res = await request(app).get("/api/products/productsDiscounted");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockDiscountedProducts);
    expect(productService.getCustomDiscountedProducts).toHaveBeenCalledTimes(1);
  });

  // Test POST /:idProduct/purchase
  test("POST /api/products/products/1/purchase debe realizar una compra exitosa", async () => {
    const mockProduct = { _id: "1", name: "Producto 1", stock: 10 };
    productService.purchaseProduct.mockResolvedValue({ ...mockProduct, stock: 8 });

    const res = await request(app)
      .post("/api/products/products/1/purchase")
      .send({ quantity: 2 });

    expect(res.statusCode).toBe(200);
    expect(productService.purchaseProduct).toHaveBeenCalledWith("1", 2);
  });

  // Test GET /
  test("GET /api/products/ debe retornar todos los productos", async () => {
    const mockProducts = [
      { _id: "1", name: "Producto 1" },
      { _id: "2", name: "Producto 2" },
    ];
    productService.getAllProducts.mockResolvedValue(mockProducts);

    const res = await request(app).get("/api/products/");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockProducts);
    expect(productService.getAllProducts).toHaveBeenCalledTimes(1);
  });

  // Test GET /:id
  test("GET /api/products/1 debe retornar un producto existente", async () => {
    const mockProduct = { _id: "1", name: "Producto 1" };
    productService.getProductById.mockResolvedValue(mockProduct);

    const res = await request(app).get("/api/products/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockProduct);
    expect(productService.getProductById).toHaveBeenCalledWith("1");
  });

  test("GET /api/products/999 debe retornar 404 si el producto no existe", async () => {
    productService.getProductById.mockImplementation(() => {
      throw new Error("Producto no encontrado");
    });

    const res = await request(app).get("/api/products/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "Producto no encontrado" });
  });

  // Test POST /
  test("POST /api/products/ debe crear un producto", async () => {
    const newProduct = { name: "Nuevo Producto", price: 100, stock: 10 };
    const createdProduct = { _id: "3", ...newProduct };
    productService.createProduct.mockResolvedValue(createdProduct);

    const res = await request(app)
      .post("/api/products/")
      .send(newProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(createdProduct);
    expect(productService.createProduct).toHaveBeenCalledWith(newProduct);
  });

  // Test PUT /:id
  test("PUT /api/products/1 debe actualizar un producto", async () => {
    const updatedData = { name: "Producto Actualizado", price: 120 };
    const updatedProduct = {
      _id: "1",
      name: "Producto Actualizado",
      price: 120,
      stock: 10
    };
    productService.updateProduct.mockResolvedValue(updatedProduct);

    const res = await request(app)
      .put("/api/products/1")
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(updatedProduct);
    expect(productService.updateProduct).toHaveBeenCalledWith("1", updatedData);
  });

  // Test DELETE /:id
  test("DELETE /api/products/1 debe eliminar un producto", async () => {
    const deletedProduct = { _id: "1" };
    productService.deleteProduct.mockResolvedValue(deletedProduct);

    const res = await request(app).delete("/api/products/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Producto eliminado", product: deletedProduct });
    expect(productService.deleteProduct).toHaveBeenCalledWith("1");
    //expect(productService.deleteProduct).toHaveBeenCalledWith("1");//  
  });

  test("DELETE /api/products/999 debe retornar 404 si el producto no existe", async () => {
    productService.deleteProduct.mockImplementation(() => {
      throw new Error("Producto no encontrado");
    });

    const res = await request(app).delete("/api/products/999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  test("PUT /api/products/999 debe retornar 404 si el producto no existe", async () => {
    productService.updateProduct.mockImplementation(() => {
      throw new Error("Producto no encontrado");
    });

    const res = await request(app)
      .put("/api/products/999")
      .send({ name: "Test" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message");
  });

  test("POST /api/products/ debe manejar errores de validación", async () => {
    productService.createProduct.mockImplementation(() => {
      throw new Error("Validation error");
    });

    const res = await request(app)
      .post("/api/products/")
      .send({ name: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("POST /api/products/products/1/purchase debe manejar cantidad inválida", async () => {
    productService.purchaseProduct.mockImplementation(() => {
      throw new Error("Cantidad inválida");
    });

    const res = await request(app)
      .post("/api/products/products/1/purchase")
      .send({ quantity: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("POST /api/products/products/1/purchase debe manejar stock insuficiente", async () => {
    productService.purchaseProduct.mockImplementation(() => {
      throw new Error("Stock insuficiente");
    });

    const res = await request(app)
      .post("/api/products/products/1/purchase")
      .send({ quantity: 100 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Stock insuficiente");
  });

  test("GET /api/products/productsAvailable debe manejar errores", async () => {
    productService.getAvailableProducts.mockImplementation(() => {
      throw new Error("Database error");
    });

    const res = await request(app).get("/api/products/productsAvailable");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message");
  });

  test("GET /api/products/productsDiscounted debe manejar errores", async () => {
    productService.getCustomDiscountedProducts.mockImplementation(() => {
      throw new Error("Database error");
    });

    const res = await request(app).get("/api/products/productsDiscounted");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message");
  });

  test("GET /api/products/ debe devolver array vacío si no hay productos", async () => {
    productService.getAllProducts.mockResolvedValue([]);

    const res = await request(app).get("/api/products/");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});