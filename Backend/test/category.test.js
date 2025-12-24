const request = require("supertest");
const express = require("express");

jest.mock("../services/categoryService");
jest.mock("../middlewares/basicAuth", () => (req, res, next) => next());

const categoryService = require("../services/categoryService");
const categoryRoutes = require("../routes/categoryRoutes");

const app = express();
app.use(express.json());
app.use("/api/categories", categoryRoutes);

describe('Category API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/categories debe devolver lista vacía', async () => {
    categoryService.getAllCategories.mockResolvedValue([]);
    
    const res = await request(app).get('/api/categories');
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
    expect(categoryService.getAllCategories).toHaveBeenCalledTimes(1);
  });

  test('POST /api/categories debe crear una categoría', async () => {
    const newCategory = {
      name: 'Electrónica',
      description: 'Productos electrónicos'
    };
    const createdCategory = { _id: '123', ...newCategory };
    categoryService.createCategory.mockResolvedValue(createdCategory);
    
    const res = await request(app).post('/api/categories').send(newCategory);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Electrónica');
    expect(categoryService.createCategory).toHaveBeenCalledWith(newCategory);
  });

  test('POST /api/categories debe fallar si falta el nombre', async () => {
    const invalidCategory = { 
      description: 'Sin nombre' 
    };
    categoryService.createCategory.mockRejectedValue(
      new Error('name is required')
    );
    
    const res = await request(app).post('/api/categories').send(invalidCategory);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/categories después de crear una categoría debe devolverla', async () => {
    const mockCategories = [
      { _id: '1', name: 'Ropa', description: 'Ropa y accesorios' }
    ];
    categoryService.getAllCategories.mockResolvedValue(mockCategories);
    
    const res = await request(app).get('/api/categories');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some(c => c.name === 'Ropa')).toBe(true);
  });

  test('GET /api/categories permite múltiples categorías', async () => {
    const mockCategories = [
      { _id: '1', name: 'Deportes', description: 'Artículos deportivos' },
      { _id: '2', name: 'Hogar', description: 'Artículos para el hogar' }
    ];
    categoryService.getAllCategories.mockResolvedValue(mockCategories);
    
    const res = await request(app).get('/api/categories');
    
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.some(c => c.name === 'Deportes')).toBe(true);
    expect(res.body.some(c => c.name === 'Hogar')).toBe(true);
  });

  test('GET /api/categories/:id debe devolver una categoría específica', async () => {
    const mockCategory = { _id: '123', name: 'Libros', description: 'Libros y revistas' };
    categoryService.getCategoryById.mockResolvedValue(mockCategory);
    
    const res = await request(app).get('/api/categories/123');
    
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe('123');
    expect(res.body.name).toBe('Libros');
    expect(categoryService.getCategoryById).toHaveBeenCalledWith('123');
  });

  test('GET /api/categories/:id debe devolver 404 si no existe', async () => {
    categoryService.getCategoryById.mockRejectedValue(
      new Error('Category not found')
    );
    
    const res = await request(app).get('/api/categories/999');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('PUT /api/categories/:id actualiza la categoría', async () => {
    const updatedCategory = { 
      _id: '123', 
      name: 'Música', 
      description: 'Instrumentos y discos' 
    };
    categoryService.updateCategory.mockResolvedValue(updatedCategory);
    
    const res = await request(app).put('/api/categories/123').send({ 
      name: 'Música',
      description: 'Instrumentos y discos' 
    });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Música');
    expect(categoryService.updateCategory).toHaveBeenCalledWith('123', { 
      name: 'Música',
      description: 'Instrumentos y discos' 
    });
  });

  test('PUT /api/categories/:id debe devolver 404 si no existe', async () => {
    categoryService.updateCategory.mockRejectedValue(
      new Error('Category not found')
    );
    
    const res = await request(app).put('/api/categories/999').send({ name: 'Test' });
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('DELETE /api/categories/:id elimina la categoría', async () => {
    const deletedCategory = { 
      _id: '123', 
      name: 'Juguetes', 
      description: 'Juguetes y juegos' 
    };
    categoryService.deleteCategory.mockResolvedValue(deletedCategory);
    
    const res = await request(app).delete('/api/categories/123');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Category deleted');
    expect(categoryService.deleteCategory).toHaveBeenCalledWith('123');
  });

  test('DELETE /api/categories/:id debe devolver 404 si no existe', async () => {
    categoryService.deleteCategory.mockRejectedValue(
      new Error('Category not found')
    );
    
    const res = await request(app).delete('/api/categories/999');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  test('GET a una ruta inexistente devuelve 404', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toBe(404);
  });
});
