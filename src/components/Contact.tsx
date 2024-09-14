"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await emailjs.send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        formData,
        "YOUR_USER_ID"
      );
      alert("Message envoyé avec succès!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Contactez-nous</h2>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <Input
            type="text"
            name="name"
            placeholder="Votre nom"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Votre email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Textarea
            name="message"
            placeholder="Votre message"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full">
            Envoyer
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
