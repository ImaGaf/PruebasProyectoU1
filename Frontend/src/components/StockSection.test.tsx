import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, test, expect, Mock } from 'vitest';
import StockSection from './StockSection';
import { productAPI } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  productAPI: {
    getAll: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('StockSection', () => {
  const mockProducts = [
    { id: '1', name: 'Producto Stock', stock: 50 },
  ];

  beforeEach(() => {
    (productAPI.getAll as Mock).mockResolvedValue(mockProducts);
  });

  test('debe mostrar el stock actual de los productos', async () => {
    render(<StockSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Producto Stock')).toBeInTheDocument();
      expect(screen.getByText('Stock: 50')).toBeInTheDocument();
    });
  });

  test('debe abrir formulario de edición de stock', async () => {
    render(<StockSection />);
    
    await waitFor(() => screen.getByText('Producto Stock'));
    
    const editButtons = screen.getAllByText('Editar Stock', { selector: 'button' });
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByRole('heading', { name: 'Editar Stock' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  test('debe actualizar el stock al guardar', async () => {
    (productAPI.update as Mock).mockResolvedValue({});
    render(<StockSection />);
    
    await waitFor(() => screen.getByText('Producto Stock'));
    
    const editButtons = screen.getAllByText('Editar Stock', { selector: 'button' });
    fireEvent.click(editButtons[0]);
    
    const input = screen.getByDisplayValue('50');
    fireEvent.change(input, { target: { value: '100' } });
    
    fireEvent.click(screen.getByText('Guardar cambios'));

    await waitFor(() => {
      expect(productAPI.update).toHaveBeenCalledWith('1', { stock: 100 });
    });
  });

  test('debe cancelar la edición al hacer click en cancelar', async () => {
    render(<StockSection />);
    
    await waitFor(() => screen.getByText('Producto Stock'));
    
    const editButtons = screen.getAllByText('Editar Stock', { selector: 'button' });
    fireEvent.click(editButtons[0]);
    fireEvent.click(screen.getByText('Cancelar'));
    
    expect(screen.queryByPlaceholderText('Stock')).not.toBeInTheDocument();
  });

  test('debe manejar errores al actualizar', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (productAPI.update as Mock).mockRejectedValue(new Error('Error'));
    render(<StockSection />);
    
    await waitFor(() => screen.getByText('Producto Stock'));
    
    const editButtons = screen.getAllByText('Editar Stock', { selector: 'button' });
    fireEvent.click(editButtons[0]);
    fireEvent.click(screen.getByText('Guardar cambios'));
    
    await waitFor(() => {
      expect(productAPI.update).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });
});
