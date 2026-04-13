import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ItemCard } from "@/components/ItemCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ItemCategory = Database["public"]["Enums"]["item_category"];

const categories: { label: string; value: ItemCategory }[] = [
  { label: "Tools", value: "tools" },
  { label: "Electronics", value: "electronics" },
  { label: "Appliances", value: "appliances" },
  { label: "Vehicles", value: "vehicles" },
  { label: "Sports", value: "sports" },
  { label: "Furniture", value: "furniture" },
  { label: "Clothing", value: "clothing" },
  { label: "Other", value: "other" },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<string>(searchParams.get("category") ?? "all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["browse-items", query, category, priceRange, location],
    queryFn: async () => {
      let q = supabase
        .from("items")
        .select("*")
        .eq("is_available", true)
        .gte("price_per_day", priceRange[0])
        .lte("price_per_day", priceRange[1])
        .order("created_at", { ascending: false });

      if (query) q = q.ilike("name", `%${query}%`);
      if (category && category !== "all") q = q.eq("category", category as ItemCategory);
      if (location) q = q.ilike("location", `%${location}%`);

      const { data } = await q;
      return data ?? [];
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "all") params.set("category", category);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Browse Items</h1>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="mr-1 h-4 w-4" /> Filters
          </Button>
        </div>

        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {showFilters && (
          <div className="mt-4 grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price: ${priceRange[0]} – ${priceRange[1]}/day</label>
              <Slider min={0} max={500} step={5} value={priceRange} onValueChange={setPriceRange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location</label>
              <Input placeholder="City or area" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => { setCategory("all"); setPriceRange([0, 500]); setLocation(""); setQuery(""); }}>
                <X className="mr-1 h-4 w-4" /> Clear
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading items...</div>
        ) : items && items.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-lg font-medium text-foreground">No items found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
