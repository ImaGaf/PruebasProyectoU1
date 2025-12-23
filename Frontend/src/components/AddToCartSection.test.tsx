import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, test, expect, Mock } from 'vitest';
import AddToCartSection from './AddToCartSection';
import { productAPI, cartAPI } from '@/lib/api';

// Mock de las APIs
vi.mock('@/lib/api', () => ({
  productAPI: {
    getAll: vi.fn(),
  },
  cartAPI: {
    create: vi.fn(),
  },
}));

// Mock del hook useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('AddToCartSection', () => {
  const mockProducts = [
    { id: '1', name: 'Producto 1', price: 100 },
    { id: '2', name: 'Producto 2', price: 200 },
  ];

  beforeEach(() => {
    (productAPI.getAll as Mock).mockResolvedValue(mockProducts);
  });

  test('debe renderizar el título de la sección', async () => {
    render(<AddToCartSection />);
    expect(screen.getByText(/Agregar Productos al Carrito/i)).toBeInTheDocument();
  });

  test('debe mostrar la lista de productos', async () => {
    render(<AddToCartSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Producto 1')).toBeInTheDocument();
      expect(screen.getByText('Producto 2')).toBeInTheDocument();
    });
  });

  test('debe mostrar el precio de los productos', async () => {
    render(<AddToCartSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Precio: $100')).toBeInTheDocument();
      expect(screen.getByText('Precio: $200')).toBeInTheDocument();
    });
  });

  test('debe llamar a cartAPI.create al hacer click en agregar', async () => {
    (cartAPI.create as Mock).mockResolvedValue({});
    render(<AddToCartSection />);
    
    await waitFor(() => screen.getByText('Producto 1'));
    
    const addButtons = screen.getAllByText('Agregar al carrito');
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(cartAPI.create).toHaveBeenCalledTimes(1);
      expect(cartAPI.create).toHaveBeenCalledWith(expect.objectContaining({
        customer: 'CUST001',
        total: 100,
        product: expect.arrayContaining([
          expect.objectContaining({
            idProduct: '1',
            price: 100,
            quantity: 1
          })
        ])
      }));
    });
  });

  test('debe manejar errores al agregar al carrito', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (cartAPI.create as Mock).mockRejectedValue(new Error('Error al agregar'));
    
    render(<AddToCartSection />);
    
    await waitFor(() => screen.getByText('Producto 1'));
    
    const addButtons = screen.getAllByText('Agregar al carrito');
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(cartAPI.create).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });
});
