package com.appointment.scheduler_api.security;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.appointment.scheduler_api.entity.User;
import com.appointment.scheduler_api.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SimpleAuthFilter extends OncePerRequestFilter {

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Get the Authorization header from the request
        String authHeader = request.getHeader("Authorization");

        // 2. Check if header exists
        if (authHeader != null && !authHeader.isEmpty()) {
            
            // 3. Remove "Bearer " prefix if the frontend sends it (standard practice)
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

            // 4. Find the user in the DB by this token
            Optional<User> userOptional = userRepository.findByToken(token);

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // 5. Create the Authentication Object (Provider or Client)
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        user, 
                        null, 
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );

                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Set the User in the Security Context (Logs them in for this request)
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // 7. Continue the filter chain
        filterChain.doFilter(request, response);
    }
}