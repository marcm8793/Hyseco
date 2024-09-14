import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  {
    title: "Nettoyage de bureaux",
    description: "Maintenez un environnement de travail propre et productif.",
  },
  {
    title: "Nettoyage résidentiel",
    description: "Des services de nettoyage personnalisés pour votre maison.",
  },
  {
    title: "Nettoyage industriel",
    description:
      "Solutions de nettoyage pour les grandes installations industrielles.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Nos Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="transition-transform hover:scale-105">
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
