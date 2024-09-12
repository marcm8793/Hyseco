import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { convert } from "html-to-text";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 50;

function addStyledTextWithWrapping(
  pdfDoc: PDFDocument,
  page: any,
  html: string,
  font: any,
  boldFont: any,
  italicFont: any,
  boldItalicFont: any,
  fontSize: number,
  startX: number,
  startY: number,
  maxWidth: number
) {
  const text = convert(html, {
    wordwrap: null,
    preserveNewlines: true,
  });

  const lines = text.split("\n").filter((line) => line.trim() !== "");
  let currentY = startY;
  const lineSpacing = fontSize * 1.2;

  for (const line of lines) {
    const words = line.split(" ");
    let currentLine = "";
    let isBold = false;
    let isItalic = false;

    for (const word of words) {
      if (word.startsWith("**") && word.endsWith("**")) {
        isBold = !isBold;
        continue;
      }
      if (word.startsWith("*") && word.endsWith("*")) {
        isItalic = !isItalic;
        continue;
      }

      const testLine = currentLine + (currentLine ? " " : "") + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth) {
        page.drawText(currentLine, {
          x: startX,
          y: currentY,
          size: fontSize,
          font:
            isBold && isItalic
              ? boldItalicFont
              : isBold
              ? boldFont
              : isItalic
              ? italicFont
              : font,
        });
        currentLine = word;
        currentY -= lineSpacing;

        if (currentY < MARGIN) {
          page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
          currentY = A4_HEIGHT - MARGIN;
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, {
        x: startX,
        y: currentY,
        size: fontSize,
        font:
          isBold && isItalic
            ? boldItalicFont
            : isBold
            ? boldFont
            : isItalic
            ? italicFont
            : font,
      });
    }

    currentY -= lineSpacing;
    if (currentY < MARGIN) {
      page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      currentY = A4_HEIGHT - MARGIN;
    }
  }

  return page;
}

