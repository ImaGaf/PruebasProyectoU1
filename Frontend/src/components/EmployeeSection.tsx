import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { employeeAPI, customerAPI, getCurrentUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Employee = {
  mongoId: string;
  idEmployee: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: string;
  idAdmin?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Customer = {
  _id: string;
  idCustomer?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
};

const EmployeeSection = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMongoId, setEditMongoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ idEmployee: string | number; role: string }>({
    idEmployee: "",
    role: "",
  });
  const { toast } = useToast();

  // Formulario de creación de empleado (sin idEmployee)
  const [newEmployee, setNewEmployee] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    idAdmin: number | "";
  }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "employee",
    idAdmin: "",
  });

  // Convertir customer en empleado
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<Customer[]>([]);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [convertForm, setConvertForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    idAdmin: number;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "employee",
    idAdmin: 100,
  });

  // === Cargar empleados ===
  const fetchEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      if (!Array.isArray(data)) throw new Error("La respuesta no es un array válido");
      setEmployees(
        data.map((emp: any) => ({
          mongoId: emp._id ?? "",
          idEmployee: emp.idEmployee ?? "",
          firstName: emp.firstName ?? "",
          lastName: emp.lastName ?? "",
          email: emp.email ?? "",
          role: emp.role ?? "",
          idAdmin: emp.idAdmin,
          createdAt: emp.createdAt,
          updatedAt: emp.updatedAt,
        }))
      );
    } catch (err) {
      console.error("Error al obtener empleados:", err);
      toast({ title: "Error al obtener empleados", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // === Crear empleado ===
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newEmployee.firstName.trim() ||
      !newEmployee.lastName.trim() ||
      !newEmployee.email.trim() ||
      !newEmployee.password.trim() ||
      !newEmployee.role.trim() ||
      !newEmployee.idAdmin
    ) {
      toast({ title: "Completa todos los campos obligatorios", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        firstName: newEmployee.firstName.trim(),
        lastName: newEmployee.lastName.trim(),
        email: newEmployee.email.trim(),
        password: newEmployee.password,
        role: newEmployee.role.trim(),
        idAdmin: Number(newEmployee.idAdmin),
      };

      await employeeAPI.create(payload);

      toast({ title: "Empleado creado" });
      setNewEmployee({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "employee",
        idAdmin: "",
      });
      fetchEmployees();
    } catch (err) {
      console.error("Error al crear empleado:", err);
      toast({ title: "Error al crear empleado", variant: "destructive" });
    }
  };

  // === Buscar usuarios (clientes) ===
  const handleUserSearch = async () => {
    try {
      const usersRaw = await customerAPI.getAll();
      const users: Customer[] = Array.isArray(usersRaw) ? usersRaw : [];
      const q = userSearch.toLowerCase();

      const results = users.filter((u) =>
        `${u.firstName ?? ""} ${u.lastName ?? ""} ${(u.email ?? "")}`.toLowerCase().includes(q)
      );
      setUserResults(results);
    } catch (err) {
      console.error(err);
      toast({ title: "Error al buscar usuarios", variant: "destructive" });
    }
  };

  // === Abrir modal con datos del usuario seleccionado para completar ===
  const openConvertModal = async (user: Customer) => {
    try {
      const fullCustomer = (await customerAPI.getById(user._id)) as Customer;
      const current = getCurrentUser() as any;
      const idAdmin =
        current?.role === "admin" && typeof current?.idAdmin === "number"
          ? current.idAdmin
          : 100;

      setSelectedUser(fullCustomer);

      setConvertForm({
        firstName: fullCustomer.firstName ?? "",
        lastName: fullCustomer.lastName ?? "",
        email: fullCustomer.email ?? "",
        password: fullCustomer.password ?? "",
        role: "employee",
        idAdmin,
      });

      setShowConvertModal(true);
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err);
      toast({ title: "Error al cargar datos del usuario", variant: "destructive" });
    }
  };

  // === Enviar formulario de creación de empleado desde customer ===
  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        !convertForm.firstName.trim() ||
        !convertForm.lastName.trim() ||
        !convertForm.email.trim() ||
        !convertForm.password.trim() ||
        !convertForm.role.trim() ||
        !convertForm.idAdmin
      ) {
        toast({ title: "Completa los campos obligatorios", variant: "destructive" });
        return;
      }

      const payload = {
        firstName: convertForm.firstName.trim(),
        lastName: convertForm.lastName.trim(),
        email: convertForm.email.trim(),
        password: convertForm.password,
        role: convertForm.role.trim(),
        idAdmin: Number(convertForm.idAdmin),
      };

      await employeeAPI.create(payload);

      toast({ title: "Usuario convertido en empleado" });
      setShowConvertModal(false);
      setSelectedUser(null);
      setUserResults([]);
      setUserSearch("");
      fetchEmployees();
    } catch (err) {
      console.error("Error al convertir usuario:", err);
      toast({ title: "Error al convertir usuario", variant: "destructive" });
    }
  };

  // === Editar empleado ===
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMongoId) return;

    try {
      const updatedData: Partial<Employee> = {};
      if (editForm.role.trim()) updatedData.role = editForm.role.trim();
      updatedData.updatedAt = new Date().toISOString();

      await employeeAPI.update(editMongoId, updatedData);
      toast({ title: "Empleado actualizado" });
      setEditMongoId(null);
      fetchEmployees();
    } catch (err) {
      console.error("Error al actualizar empleado:", err);
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  };

  // === Eliminar empleado ===
  const handleDeleteEmployee = async (mongoId: string) => {
    try {
      await employeeAPI.delete(mongoId);
      toast({ title: "Empleado eliminado" });
      fetchEmployees();
    } catch (err) {
      console.error("Error al eliminar empleado:", err);
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  // === Filtrar empleados ===
  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    return (
      String(emp.idEmployee).toLowerCase().includes(q) ||
      (emp.mongoId ?? "").toLowerCase().includes(q) ||
      (emp.firstName ?? "").toLowerCase().includes(q) ||
      (emp.lastName ?? "").toLowerCase().includes(q) ||
      (emp.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h2 className="font-bold mb-4">Empleados</h2>

      {/* Formulario para crear empleado */}
      <form onSubmit={handleCreateEmployee} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-semibold">Nombre *</label>
          <Input
            value={newEmployee.firstName}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, firstName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Apellido *</label>
          <Input
            value={newEmployee.lastName}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, lastName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Email *</label>
          <Input
            type="email"
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Contraseña *</label>
          <Input
            type="password"
            value={newEmployee.password}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, password: e.target.value })
            }
            required
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Rol *</label>
          <Input
            value={newEmployee.role}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, role: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">ID Admin *</label>
          <Input
            type="number"
            value={newEmployee.idAdmin}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, idAdmin: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="flex items-end">
          <Button type="submit">Crear empleado</Button>
        </div>
      </form>

      {/* Búsqueda de empleados */}
      <Input
        type="text"
        placeholder="Buscar por nombre, apellido, email, ID o _id"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      {filteredEmployees.length === 0 ? (
        <div>No se encontraron empleados</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <Card key={emp.mongoId} className="w-full max-w-xs mx-auto">
              <CardHeader>
                <CardTitle>
                  {(emp.firstName ?? "")} {(emp.lastName ?? "")}
                </CardTitle>
                <div className="text-xs text-gray-500 break-words">
                  Email: {emp.email ?? "-"}
                </div>
                <div className="text-xs text-gray-500 break-words">
                  ID Empleado: {emp.idEmployee}
                </div>
                <div className="text-xs text-gray-500 break-words">
                  _id: {emp.mongoId}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">Rol: {emp.role}</div>

                {editMongoId === emp.mongoId ? (
                  <form onSubmit={handleEditSubmit}>
                    <Input
                      placeholder="ID Empleado"
                      value={String(editForm.idEmployee)}
                      disabled
                      className="mb-2"
                    />
                    <Input
                      placeholder="Rol"
                      value={editForm.role}
                      onChange={(e) =>
                        setEditForm({ ...editForm, role: e.target.value })
                      }
                      className="mb-2"
                      required
                    />
                    <Button type="submit">Guardar cambios</Button>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setEditMongoId(null)}
                      className="ml-2"
                    >
                      Cancelar
                    </Button>
                  </form>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditMongoId(emp.mongoId);
                        setEditForm({
                          idEmployee: emp.idEmployee,
                          role: emp.role,
                        });
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteEmployee(emp.mongoId)}
                      className="ml-2"
                    >
                      Eliminar
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <hr className="my-8" />
      <h3 className="font-bold mb-2">Convertir usuario en empleado</h3>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Buscar usuario por nombre, apellido o email"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />
        <Button onClick={handleUserSearch}>Buscar</Button>
      </div>

      {userResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userResults.map((user) => (
            <Card key={user._id} className="w-full max-w-xs mx-auto">
              <CardHeader>
                <CardTitle>
                  {(user.firstName ?? "")} {(user.lastName ?? "")}
                </CardTitle>
                <div className="text-xs text-gray-500 break-words">
                  Email: {user.email ?? "-"}
                </div>
                <div className="text-xs text-gray-500 break-words">
                  _id: {user._id}
                </div>
              </CardHeader>
              <CardContent>
                <Button size="sm" onClick={() => openConvertModal(user)}>
                  Convertir en empleado
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para completar datos y convertir */}
      {showConvertModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowConvertModal(false)}
        >
          <div
            className="bg-white p-6 rounded shadow max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold mb-4">Completar datos para empleado</h3>
            <form onSubmit={handleConvertSubmit}>
              <label className="block mb-2">
                Nombre
                <Input
                  value={convertForm.firstName}
                  onChange={(e) => setConvertForm({ ...convertForm, firstName: e.target.value })}
                  required
                />
              </label>

              <label className="block mb-2">
                Apellido
                <Input
                  value={convertForm.lastName}
                  onChange={(e) => setConvertForm({ ...convertForm, lastName: e.target.value })}
                  required
                />
              </label>

              <label className="block mb-2">
                Email
                <Input
                  type="email"
                  value={convertForm.email}
                  onChange={(e) => setConvertForm({ ...convertForm, email: e.target.value })}
                  required
                />
              </label>

              <label className="block mb-2">
                Contraseña (hash)
                <Input
                  type="password"
                  value={convertForm.password}
                  onChange={(e) => setConvertForm({ ...convertForm, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
              </label>

              <label className="block mb-2">
                Rol
                <Input
                  value={convertForm.role}
                  onChange={(e) => setConvertForm({ ...convertForm, role: e.target.value })}
                  required
                />
              </label>

              <label className="block mb-2">
                ID Admin
                <Input
                  type="number"
                  value={convertForm.idAdmin}
                  onChange={(e) => setConvertForm({ ...convertForm, idAdmin: Number(e.target.value) })}
                  required
                />
              </label>

              <div className="mt-4 flex justify-end gap-2">
                <Button type="submit">Crear empleado</Button>
                <Button variant="ghost" onClick={() => setShowConvertModal(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSection;