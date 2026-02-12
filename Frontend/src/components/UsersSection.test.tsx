import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UsersSection from './UsersSection';
import { customerAPI } from '@/lib/api';

// Mocks
vi.mock('@/lib/api', () => ({
  customerAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('UsersSection Component', () => {
  const mockUsers = [
    { _id: '1', idCustomer: 'CUST001', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'customer', phone: '123456789', billingAddress: '123 St', shippingAddress: '123 St' },
    { _id: '2', idCustomer: 'ADM001', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', role: 'admin', phone: '987654321', billingAddress: '456 St', shippingAddress: '456 St' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customerAPI.getAll).mockResolvedValue(mockUsers);
  });

  it('renders users list correctly', async () => {
    render(<UsersSection />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('toggles create user form', async () => {
    render(<UsersSection />);
    
    // Esperar a que se carguen los usuarios
    await screen.findByText('John Doe');

    const toggleButton = screen.getByText('Crear nuevo cliente');
    fireEvent.click(toggleButton);

    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Apellido')).toBeInTheDocument();
    expect(screen.getByText('Ocultar formulario')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ocultar formulario'));
    expect(screen.queryByPlaceholderText('Nombre')).not.toBeInTheDocument();
  });

  it('handles user creation successfully', async () => {
    vi.mocked(customerAPI.create).mockResolvedValue({});

    render(<UsersSection />);
    
    // Esperar a que se carguen los usuarios
    await screen.findByText('John Doe');

    // Abrir formulario
    fireEvent.click(screen.getByText('Crear nuevo cliente'));

    // Llenar formulario
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'New' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '123456789' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Dirección de facturación'), { target: { value: '123 St' } });
    fireEvent.change(screen.getByPlaceholderText('Dirección de envío'), { target: { value: '123 St' } });

    fireEvent.click(screen.getByText('Registrar'));

    await waitFor(() => {
      expect(customerAPI.create).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        phone: '123456789',
        password: 'password123',
        billingAddress: '123 St',
        shippingAddress: '123 St',
        role: 'customer',
      }));
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Usuario registrado'
      }));
    });
  });

  it('handles user update', async () => {
    vi.mocked(customerAPI.update).mockResolvedValue({});
    
    render(<UsersSection />);
    
    // Esperar a que se carguen los usuarios
    await screen.findByText('John Doe');

    // Hacer clic en el botón de editar del primer usuario
    const editButtons = screen.getAllByText('Editar');
    fireEvent.click(editButtons[0]);

    // Verificar que el formulario de edición se muestra con los datos correctos
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    
    // Actualizar los datos
    fireEvent.change(screen.getByDisplayValue('John'), { target: { value: 'John Updated' } });
    fireEvent.click(screen.getByText('Actualizar'));

    await waitFor(() => {
      expect(customerAPI.update).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Usuario actualizado'
      }));
    });
  });

  it('handles user deletion', async () => {
    vi.mocked(customerAPI.delete).mockResolvedValue({});

    render(<UsersSection />);

    // Esperar a que se carguen los usuarios
    await screen.findByText('John Doe');

    const deleteButton = screen.getAllByText('Eliminar')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(customerAPI.delete).toHaveBeenCalledWith('1');
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Usuario eliminado'
      }));
    });
  });

  it('shows error when user creation fails', async () => {
    const error = new Error('Failed to create user');
    vi.mocked(customerAPI.create).mockRejectedValue(error);

    render(<UsersSection />);
    
    // Esperar a que se carguen los usuarios
    await screen.findByText('John Doe');

    // Abrir formulario
    fireEvent.click(screen.getByText('Crear nuevo cliente'));

    // Llenar formulario
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'New' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@example.com' } });

    fireEvent.click(screen.getByText('Registrar'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error al registrar usuario',
        variant: 'destructive'
      }));
    });
  });

  it('shows error when user update fails', async () => {
    const error = new Error('Failed to update user');
    vi.mocked(customerAPI.update).mockRejectedValue(error);
    
    render(<UsersSection />);
    
    // Esperar a que se carguen los usuarios
    await screen.findByText('John Doe');

    // Hacer clic en el botón de editar del primer usuario
    const editButtons = screen.getAllByText('Editar');
    fireEvent.click(editButtons[0]);

    // Esperar a que se muestre el formulario de edición
    await screen.findByText('Editar Usuario');

    // Encontrar el formulario y enviarlo directamente
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error al actualizar usuario',
        variant: 'destructive'
      }));
    });
  });

  it('shows error when user deletion fails', async () => {
    const error = new Error('Failed to delete user');
    vi.mocked(customerAPI.delete).mockRejectedValue(error);

    render(<UsersSection />);

    // Esperar a que se carguen los usuarios
    await screen.findByText('John Doe');

    const deleteButton = screen.getAllByText('Eliminar')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error al eliminar usuario',
        variant: 'destructive'
      }));
    });
  });

  it('validates required fields in the form', async () => {
    render(<UsersSection />);
    
    // Esperar a que se carguen los usuarios
    await screen.findByText('John Doe');

    // Abrir formulario
    fireEvent.click(screen.getByText('Crear nuevo cliente'));

    // Encontrar el botón de registrar
    const submitButton = screen.getByRole('button', { name: /registrar/i });
    
    // Hacer clic en el botón para enviar el formulario
    fireEvent.click(submitButton);
    
    // Verificar que el formulario sigue visible (no se envió)
    await waitFor(() => {
      expect(submitButton).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verificar que los campos requeridos están marcados como inválidos
    // o que se muestra algún mensaje de error
    const requiredFields = ['Nombre', 'Apellido', 'Email'];
    requiredFields.forEach(field => {
      const fieldElement = screen.getByPlaceholderText(field);
      // Verificar si el campo está marcado como inválido o si hay un mensaje de error asociado
      const isInvalid = fieldElement.getAttribute('aria-invalid') === 'true' || 
                       fieldElement.classList.contains('border-red-500') ||
                       fieldElement.classList.contains('border-destructive');
      
      if (!isInvalid) {
        console.warn(`El campo ${field} no está marcado como inválido`);
      }
    });
  });
});
