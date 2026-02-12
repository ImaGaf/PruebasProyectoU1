const dbHandler = require("./dbHandler");
const categoryService = require("../services/categoryService");
const Category = require("../models/category");

describe("CategoryService (BD real)", () => {
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

  // --- getAllCategories ---
  test("getAllCategories debe retornar todas las categorías", async () => {
    // Arrange
    await Category.create({ categoryID: 1, name: "Electrónica", description: "Productos electrónicos" });
    await Category.create({ categoryID: 2, name: "Ropa", description: "Ropa y accesorios" });

    // Act
    const result = await categoryService.getAllCategories();

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Electrónica");
    expect(result[1].name).toBe("Ropa");
  });

  test("getAllCategories debe retornar array vacío si no hay categorías", async () => {
    // Arrange (BD vacía)

    // Act
    const result = await categoryService.getAllCategories();

    // Assert
    expect(result).toEqual([]);
  });

  // --- getCategoryById ---
  test("getCategoryById debe retornar una categoría existente", async () => {
    // Arrange
    const created = await Category.create({ categoryID: 10, name: "Libros", description: "Libros y revistas" });

    // Act
    const result = await categoryService.getCategoryById(created._id);

    // Assert
    expect(result.name).toBe("Libros");
    expect(result.description).toBe("Libros y revistas");
  });

  test("getCategoryById debe lanzar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act & Assert
    await expect(categoryService.getCategoryById(fakeId)).rejects.toThrow("Category not found");
  });

  // --- createCategory ---
  test("createCategory debe crear y guardar en la BD", async () => {
    // Arrange
    const data = { categoryID: 20, name: "Hogar", description: "Artículos para el hogar" };

    // Act
    const result = await categoryService.createCategory(data);

    // Assert
    expect(result._id).toBeDefined();
    expect(result.name).toBe("Hogar");

    // Verificar que realmente está en la BD
    const found = await Category.findById(result._id);
    expect(found).not.toBeNull();
    expect(found.name).toBe("Hogar");
  });

  // --- updateCategory ---
  test("updateCategory debe actualizar en la BD", async () => {
    // Arrange
    const created = await Category.create({ categoryID: 30, name: "Deportes", description: "Artículos deportivos" });

    // Act
    const result = await categoryService.updateCategory(created._id, { name: "Deportes Extremos" });

    // Assert
    expect(result.name).toBe("Deportes Extremos");

    // Verificar en la BD
    const found = await Category.findById(created._id);
    expect(found.name).toBe("Deportes Extremos");
  });

  test("updateCategory debe lanzar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act & Assert
    await expect(categoryService.updateCategory(fakeId, { name: "Test" })).rejects.toThrow("Category not found");
  });

  // --- deleteCategory ---
  test("deleteCategory debe eliminar de la BD", async () => {
    // Arrange
    const created = await Category.create({ categoryID: 40, name: "Juguetes", description: "Juguetes y juegos" });

    // Act
    const result = await categoryService.deleteCategory(created._id);

    // Assert
    expect(result.name).toBe("Juguetes");

    // Verificar que ya no está en la BD
    const found = await Category.findById(created._id);
    expect(found).toBeNull();
  });

  test("deleteCategory debe lanzar error si no existe", async () => {
    // Arrange
    const fakeId = "507f1f77bcf86cd799439011";

    // Act & Assert
    await expect(categoryService.deleteCategory(fakeId)).rejects.toThrow("Category not found");
  });
});
