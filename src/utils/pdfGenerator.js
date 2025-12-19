import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateBookingPDF = (booking, formatPrice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const brandColor = [8, 145, 178]; // #0891b2

    // Background accent
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Add Logo or Header
    doc.setFontSize(24);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Ar One', 14, 25);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('TOURISM & TRAVELS SRI LANKA', 14, 32);

    // Invoice Label
    doc.setFontSize(30);
    doc.setTextColor(240, 240, 240);
    doc.text('INVOICE', pageWidth - 14, 28, { align: 'right' });

    // Client/Booking Details
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text('BILL TO:', 14, 55);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.customerName || 'Valued Customer', 14, 62);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(booking.customerEmail || '', 14, 67);
    doc.text(booking.customerPhone || '', 14, 72);

    // Booking Meta
    doc.setTextColor(80);
    doc.text('BOOKING INFO:', pageWidth - 70, 55);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`ID: ${booking.bookingId}`, pageWidth - 70, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 70, 67);
    doc.text(`Status: ${booking.status.toUpperCase()}`, pageWidth - 70, 72);

    // Package Details
    doc.setFontSize(14);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text('Tour Details', 14, 85);

    const tourData = [
        ['Package Name', booking.packageTitle],
        ['Location', booking.location],
        ['Travel Date', new Date(booking.travelDate).toLocaleDateString()],
        ['Travelers', `${booking.adults} Adults ${booking.children > 0 ? `+ ${booking.children} Children` : ''}`],
        ['Hotel', `${booking.hotel.name} (${booking.hotel.type})`],
        ['Guide', `${booking.guide.name} (${booking.guide.role})`]
    ];

    autoTable(doc, {
        startY: 90,
        body: tourData,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 'auto' }
        },
        headStyles: { fillColor: brandColor }
    });

    // Payment Summary
    // Calculate finalY safely after first table
    const tourFinalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 160;
    const finalY = tourFinalY + 15;

    doc.setFontSize(14);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text('Pricing Summary', 14, finalY);

    const paymentData = [
        ['Base Tour Price', formatPrice(booking.totalAmount)],
        ['Taxes & Fees', 'Included'],
        ['Promotional Discount', booking.appliedOffer ? `-${booking.appliedOffer.discount}` : 'N/A'],
        ['Total Paid', formatPrice(booking.totalAmount)],
    ];

    autoTable(doc, {
        startY: finalY + 5,
        body: paymentData,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 100 },
            1: { halign: 'right' }
        }
    });

    // Draw total line
    const summaryY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || (finalY + 40);
    doc.setDrawColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setLineWidth(0.5);
    doc.line(14, summaryY - 6, pageWidth - 14, summaryY - 6);

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Thank you for booking with Ar One Tourism!', pageWidth / 2, pageHeight - 25, { align: 'center' });
    doc.setFontSize(8);
    doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text('For support: support@arone.com | www.arone.com', pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Save PDF
    doc.save(`ArOne_Booking_${booking.bookingId}.pdf`);
};
