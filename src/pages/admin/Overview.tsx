import { useNavigate } from "react-router-dom";
import { useCars, useReviewsAll, useServices, useSiteSettings } from "@/hooks/useSiteData";
import { Car, Wrench, MessageSquare, CreditCard, ImageIcon, TrendingUp, Users, Calendar, ArrowUpRight } from "lucide-react";
import { Section } from "./SharedUI";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

const bookingData = [
  { name: "May 19", bookings: 4, revenue: 8200 },
  { name: "May 20", bookings: 7, revenue: 14500 },
  { name: "May 21", bookings: 5, revenue: 11000 },
  { name: "May 22", bookings: 9, revenue: 19800 },
  { name: "May 23", bookings: 12, revenue: 26400 },
  { name: "May 24", bookings: 8, revenue: 17200 },
  { name: "May 25", bookings: 15, revenue: 32000 },
];

const Overview = () => {
  const navigate = useNavigate();
  const { data: cars = [] } = useCars({ includeInactive: true });
  const { data: reviews = [] } = useReviewsAll();
  const { data: services = [] } = useServices({ includeInactive: true });
  const { data: settings } = useSiteSettings();

  const activeCars = cars.filter((c) => c.active).length;
  const activeReviews = reviews.filter((r) => r.active).length;
  const liveServices = services.filter((s) => s.active).length;

  const stats = [
    { 
      label: "Fleet Availability", 
      value: `${activeCars}/${cars.length}`, 
      sub: "Vehicles live", 
      color: "from-blue-500/20 to-indigo-500/20 border-indigo-500/30 text-indigo-400",
      icon: Car, 
      path: "/admin/cars" 
    },
    { 
      label: "Total Bookings", 
      value: "60", 
      sub: "+15% from last week", 
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
      icon: Calendar, 
      path: "/admin" 
    },
    { 
      label: "Est. Revenue", 
      value: "₹1.28L", 
      sub: "Direct enquiries generated", 
      color: "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-500",
      icon: CreditCard, 
      path: "/admin/payment" 
    },
    { 
      label: "Active Reviews", 
      value: activeReviews, 
      sub: `${reviews.length - activeReviews} waiting approval`, 
      color: "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400",
      icon: MessageSquare, 
      path: "/admin/reviews" 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground tracking-tight">Console Command</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time landing page telemetry, stats, and live layout modifiers.</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/35 border border-border/50 rounded-2xl p-2.5 backdrop-blur-xl shrink-0 self-start md:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block shrink-0" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Sync Active</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <button 
            key={i} 
            onClick={() => navigate(s.path)} 
            className={`text-left rounded-3xl border bg-card/45 p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 group relative overflow-hidden`}
          >
            {/* Soft backdrop radial glow */}
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-xl group-hover:scale-125 transition-transform duration-500`} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
                <s.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            
            <div className="relative z-10">
              <div className="font-display font-black text-3xl mb-1 text-foreground leading-none">{s.value}</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <div className="text-[11px] text-muted-foreground mt-1 font-medium">{s.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Analytics Graph Panels */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Interactive Spline Area Chart */}
        <div className="lg:col-span-2 backdrop-blur-xl bg-card/40 border border-border/60 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">Traffic & Lead Valuation</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Estimated revenue from WhatsApp clicks</p>
            </div>
            <div className="flex gap-4 text-xs font-bold shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>Revenue (₹)</span>
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glowColorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(20, 20, 30, 0.9)', 
                    borderColor: 'rgba(255,255,255,0.08)', 
                    borderRadius: '16px', 
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#glowColorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Bookings Bar Chart */}
        <div className="backdrop-blur-xl bg-card/40 border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-foreground font-display">Daily Operations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Booking triggers recorded</p>
          </div>
          
          <div className="h-[180px] w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20, 20, 30, 0.9)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">Weekly Growth</span>
            </div>
            <span className="font-bold text-emerald-400">+28.5%</span>
          </div>
        </div>
      </div>

      {/* Quick Launch Panel */}
      <Section title="Direct Controls" description="Fast route triggers to modify sections of the public landing page instantly.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => navigate("/admin/branding")} 
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-border bg-card/35 hover:border-primary/50 transition-all hover:scale-[1.02] duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform"><ImageIcon className="w-5 h-5" /></div>
            <span className="text-xs font-semibold text-foreground">Branding</span>
          </button>
          
          <button 
            onClick={() => navigate("/admin/cars")} 
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-border bg-card/35 hover:border-primary/50 transition-all hover:scale-[1.02] duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform"><Car className="w-5 h-5" /></div>
            <span className="text-xs font-semibold text-foreground">Manage Cars</span>
          </button>

          <button 
            onClick={() => navigate("/admin/services")} 
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-border bg-card/35 hover:border-primary/50 transition-all hover:scale-[1.02] duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform"><Wrench className="w-5 h-5" /></div>
            <span className="text-xs font-semibold text-foreground">Services</span>
          </button>

          <button 
            onClick={() => navigate("/admin/whatsapp")} 
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-border bg-card/35 hover:border-primary/50 transition-all hover:scale-[1.02] duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform"><MessageSquare className="w-5 h-5" /></div>
            <span className="text-xs font-semibold text-foreground">WhatsApp API</span>
          </button>
        </div>
      </Section>
    </div>
  );
};

export default Overview;
