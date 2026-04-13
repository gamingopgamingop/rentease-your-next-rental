import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Calendar, DollarSign, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

const statusColors: Record<BookingStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const { data: roles } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      return data?.map((r) => r.role) ?? [];
    },
    enabled: !!user,
  });

  const isOwner = roles?.includes("owner");

  const { data: myItems } = useQuery({
    queryKey: ["my-items", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("items").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user && isOwner,
  });

  const { data: ownerBookings } = useQuery({
    queryKey: ["owner-bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, items(name, image_url), profiles:renter_id(full_name)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user && isOwner,
  });

  const { data: renterBookings } = useQuery({
    queryKey: ["renter-bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, items(name, image_url, price_per_day), profiles:owner_id(full_name)")
        .eq("renter_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: BookingStatus }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking updated!");
      queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["renter-bookings"] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("items").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item deleted");
      queryClient.invalidateQueries({ queryKey: ["my-items"] });
    },
  });

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          {isOwner && (
            <Button onClick={() => navigate("/items/new")}>
              <Plus className="mr-1 h-4 w-4" /> List Item
            </Button>
          )}
        </div>

        <Tabs defaultValue={isOwner ? "listings" : "rentals"} className="mt-6">
          <TabsList>
            {isOwner && <TabsTrigger value="listings">My Listings</TabsTrigger>}
            {isOwner && <TabsTrigger value="requests">Booking Requests</TabsTrigger>}
            <TabsTrigger value="rentals">My Rentals</TabsTrigger>
          </TabsList>

          {isOwner && (
            <TabsContent value="listings" className="mt-4">
              {myItems && myItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {myItems.map((item) => (
                    <Card key={item.id} className="border-0 shadow-md overflow-hidden">
                      <div className="aspect-video bg-muted">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground"><Package className="h-8 w-8" /></div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.price_per_day}/day</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/items/${item.id}/edit`)}>
                            <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteItem.mutate(item.id)}>
                            <Trash2 className="mr-1 h-3 w-3" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No items listed yet</p>
                  <Button className="mt-4" onClick={() => navigate("/items/new")}>List Your First Item</Button>
                </div>
              )}
            </TabsContent>
          )}

          {isOwner && (
            <TabsContent value="requests" className="mt-4 space-y-3">
              {ownerBookings && ownerBookings.length > 0 ? (
                ownerBookings.map((b) => (
                  <Card key={b.id} className="border-0 shadow-sm">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium text-foreground">{(b.items as any)?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(b.profiles as any)?.full_name} • {format(new Date(b.start_date), "MMM d")} – {format(new Date(b.end_date), "MMM d")}
                        </p>
                        <p className="text-sm font-medium text-foreground">${b.total_price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[b.status]}>{b.status}</Badge>
                        {b.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus.mutate({ bookingId: b.id, status: "confirmed" })}>
                              <CheckCircle className="mr-1 h-3 w-3" /> Confirm
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus.mutate({ bookingId: b.id, status: "cancelled" })}>
                              <XCircle className="mr-1 h-3 w-3" /> Decline
                            </Button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus.mutate({ bookingId: b.id, status: "completed" })}>
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">No booking requests</p>
              )}
            </TabsContent>
          )}

          <TabsContent value="rentals" className="mt-4 space-y-3">
            {renterBookings && renterBookings.length > 0 ? (
              renterBookings.map((b) => (
                <Card key={b.id} className="border-0 shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                        {(b.items as any)?.image_url ? (
                          <img src={(b.items as any).image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{(b.items as any)?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(b.start_date), "MMM d")} – {format(new Date(b.end_date), "MMM d")} • ${b.total_price}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[b.status]}>{b.status}</Badge>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No rentals yet</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/browse")}>Browse Items</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
