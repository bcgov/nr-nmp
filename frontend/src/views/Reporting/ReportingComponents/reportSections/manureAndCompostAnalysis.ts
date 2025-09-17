import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { NMPFileYear } from '@/types';
import { drawStandardHeader, addText, numberToSuperscript } from '../reportingUtils';
import { sharedAutoTableSettings } from '../reportingConstants';

const generateManureAndCompostAnalysis = (
  doc: jsPDF,
  nmpFileYear: NMPFileYear,
  unassignedManures: any[],
  isDairyCattle: boolean,
  farmName: string,
  year: number,
  pageWidth: number,
) => {
  if (nmpFileYear.nutrientAnalyses.length > 0) {
    const footnotes: string[] = [];
    doc.addPage();
    autoTable(doc, {
      ...sharedAutoTableSettings,
      // Page Header
      margin: { top: 45 },
      willDrawPage(data) {
        const [nextX, nextY] = drawStandardHeader(data, doc, farmName, year);
        doc.setFont(doc.getFont().fontName, 'bold');
        const updatedNextY = addText(doc, 'Manure and Compost Analysis', nextX, nextY + 2);
        doc.setFont(doc.getFont().fontName, 'normal');
        doc.setFontSize(10);
        addText(
          doc,
          'All results are provided on an as-received (wet weight) basis.',
          nextX,
          updatedNextY + 4,
        );
      },
      // Table
      head: [
        [
          'Source of Material',
          'Material Type',
          'Moisture (%)',
          'Total N (%)',
          'NH4-N (ppm)',
          'P (%)',
          'K (%)',
        ],
      ],
      columnStyles: {
        0: { cellWidth: pageWidth * 0.21 },
        1: { cellWidth: pageWidth * 0.21 },
        2: { cellWidth: pageWidth * 0.14 },
        3: { cellWidth: pageWidth * 0.14 },
        4: { cellWidth: pageWidth * 0.14 },
        5: { cellWidth: pageWidth * 0.08 },
        6: { cellWidth: 'auto' },
      },
      body: nmpFileYear.nutrientAnalyses.map((analysis) => {
        let hasFootnote = false;
        if (isDairyCattle && unassignedManures.some((m) => m.uuid === analysis.sourceUuid)) {
          footnotes.push(
            `${analysis.uniqueMaterialName} includes materials that have not been allocated to a storage.`,
          );
          hasFootnote = true;
        }
        return [
          hasFootnote
            ? `${analysis.uniqueMaterialName}${numberToSuperscript(footnotes.length)}`
            : analysis.uniqueMaterialName,
          analysis.manureName,
          analysis.moisture,
          analysis.N,
          analysis.NH4N,
          analysis.P,
          analysis.K,
        ];
      }),
    });
    // Text below table
    doc.setFontSize(10);
    let nextY: number = (doc as any).lastAutoTable.finalY + 5; // type shenanigans
    footnotes.forEach((footnote, i) => {
      nextY = addText(doc, `${i + 1}   ${footnote}`, 15, nextY);
    });
  }
};

export default generateManureAndCompostAnalysis;