function addTextWithWrapping(
  pdfDoc: PDFDocument,
  page: any,
  text: string,
  font: any,
  fontSize: number,
  startX: number,
  startY: number,
  maxWidth: number
) {
  const lines = text.split("\n");
  let currentY = startY;

  for (const line of lines) {
    const words = line.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth) {
        page.drawText(currentLine, {
          x: startX,
          y: currentY,
          size: fontSize,
          font,
        });
        currentLine = word;
        currentY -= fontSize * 1.5; // Move to next line

        if (currentY < MARGIN) {
          // If we've reached the bottom of the page, create a new page
          page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
          currentY = A4_HEIGHT - MARGIN;
        }
      } else {
        currentLine = testLine;
      }
    }

    // Draw any remaining text in the line
    if (currentLine) {
      page.drawText(currentLine, {
        x: startX,
        y: currentY,
        size: fontSize,
        font,
      });
    }

    // Move to the next line after processing each original line
    currentY -= fontSize * 1.5;
    if (currentY < MARGIN) {
      page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      currentY = A4_HEIGHT - MARGIN;
    }
  }

  return page;
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const formData = await req.json();

  // Save client data to MongoDB
  const client = new Client(formData);
  await client.save();

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add the first page
  let page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

  // Get the fonts
  // Get the fonts
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const boldItalicFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBoldItalic
  );

  // Add company information in the top left corner
  page.drawText("HYSECO", {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN,
    size: 12,
    font: boldFont,
  });
  page.drawText("18 rue de Chevreloup", {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 15,
    size: 10,
    font,
  });
  page.drawText("78590 NOISY-LE-ROI", {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 30,
    size: 10,
    font,
  });
  page.drawText("Port : 06 59 82 05 81", {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 45,
    size: 10,
    font,
  });
  page.drawText("E-mail : contact@hyseco.net", {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 60,
    size: 10,
    font,
  });

  // Add dynamic content
  page.drawText(`Devis contractuel N° ${formData.devisNumber}`, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 90,
    size: 14,
    font: boldFont,
  });

  // Client details
  page.drawText(`Client: ${formData.clientName}`, {
    x: 350,
    y: A4_HEIGHT - MARGIN,
    size: 10,
    font,
  });
  page.drawText(`Adresse: ${formData.clientAddress}`, {
    x: 350,
    y: A4_HEIGHT - MARGIN - 15,
    size: 10,
    font,
  });

  // Date and validity
  page.drawText(`Date: ${formData.date}`, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 120,
    size: 10,
    font,
  });
  page.drawText(`Durée de validité: ${formData.validityPeriod}`, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 135,
    size: 10,
    font,
  });

  // Intervention address and periodicity
  page.drawText(`Adresse d'intervention: ${formData.interventionAddress}`, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 150,
    size: 10,
    font,
  });
  page.drawText(`Périodicité: ${formData.periodicity}`, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 165,
    size: 10,
    font,
  });

  // Task details
  page.drawText(`${formData.taskTitle}`, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 190,
    size: 12,
    font: boldFont,
  });

  page = addStyledTextWithWrapping(
    pdfDoc,
    page,
    formData.taskDescription,
    font,
    boldFont,
    italicFont,
    boldItalicFont,
    10,
    MARGIN,
    A4_HEIGHT - MARGIN - 210,
    A4_WIDTH - 2 * MARGIN
  );

  // Price
  page.drawText(`Prix H.T.: ${formData.priceHT} €`, {
    x: A4_WIDTH - MARGIN - 150,
    y: MARGIN,
    size: 12,
    font: boldFont,
  });

  // Add CONDITIONS CONTRACTUELLES on a new page
  page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  page.drawText("CONDITIONS CONTRACTUELLES", {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN,
    size: 14,
    font: boldFont,
  });

  const conditionsText = `
ARTICLE 1 - PLANNING ET HORAIRES
Un accord d'intervention (jour et heure) sera défini entre les parties contractantes et ne pourra être modifié qu'avec l'accord des deux parties. Si nécessaire seront confiés au personnel de HYSECO : clés et codes (alarme).

ARTICLE 2 - CONDITIONS DE TRAVAIL
Le personnel délégué pour la bonne exécution du contrat sera sous la responsabilité d'un responsable du chantier. Tout moyen d'intervention doit être fourni par le contractant (eau, électricité, container).
Toute intervention supplémentaire ou complémentaire doit être avalisée par la société HYSECO (aval confirmé par un devis signé en les deux parties).
Le personnel de HYSECO se conformera à toutes les dispositions légales et réglementaires relatives à la sécurité (convention collective des entreprises de propreté) ainsi qu'à celles définies et affichées sur le lieu d'intervention.
Le n° des urgences doit être visible sur place par le personnel de HYSECO.
Les produits et matériels de nettoyage sont fournis par HYSECO dans le cadre du contrat, hors consommables tel que papier toilette, savon/crème, essuie main facturés en supplément avec bon de livraison.

ARTICLE 3 - ASSURANCE
HYSECO a souscrit une assurance garantissant l'ensemble des activités souscrites auprès de AXA Assurances 12 rue de montreuil - 78000 VERSAILLES -
Une attestation sera fournie sur simple demande. Cette assurance garantit les risques corporels et matériels pour les deux parties. Contrat responsabilité civile n°0000010746636504.

ARTICLE 4 - CONTESTATION
Toute contestation sur la qualité des prestations doit être notifiée (au plus tard dans les 48 heures) par appel téléphonique au n° de téléphone figurant sur le devis et les factures, et ensuite par fax ou par LRAR.
HYSECO délèguera immédiatement un responsable sur le site. Pour des raisons de sécurité et d'assurance, le signataire du contrat s'interdit de faire exécuter tout travail non défini dans le devis. Toute proposition ou tentative d'embauche de notre personnel sont formellement exclus.

ARTICLE 5 - TACITE RECONDUCTION ET REVISION DES PRIX
La révision des prix est faite à chaque augmentation du SMIC (en fonction de l'indice d'augmentation du SMIC fourni par les instances gouvernementales) - Ne concerne que les contrats ayant une PERIODICITE autre que sur demande / ponctuelle :
Le contrat annuel est renouvelable par tacite reconduction. La dénonciation du contrat peut être faite par l'une ou l'autres des deux parties avec un préavis de trois mois par LRAR avant date anniversaire du contrat.

ARTICLE 6 - CONDITIONS DE REGLEMENT
Règlement à réception de facture (prestation de services). Une pénalité pour retard de paiement sera appliquée en fonction du taux (Refi : taux variable,) appliquée par la Banque Centrale Européenne majoré de 10 points (Article L441-6 du Code de Commerce).
Une indemnité forfaitaire de 40 € sera systématiquement ajoutée pour frais de recouvrement aux pénalités de retard, une facturation complémentaire pourra être effectuée en fonction des frais occasionnés en relances et rappels sur justificatif.
Une indemnisation complémentaire de 35 € par courrier établi (Rappel, LRAR) sera réclamée au débiteur pour frais de recouvrement engagés si supérieurs au montant forfaitaire de 40 € (décret (n°2012-1115) du 2 octobre 2012 JO du 4 octobre 2012))

ARTICLE 7 - AUTORISATION / DROIT D'IMAGES
Le client accepte que des photos du chantier puissent être prises et utilisées pour la communication de HYSECO et être diffusées publiquement (site web, blog, réseaux sociaux, dépliants publicitaires, etc...) sauf avis contraire écrit.
  `.trim();

  // Add the conditions text with automatic wrapping and page breaks
  page = addTextWithWrapping(
    pdfDoc,
    page,
    conditionsText,
    font,
    10,
    MARGIN,
    A4_HEIGHT - MARGIN - 30,
    A4_WIDTH - 2 * MARGIN
  );

  // Save the PDF
  const pdfBytes = await pdfDoc.save();

  // Return the PDF as a response
  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="devis-contractuel.pdf"',
    },
  });
}
