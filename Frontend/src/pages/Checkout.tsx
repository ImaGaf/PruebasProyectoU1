import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cartStore } from "@/lib/cart-store";
import { getCurrentUser } from "@/lib/api";

export default function Checkout() {
  const navigate = useNavigate();
  const [sameAddress, setSameAddress] = useState(true);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [shipping, setShipping] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Argentina",
  });
  const [billing, setBilling] = useState({ address: "", city: "", state: "", zip: "", country: "Argentina" });
  const [card, setCard] = useState({ holder: "", number: "", exp: "", cvc: "" });
  const [items, setItems] = useState(cartStore.getItems());

  useEffect(() => {
    document.title = "Checkout - Pago | Tienda";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Finaliza tu compra de forma segura y rápida en nuestra tienda.");
  }, []);

  useEffect(() => {
    const unsub = cartStore.subscribe(() => setItems(cartStore.getItems()));
    return () => unsub();
  }, []);

  useEffect(() => {
    const user = getCurrentUser?.();
    if (user) {
      setContact((c) => ({ ...c, name: user.name ?? user.fullName ?? "", email: user.email ?? "" }));
    }
  }, []);

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * it.quantity, 0), [items]);
  const shippingCost = useMemo(() => (items.length ? 0 : 0), [items]);
  const tax = useMemo(() => Math.round(subtotal * 0.21), [subtotal]);
  const total = subtotal + shippingCost + tax;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/payment-success");
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Checkout y pago</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-6" aria-label="Formulario de checkout">
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre y apellido</Label>
                <Input id="name" required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" required value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dirección de envío</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" required value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" required value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Provincia</Label>
                <Input id="state" required value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Código postal</Label>
                <Input id="zip" required value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input id="country" required value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox id="same" checked={sameAddress} onCheckedChange={(v) => setSameAddress(Boolean(v))} />
                <Label htmlFor="same">Usar esta misma dirección para facturación</Label>
              </div>
            </CardContent>
          </Card>

          {!sameAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Dirección de facturación</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="b_address">Dirección</Label>
                  <Input id="b_address" required value={billing.address} onChange={(e) => setBilling({ ...billing, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b_city">Ciudad</Label>
                  <Input id="b_city" required value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b_state">Provincia</Label>
                  <Input id="b_state" required value={billing.state} onChange={(e) => setBilling({ ...billing, state: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b_zip">Código postal</Label>
                  <Input id="b_zip" required value={billing.zip} onChange={(e) => setBilling({ ...billing, zip: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b_country">País</Label>
                  <Input id="b_country" required value={billing.country} onChange={(e) => setBilling({ ...billing, country: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Método de pago (demostración)</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="holder">Titular de la tarjeta</Label>
                <Input id="holder" required value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="number">Número de tarjeta</Label>
                <Input id="number" inputMode="numeric" placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp">Vencimiento (MM/AA)</Label>
                <Input id="exp" placeholder="MM/AA" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" inputMode="numeric" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
              </div>
              <p className="text-sm text-muted-foreground sm:col-span-2">Este formulario es solo visual. No se almacenan ni procesan datos de tarjeta.</p>
              <div className="sm:col-span-2 flex gap-3">
                <Button type="button" variant="secondary" onClick={() => navigate("/payment-canceled")}>Cancelar</Button>
                <Button type="submit">Pagar ahora</Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <aside className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de compra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between text-sm">
                        <span>{it.name} × {it.quantity}</span>
                        <span>${(it.price * it.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Separator />
                <div className="flex items-center justify-between text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between text-sm"><span>Envío</span><span>${shippingCost.toFixed(2)}</span></div>
                <div className="flex items-center justify-between text-sm"><span>Impuestos</span><span>${tax.toFixed(2)}</span></div>
                <Separator />
                <div className="flex items-center justify-between font-medium"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
