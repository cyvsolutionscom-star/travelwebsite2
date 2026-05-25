import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Section, Loading, Empty, Field, SelectField } from "./SharedUI";
import { Calendar, Trash2, CheckCircle2, XCircle, Clock, Check, RefreshCw, Plus, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

type Booking = {
  id: string;
  customer_name: string;
  phone_number: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  drop_date: string | null;
  car_id: string | null;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
};

const BookingsEditor = () => {
  const qc = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customer_name: "",
    phone_number: "",
    pickup_location: "",
    drop_location: "",
    pickup_date: "",
    drop_date: "",
    car_id: "",
    status: "Pending",
    payment_status: "Unpaid",
    notes: "",
  });

  // Fetch Bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        // Return mock data if table is not yet created in remote DB to prevent crash
        console.warn("Bookings table check failed. Please ensure the migration is executed.", error);
        return [];
      }
      return data as Booking[];
    },
  });

  // Fetch Cars (for manual selection & mapping)
  const { data: cars = [] } = useQuery({
    queryKey: ["cars", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("cars").select("id, name");
      return data ?? [];
    },
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking status updated");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, payment_status }: { id: string; payment_status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ payment_status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment status updated");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking deleted");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from("bookings").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking logged successfully");
      setShowAddForm(false);
      setNewBooking({
        customer_name: "",
        phone_number: "",
        pickup_location: "",
        drop_location: "",
        pickup_date: "",
        drop_date: "",
        car_id: "",
        status: "Pending",
        payment_status: "Unpaid",
        notes: "",
      });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.customer_name || !newBooking.phone_number || !newBooking.pickup_location || !newBooking.pickup_date) {
      return toast.error("Please fill in required fields (Name, Phone, Pickup Location, Date)");
    }
    
    const payload = {
      customer_name: newBooking.customer_name,
      phone_number: newBooking.phone_number,
      pickup_location: newBooking.pickup_location,
      drop_location: newBooking.drop_location,
      pickup_date: newBooking.pickup_date,
      drop_date: newBooking.drop_date || null,
      car_id: newBooking.car_id || null,
      status: newBooking.status,
      payment_status: newBooking.payment_status,
      notes: newBooking.notes || null,
    };
    createMutation.mutate(payload);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "Completed":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/30";
      case "Cancelled":
        return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Partial":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-muted-foreground border-slate-500/20";
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <Section 
        title="Bookings Management" 
        description="Monitor rental bookings logged from the landing page or add new entries manually."
        action={
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold btn-glow"
          >
            {showAddForm ? "View Bookings" : <><Plus className="w-4 h-4" /> Add Manual Booking</>}
          </button>
        }
      >
        {showAddForm ? (
          <form onSubmit={handleAddSubmit} className="space-y-4 max-w-xl mx-auto p-6 rounded-2xl bg-white/[0.01] border border-white/5">
            <h3 className="font-display font-semibold text-lg border-b border-border pb-2 mb-4">Log New Booking</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Customer Name *" value={newBooking.customer_name} onChange={(v) => setNewBooking({ ...newBooking, customer_name: v })} />
              <Field label="Phone Number *" value={newBooking.phone_number} onChange={(v) => setNewBooking({ ...newBooking, phone_number: v })} />
              <Field label="Pickup Location *" value={newBooking.pickup_location} onChange={(v) => setNewBooking({ ...newBooking, pickup_location: v })} />
              <Field label="Drop Location" value={newBooking.drop_location} onChange={(v) => setNewBooking({ ...newBooking, drop_location: v })} />
              <Field label="Pickup Date & Time *" type="datetime-local" value={newBooking.pickup_date} onChange={(v) => setNewBooking({ ...newBooking, pickup_date: v })} />
              <Field label="Drop Date & Time" type="datetime-local" value={newBooking.drop_date} onChange={(v) => setNewBooking({ ...newBooking, drop_date: v })} />
              
              <SelectField 
                label="Select Car" 
                value={newBooking.car_id} 
                onChange={(v) => setNewBooking({ ...newBooking, car_id: v })} 
                options={[["", "None / Unspecified"], ...cars.map(c => [c.id, c.name] as [string, string])]}
              />

              <SelectField 
                label="Booking Status" 
                value={newBooking.status} 
                onChange={(v) => setNewBooking({ ...newBooking, status: v })} 
                options={[["Pending", "Pending"], ["Confirmed", "Confirmed"], ["Completed", "Completed"], ["Cancelled", "Cancelled"]]}
              />
              
              <SelectField 
                label="Payment Status" 
                value={newBooking.payment_status} 
                onChange={(v) => setNewBooking({ ...newBooking, payment_status: v })} 
                options={[["Unpaid", "Unpaid"], ["Partial", "Partial"], ["Paid", "Paid"]]}
              />
            </div>
            
            <Field label="Administrative Notes" value={newBooking.notes} onChange={(v) => setNewBooking({ ...newBooking, notes: v })} multiline />

            <div className="flex gap-3 justify-end pt-4">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="px-5 h-10 rounded-xl bg-secondary border border-border text-sm font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-6 h-10 rounded-xl bg-gradient-primary text-primary-foreground font-semibold btn-glow"
              >
                {createMutation.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                Log Booking
              </button>
            </div>
          </form>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-secondary/20">
            {bookings.length === 0 ? (
              <Empty text="No bookings logged yet. Ensure Supabase migrations are run and bookings are added." />
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-white/[0.02]">
                    <th className="p-4 font-semibold text-muted-foreground">Customer</th>
                    <th className="p-4 font-semibold text-muted-foreground">Rental Info</th>
                    <th className="p-4 font-semibold text-muted-foreground">Vehicle</th>
                    <th className="p-4 font-semibold text-muted-foreground">Status</th>
                    <th className="p-4 font-semibold text-muted-foreground">Payment</th>
                    <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {bookings.map((b) => {
                    const car = cars.find((c) => c.id === b.car_id);
                    return (
                      <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{b.customer_name}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{b.phone_number}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs space-y-0.5">
                            <div><span className="text-muted-foreground">Pick:</span> <span className="text-foreground font-medium">{b.pickup_location}</span></div>
                            <div><span className="text-muted-foreground">Drop:</span> <span className="text-foreground">{b.drop_location || "—"}</span></div>
                            <div className="flex items-center gap-1 text-[10px] text-primary font-medium mt-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(b.pickup_date).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              {b.drop_date && ` → ${new Date(b.drop_date).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-foreground">
                          {car ? car.name : <span className="text-muted-foreground text-xs italic">Not selected</span>}
                          {b.notes && <div className="text-[10px] text-muted-foreground font-normal max-w-xs truncate mt-0.5" title={b.notes}>{b.notes}</div>}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] uppercase tracking-wider font-semibold ${getStatusColor(b.status)}`}>
                            {b.status === "Confirmed" && <CheckCircle2 className="w-3 h-3" />}
                            {b.status === "Cancelled" && <XCircle className="w-3 h-3" />}
                            {b.status === "Pending" && <Clock className="w-3 h-3" />}
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select 
                            value={b.payment_status} 
                            onChange={(e) => updatePaymentMutation.mutate({ id: b.id, payment_status: e.target.value })}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary ${getPaymentColor(b.payment_status)}`}
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partial">Partial</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.status === "Pending" && (
                              <button 
                                onClick={() => updateStatusMutation.mutate({ id: b.id, status: "Confirmed" })}
                                className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20"
                                title="Confirm Booking"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {b.status !== "Completed" && b.status !== "Cancelled" && (
                              <button 
                                onClick={() => updateStatusMutation.mutate({ id: b.id, status: "Completed" })}
                                className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/20"
                                title="Complete Journey"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {b.status !== "Cancelled" && (
                              <button 
                                onClick={() => updateStatusMutation.mutate({ id: b.id, status: "Cancelled" })}
                                className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20"
                                title="Cancel Booking"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this booking history?")) {
                                  deleteMutation.mutate(b.id);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center hover:bg-destructive/20"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Section>
    </div>
  );
};

export default BookingsEditor;
