import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { customerAPI } from "@/lib/api";
import { Link } from "react-router-dom";

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
    role: "customer",
  });

  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState({
    phone: "",
    billingAddress: "",
    shippingAddress: "",
  });

  const fetchCustomers = async () => {
    try {
      const data = await customerAPI.getAll();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);


  const handleCreate = async () => {
    try {
      await customerAPI.create(newCustomer);
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido registrado correctamente",
      });


      setNewCustomer({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        billingAddress: "",
        shippingAddress: "",
        role: "customer",
      });

      fetchCustomers();
    } catch (error) {
      console.error("Error al crear cliente:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await customerAPI.update(id, editCustomer);
      toast({
        title: "Cliente actualizado",
        description: "Los datos del cliente fueron modificados correctamente",
      });
      setEditCustomerId(null);
      fetchCustomers();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await customerAPI.delete(id);
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente",
      });
      fetchCustomers();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      });
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c._id?.toLowerCase().includes(term) ||
      c.firstName?.toLowerCase().includes(term) ||
      c.lastName?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cornsilk via-warm to-accent p-6">
      <Card className="max-w-5xl mx-auto bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestión de Clientes</CardTitle>
        </CardHeader>
              <div className="w-60 bg-gray-800 text-white flex flex-col p-4">
                <h2 className="text-lg font-bold mb-6">Menú</h2>
                <Link to="/dashboard" className="mb-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
                  Dashboard
                </Link>
                <Link to="/empleados" className="mb-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
                  Empleados
                </Link>
                <Link to="/productoscontrol" className="mb-2 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded">
                  Productos
                </Link>
                <Link to="/ordenpedidos" className="mb-2 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded">
                  Ordenes
                </Link>
              </div>

        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Input placeholder="Nombre" value={newCustomer.firstName} onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })} />
            <Input placeholder="Apellido" value={newCustomer.lastName} onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })} />
            <Input type="email" placeholder="Correo" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
            <Input type="password" placeholder="Contraseña" value={newCustomer.password} onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })} />
            <Input type="tel" placeholder="Teléfono" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
            <Input placeholder="Dirección de facturación" value={newCustomer.billingAddress} onChange={(e) => setNewCustomer({ ...newCustomer, billingAddress: e.target.value })} />
            <Input placeholder="Dirección de envío" value={newCustomer.shippingAddress} onChange={(e) => setNewCustomer({ ...newCustomer, shippingAddress: e.target.value })} />
          </div>

          <Button className="w-full bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground" onClick={handleCreate}>
            Crear Cliente
          </Button>

          <Separator className="my-6" />

          <Input placeholder="Buscar cliente por ID, nombre o email" className="mb-4" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

          {filteredCustomers.length > 0 ? (
            <ul className="space-y-3">
              {filteredCustomers.map((c) => (
                <li key={c._id} className="border p-4 rounded-md">
                  <p><strong>ID:</strong> {c._id}</p>
                  <p><strong>Nombre:</strong> {c.firstName} {c.lastName}</p>
                  <p><strong>Email:</strong> {c.email}</p>
                  <p><strong>Teléfono:</strong> {c.phone}</p>
                  <p><strong>Facturación:</strong> {c.billingAddress}</p>
                  <p><strong>Envío:</strong> {c.shippingAddress}</p>
                  <p><strong>Rol:</strong> {c.role}</p>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => {
                      setEditCustomerId(c._id);
                      setEditCustomer({ phone: c.phone, billingAddress: c.billingAddress, shippingAddress: c.shippingAddress });
                    }}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(c._id)}>
                      Eliminar
                    </Button>
                  </div>

                  {editCustomerId === c._id && (
                    <div className="mt-3 p-3 border rounded bg-muted">
                      <Input placeholder="Teléfono" value={editCustomer.phone} onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })} />
                      <Input placeholder="Dirección de facturación" value={editCustomer.billingAddress} onChange={(e) => setEditCustomer({ ...editCustomer, billingAddress: e.target.value })} className="mt-2" />
                      <Input placeholder="Dirección de envío" value={editCustomer.shippingAddress} onChange={(e) => setEditCustomer({ ...editCustomer, shippingAddress: e.target.value })} className="mt-2" />
                      <Button className="mt-2" onClick={() => handleUpdate(c._id)}>Guardar Cambios</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No se encontraron clientes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
