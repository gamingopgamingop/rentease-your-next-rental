import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import type { Database } from "@/integrations/supabase/types";

type ItemCategory = Database["public"]["Enums"]["item_category"];
type ItemCondition = Database["public"]["Enums"]["item_condition"];

export default function ItemForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("other");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<ItemCondition>("good");
  const [pricePerDay, setPricePerDay] = useState("");
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isEdit || !user) return;
    supabase.from("items").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setName(data.name);
        setCategory(data.category);
        setDescription(data.description ?? "");
        setCondition(data.condition);
        setPricePerDay(String(data.price_per_day));
        setLocation(data.location ?? "");
        if (data.available_from && data.available_to) {
          setDateRange({ from: new Date(data.available_from), to: new Date(data.available_to) });
        }
      }
    });
  }, [id, isEdit, user]);

  // Dynamic pricing suggestion
  useEffect(() => {
    if (!category || category === "other") { setSuggestedPrice(null); return; }
    supabase
      .from("items")
      .select("price_per_day")
      .eq("category", category)
      .eq("is_available", true)
      .then(({ data }) => {
        if (data && data.length >= 2) {
          const avg = data.reduce((s, i) => s + i.price_per_day, 0) / data.length;
          setSuggestedPrice(Math.round(avg * 100) / 100);
        } else {
          setSuggestedPrice(null);
        }
      });
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const filePath = `${user.id}/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from("item-images").upload(filePath, imageFile);
      if (uploadError) { toast.error("Image upload failed"); setSaving(false); return; }
      const { data: urlData } = supabase.storage.from("item-images").getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    const itemData = {
      name: name.trim(),
      category,
      description: description.trim() || null,
      condition,
      price_per_day: parseFloat(pricePerDay),
      location: location.trim() || null,
      available_from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : null,
      available_to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : null,
      ...(imageUrl && { image_url: imageUrl }),
    };

    if (isEdit) {
      const { error } = await supabase.from("items").update(itemData).eq("id", id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Item updated!");
    } else {
      const { error } = await supabase.from("items").insert({ ...itemData, owner_id: user.id });
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Item listed!");
    }

    setSaving(false);
    navigate("/dashboard");
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Item" : "List a New Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Power Drill" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="appliances">Appliances</SelectItem>
                      <SelectItem value="vehicles">Vehicles</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={condition} onValueChange={(v) => setCondition(v as ItemCondition)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="worn">Worn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your item..." rows={3} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Price per Day ($)</Label>
                  <Input type="number" min="0" step="0.01" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />
                  {suggestedPrice && (
                    <p className="text-xs text-muted-foreground">
                      💡 Avg price for {category}: ${suggestedPrice}/day
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Availability Dates</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !dateRange?.from && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}` : format(dateRange.from, "MMM d, yyyy")
                      ) : "Select available dates"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={1} disabled={(d) => d < new Date()} className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:border-primary transition-colors">
                    <Upload className="h-4 w-4" />
                    {imageFile ? imageFile.name : "Choose image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Update Item" : "List Item"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
