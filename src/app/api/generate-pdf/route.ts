import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { convert } from "html-to-text";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import path from "path";
import fs from "fs";
import { format } from "date-fns";
import { calculateTotalsWithTva } from "@/lib/utils";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 50;
const BAND_WIDTH = 3; // Width of the color band
const BAND_COLOR = rgb(0, 0.651, 0.678); // Teal color (adjust as needed)

function addStyledTextWithWrapping(
  pdfDoc: PDFDocument,
  page: PDFPage,
  html: string,
  font: PDFFont,
  boldFont: PDFFont,
  italicFont: PDFFont,
  boldItalicFont: PDFFont,
  fontSize: number,
  startX: number,
  startY: number,
  maxWidth: number,
  monthlyAmount: number
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

  // Add monthly amount line after the last line of task description
  currentY -= lineSpacing; // Add some extra space
  if (currentY < MARGIN) {
    page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    currentY = A4_HEIGHT - MARGIN;
  }
  page.drawText(
    `Montant forfaitaire H.T. mensuel (T.V.A. 20%) : ${monthlyAmount} €`,
    {
      x: startX,
      y: currentY,
      size: fontSize,
      font: boldFont,
    }
  );

  return page;
}

function addTextWithWrapping(
  pdfDoc: PDFDocument,
  page: PDFPage,
  text: string,
  font: PDFFont,
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

function addFooter(page: PDFPage, font: PDFFont) {
  const { width, height } = page.getSize();
  const fontSize = 8; // Small font size

  // Left footer text
  page.drawText(
    "Siège social : HYSECO - 18 rue de chevreloup 78590 NOISY-LE-ROI",
    {
      x: MARGIN,
      y: MARGIN / 2,
      size: fontSize,
      font: font,
    }
  );
  page.drawText(
    "SASU au capital de 1000€ RCS Versailles - SIRET : 89334902200011 - APE : 8121Z",
    {
      x: MARGIN,
      y: MARGIN / 2 - fontSize - 2,
      size: fontSize,
      font: font,
    }
  );
  page.drawText(
    "Assurance responsabilité civile n° 0000010746636504 - AXA Assurances - 78000 VERSAILLES",
    {
      x: MARGIN,
      y: MARGIN / 2 - (fontSize + 2) * 2,
      size: fontSize,
      font: font,
    }
  );

  // Right footer text
  const rightText = "Montant exprimés en euros";
  const textWidth = font.widthOfTextAtSize(rightText, fontSize);
  page.drawText(rightText, {
    x: width - MARGIN - textWidth,
    y: MARGIN / 2,
    size: fontSize,
    font: font,
  });
}

function isPageBlank(page: PDFPage): boolean {
  return Math.abs(page.getHeight() - A4_HEIGHT) < 0.1; // Allow for small floating-point differences
}

function addColorBands(page: PDFPage) {
  const { width, height } = page.getSize();

  // Left vertical band
  page.drawRectangle({
    x: 0,
    y: 0,
    width: BAND_WIDTH,
    height: height,
    color: BAND_COLOR,
  });

  // Bottom horizontal band
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: BAND_WIDTH,
    color: BAND_COLOR,
  });
}

