import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { drawStandardHeader, addText } from '../reportingUtils';
import { sharedAutoTableSettings, FertilizerRequiredStep } from '../reportingConstants';

const generateFertilizerRequired = (
  doc: jsPDF,
  fertilizers: FertilizerRequiredStep[],
  farmName: string,
  year: number,
  pageWidth: number,
) => {
  if (fertilizers.length > 0) {
    doc.addPage();
    autoTable(doc, {
      ...sharedAutoTableSettings,
      // Page Header
      margin: { top: 40 },
      willDrawPage(data) {
        const [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
        doc.setFont(doc.getFont().fontName, 'bold');
        addText(doc, 'Fertilizer Required', nextX, nextY + 2);
        doc.setFont(doc.getFont().fontName, 'normal');
      },
      // Table
      head: [['Material', `Total Amount Required in ${year}`]],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.6 },
        1: { cellWidth: 'auto' },
      },
      body: fertilizers.map((f) => [f.name, `${Math.round(f.totalAmount)} ${f.unit}`]),
    });
  }
};

export default generateFertilizerRequired;
