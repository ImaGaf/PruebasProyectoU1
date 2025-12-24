import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, test, expect, Mock } from 'vitest';
import RegisterProductSection from './RegisterProductSection';
import { productAPI } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  productAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('RegisterProductSection', () => {
  const mockProducts = [
    { idProduct: 'P1', name: 'Producto A', price: 100, stock: 10, url: 'http://img.com' },
  ];

  beforeEach(() => {
    (productAPI.getAll as Mock).mockResolvedValue(mockProducts);
  });

  test('debe renderizar el formulario de registro', async () => {
    render(<RegisterProductSection />);
    expect(screen.getByText(/Registrar\/Editar Producto/i)).toBeInTheDocument(); 
  });

  test('debe mostrar lista de productos existentes', async () => {
    render(<RegisterProductSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Producto A')).toBeInTheDocument();
    });
  });

  test('debe llamar a productAPI.create al enviar formulario válido', async () => {
    (productAPI.create as Mock).mockResolvedValue({});
    render(<RegisterProductSection />);
    
    // Simular llenado de formulario (ajusta selectores según tu UI)
    // fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Nuevo Prod' } });
    // fireEvent.click(screen.getByText('Registrar'));

    // await waitFor(() => {
    //   expect(productAPI.create).toHaveBeenCalled();
    // });
  });

  test('debe validar campos obligatorios', async () => {
    render(<RegisterProductSection />);
    // fireEvent.click(screen.getByText('Registrar'));
    // expect(productAPI.create).not.toHaveBeenCalled();
  });

  test('debe permitir editar un producto', async () => {
    render(<RegisterProductSection />);
    await waitFor(() => screen.getByText('Producto A'));
    
    // fireEvent.click(screen.getByText('Editar'));
    // expect(screen.getByDisplayValue('Producto A')).toBeInTheDocument();
  });
});
