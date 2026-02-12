const dbHandler = require("./dbHandler");
const shoppingCartService = require("../services/shoppingCartService");
const ShoppingCart = require("../models/shoppingCart");

describe("ShoppingCartService (BD real)", () => {
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

  // --- createShoppingCart ---
  test("createShoppingCart debe crear y guardar un carrito en la BD", async () => {
    // Arrange
    const data = {
      customer: "Juan",
      products: [{ idProduct: "P1", quantity: 2, price: 10 }],
      total: 20,
    };

    // Act
    const result = await shoppingCartService.createShoppingCart(data);

    // Assert
    expect(result._id).toBeDefined();
    expect(result.customer).toBe("Juan");
    expect(result.total).toBe(20);
    expect(result.idShoppingCart).toBeDefined();
  });

  // --- getAllShoppingCarts ---
  test("getAllShoppingCarts debe retornar todos los carritos", async () => {
    // Arrange
    await ShoppingCart.create({
      customer: "Ana", products: [{ idProduct: "P2", quantity: 1, price: 15 }], total: 15,
    });
    await ShoppingCart.create({
      customer: "Luis", products: [{ idProduct: "P3", quantity: 3, price: 5 }], total: 15,
    });

    // Act
    const result = await shoppingCartService.getAllShoppingCarts();

    // Assert
    expect(result).toHaveLength(2);
  });

  // --- getShoppingCartById ---
  test("getShoppingCartById debe retornar un carrito existente", async () => {
    // Arrange
    const created = await ShoppingCart.create({
      customer: "Pedro", products: [{ idProduct: "P4", quantity: 1, price: 30 }], total: 30,
    });

    // Act
    const result = await shoppingCartService.getShoppingCartById(created.idShoppingCart);

    // Assert
    expect(result).not.toBeNull();
    expect(result.customer).toBe("Pedro");
    expect(result.total).toBe(30);
  });

  test("getShoppingCartById debe retornar null si no existe", async () => {
    // Arrange (no crear nada)

    // Act
    const result = await shoppingCartService.getShoppingCartById(99999);

    // Assert
    expect(result).toBeNull();
  });

  // --- updateShoppingCart ---
  test("updateShoppingCart debe actualizar en la BD", async () => {
    // Arrange
    const created = await ShoppingCart.create({
      customer: "Elena", products: [{ idProduct: "P5", quantity: 2, price: 10 }], total: 20,
    });

    // Act
    const result = await shoppingCartService.updateShoppingCart(created.idShoppingCart, { total: 50 });

    // Assert
    expect(result.total).toBe(50);

    // Verificar en la BD
    const found = await ShoppingCart.findOne({ idShoppingCart: created.idShoppingCart });
    expect(found.total).toBe(50);
  });

  test("updateShoppingCart debe retornar null si no existe", async () => {
    // Act
    const result = await shoppingCartService.updateShoppingCart(99999, { total: 50 });

    // Assert
    expect(result).toBeNull();
  });

  // --- deleteShoppingCart ---
  test("deleteShoppingCart debe eliminar de la BD", async () => {
    // Arrange
    const created = await ShoppingCart.create({
      customer: "Carlos", products: [{ idProduct: "P6", quantity: 1, price: 25 }], total: 25,
    });

    // Act
    const result = await shoppingCartService.deleteShoppingCart(created.idShoppingCart);

    // Assert
    expect(result.customer).toBe("Carlos");

    // Verificar que ya no existe
    const found = await ShoppingCart.findOne({ idShoppingCart: created.idShoppingCart });
    expect(found).toBeNull();
  });

  test("deleteShoppingCart debe retornar null si no existe", async () => {
    // Act
    const result = await shoppingCartService.deleteShoppingCart(99999);

    // Assert
    expect(result).toBeNull();
  });

  // --- getShoppingCartByCustomer ---
  test("getShoppingCartByCustomer debe retornar carrito por cliente", async () => {
    // Arrange
    await ShoppingCart.create({
      customer: "cliente123",
      products: [{ idProduct: "P7", quantity: 2, price: 25 }],
      total: 50,
    });

    // Act
    const result = await shoppingCartService.getShoppingCartByCustomer("cliente123");

    // Assert
    expect(result).not.toBeNull();
    expect(result.customer).toBe("cliente123");
  });

  test("getShoppingCartByCustomer debe retornar null si no existe", async () => {
    // Act
    const result = await shoppingCartService.getShoppingCartByCustomer("noexiste");

    // Assert
    expect(result).toBeNull();
  });
});
