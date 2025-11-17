import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { customerAPI, RegisterAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import { LoginAPI } from "@/lib/api";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await LoginAPI.login(loginForm.email, loginForm.password);

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.firstName || user.email}`,
      });

      if (user.role === "admin") {
        window.location.href = "/admin";
      } else if (user.role === "employee") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }

    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "No se pudo iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const customerData = {
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        billingAddress: registerForm.billingAddress,
        shippingAddress: registerForm.shippingAddress,
      };

      await RegisterAPI.registerCustomer(customerData);

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente. Redirigiendo...",
      });

      setRegisterForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        billingAddress: "",
        shippingAddress: "",
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

    } catch (error) {
      toast({
        title: "Error en el registro",
        description: "No se pudo crear la cuenta. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cornsilk via-warm to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-ceramics rounded-lg flex items-center justify-center">
              <span className="text-ceramics-foreground font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Barroco Ceramics</span>
          </Link>
        </div>

        <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bienvenido</CardTitle>
            <CardDescription>
              Accede a tu cuenta o créate una nueva para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>

                <div className="text-center">
                  <Button variant="link" className="text-sm text-muted-foreground">
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress">Dirección de Facturación</Label>
                    <Input
                      id="billingAddress"
                      placeholder="Calle Principal 123, Ciudad"
                      value={registerForm.billingAddress}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, billingAddress: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">Dirección de Envío</Label>
                    <Input
                      id="shippingAddress"
                      placeholder="Misma que facturación o diferente"
                      value={registerForm.shippingAddress}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">O</span>
                </div>
              </div>

              <div className="mt-4">
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full">
                    Continuar como Invitado
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Al registrarte, aceptas nuestros{" "}
            <Link to="/terminos" className="text-ceramics hover:underline">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link to="/privacidad" className="text-ceramics hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}