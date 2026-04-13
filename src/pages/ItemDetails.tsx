import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Star, CalendarIcon, User } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("items")
        .select("*, profiles:owner_id(full_name, location)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles:reviewer_id(full_name)")
        .eq("item_id", id!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!user || !item || !dateRange?.from || !dateRange?.to) throw new Error("Missing data");
      const days = differenceInDays(dateRange.to, dateRange.from) + 1;
      const totalPrice = days * item.price_per_day;

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          item_id: item.id,
          renter_id: user.id,
          owner_id: item.owner_id,
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
          total_price: totalPrice,
        })
        .select()
        .single();

      if (error) throw error;

      // Mock payment
      await supabase.from("payments").insert({
        booking_id: booking.id,
        payer_id: user.id,
        amount: totalPrice,
      });

      // Notification to owner
      await supabase.from("notifications").insert({
        user_id: item.owner_id,
        title: "New Booking Request",
        message: `Someone booked "${item.name}" from ${format(dateRange.from, "MMM d")} to ${format(dateRange.to, "MMM d")}`,
      });

      return booking;
    },
    onSuccess: () => {
      toast.success("Booking confirmed! Payment processed.");
      queryClient.invalidateQueries({ queryKey: ["item", id] });
      setDateRange(undefined);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Must be logged in");
      const { error } = await supabase.from("reviews").insert({
        item_id: id,
        reviewer_id: user.id,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="min-h-screen bg-background"><Navbar /><div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div></div>;
  if (!item) return <div className="min-h-screen bg-background"><Navbar /><div className="flex items-center justify-center py-20 text-muted-foreground">Item not found</div></div>;

  const days = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : 0;
  const totalPrice = days * item.price_per_day;
  const avgRating = reviews?.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const ownerProfile = item.profiles as any;
  const conditionLabels: Record<string, string> = { new: "New", like_new: "Like New", good: "Good", fair: "Fair", worn: "Worn" };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Image + Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video overflow-hidden rounded-2xl bg-muted">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge variant="outline">{conditionLabels[item.condition] ?? item.condition}</Badge>
                {avgRating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    {avgRating} ({reviews?.length} reviews)
                  </div>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-bold text-foreground">{item.name}</h1>
              {item.location && (
                <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {item.location}
                </p>
              )}
              {item.description && <p className="mt-4 text-foreground leading-relaxed">{item.description}</p>}

              {ownerProfile && (
                <div className="mt-6 flex items-center gap-3 rounded-xl border bg-card p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{ownerProfile.full_name ?? "User"}</p>
                    {ownerProfile.location && <p className="text-sm text-muted-foreground">{ownerProfile.location}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((r) => (
                    <div key={r.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{(r.profiles as any)?.full_name ?? "User"}</p>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("h-4 w-4", s <= r.rating ? "fill-warning text-warning" : "text-muted")} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No reviews yet</p>
                )}

                {user && user.id !== item.owner_id && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    <p className="font-medium text-foreground">Leave a Review</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setRating(s)}>
                          <Star className={cn("h-6 w-6 cursor-pointer", s <= rating ? "fill-warning text-warning" : "text-muted")} />
                        </button>
                      ))}
                    </div>
                    <Textarea placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
                    <Button size="sm" onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>
                      Submit Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Booking */}
          <div>
            <Card className="sticky top-24 border-0 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <p className="text-3xl font-bold text-foreground">
                  ${item.price_per_day}<span className="text-base font-normal text-muted-foreground">/day</span>
                </p>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !dateRange?.from && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
                        ) : format(dateRange.from, "MMM d, yyyy")
                      ) : "Select rental dates"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {days > 0 && (
                  <div className="space-y-2 rounded-lg bg-muted p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">${item.price_per_day} × {days} days</span>
                      <span className="text-foreground">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-foreground border-t pt-2">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!days || bookMutation.isPending || !user || user.id === item.owner_id}
                  onClick={() => {
                    if (!user) { navigate("/login"); return; }
                    bookMutation.mutate();
                  }}
                >
                  {!user ? "Sign in to Book" : bookMutation.isPending ? "Processing..." : "Book Now"}
                </Button>

                {user?.id === item.owner_id && (
                  <p className="text-center text-sm text-muted-foreground">You own this item</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
