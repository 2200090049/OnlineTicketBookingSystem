package org.otbs.www.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:Online Ticket Booking System}")
    private String appName;

    public void sendOTP(String toEmail, String otp) {
        try {
            // Log OTP to console for development
            System.out.println("=== OTP EMAIL ===");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: OTP Verification - " + appName);
            System.out.println("OTP: " + otp);
            System.out.println("=================");
            
            // Try to send actual email
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("OTP Verification - " + appName);
                message.setText(buildOTPEmailBody(otp));
                
                mailSender.send(message);
                System.out.println("✅ OTP email sent successfully to: " + toEmail);
            } catch (Exception emailError) {
                System.err.println("❌ Failed to send email, but OTP is logged above: " + emailError.getMessage());
                // Don't throw exception, just log the error
            }
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void sendPasswordResetOTP(String toEmail, String otp) {
        try {
            // Log OTP to console for development
            System.out.println("=== PASSWORD RESET OTP EMAIL ===");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: Password Reset OTP - " + appName);
            System.out.println("OTP: " + otp);
            System.out.println("=================================");
            
            // Try to send actual email
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("Password Reset OTP - " + appName);
                message.setText(buildPasswordResetOTPEmailBody(otp));
                
                mailSender.send(message);
                System.out.println("✅ Password reset OTP email sent successfully to: " + toEmail);
            } catch (Exception emailError) {
                System.err.println("❌ Failed to send email, but OTP is logged above: " + emailError.getMessage());
                // Don't throw exception, just log the error
            }
        } catch (Exception e) {
            System.err.println("Failed to send password reset OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send password reset OTP email", e);
        }
    }

    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            // Log welcome email to console for development
            System.out.println("=== WELCOME EMAIL ===");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: Welcome to " + appName);
            System.out.println("Username: " + username);
            System.out.println("=====================");
            
            // Try to send actual email
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("Welcome to " + appName);
                message.setText(buildWelcomeEmailBody(username));
                
                mailSender.send(message);
                System.out.println("✅ Welcome email sent successfully to: " + toEmail);
            } catch (Exception emailError) {
                System.err.println("❌ Failed to send welcome email, but logged above: " + emailError.getMessage());
                // Don't throw exception for welcome email as it's not critical
            }
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
            // Don't throw exception for welcome email as it's not critical
        }
    }

    private String buildOTPEmailBody(String otp) {
        return String.format("""
            Dear User,
            
            Thank you for registering with %s!
            
            Your OTP (One-Time Password) for account verification is:
            
            %s
            
            This OTP is valid for 5 minutes only.
            
            If you did not request this OTP, please ignore this email.
            
            Best regards,
            %s Team
            """, appName, otp, appName);
    }

    private String buildPasswordResetOTPEmailBody(String otp) {
        return String.format("""
            Dear User,
            
            You have requested to reset your password for your %s account.
            
            Your password reset OTP is:
            
            %s
            
            This OTP is valid for 5 minutes only.
            
            If you did not request this password reset, please ignore this email and ensure your account is secure.
            
            Best regards,
            %s Team
            """, appName, otp, appName);
    }

    private String buildWelcomeEmailBody(String username) {
        return String.format("""
            Dear %s,
            
            Welcome to %s!
            
            Your account has been successfully created and verified. You can now:
            
            • Book train tickets
            • Manage your bookings
            • Update your profile
            • View booking history
            
            Thank you for choosing %s for your travel needs!
            
            Best regards,
            %s Team
            """, username, appName, appName, appName);
    }

    public void sendBookingConfirmation(String toEmail, String passengerName, String bookingReference, 
                                      String trainName, String trainNumber, String sourceStation, 
                                      String destinationStation, String departureTime, String arrivalTime, 
                                      Integer numberOfSeats, String totalAmount) {
        try {
            // Log booking confirmation email to console for development
            System.out.println("=== BOOKING CONFIRMATION EMAIL ===");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: Booking Confirmed - " + appName);
            System.out.println("Booking Reference: " + bookingReference);
            System.out.println("===================================");
            
            // Try to send actual email
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("Booking Confirmed - " + appName);
                message.setText(buildBookingConfirmationEmailBody(passengerName, bookingReference, 
                    trainName, trainNumber, sourceStation, destinationStation, departureTime, 
                    arrivalTime, numberOfSeats, totalAmount));
                
                mailSender.send(message);
                System.out.println("✅ Booking confirmation email sent successfully to: " + toEmail);
            } catch (Exception emailError) {
                System.err.println("❌ Failed to send booking confirmation email, but logged above: " + emailError.getMessage());
                // Don't throw exception, just log the error
            }
        } catch (Exception e) {
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
            // Don't throw exception for booking confirmation email as it's not critical
        }
    }

    private String buildBookingConfirmationEmailBody(String passengerName, String bookingReference, 
                                                   String trainName, String trainNumber, String sourceStation, 
                                                   String destinationStation, String departureTime, 
                                                   String arrivalTime, Integer numberOfSeats, String totalAmount) {
        return String.format("""
            Dear %s,
            
            Your train ticket has been successfully booked!
            
            BOOKING DETAILS:
            ================
            Booking Reference: %s
            Train: %s (%s)
            Route: %s → %s
            Departure: %s
            Arrival: %s
            Number of Seats: %d
            Total Amount: %s
            
            IMPORTANT INFORMATION:
            =====================
            • Your ticket has been attached to this email as a PDF.
            • Please arrive at the station at least 30 minutes before departure.
            • Carry a valid ID proof along with your ticket.
            • You can download your ticket anytime from your booking history.
            
            CANCELLATION POLICY:
            ===================
            • Cancellation is allowed up to 24 hours before departure.
            • Refunds will be processed within 5-7 business days.
            
            Thank you for choosing %s for your travel needs!
            
            Safe travels!
            
            Best regards,
            %s Team
            """, passengerName, bookingReference, trainName, trainNumber, sourceStation, 
            destinationStation, departureTime, arrivalTime, numberOfSeats, totalAmount, appName, appName);
    }
}
