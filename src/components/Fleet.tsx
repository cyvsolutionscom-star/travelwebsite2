import { useState } from "react";
import { Users, Fuel, Settings, MessageCircle, Phone } from "lucide-react";
import { useCars, useSiteSettings, type Car } from "@/hooks/useSiteData";
import { BookingModal } from "@/components/BookingModal";

type Cat = "all" | "suv" | "sedan" | "mpv";

const filters: { id: Cat; label: string }[] = [
  { id: "all", label: "All Cars" },
  { id: "suv", label: "SUVs" },
  { id: "sedan", label: "Sedans" },
  { id: "mpv", label: "MPVs" },
];

const Fleet = () => {
  const [active, setActive] = useState<Cat>("all");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const { data: cars = [], isLoading } = useCars();
  const { data: settings } = useSiteSettings();
  const wa = settings?.whatsapp_number ?? "919492456488";
  const phone = settings?.phone_number ?? "+919492456488";

  const visible = active === "all" ? cars : cars.filter((c: Car) => c.category === active);

  const handleBookClick = (car: Car) => {
    setSelectedCar(car);
    setModalOpen(true);
  };

  return (
    <section id="fleet" className="py-24 sm:py-32 bg-background/40">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="accent-rule">Our Cars</span>
          <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mt-4 mb-4">
            Choose Your <span className="text-gradient">Ride</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Every vehicle is thoroughly cleaned, serviced, and inspected before handover. Tap "Book on WhatsApp" to reserve instantly.
          </p>
        </div>

        <div className="flex justify-center flex-wrap gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`px-5 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                active === f.id
                  ? "bg-gradient-primary text-primary-foreground btn-glow scale-105"
                  : "bg-secondary/60 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-20">Loading fleet…</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((car, i) => (
              <article
                key={car.id}
                className="card-elevated rounded-3xl overflow-hidden border border-border/60 group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={car.image_url}
                    alt={car.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {car.badge && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider btn-glow">
                      {car.badge}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-display font-bold text-xl mb-1">{car.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{car.type_label} • {car.use_label}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary/70 border border-border"><Users className="w-3 h-3" />{car.seats}</span>
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary/70 border border-border"><Fuel className="w-3 h-3" />{car.fuel}</span>
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary/70 border border-border"><Settings className="w-3 h-3" />{car.transmission}</span>
                  </div>

                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Starting from</div>
                      <div className="font-display font-bold text-2xl text-gradient">₹{car.price_per_day}<span className="text-sm text-muted-foreground font-medium">/day</span></div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookClick(car)}
                    className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:brightness-110 transition-all hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4" /> Book on WhatsApp
                  </button>
                  <a
                    href={`tel:${phone}`}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 h-11 rounded-full border border-border text-sm font-semibold hover:bg-secondary transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Call to Book
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <BookingModal
        car={selectedCar}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        whatsappNumber={wa}
        bookingTemplate={settings?.whatsapp_booking_template ?? "Hi! I want to book the {car} (₹{price}/day). Please share availability."}
      />
    </section>
  );
};

export default Fleet;

