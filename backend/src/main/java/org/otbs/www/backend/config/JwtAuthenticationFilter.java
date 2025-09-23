package org.otbs.www.backend.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.otbs.www.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);

            if (jwtUtil.validateToken(jwt)) {
                try {
                    var claims = jwtUtil.extractAllClaims(jwt);
                    String email = claims.getSubject();
                    String role = (String) claims.get("role");
                    Boolean isVendor = (Boolean) claims.get("isVendor");
                    String vendorType = (String) claims.get("vendorType");

                    // Create authorities list
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    
                    // Add role authority
                    if (role != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    }
                    
                    // Add vendor authorities
                    if (isVendor != null && isVendor) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_VENDOR"));
                        if (vendorType != null && !vendorType.equals("Default")) {
                            authorities.add(new SimpleGrantedAuthority("ROLE_" + vendorType));
                        }
                    }

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null, authorities
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (Exception e) {
                    // If there's an error parsing the token, continue without authentication
                    System.out.println("Error parsing JWT token in filter: " + e.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
