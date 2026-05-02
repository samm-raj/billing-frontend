import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePdf = (invoice: any, customer: any, counts: { original: number; duplicate: number; triplicate: number }, config?: any) => {
  const doc = new jsPDF();
  let firstPage = true;

  // Use config from DB with fallback empty strings
  const companyName = config?.company_name || '';
  const companyAddress = config?.company_address || '';
  const companyGst = config?.company_gst || '';
  const companyEmail = config?.company_email || '';
  const companyPhone = config?.company_phone || '';

  const generatePage = (type: string) => {
    if (!firstPage) doc.addPage();
    firstPage = false;

    const pageWidth = doc.internal.pageSize.width;

    // 0. Tax Invoice Header & Copy Type
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', pageWidth / 2, 12, { align: 'center' });
    doc.text(type, pageWidth - 15, 12, { align: 'right' });
    doc.line(15, 16, pageWidth - 15, 16); // Full line under TAX INVOICE

    // 1. Header (Centered)
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(companyAddress, pageWidth / 2, 38, { align: 'center' });
    doc.text(`GST: ${companyGst} | Email: ${companyEmail} | Ph: ${companyPhone}`, pageWidth / 2, 44, { align: 'center' });

    doc.line(15, 50, pageWidth - 15, 50);

    // 2. Invoice Info (Top Right, Smaller Font)
    const infoY = 60;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No: ${invoice.invoice_number}`, pageWidth - 15, infoY, { align: 'right' });
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('en-GB')}`, pageWidth - 15, infoY + 6, { align: 'right' });

    // 3. Customer & Shipping Info
    const customerY = 80;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, customerY);
    doc.text('Ship To / Supply Address:', pageWidth / 2, customerY);

    doc.setFont('helvetica', 'normal');
    doc.text(customer.name, 15, customerY + 6);
    const billAddressLines = doc.splitTextToSize(customer.address, 80);
    doc.text(billAddressLines, 15, customerY + 12);
    doc.text(`GST: ${customer.gst_number}`, 15, customerY + 12 + (billAddressLines.length * 5));

    doc.text(customer.name, pageWidth / 2, customerY + 6);
    const shipAddress = customer.supply_address || customer.address;
    const shipAddressLines = doc.splitTextToSize(shipAddress, 80);
    doc.text(shipAddressLines, pageWidth / 2, customerY + 12);

    // 4. Reference Metadata Box
    const metaY = customerY + 35;
    doc.setDrawColor(200);
    doc.rect(15, metaY, pageWidth - 30, 15);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB') : ' - ';

    const colWidth = (pageWidth - 30) / 3;
    doc.text(`You're Po. No / Date:`, 20, metaY + 6);
    doc.text(`${invoice.po_number || ' - '} / ${formatDate(invoice.po_date)}`, 20, metaY + 11);

    doc.text(`DA No / Date:`, 20 + colWidth, metaY + 6);
    doc.text(`${invoice.da_number || ' - '} / ${formatDate(invoice.da_date)}`, 20 + colWidth, metaY + 11);

    doc.text(`Our DC No / Date:`, 20 + (colWidth * 2), metaY + 6);
    doc.text(`${invoice.dc_number || ' - '} / ${formatDate(invoice.dc_date)}`, 20 + (colWidth * 2), metaY + 11);

    // 5. Items Table
    autoTable(doc, {
      startY: metaY + 20,
      head: [['D.A. S.NO', 'P.O. S.NO', 'DESCRIPTION', 'HSN/SAC', 'QTY', 'RATE', 'AMOUNT']],
      body: invoice.items.map((item: any) => [
        item.da_number || '-',
        item.po_number || '-',
        item.description,
        item.hsn_sac || '-',
        item.quantity,
        item.rate.toFixed(2),
        item.amount.toFixed(2)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [40, 40, 40], fontStyle: 'bold', lineWidth: 0.1 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 6: { halign: 'right' }, 4: { halign: 'center' }, 5: { halign: 'right' } }
    });

    // 6. Totals & Amount in Words
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const rightX = pageWidth - 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount in Words:', 15, finalY);
    const wordsLines = doc.splitTextToSize(invoice.amount_in_words, (pageWidth / 2) - 20);
    doc.text(wordsLines, 15, finalY + 7);

    let currentY = finalY;
    const summaryData = [
      { label: 'Sub Total:', value: invoice.sub_total },
      { label: `CGST (${invoice.cgst_rate}%):`, value: invoice.cgst_amount },
      { label: `SGST (${invoice.sgst_rate}%):`, value: invoice.sgst_amount },
      { label: `IGST (${invoice.igst_rate}%):`, value: invoice.igst_amount },
    ];
    summaryData.forEach(row => {
      if (row.value > 0 || row.label === 'Sub Total:') {
        doc.setFont('helvetica', 'normal');
        doc.text(row.label, rightX - 60, currentY);
        doc.text(`INR ${row.value.toFixed(2)}`, rightX, currentY, { align: 'right' });
        currentY += 6;
      }
    });

    // Grand Total with Lines
    doc.setFont('helvetica', 'bold');
    doc.line(rightX - 60, currentY, rightX, currentY); // Line above
    doc.text('Grand Total:', rightX - 60, currentY + 6);
    doc.text(`INR ${invoice.grand_total.toFixed(2)}`, rightX, currentY + 6, { align: 'right' });
    doc.line(rightX - 60, currentY + 8, rightX, currentY + 8); // Line below

    // 7. Footer
    const footerY = doc.internal.pageSize.height - 35;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`For, ${companyName}`, rightX, footerY, { align: 'right' });
    doc.text('Authorised Signatory', rightX, footerY + 20, { align: 'right' });
  };

  // Generate pages based on counts
  for (let i = 0; i < counts.original; i++) generatePage('ORIGINAL');
  for (let i = 0; i < counts.duplicate; i++) generatePage('DUPLICATE');
  for (let i = 0; i < counts.triplicate; i++) generatePage('TRIPLICATE');

  doc.save(`${invoice.invoice_number}_Package.pdf`);
};
