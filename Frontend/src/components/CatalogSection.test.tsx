import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, test, expect, Mock } from 'vitest';
import CatalogSection from './CatalogSection';
import { productAPI } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  productAPI: {
    getAll: vi.fn(),
  },
}));

describe('CatalogSection', () => {
  const mockProducts = [
    { id: '1', name: 'Laptop', price: 1000, stock: 5 },
    { id: '2', name: 'Mouse', price: 20, stock: 10 },
  ];

  beforeEach(() => {
    (productAPI.getAll as Mock).mockResolvedValue(mockProducts);
  });

  test('debe renderizar el título del catálogo', async () => {
    render(<CatalogSection />);
    expect(screen.getByText(/Catálogo de Productos/i)).toBeInTheDocument();
  });

  test('debe mostrar los nombres de los productos', async () => {
    render(<CatalogSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
    });
  });

  test('debe mostrar los precios correctamente', async () => {
    render(<CatalogSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Precio: $1000')).toBeInTheDocument();
      expect(screen.getByText('Precio: $20')).toBeInTheDocument();
    });
  });

  test('debe mostrar el stock de los productos', async () => {
    render(<CatalogSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Stock: 5')).toBeInTheDocument();
      expect(screen.getByText('Stock: 10')).toBeInTheDocument();
    });
  });

  test('debe manejar una lista vacía de productos', async () => {
    (productAPI.getAll as Mock).mockResolvedValue([]);
    render(<CatalogSection />);
    
    await waitFor(() => {
      expect(screen.queryByText('Precio:')).not.toBeInTheDocument();
    });
  });
});
