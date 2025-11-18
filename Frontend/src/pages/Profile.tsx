import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { customerAPI, getCurrentUser } from "@/lib/api";

export default function Profile() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
  });

  useEffect(() => {
    document.title = "Perfil del cliente | Barroco Ceramics";
    const current = getCurrentUser();
    setUser(current);
    if (current) {
      setForm({
        firstName: current.firstName || "",
        lastName: current.lastName || "",
        email: current.email || "",
        phone: current.phone || "",
        billingAddress: current.billingAddress || "",
        shippingAddress: current.shippingAddress || "",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    setIsSaving(true);
    try {
      const updatePayload = { ...form } as any;
      delete updatePayload.password;
      const updated = await customerAPI.update(user._id, updatePayload);

      const newUser = { ...user, ...updatePayload, ...(typeof updated === "object" ? updated : {}) };
      sessionStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      toast({ title: "Perfil actualizado", description: "Tus datos se guardaron correctamente." });
    } catch (err) {
      toast({ title: "Error", description: "No se pudo guardar el perfil.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-2">
          Actualiza tu información personal y de envío.
        </p>
      </header>

      <Card className="max-w-5xl mx-auto rounded-2xl shadow-md border border-gray-200 bg-[#ececec]">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Información del cliente
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">Nombre</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  className="rounded-xl border-gray-300 focus:border-[#E7A97C] focus:ring-[#E7A97C]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">Apellido</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  className="rounded-xl border-gray-300 focus:border-[#E7A97C] focus:ring-[#E7A97C]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="rounded-xl border-gray-300 focus:border-[#E7A97C] focus:ring-[#E7A97C]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">Teléfono</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="rounded-xl border-gray-300 focus:border-[#E7A97C] focus:ring-[#E7A97C]"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="billingAddress" className="text-gray-700 font-medium">
                  Dirección de facturación
                </Label>
                <Input
                  id="billingAddress"
                  value={form.billingAddress}
                  onChange={(e) => setForm((p) => ({ ...p, billingAddress: e.target.value }))}
                  className="rounded-xl border-gray-300 focus:border-[#E7A97C] focus:ring-[#E7A97C]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAddress" className="text-gray-700 font-medium">
                  Dirección de envío
                </Label>
                <Input
                  id="shippingAddress"
                  value={form.shippingAddress}
                  onChange={(e) => setForm((p) => ({ ...p, shippingAddress: e.target.value }))}
                  className="rounded-xl border-gray-300 focus:border-[#E7A97C] focus:ring-[#E7A97C]"
                />
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#E7A97C] hover:bg-[#d98a60] text-white rounded-xl px-6 py-2"
                >
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );


}
