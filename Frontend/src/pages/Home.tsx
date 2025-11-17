import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Truck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

export default function Home() {

  const [sliderRef] = useKeenSlider({
    loop: true,
    mode: "snap",
    slides: { perView: 1, spacing: 15 },
    breakpoints: {
      "(min-width: 768px)": { slides: { perView: 2, spacing: 15 } },
      "(min-width: 1024px)": { slides: { perView: 3, spacing: 20 } },
    },
  });

  const sliderImages = [
    { id: 1, url: "https://i.pinimg.com/736x/82/19/14/82191414c93483468e0c5a756dc2920c.jpg", title: "Tazas Personalizadas" },
    { id: 2, url: "https://i.pinimg.com/736x/86/0d/fe/860dfe069b80ad7f6f33a881b96c4ba5.jpg", title: "Platos Decorativos" },
    { id: 3, url: "https://i.pinimg.com/1200x/f4/1d/cb/f41dcb4b8c08ae7714094346cc676271.jpg", title: "Macetas Artesanales" },
    { id: 4, url: "https://i.pinimg.com/736x/ce/54/79/ce5479d909d19e75d24516f4fc1d35cc.jpg", title: "Figuras Únicas" },
  ];

  return (
    <div className="min-h-screen">
      
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-cornsilk via-warm to-accent py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6">
            ✨ Cerámicas Artesanales Personalizadas
          </Badge>

          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Crea Piezas <span className="text-ceramics">Únicas</span> de Cerámica
          </h1>

          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Hechas a mano, con amor y personalizables para ti. Dale a tu hogar un toque especial.
          </p>

          <Link to="/productos">
            <Button size="lg" className="bg-ceramics hover:bg-ceramics/90 text-ceramics-foreground">
              Explorar Catálogo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">

          <div>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Calidad Garantizada</h3>
            <p className="text-muted-foreground">Materiales premium y acabados profesionales.</p>
          </div>

          <div>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Hecho con Amor</h3>
            <p className="text-muted-foreground">Cada pieza es elaborada por artesanos expertos.</p>
          </div>

          <div>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Envío Seguro</h3>
            <p className="text-muted-foreground">Empaque especializado y transporte seguro.</p>
          </div>

        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Nuestro Trabajo</h2>
            <p className="text-muted-foreground">
              Un vistazo a algunas piezas creadas con técnicas artesanales.
            </p>
          </div>

          <div ref={sliderRef} className="flex keen-slider justify-around">
            {sliderImages.map((img) => (
              <div key={img.id} className="w-72 rounded-xl">
                <div className="rounded-xl overflow-hidden shadow-lg bg-white ">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-64 object-cover"
                  />

                  <div className="p-4 justify-center text-center h-full flex items-center">
                    <p className="font-medium text-foreground">{img.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
