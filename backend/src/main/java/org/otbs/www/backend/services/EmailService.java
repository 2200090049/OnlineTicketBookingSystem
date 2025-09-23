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

    public void sendAccountDeletionEmail(String toEmail, String username) {
        try {
            // Log account deletion email to console for development
            System.out.println("=== ACCOUNT DELETION EMAIL ===");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: Account Deletion Confirmation - " + appName);
            System.out.println("Username: " + username);
            System.out.println("===============================");

            // Try to send actual email
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("Account Deletion Confirmation - " + appName);
                message.setText(buildAccountDeletionEmailBody(username));

                mailSender.send(message);
                System.out.println("✅ Account deletion email sent successfully to: " + toEmail);
            } catch (Exception emailError) {
                System.err.println("❌ Failed to send account deletion email, but logged above: " + emailError.getMessage());
                // Don't throw exception for deletion confirmation email as it's not critical
            }
        } catch (Exception e) {
            System.err.println("Failed to send account deletion email: " + e.getMessage());
            // Don't throw exception for deletion confirmation email as it's not critical
        }
    }

    public void sendPasswordChangeConfirmation(String toEmail, String username) {
        try {
            // Log password change confirmation to console for development
            System.out.println("=== PASSWORD CHANGE CONFIRMATION EMAIL ===");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: Password Changed Successfully - " + appName);
            System.out.println("Username: " + username);
            System.out.println("===========================================");

            // Try to send actual email
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("Password Changed Successfully - " + appName);
                message.setText(buildPasswordChangeConfirmationEmailBody(username));

                mailSender.send(message);
                System.out.println("✅ Password change confirmation email sent successfully to: " + toEmail);
            } catch (Exception emailError) {
                System.err.println("❌ Failed to send password change confirmation email, but logged above: " + emailError.getMessage());
                // Don't throw exception for password change confirmation email as it's not critical
            }
        } catch (Exception e) {
            System.err.println("Failed to send password change confirmation email: " + e.getMessage());
            // Don't throw exception for password change confirmation email as it's not critical
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

    private String buildAccountDeletionEmailBody(String username) {
        return String.format("""
            Dear %s,
            
            We're sorry to see you go! This email confirms that your %s account has been successfully deleted.
            
            Your account and associated data have been removed from our system.
            
            If you didn't request this deletion or believe this was done in error, please contact our support team immediately at support@otbs.com.
            
            Thank you for being part of our community. We hope to serve you again in the future!
            
            Best regards,
            %s Team
            """, username, appName, appName);
    }

    private String buildPasswordChangeConfirmationEmailBody(String username) {
        return String.format("""
            Dear %s,
            
            This email confirms that your password for your %s account has been successfully changed.
            
            If you didn't make this change, please:
            • Contact our support team immediately
            • Consider changing your password again
            • Review your account security settings
            
            For your security, please remember to:
            • Use a strong, unique password
            • Keep your login credentials secure
            • Log out from shared devices
            • Enable two-factor authentication if available
            
            If you have any concerns about your account security, please don't hesitate to contact us.
            
            Best regards,
            %s Team
            """, username, appName, appName);
    }
}