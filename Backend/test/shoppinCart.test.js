const request = require('supertest');
const app = require('../PruebasProyectoU1/Backend/app'); // Ajusta la ruta si tu app principal está en otro archivo

describe('ShoppingCart API', () => {
    // GET debe devolver una lista vacía inicialmente
    test('GET /api/cart debe devolver lista vacía', async () => {
        const res = await request(app).get('/api/cart');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    // POST debe crear un carrito correctamente
    test('POST /api/cart debe crear un carrito', async () => {
        const newCart = {
            customer: 'dennison',
            products: [{ idProduct: 'prod1', quantity: 2, price: 10 }],
            total: 20
        };
        const res = await request(app).post('/api/cart').send(newCart);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('idShoppingCart');
        expect(res.body.customer).toBe('dennison');
    });

    // POST debe fallar si falta el cliente
    test('POST /api/cart debe fallar si falta el cliente', async () => {
        const res = await request(app).post('/api/cart').send({ products: [{ idProduct: 'prod1', quantity: 2, price: 10 }], total: 20 });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    // GET después de crear un carrito debe devolverlo
    test('GET /api/cart debe devolver el carrito creado', async () => {
        const newCart = { customer: 'Ana', products: [{ idProduct: 'prod2', quantity: 1, price: 15 }], total: 15 };
        await request(app).post('/api/cart').send(newCart);
        const res = await request(app).get('/api/cart');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body.some(c => c.customer === 'Ana')).toBe(true);
    });

    // Se pueden crear varios carritos y aparecen en el GET
    test('POST /api/cart permite múltiples carritos', async () => {
        const carts = [
            { customer: 'Luis', products: [{ idProduct: 'prod3', quantity: 1, price: 5 }], total: 5 },
            { customer: 'Maria', products: [{ idProduct: 'prod4', quantity: 3, price: 7 }], total: 21 }
        ];
        for (const cart of carts) {
            await request(app).post('/api/cart').send(cart);
        }
        const res = await request(app).get('/api/cart');
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        expect(res.body.some(c => c.customer === 'Luis')).toBe(true);
        expect(res.body.some(c => c.customer === 'Maria')).toBe(true);
    });

    // POST rechaza si el total está vacío
    test('POST /api/cart debe fallar si total está vacío', async () => {
        const res = await request(app).post('/api/cart').send({ customer: 'Juan', products: [{ idProduct: 'prod5', quantity: 1, price: 10 }] });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    // GET a una ruta inexistente devuelve 404
    test('GET /api/unknown debe devolver 404', async () => {
        const res = await request(app).get('/api/unknown');
        expect(res.statusCode).toBe(404);
    });

    // PUT actualiza un carrito existente
    test('PUT /api/cart/:id actualiza el carrito', async () => {
        const newCart = { customer: 'Pedro', products: [{ idProduct: 'prod6', quantity: 1, price: 8 }], total: 8 };
        const postRes = await request(app).post('/api/cart').send(newCart);
        const id = postRes.body.idShoppingCart;
        const updateRes = await request(app).put(`/api/cart/${id}`).send({ total: 16 });
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.total).toBe(16);
    });

    // DELETE elimina un carrito existente
    test('DELETE /api/cart/:id elimina el carrito', async () => {
        const newCart = { customer: 'Carlos', products: [{ idProduct: 'prod7', quantity: 2, price: 12 }], total: 24 };
        const postRes = await request(app).post('/api/cart').send(newCart);
        const id = postRes.body.idShoppingCart;
        const deleteRes = await request(app).delete(`/api/cart/${id}`);
        expect(deleteRes.statusCode).toBe(200);
        expect(deleteRes.body).toHaveProperty('message');
    });
});