"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

export async function exportElementToPDF(element: HTMLElement, fileName = "jina-response.pdf") {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF();
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}

export async function exportMarkdownToDocx(markdown: string, query: string, fileName = "jina-response.docx") {
  const textContent = markdown.replace(/<[^>]*>/g, "");
  const blob = new Blob([`Query: ${query}\n\nResponse:\n${textContent}`], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  saveAs(blob, fileName);
}


