const dbHandler = require("./dbHandler");
const customerService = require("../services/customerService");
const Customer = require("../models/customer");

describe("CustomerService (BD real)", () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  // --- findAll ---
  test("findAll debe retornar todos los clientes", async () => {
    // Arrange
    await Customer.create({
      firstName: "Juan", lastName: "Pérez", email: "juan@test.com",
      password: "pass123", phone: "1234567890", billingAddress: "Calle 1"
    });
    await Customer.create({
      firstName: "Ana", lastName: "García", email: "ana@test.com",
      password: "pass456", phone: "0987654321", billingAddress: "Calle 2"
    });

    // Act
    const result = await customerService.findAll();

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].firstName).toBe("Juan");
    expect(result[1].firstName).toBe("Ana");
  });

  // --- findById ---
  test("findById debe retornar un cliente existente", async () => {
    // Arrange
    const created = await Customer.create({
      firstName: "Lucía", lastName: "López", email: "lucia@test.com",
      password: "pass789", phone: "5555555555", billingAddress: "Calle 3"
    });

    // Act
    const result = await customerService.findById(created._id);

    // Assert
    expect(result.firstName).toBe("Lucía");
    expect(result.email).toBe("lucia@test.com");
  });

  test("findById debe lanzar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act & Assert
    await expect(customerService.findById(fakeId)).rejects.toThrow("Customer not found");
  });

  // --- create ---
  test("create debe crear y guardar un cliente en la BD", async () => {
    // Arrange
    const data = {
      firstName: "Pedro", lastName: "Martínez", email: "pedro@test.com",
      password: "secreto123", phone: "1112223333", billingAddress: "Calle 4"
    };

    // Act
    const result = await customerService.create(data);

    // Assert
    expect(result._id).toBeDefined();
    expect(result.firstName).toBe("Pedro");

    // Verificar que está en la BD
    const found = await Customer.findById(result._id);
    expect(found).not.toBeNull();
    expect(found.firstName).toBe("Pedro");
  });

  // --- update ---
  test("update debe actualizar un cliente en la BD", async () => {
    // Arrange
    const created = await Customer.create({
      firstName: "Carlos", lastName: "Ruiz", email: "carlos@test.com",
      password: "pass000", phone: "9998887777", billingAddress: "Calle 5"
    });

    // Act
    const result = await customerService.update(created._id, { firstName: "Carlos Actualizado" });

    // Assert
    expect(result.firstName).toBe("Carlos Actualizado");

    // Verificar en la BD
    const found = await Customer.findById(created._id);
    expect(found.firstName).toBe("Carlos Actualizado");
  });

  test("update debe lanzar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act & Assert
    await expect(customerService.update(fakeId, { firstName: "Test" })).rejects.toThrow("Customer not found");
  });

  // --- remove ---
  test("remove debe eliminar un cliente de la BD", async () => {
    // Arrange
    const created = await Customer.create({
      firstName: "Elena", lastName: "Soto", email: "elena@test.com",
      password: "pass111", phone: "4443332222", billingAddress: "Calle 6"
    });

    // Act
    const result = await customerService.remove(created._id);

    // Assert
    expect(result.firstName).toBe("Elena");

    // Verificar que ya no está
    const found = await Customer.findById(created._id);
    expect(found).toBeNull();
  });

  test("remove debe lanzar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act & Assert
    await expect(customerService.remove(fakeId)).rejects.toThrow("Customer not found");
  });
});
