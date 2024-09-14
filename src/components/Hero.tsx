import Image from "next/image";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative h-screen">
      <Image
        src="/hero-image.jpg"
        alt="Service de nettoyage"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-white text-center">
        <h1 className="text-5xl font-bold mb-4">
          Services de Nettoyage Professionnels
        </h1>
        <p className="text-xl mb-8">
          Des espaces propres pour un environnement sain
        </p>
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Demander un devis
        </Button>
      </div>
    </div>
  );
};

export default Hero;
