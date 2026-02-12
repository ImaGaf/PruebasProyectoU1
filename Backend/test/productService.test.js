const dbHandler = require("./dbHandler");
const productService = require("../services/productService");
const Product = require("../models/product");

describe("ProductService (BD real)", () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  // --- getAllProducts ---
  test("getAllProducts debe retornar todos los productos", async () => {
    // Arrange
    await Product.create({ idProduct: "P001", name: "Laptop", price: 1000, stock: 5 });
    await Product.create({ idProduct: "P002", name: "Mouse", price: 25, stock: 50 });

    // Act
    const result = await productService.getAllProducts();

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Laptop");
  });

  // --- getProductById ---
  test("getProductById debe retornar un producto existente", async () => {
    // Arrange
    const created = await Product.create({ idProduct: "P010", name: "Teclado", price: 60, stock: 20 });

    // Act
    const result = await productService.getProductById(created._id);

    // Assert
    expect(result.name).toBe("Teclado");
    expect(result.price).toBe(60);
  });

  test("getProductById debe lanzar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act & Assert
    await expect(productService.getProductById(fakeId)).rejects.toThrow("Producto no encontrado");
  });

  // --- createProduct ---
  test("createProduct debe crear y guardar en la BD", async () => {
    // Arrange
    const data = { idProduct: "P020", name: "Monitor", price: 300, stock: 10 };

    // Act
    const result = await productService.createProduct(data);

    // Assert
    expect(result._id).toBeDefined();
    expect(result.name).toBe("Monitor");

    const found = await Product.findById(result._id);
    expect(found).not.toBeNull();
  });

  // --- updateProduct ---
  test("updateProduct debe actualizar en la BD", async () => {
    // Arrange
    const created = await Product.create({ idProduct: "P030", name: "Auriculares", price: 50, stock: 30 });

    // Act
    const result = await productService.updateProduct(created._id, { price: 45 });

    // Assert
    expect(result.price).toBe(45);

    const found = await Product.findById(created._id);
    expect(found.price).toBe(45);
  });

  test("updateProduct debe lanzar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act & Assert
    await expect(productService.updateProduct(fakeId, { price: 10 })).rejects.toThrow("Producto no encontrado");
  });

  // --- deleteProduct ---
  test("deleteProduct debe eliminar de la BD", async () => {
    // Arrange
    const created = await Product.create({ idProduct: "P040", name: "Cable USB", price: 10, stock: 100 });

    // Act
    const result = await productService.deleteProduct(created._id);

    // Assert
    expect(result.name).toBe("Cable USB");

    const found = await Product.findById(created._id);
    expect(found).toBeNull();
  });

  test("deleteProduct debe lanzar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act & Assert
    await expect(productService.deleteProduct(fakeId)).rejects.toThrow("Producto no encontrado");
  });

  // --- getAvailableProducts ---
  test("getAvailableProducts debe retornar solo productos con stock > 0", async () => {
    // Arrange
    await Product.create({ idProduct: "P050", name: "Con Stock", price: 20, stock: 5 });
    await Product.create({ idProduct: "P051", name: "Sin Stock", price: 15, stock: 0 });

    // Act
    const result = await productService.getAvailableProducts();

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Con Stock");
  });

  // --- getCustomDiscountedProducts ---
  test("getCustomDiscountedProducts debe retornar productos custom con 10% descuento", async () => {
    // Arrange
    await Product.create({
      idProduct: "P060", name: "Producto Custom", description: "Desc",
      price: 100, stock: 10, cathegory: "cat1", custom: true
    });
    await Product.create({
      idProduct: "P061", name: "Producto Normal", price: 50, stock: 5, custom: false
    });

    // Act
    const result = await productService.getCustomDiscountedProducts();

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].originalPrice).toBe(100);
    expect(result[0].discountedPrice).toBe(90);
    expect(result[0].name).toBe("Producto Custom");
  });

  test("getCustomDiscountedProducts retorna array vacío si no hay custom", async () => {
    // Arrange
    await Product.create({ idProduct: "P070", name: "Normal", price: 30, stock: 5, custom: false });

    // Act
    const result = await productService.getCustomDiscountedProducts();

    // Assert
    expect(result).toEqual([]);
  });

  // --- purchaseProduct ---
  test("purchaseProduct debe reducir stock y retornar info de compra", async () => {
    // Arrange
    await Product.create({ idProduct: "P080", name: "Camiseta", price: 25, stock: 10 });

    // Act
    const result = await productService.purchaseProduct("P080", 3);

    // Assert
    expect(result.message).toBe("Compra realizada con éxito");
    expect(result.product).toBe("Camiseta");
    expect(result.quantity).toBe(3);
    expect(result.totalPrice).toBe(75);

    // Verificar que el stock se redujo en la BD
    const found = await Product.findOne({ idProduct: "P080" });
    expect(found.stock).toBe(7);
  });

  test("purchaseProduct debe lanzar error si cantidad es 0", async () => {
    // Arrange (no necesita producto)

    // Act & Assert
    await expect(productService.purchaseProduct("P080", 0)).rejects.toThrow("Cantidad inválida");
  });

  test("purchaseProduct debe lanzar error si cantidad es negativa", async () => {
    // Act & Assert
    await expect(productService.purchaseProduct("P080", -1)).rejects.toThrow("Cantidad inválida");
  });

  test("purchaseProduct debe lanzar error si cantidad es null", async () => {
    // Act & Assert
    await expect(productService.purchaseProduct("P080", null)).rejects.toThrow("Cantidad inválida");
  });

  test("purchaseProduct debe lanzar error si producto no existe", async () => {
    // Act & Assert
    await expect(productService.purchaseProduct("NOEXISTE", 1)).rejects.toThrow("Producto no encontrado");
  });

  test("purchaseProduct debe lanzar error si stock insuficiente", async () => {
    // Arrange
    await Product.create({ idProduct: "P090", name: "Escaso", price: 50, stock: 2 });

    // Act & Assert
    await expect(productService.purchaseProduct("P090", 5)).rejects.toThrow("Stock insuficiente");
  });
});
