"use client";

import { useState } from "react";
import PDFForm from "../components/PDFForm";

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFormSubmit = async (formData: any) => {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Devis Contractuel Generator</h1>
      <PDFForm onSubmit={handleFormSubmit} />
      {pdfUrl && (
        <div className="mt-4">
          <a
            href={pdfUrl}
            download="devis-contractuel.pdf"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Download Devis Contractuel PDF
          </a>
        </div>
      )}
    </div>
  );
}
