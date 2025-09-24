package org.otbs.www.backend.services;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

import org.otbs.www.backend.train.models.Booking;
import org.otbs.www.backend.train.models.Train;
import org.otbs.www.backend.bus.models.Bus;
import org.otbs.www.backend.bus.models.BusBooking;
import org.springframework.stereotype.Service;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

@Service
public class PdfService {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, BaseColor.BLUE);
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, BaseColor.BLACK);
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL, BaseColor.BLACK);
    private static final Font SMALL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.GRAY);

    public byte[] generateTrainTicket(Booking booking) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4, 20, 20, 20, 20);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, outputStream);
        
        document.open();
        
        // Add header
        addHeader(document, booking);
        
        // Add booking details
        addBookingDetails(document, booking);
        
        // Add train details
        addTrainDetails(document, booking);
        
        // Add passenger details
        addPassengerDetails(document, booking);
        
        // Add footer
        addFooter(document);
        
        document.close();
        return outputStream.toByteArray();
    }

    public byte[] generateBusTicket(BusBooking booking) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4, 20, 20, 20, 20);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, outputStream);
        
        document.open();
        
        // Add header
        addBusHeader(document, booking);
        
        // Add booking details
        addBusBookingDetails(document, booking);
        
        // Add bus details
        addBusDetails(document, booking);
        
        // Add passenger details
        addBusPassengerDetails(document, booking);
        
        // Add footer
        addBusFooter(document);
        
        document.close();
        return outputStream.toByteArray();
    }

    private void addHeader(Document document, Booking booking) throws DocumentException {
        // Title
        Paragraph title = new Paragraph("TRAIN TICKET", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Booking reference
        Paragraph ref = new Paragraph("Booking Reference: " + booking.getBookingReference(), HEADER_FONT);
        ref.setAlignment(Element.ALIGN_CENTER);
        ref.setSpacingAfter(10);
        document.add(ref);

        // Status
        Paragraph status = new Paragraph("Status: " + booking.getStatus().toString(), NORMAL_FONT);
        status.setAlignment(Element.ALIGN_CENTER);
        status.setSpacingAfter(20);
        document.add(status);

        // Line separator
        document.add(new Paragraph("________________________________________________"));
        document.add(new Paragraph(" "));
    }

    private void addBookingDetails(Document document, Booking booking) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);

        // Booking date
        addTableRow(table, "Booking Date", 
            booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")), 
            HEADER_FONT, NORMAL_FONT);
        
        // Total amount
        addTableRow(table, "Total Amount", "₹" + booking.getTotalAmount(), 
            HEADER_FONT, NORMAL_FONT);
        
        // Number of seats
        addTableRow(table, "Number of Seats", booking.getNumberOfSeats().toString(), 
            HEADER_FONT, NORMAL_FONT);

        document.add(table);
    }

    private void addTrainDetails(Document document, Booking booking) throws DocumentException {
        Train train = booking.getTrain();
        
        if (train == null) {
            throw new DocumentException("Train information is missing from booking");
        }
        
        Paragraph trainHeader = new Paragraph("TRAIN DETAILS", HEADER_FONT);
        trainHeader.setSpacingBefore(20);
        trainHeader.setSpacingAfter(10);
        document.add(trainHeader);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);

        addTableRow(table, "Train Name", train.getTrainName() != null ? train.getTrainName() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Train Number", train.getTrainNumber() != null ? train.getTrainNumber() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Class", train.getTrainClass() != null ? train.getTrainClass().toString().replace("_", " ") : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "From", train.getSourceStation() != null ? train.getSourceStation() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "To", train.getDestinationStation() != null ? train.getDestinationStation() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Departure", 
            train.getDepartureTime() != null ? train.getDepartureTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")) : "N/A", 
            HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Arrival", 
            train.getArrivalTime() != null ? train.getArrivalTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")) : "N/A", 
            HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Price per Seat", train.getPrice() != null ? "₹" + train.getPrice() : "N/A", HEADER_FONT, NORMAL_FONT);

        document.add(table);
    }

    private void addPassengerDetails(Document document, Booking booking) throws DocumentException {
        Paragraph passengerHeader = new Paragraph("PASSENGER DETAILS", HEADER_FONT);
        passengerHeader.setSpacingBefore(20);
        passengerHeader.setSpacingAfter(10);
        document.add(passengerHeader);

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);

        // Header row
        addTableHeader(table, "Passenger Name", HEADER_FONT);
        addTableHeader(table, "Email", HEADER_FONT);
        addTableHeader(table, "Phone", HEADER_FONT);

        // Passenger data row
        addTableData(table, booking.getPassengerName(), NORMAL_FONT);
        addTableData(table, booking.getPassengerEmail(), NORMAL_FONT);
        addTableData(table, booking.getPassengerPhone(), NORMAL_FONT);

        document.add(table);
    }

    private void addFooter(Document document) throws DocumentException {
        Paragraph footer = new Paragraph();
        footer.setSpacingBefore(30);
        
        // Terms and conditions
        Paragraph terms = new Paragraph("IMPORTANT TERMS & CONDITIONS:", HEADER_FONT);
        terms.setSpacingAfter(10);
        footer.add(terms);
        
        String[] termsText = {
            "• Please arrive at the station at least 30 minutes before departure time.",
            "• This ticket is non-transferable and valid only for the passenger named above.",
            "• Cancellation is allowed up to 24 hours before departure.",
            "• Please carry a valid ID proof along with this ticket.",
            "• For any queries, contact our customer support."
        };
        
        for (String term : termsText) {
            Paragraph termPara = new Paragraph(term, SMALL_FONT);
            termPara.setSpacingAfter(5);
            footer.add(termPara);
        }
        
        // Company info
        Paragraph companyInfo = new Paragraph();
        companyInfo.setSpacingBefore(20);
        companyInfo.add(new Paragraph("Online Ticket Booking System", NORMAL_FONT));
        companyInfo.add(new Paragraph("Customer Support: +91-1234567890", SMALL_FONT));
        companyInfo.add(new Paragraph("Email: support@otbs.com", SMALL_FONT));
        companyInfo.setAlignment(Element.ALIGN_CENTER);
        
        footer.add(companyInfo);
        document.add(footer);
    }

    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }

    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTableData(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(cell);
    }

    // Bus ticket generation helper methods
    private void addBusHeader(Document document, BusBooking booking) throws DocumentException {
        // Title
        Paragraph title = new Paragraph("BUS TICKET", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Booking reference
        Paragraph ref = new Paragraph("Booking Reference: " + booking.getBookingReference(), HEADER_FONT);
        ref.setAlignment(Element.ALIGN_CENTER);
        ref.setSpacingAfter(10);
        document.add(ref);

        // Status
        Paragraph status = new Paragraph("Status: " + booking.getStatus().toString(), NORMAL_FONT);
        status.setAlignment(Element.ALIGN_CENTER);
        status.setSpacingAfter(20);
        document.add(status);

        // Line separator
        document.add(new Paragraph("________________________________________________"));
        document.add(new Paragraph(" "));
    }

    private void addBusBookingDetails(Document document, BusBooking booking) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);

        // Booking date
        addTableRow(table, "Booking Date", 
            booking.getBookingDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")), 
            HEADER_FONT, NORMAL_FONT);
        
        // Total amount
        addTableRow(table, "Total Amount", "₹" + booking.getTotalAmount(), 
            HEADER_FONT, NORMAL_FONT);
        
        // Number of seats
        addTableRow(table, "Number of Seats", booking.getNumberOfSeats().toString(), 
            HEADER_FONT, NORMAL_FONT);

        document.add(table);
    }

    private void addBusDetails(Document document, BusBooking booking) throws DocumentException {
        Bus bus = booking.getBus();
        
        if (bus == null) {
            throw new DocumentException("Bus information is missing from booking");
        }
        
        Paragraph busHeader = new Paragraph("BUS DETAILS", HEADER_FONT);
        busHeader.setSpacingBefore(20);
        busHeader.setSpacingAfter(10);
        document.add(busHeader);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);

        addTableRow(table, "Bus Name", bus.getBusName() != null ? bus.getBusName() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Bus Number", bus.getBusNumber() != null ? bus.getBusNumber() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Operator", bus.getOperatorName() != null ? bus.getOperatorName() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Bus Type", bus.getBusType() != null ? bus.getBusType().getDisplayName() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "From", bus.getSourceCity() != null ? bus.getSourceCity() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "To", bus.getDestinationCity() != null ? bus.getDestinationCity() : "N/A", HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Departure", 
            bus.getDepartureTime() != null ? bus.getDepartureTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")) : "N/A", 
            HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Arrival", 
            bus.getArrivalTime() != null ? bus.getArrivalTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")) : "N/A", 
            HEADER_FONT, NORMAL_FONT);
        addTableRow(table, "Price per Seat", bus.getPrice() != null ? "₹" + bus.getPrice() : "N/A", HEADER_FONT, NORMAL_FONT);

        document.add(table);
    }

    private void addBusPassengerDetails(Document document, BusBooking booking) throws DocumentException {
        Paragraph passengerHeader = new Paragraph("PASSENGER DETAILS", HEADER_FONT);
        passengerHeader.setSpacingBefore(20);
        passengerHeader.setSpacingAfter(10);
        document.add(passengerHeader);

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setSpacingAfter(20);

        // Header row
        addTableHeader(table, "Passenger Name", HEADER_FONT);
        addTableHeader(table, "Email", HEADER_FONT);
        addTableHeader(table, "Phone", HEADER_FONT);

        // Passenger data row
        addTableData(table, booking.getPassengerName(), NORMAL_FONT);
        addTableData(table, booking.getPassengerEmail(), NORMAL_FONT);
        addTableData(table, booking.getPassengerPhone(), NORMAL_FONT);

        document.add(table);
    }

    private void addBusFooter(Document document) throws DocumentException {
        Paragraph footer = new Paragraph();
        footer.setSpacingBefore(30);
        
        // Terms and conditions
        Paragraph terms = new Paragraph("IMPORTANT TERMS & CONDITIONS:", HEADER_FONT);
        terms.setSpacingAfter(10);
        footer.add(terms);
        
        String[] termsText = {
            "• Please arrive at the boarding point at least 15 minutes before departure time.",
            "• This ticket is non-transferable and valid only for the passenger named above.",
            "• Cancellation is allowed up to 2 hours before departure.",
            "• Please carry a valid ID proof along with this ticket.",
            "• For any queries, contact our customer support."
        };
        
        for (String term : termsText) {
            Paragraph termPara = new Paragraph(term, SMALL_FONT);
            termPara.setSpacingAfter(5);
            footer.add(termPara);
        }
        
        // Company info
        Paragraph companyInfo = new Paragraph();
        companyInfo.setSpacingBefore(20);
        companyInfo.add(new Paragraph("Online Ticket Booking System", NORMAL_FONT));
        companyInfo.add(new Paragraph("Customer Support: +91-1234567890", SMALL_FONT));
        companyInfo.add(new Paragraph("Email: support@otbs.com", SMALL_FONT));
        companyInfo.setAlignment(Element.ALIGN_CENTER);
        
        footer.add(companyInfo);
        document.add(footer);
    }
}
