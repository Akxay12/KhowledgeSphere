package com.knowledgeSphere.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        System.out.println("🔥 CUSTOM SECURITY FILTER CHAIN CREATED");
        http
                // ❌ CSRF disable (API use case)
                .csrf(csrf -> csrf.disable())

                // ❌ SESSION disable (VERY IMPORTANT for JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 🔥 CORS CONFIG
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();

                    corsConfig.setAllowedOrigins(
        java.util.List.of(
                "http://localhost:3000",
                "https://khowledge-sphere-bfrz.vercel.app"
        )
);
                    corsConfig.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    corsConfig.setAllowedHeaders(java.util.List.of("*"));
                    corsConfig.setAllowCredentials(true);

                    return corsConfig;
                }))

                // 🔥 AUTH RULES
                .authorizeHttpRequests(auth -> auth
                        // Public authentication APIs
                        .requestMatchers("/users/signup", "/users/login").permitAll()

                        // 🌐 All public APIs
                        .requestMatchers("/public/**").permitAll()

                        // 🔎 Public search API
                        .requestMatchers("/api/search/**").permitAll()

                        // CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 🔒 Everything else requires JWT
                        .anyRequest().authenticated()
                )

                // ❌ DISABLE DEFAULT SPRING SECURITY LOGIN
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable());

        // 🔥 JWT FILTER (IMPORTANT POSITION)
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
