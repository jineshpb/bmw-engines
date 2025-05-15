import Image from "next/image";
import Link from "next/link";
import { CarModel } from "@/types/cars";
import supabase from "@/lib/supabaseClient";

interface CarModelCardProps {
  model: CarModel;
}

const CarModelCard = ({ model }: CarModelCardProps) => {
  let imageUrl = "";
  if (model.image_path) {
    const {
      data: { publicUrl },
    } = supabase.storage.from("car-images").getPublicUrl(model.image_path);
    imageUrl = publicUrl;
  }

  // console.log("From car card in engine page", imageUrl);

  return (
    <Link
      href={`/cars/${model.car_makes.name.toLowerCase()}/${model.name.toLowerCase()}`}
      className="group block"
    >
      <div className="relative h-40 overflow-hidden rounded-lg mb-2">
        {model.image_path ? (
          <Image
            src={imageUrl}
            alt={model.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Image
            src="/placeholder-1.png"
            alt={model.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform opacity-50"
          />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-medium">
          {model.car_makes.name} {model.name}
        </h3>
        <p className="text-sm text-muted-foreground">{model.model_year}</p>
      </div>
    </Link>
  );
};

export default CarModelCard;
