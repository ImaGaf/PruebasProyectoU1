import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, test, expect, Mock } from 'vitest';
import OrdersSection from './OrdersSection';
import { orderAPI } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  orderAPI: {
    getAll: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('OrdersSection', () => {
  const mockOrders = [
    { id: '1', customerName: 'Juan', total: 100, status: 'Pending' },
    { id: '2', customerName: 'Maria', total: 200, status: 'Shipped' },
  ];

  beforeEach(() => {
    (orderAPI.getAll as Mock).mockResolvedValue(mockOrders);
  });

  test('debe mostrar la lista de pedidos', async () => {
    render(<OrdersSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Pedido #1')).toBeInTheDocument();
      expect(screen.getByText('Pedido #2')).toBeInTheDocument();
    });
  });

  test('debe mostrar detalles del pedido', async () => {
    render(<OrdersSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Cliente: Juan')).toBeInTheDocument();
      expect(screen.getByText('Total: $100')).toBeInTheDocument();
      expect(screen.getByText('Estado: Pending')).toBeInTheDocument();
    });
  });

  test('debe abrir formulario de edición al hacer click en editar', async () => {
    render(<OrdersSection />);
    
    await waitFor(() => screen.getByText('Pedido #1'));
    
    const editButtons = screen.getAllByText('Editar');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Editar Estado')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
  });

  test('debe llamar a orderAPI.update al guardar cambios', async () => {
    (orderAPI.update as Mock).mockResolvedValue({});
    render(<OrdersSection />);
    
    await waitFor(() => screen.getByText('Pedido #1'));
    
    const editButtons = screen.getAllByText('Editar');
    fireEvent.click(editButtons[0]);

    const input = screen.getByDisplayValue('Pending');
    fireEvent.change(input, { target: { value: 'Delivered' } });
    
    fireEvent.click(screen.getByText('Guardar cambios'));

    await waitFor(() => {
      expect(orderAPI.update).toHaveBeenCalledWith('1', { status: 'Delivered' });
    });
  });

  test('debe llamar a orderAPI.delete al eliminar', async () => {
    (orderAPI.delete as Mock).mockResolvedValue({});
    render(<OrdersSection />);
    
    await waitFor(() => screen.getByText('Pedido #1'));
    
    const deleteButtons = screen.getAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(orderAPI.delete).toHaveBeenCalledWith('1');
    });
  });
});
