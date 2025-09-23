package org.otbs.www.backend.util;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.models.Vendor_Type;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final SecretKey key = Keys.hmacShaKeyFor("mySecretKey123456789012345678901234567890".getBytes());
    private static final long JWT_TOKEN_VALIDITY = 24 * 60 * 60 * 1000; // 24 hours

    public String generateToken(Users user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole());
        claims.put("id", user.getId());
        claims.put("isVendor", user.isVendor());
        claims.put("vendorType", user.getVendorType() != null ? user.getVendorType().toString() : "Default");

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(key)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Users getUserFromToken(String token) {
        try {
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            Claims claims = extractAllClaims(token);
            Users user = new Users();
            user.setId((Integer) claims.get("id"));
            user.setEmail(claims.getSubject());
            user.setRole((String) claims.get("role"));
            
            System.out.println("DEBUG JwtUtil - Raw claims: " + claims);
            System.out.println("DEBUG JwtUtil - Role from claims: " + claims.get("role"));
            System.out.println("DEBUG JwtUtil - isVendor from claims: " + claims.get("isVendor"));
            System.out.println("DEBUG JwtUtil - vendorType from claims: " + claims.get("vendorType"));
            
            // Extract vendor information
            Boolean isVendor = (Boolean) claims.get("isVendor");
            if (isVendor != null) {
                user.setVendor(isVendor);
            }
            
            String vendorTypeStr = (String) claims.get("vendorType");
            System.out.println("DEBUG JwtUtil - vendorTypeStr: " + vendorTypeStr);
            if (vendorTypeStr != null && !vendorTypeStr.equals("Default")) {
                try {
                    user.setVendorType(Vendor_Type.valueOf(vendorTypeStr));
                    System.out.println("DEBUG JwtUtil - Successfully set vendorType: " + user.getVendorType());
                } catch (IllegalArgumentException e) {
                    System.out.println("DEBUG JwtUtil - Error parsing vendorType: " + e.getMessage());
                    user.setVendorType(Vendor_Type.Defualt);
                }
            }
            
            System.out.println("DEBUG JwtUtil - Final user object - role: " + user.getRole() + ", isVendor: " + user.isVendor() + ", vendorType: " + user.getVendorType());
            return user;
        } catch (Exception e) {
            System.out.println("DEBUG JwtUtil - Exception in getUserFromToken: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Invalid or expired token");
        }
    }
}
