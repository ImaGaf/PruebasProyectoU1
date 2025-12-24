import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, test, expect, Mock } from 'vitest';
import FilterSection from './FilterSection';
import { productAPI } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  productAPI: {
    getAll: vi.fn(),
  },
}));

describe('FilterSection', () => {
  const mockProducts = [
    { id: '1', name: 'Apple iPhone', price: 999, stock: 10 },
    { id: '2', name: 'Samsung Galaxy', price: 899, stock: 15 },
    { id: '3', name: 'Sony Headphones', price: 199, stock: 20 },
  ];

  beforeEach(() => {
    (productAPI.getAll as Mock).mockResolvedValue(mockProducts);
  });

  test('debe renderizar el input de búsqueda', async () => {
    render(<FilterSection />);
    expect(screen.getByPlaceholderText(/Buscar por nombre.../i)).toBeInTheDocument();
  });

  test('debe mostrar todos los productos inicialmente', async () => {
    render(<FilterSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple iPhone')).toBeInTheDocument();
      expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
      expect(screen.getByText('Sony Headphones')).toBeInTheDocument();
    });
  });

  test('debe filtrar productos al escribir en el input', async () => {
    render(<FilterSection />);
    
    await waitFor(() => screen.getByText('Apple iPhone'));
    
    const input = screen.getByPlaceholderText(/Buscar por nombre.../i);
    fireEvent.change(input, { target: { value: 'Samsung' } });

    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
    expect(screen.queryByText('Apple iPhone')).not.toBeInTheDocument();
    expect(screen.queryByText('Sony Headphones')).not.toBeInTheDocument();
  });

  test('debe filtrar sin importar mayúsculas/minúsculas', async () => {
    render(<FilterSection />);
    
    await waitFor(() => screen.getByText('Apple iPhone'));
    
    const input = screen.getByPlaceholderText(/Buscar por nombre.../i);
    fireEvent.change(input, { target: { value: 'sony' } });

    expect(screen.getByText('Sony Headphones')).toBeInTheDocument();
  });

  test('debe mostrar mensaje vacío si no hay coincidencias', async () => {
    render(<FilterSection />);
    
    await waitFor(() => screen.getByText('Apple iPhone'));
    
    const input = screen.getByPlaceholderText(/Buscar por nombre.../i);
    fireEvent.change(input, { target: { value: 'xyz' } });

    expect(screen.queryByText('Apple iPhone')).not.toBeInTheDocument();
    expect(screen.queryByText('Samsung Galaxy')).not.toBeInTheDocument();
  });
});
