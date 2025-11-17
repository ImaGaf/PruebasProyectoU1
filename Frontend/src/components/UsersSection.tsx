import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { customerAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    role: "customer",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    billingAddress: "",
    shippingAddress: "",
    idCustomer: "",
  });
  const [editMongoId, setEditMongoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({
    role: "customer",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    billingAddress: "",
    shippingAddress: "",
    idCustomer: "",
  });
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const data = await customerAPI.getAll() as any[];
      setUsers(
        data.map((u: any) => ({
          mongoId: u._id, // ID real de Mongo
          idCustomer: u.idCustomer,
          role: u.role,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          billingAddress: u.billingAddress,
          shippingAddress: u.shippingAddress,
        }))
      );
    } catch (error) {
      toast({ title: "Error al obtener usuarios", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerAPI.create({ ...form, createdAt: new Date(), updatedAt: new Date() });
      toast({ title: "Usuario registrado" });
      setForm({
        role: "customer",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        billingAddress: "",
        shippingAddress: "",
        idCustomer: "",
      });
      setFormVisible(false);
      fetchUsers();
    } catch (error) {
      toast({ title: "Error al registrar usuario", variant: "destructive" });
    }
  };

  const handleDelete = async (mongoId: string) => {
    try {
      await customerAPI.delete(mongoId); // Usar _id aquí
      toast({ title: "Usuario eliminado" });
      fetchUsers();
    } catch (error) {
      toast({ title: "Error al eliminar usuario", variant: "destructive" });
    }
  };

  const handleEdit = (u: any) => {
    setEditMongoId(u.mongoId); // Guardamos _id para la edición
    setEditForm({
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      password: "",
      billingAddress: u.billingAddress,
      shippingAddress: u.shippingAddress,
      idCustomer: u.idCustomer,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMongoId) return;

    const dataToSend: any = {};
    Object.entries(editForm).forEach(([key, value]) => {
      if (value !== "") {
        dataToSend[key] = value;
      }
    });
    dataToSend.updatedAt = new Date();

    try {
      await customerAPI.update(editMongoId, dataToSend); // Usar _id aquí
      toast({ title: "Usuario actualizado" });
      setEditMongoId(null);
      fetchUsers();
    } catch (error) {
      toast({ title: "Error al actualizar usuario", variant: "destructive" });
    }
  };

  return (
    <div>
      <h2 className="font-bold mb-4">CRUD Usuarios</h2>
      <Separator />

      <Button className="mt-4 mb-4" onClick={() => setFormVisible(!formVisible)}>
        {formVisible ? "Ocultar formulario" : "Crear nuevo cliente"}
      </Button>

      {formVisible && (
        <form className="mt-4 mb-6" onSubmit={handleSubmit}>
          <Input placeholder="Nombre" className="mb-2" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input placeholder="Apellido" className="mb-2" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input placeholder="Email" className="mb-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Teléfono" className="mb-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Contraseña" type="password" className="mb-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input placeholder="Dirección Facturación" className="mb-2" value={form.billingAddress} onChange={(e) => setForm({ ...form, billingAddress: e.target.value })} />
          <Input placeholder="Dirección Envío" className="mb-2" value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
          <Input placeholder="ID Cliente" className="mb-2" value={form.idCustomer} onChange={(e) => setForm({ ...form, idCustomer: e.target.value })} />
          <Button type="submit">Registrar</Button>
        </form>
      )}

      {editMongoId && (
        <form className="mb-6" onSubmit={handleEditSubmit}>
          <h3 className="font-semibold mb-2">Editar Usuario</h3>
          <Input placeholder="Nombre" className="mb-2" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
          <Input placeholder="Apellido" className="mb-2" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
          <Input placeholder="Email" className="mb-2" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <Input placeholder="Teléfono" className="mb-2" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <Input placeholder="Contraseña (vacío = no cambia)" type="password" className="mb-2" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
          <Input placeholder="Dirección Facturación" className="mb-2" value={editForm.billingAddress} onChange={(e) => setEditForm({ ...editForm, billingAddress: e.target.value })} />
          <Input placeholder="Dirección Envío" className="mb-2" value={editForm.shippingAddress} onChange={(e) => setEditForm({ ...editForm, shippingAddress: e.target.value })} />
          <Input placeholder="ID Cliente" className="mb-2" value={editForm.idCustomer} onChange={(e) => setEditForm({ ...editForm, idCustomer: e.target.value })} />
          <Input placeholder="Rol" className="mb-2" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} />
          <Button type="submit">Guardar cambios</Button>
          <Button variant="ghost" type="button" onClick={() => setEditMongoId(null)}>Cancelar</Button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {users.map((u, idx) => (
          <Card key={u.mongoId ?? idx}>
            <CardHeader>
              <CardTitle>{u.firstName} {u.lastName}</CardTitle>
              <div className="text-sm text-gray-500">ID Cliente: {u.idCustomer}</div>
            </CardHeader>
            <CardContent>
              <div>Email: {u.email}</div>
              <div>Teléfono: {u.phone}</div>
              <Button size="sm" className="mr-2" onClick={() => handleEdit(u)}>Editar</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(u.mongoId)}>Eliminar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
