import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ItemCardProps {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  location: string | null;
  image_url: string | null;
  condition: string;
  avgRating?: number;
}

export function ItemCard({ id, name, category, price_per_day, location, image_url, condition, avgRating }: ItemCardProps) {
  const navigate = useNavigate();

  const conditionLabel: Record<string, string> = {
    new: "New",
    like_new: "Like New",
    good: "Good",
    fair: "Fair",
    worn: "Worn",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={() => navigate(`/items/${id}`)}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          {image_url ? (
            <img src={image_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          <Badge className="absolute top-3 left-3 text-xs" variant="secondary">
            {category}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1">{name}</h3>
            {avgRating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {avgRating.toFixed(1)}
              </div>
            )}
          </div>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" /> {location}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold text-foreground">
              ${price_per_day}<span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
            <Badge variant="outline" className="text-xs">{conditionLabel[condition] ?? condition}</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