async function addFinalPage(
  pdfDoc: PDFDocument,
  font: PDFFont,
  boldFont: PDFFont
) {
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  addColorBands(page);
  const { width, height } = page.getSize();

  // Add "ACCEPTATION DU DEVIS" title
  page.drawText("ACCEPTATION DU DEVIS", {
    x: MARGIN,
    y: height - MARGIN - 20,
    size: 14,
    font: boldFont,
  });

  // Add the text content
  const content = `Par signature et apposition du cachet de son entreprise, le contractant atteste que ce présent devis devient de plein droit un contrat engageant les deux parties.
Tout devis doit être impérativement accepté pour bénéficier des conditions de garantie de notre assurance. Aucun travail effectif ne sera réalisé sans devis accepté.
Si PERIODICITE autre que sur demande / ponctuelle, le contrat est souscrit sans limitation de durée et se renouvelle par tacite reconduction annuelle. Le contrat est résiliable au gré de chaque partie par lettre recommandée avec accusé de réception trois mois avant la date anniversaire du contrat`;

  addTextWithWrapping(
    pdfDoc,
    page,
    content,
    font,
    10,
    MARGIN,
    height - MARGIN - 50,
    width - 2 * MARGIN
  );

  page.drawText("Pour le Client, signataire (Cachet, date, signature) :", {
    x: MARGIN,
    y: height - MARGIN - 200,
    size: 10,
    font: font,
  });
  page.drawText("A : ........................ le ....../....../.......", {
    x: MARGIN,
    y: height - MARGIN - 215,
    size: 10,
    font: font,
  });

  page.drawText("Pour HYSECO :", {
    x: width / 2 + MARGIN / 2,
    y: height - MARGIN - 215,
    size: 10,
    font: font,
  });

  // Add "Devis reçu avant l'exécution des travaux" text
  page.drawText("Devis reçu avant l'exécution des travaux", {
    x: MARGIN,
    y: height - MARGIN - 230,
    size: 10,
    font: font,
  });

  // Add payment conditions
  page.drawText(
    "Conditions de paiement : par chèque/virement/prélèvement à réception de facture.",
    {
      x: MARGIN,
      y: height - MARGIN - 330,
      size: 10,
      font: font,
      color: rgb(1, 0, 0), // Red color
    }
  );

  // Add logo
  const logoPath = path.join(process.cwd(), "public", "hyseco-logo.png");
  const logoImage = await pdfDoc.embedPng(fs.readFileSync(logoPath));
  const logoDims = logoImage.scale(0.3); // Adjust scale as needed
  page.drawImage(logoImage, {
    x: (width - logoDims.width) / 2,
    y: height - MARGIN - 400,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Add footer
  addFooter(page, font);

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

  // Get the fonts
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const boldItalicFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBoldItalic
  );

  // Function to add a new page with footer
  const addPageWithFooter = () => {
    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    addFooter(page, font);
    addColorBands(page);
    return page;
  };

  // Add the first page
  let page = addPageWithFooter();

  // Add the logo
  const logoPath = path.join(process.cwd(), "public", "hyseco-logo.png");
  const logoImage = await pdfDoc.embedPng(fs.readFileSync(logoPath));
  const logoDims = logoImage.scale(0.5); // Adjust scale as needed
  page.drawImage(logoImage, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - logoDims.height,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Add company information below the logo
  const infoStartY = A4_HEIGHT - MARGIN - logoDims.height - 20; // Add some space below the logo
  page.drawText("HYSECO", {
    x: MARGIN,
    y: infoStartY,
    size: 12,
    font: boldFont,
  });
  page.drawText("18 rue de Chevreloup", {
    x: MARGIN,
    y: infoStartY - 15,
    size: 10,
    font,
  });
  page.drawText("78590 NOISY-LE-ROI", {
    x: MARGIN,
    y: infoStartY - 30,
    size: 10,
    font,
  });
  page.drawText("Port : 06 59 82 05 81", {
    x: MARGIN,
    y: infoStartY - 45,
    size: 10,
    font,
  });
  page.drawText("E-mail : contact@hyseco.net", {
    x: MARGIN,
    y: infoStartY - 60,
    size: 10,
    font,
  });

  // Add dynamic content
  page.drawText(`Devis contractuel N° ${formData.devisNumber}`, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 200,
    size: 14,
    font: boldFont,
  });

  // Date and validity
  page.drawText(`Date: ${format(new Date(formData.date), "dd/MM/yyyy")}`, {
    x: MARGIN + 200,
    y: A4_HEIGHT - MARGIN - 200,
    size: 10,
    font,
  });
  page.drawText(`Durée de validité: ${formData.validityPeriod}`, {
    x: MARGIN + 300,
    y: A4_HEIGHT - MARGIN - 200,
    size: 10,
    font,
  });

  // Client details
  page.drawText(
    `Client: ${formData.clientFirstName} ${formData.clientLastName}`,
    {
      x: 350,
      y: A4_HEIGHT - MARGIN,
      size: 10,
      font,
    }
  );
  page.drawText(
    `Adresse: ${formData.clientStreet}, ${formData.clientCity}, ${formData.clientPostalCode}`,
    {
      x: 350,
      y: A4_HEIGHT - MARGIN - 15,
      size: 10,
      font,
    }
  );

  // Intervention address and periodicity
  page.drawText(
    `Adresse d'intervention: ${formData.interventionStreet}, ${formData.interventionCity}, ${formData.interventionPostalCode}`,
    {
      x: MARGIN,
      y: A4_HEIGHT - MARGIN - 215,
      size: 10,
      font,
    }
  );
  page.drawText(`Périodicité: ${formData.periodicity}`, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 230,
    size: 10,
    font,
  });

  // Add "DESCRIPTIF DES TRAVAUX" title
  const titleText = "DESCRIPTIF DES TRAVAUX";
  const titleWidth = boldFont.widthOfTextAtSize(titleText, 14);
  page.drawText(titleText, {
    x: (A4_WIDTH - titleWidth) / 2,
    y: A4_HEIGHT - MARGIN - 245,
    size: 14,
    font: boldFont,
  });

  // Task details
  page.drawText(`${formData.taskTitle}`, {
    x: MARGIN,
    y: A4_HEIGHT - MARGIN - 305,
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
    A4_HEIGHT - MARGIN - 320,
    A4_WIDTH - 2 * MARGIN,
    formData.priceHT
  );

  // Price details
  const priceHT = parseFloat(formData.priceHT);
  const { tva, ttc } = calculateTotalsWithTva(priceHT);

  // Create a box for price details
  const boxWidth = 200;
  const boxHeight = 80;
  const boxX = A4_WIDTH - MARGIN - boxWidth;
  const boxY = MARGIN;

  // Draw the box
  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });

  // Add price details
  page.drawText("Total H.T.", {
    x: boxX + 10,
    y: boxY + boxHeight - 20,
    size: 10,
    font,
  });
  page.drawText(`${priceHT.toFixed(2)}`, {
    x: boxX + boxWidth - 60,
    y: boxY + boxHeight - 20,
    size: 10,
    font,
  });

  page.drawText("Total T.V.A. (20%)", {
    x: boxX + 10,
    y: boxY + boxHeight - 40,
    size: 10,
    font,
  });
  page.drawText(`${tva.toFixed(2)}`, {
    x: boxX + boxWidth - 60,
    y: boxY + boxHeight - 40,
    size: 10,
    font,
  });

  page.drawText("Total T.T.C.", {
    x: boxX + 10,
    y: boxY + boxHeight - 60,
    size: 12,
    font: boldFont,
  });
  page.drawText(`${ttc.toFixed(2)}`, {
    x: boxX + boxWidth - 60,
    y: boxY + boxHeight - 60,
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

  // Before saving the PDF, add footer to all pages except the last one if it's blank
  const pageCount = pdfDoc.getPageCount();
  for (let i = 0; i < pageCount - 1; i++) {
    addFooter(pdfDoc.getPage(i), font);
  }

  // Check if the last page has content before adding a footer
  const lastPage = pdfDoc.getPage(pageCount - 1);
  if (!isPageBlank(lastPage)) {
    addFooter(lastPage, font);
  } else {
    // Remove the last page if it's blank
    pdfDoc.removePage(pageCount - 1);
  }

  // Add final page
  await addFinalPage(pdfDoc, font, boldFont);

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
