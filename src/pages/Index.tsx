import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemCard } from "@/components/ItemCard";
import { Search, Shield, Clock, Star, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: featuredItems } = useQuery({
    queryKey: ["featured-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });

  const { data: popularItems } = useQuery({
    queryKey: ["popular-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("items")
        .select("*, reviews(rating)")
        .eq("is_available", true)
        .limit(4);
      return (data ?? []).map((item) => ({
        ...item,
        avgRating: item.reviews?.length
          ? item.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / item.reviews.length
          : undefined,
      }));
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
  };

  const categories = [
    { name: "Tools", icon: "🔧", value: "tools" },
    { name: "Electronics", icon: "📱", value: "electronics" },
    { name: "Appliances", icon: "🏠", value: "appliances" },
    { name: "Vehicles", icon: "🚗", value: "vehicles" },
    { name: "Sports", icon: "⚽", value: "sports" },
    { name: "Furniture", icon: "🪑", value: "furniture" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-teal-light px-4 py-20 md:py-28">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl"
          >
            Rent anything,{" "}
            <span className="text-primary">anytime</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
          >
            From power tools to party supplies — rent what you need from people nearby at a fraction of the cost.
          </motion.p>
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-8 flex max-w-lg gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for items..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </motion.form>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground">Browse by Category</h2>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => navigate(`/browse?category=${cat.value}`)}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium text-foreground">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      {featuredItems && featuredItems.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Recently Listed</h2>
            <Button variant="ghost" onClick={() => navigate("/browse")}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Items */}
      {popularItems && popularItems.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-foreground">Popular Items</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {popularItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* Value Props */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Shield, title: "Secure & Trusted", desc: "All transactions are protected. Rate and review every rental experience." },
            { icon: Clock, title: "Flexible Rentals", desc: "Rent by the day. Pick your dates, book instantly, and return when done." },
            { icon: Star, title: "Great Prices", desc: "Save up to 90% compared to buying. Earn by listing items you rarely use." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-primary-foreground">Ready to start renting?</h2>
        <p className="mt-2 text-primary-foreground/80">Join thousands of people sharing resources in your community.</p>
        <Button variant="secondary" size="lg" className="mt-6" onClick={() => navigate("/register")}>
          Get Started Free
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} RentEase. All rights reserved.
      </footer>
    </div>
  );
}
