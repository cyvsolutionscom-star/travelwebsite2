import { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { type Car } from "@/hooks/useSiteData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, User, Phone, MapPin, MessageSquare, Loader2 } from "lucide-react";

type Props = {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  bookingTemplate: string;
};

export const BookingModal = ({ car, isOpen, onClose, whatsappNumber, bookingTemplate }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pickupLoc: "Vijayawada",
    dropLoc: "",
    pickupDate: "",
    dropDate: "",
    notes: "",
  });

  if (!car) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.pickupLoc || !formData.pickupDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // 1. Record the booking in the Supabase database
      const { error } = await supabase.from("bookings").insert({
        customer_name: formData.name,
        phone_number: formData.phone,
        pickup_location: formData.pickupLoc,
        drop_location: formData.dropLoc || "",
        pickup_date: new Date(formData.pickupDate).toISOString(),
        drop_date: formData.dropDate ? new Date(formData.dropDate).toISOString() : null,
        car_id: car.id,
        status: "Pending",
        payment_status: "Unpaid",
        notes: formData.notes ? `User request: ${formData.notes}` : null,
      });

      if (error) {
        // Log error but do not block the user's booking experience. Fallback to WhatsApp redirect directly.
        console.error("Failed to log booking in database:", error);
      } else {
        toast.success("Booking request logged!");
      }
    } catch (err) {
      console.error("Error inserting booking:", err);
    } finally {
      setLoading(false);

      // 2. Format details and open WhatsApp
      const template = bookingTemplate || "Hi! I want to book the {car} (₹{price}/day). Please share availability.";
      
      let customerDetails = `\n\n*Booking Details:*`;
      customerDetails += `\n👤 Name: ${formData.name}`;
      customerDetails += `\n📞 Phone: ${formData.phone}`;
      customerDetails += `\n📍 Pickup: ${formData.pickupLoc}`;
      if (formData.dropLoc) customerDetails += `\n📍 Drop: ${formData.dropLoc}`;
      customerDetails += `\n📅 Pickup Date: ${new Date(formData.pickupDate).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
      if (formData.dropDate) customerDetails += `\n📅 Drop Date: ${new Date(formData.dropDate).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
      if (formData.notes) customerDetails += `\n📝 Notes: ${formData.notes}`;

      const baseMessage = template.replace(/\{car\}/g, car.name).replace(/\{price\}/g, String(car.price_per_day));
      const fullMessage = encodeURIComponent(baseMessage + customerDetails);

      window.open(`https://wa.me/${whatsappNumber}?text=${fullMessage}`, "_blank", "noopener,noreferrer");
      
      // Reset and close
      setFormData({
        name: "",
        phone: "",
        pickupLoc: "Vijayawada",
        dropLoc: "",
        pickupDate: "",
        dropDate: "",
        notes: "",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md backdrop-blur-2xl bg-card/90 border border-border/80 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-2xl text-foreground">
            Book <span className="text-gradient">{car.name}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Please fill in your details to secure your self-drive rental request. We will immediately transfer you to WhatsApp to finalize.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* Customer Details */}
          <div className="space-y-3">
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pickup Location *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="Benz Circle"
                  value={formData.pickupLoc}
                  onChange={(e) => setFormData({ ...formData, pickupLoc: e.target.value })}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Drop Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Benz Circle"
                  value={formData.dropLoc}
                  onChange={(e) => setFormData({ ...formData, dropLoc: e.target.value })}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pickup Date & Time *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="datetime-local"
                  required
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Drop Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="datetime-local"
                  value={formData.dropDate}
                  onChange={(e) => setFormData({ ...formData, dropDate: e.target.value })}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Special requests / Notes</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                placeholder="Any special requirements, child seat, outstation duration..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-5 rounded-xl bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 btn-glow hover:scale-[1.01] transition-transform"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              Confirm & Book on WhatsApp
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
