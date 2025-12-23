import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, test, expect, Mock } from 'vitest';
import PaymentSection from './PaymentSection';
import { paymentAPI } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  paymentAPI: {
    getAll: vi.fn(),
  },
}));

describe('PaymentSection', () => {
  const mockPayments = [
    { id: '1', amount: 500, status: 'Completed' },
    { id: '2', amount: 150, status: 'Pending' },
  ];

  beforeEach(() => {
    (paymentAPI.getAll as Mock).mockResolvedValue(mockPayments);
  });

  test('debe renderizar el título de pagos', async () => {
    render(<PaymentSection />);
    expect(screen.getByText('Pagos')).toBeInTheDocument();
  });

  test('debe mostrar la lista de pagos', async () => {
    render(<PaymentSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Pago #1')).toBeInTheDocument();
      expect(screen.getByText('Pago #2')).toBeInTheDocument();
    });
  });

  test('debe mostrar el monto de los pagos', async () => {
    render(<PaymentSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Monto: $500')).toBeInTheDocument();
      expect(screen.getByText('Monto: $150')).toBeInTheDocument();
    });
  });

  test('debe mostrar el estado de los pagos', async () => {
    render(<PaymentSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Estado: Completed')).toBeInTheDocument();
      expect(screen.getByText('Estado: Pending')).toBeInTheDocument();
    });
  });

  test('debe manejar lista vacía de pagos', async () => {
    (paymentAPI.getAll as Mock).mockResolvedValue([]);
    render(<PaymentSection />);
    
    await waitFor(() => {
      expect(screen.queryByText('Monto:')).not.toBeInTheDocument();
    });
  });
});
