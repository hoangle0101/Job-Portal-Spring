package com.mockproject.job_portal.config;

import com.mockproject.job_portal.repository.UserRepository;
import com.mockproject.job_portal.security.JwtAuthFilter;
import com.mockproject.job_portal.security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

@Configuration
public class SecurityConfig {

    private static final String API = "/api/v1";

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public SecurityConfig(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    // All authorization rules of the application are declared here (first matching rule wins).
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Public: authentication and read-only browsing.
                        .requestMatchers(HttpMethod.POST, API + "/auth/register", API + "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, API + "/jobs/mine", API + "/companies/mine").hasRole("RECRUITER")
                        .requestMatchers(HttpMethod.GET, API + "/health", API + "/jobs/**", API + "/companies/**",
                                API + "/industries", API + "/job-types", API + "/files/**").permitAll()

                        // Admin.
                        .requestMatchers(API + "/admin/**").hasRole("ADMIN")

                        // Job seeker.
                        .requestMatchers(API + "/candidates/me/**").hasRole("JOB_SEEKER")
                        .requestMatchers(HttpMethod.POST, API + "/applications/jobs/*").hasRole("JOB_SEEKER")
                        .requestMatchers(HttpMethod.DELETE, API + "/applications/*").hasRole("JOB_SEEKER")
                        .requestMatchers(API + "/applications/mine").hasRole("JOB_SEEKER")
                        .requestMatchers(API + "/hiring/offers/*/respond").hasRole("JOB_SEEKER")
                        .requestMatchers(HttpMethod.POST, API + "/companies/*/reviews").hasRole("JOB_SEEKER")

                        // Recruiter.
                        .requestMatchers(API + "/candidates/*/profile").hasRole("RECRUITER")
                        .requestMatchers(API + "/applications/recruiter", API + "/applications/*/reject").hasRole("RECRUITER")
                        .requestMatchers(API + "/hiring/**").hasRole("RECRUITER")
                        .requestMatchers(API + "/jobs/**").hasRole("RECRUITER")
                        .requestMatchers(HttpMethod.POST, API + "/companies").hasRole("RECRUITER")
                        .requestMatchers(HttpMethod.PUT, API + "/companies/*").hasRole("RECRUITER")
                        .requestMatchers(HttpMethod.DELETE, API + "/companies/*").hasRole("RECRUITER")

                        // Anything else (notifications, account, review edit/delete, file upload): any logged-in user.
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, e) ->
                                writeError(response, 401, "Vui lòng đăng nhập để tiếp tục", request.getRequestURI()))
                        .accessDeniedHandler((request, response, e) ->
                                writeError(response, 403, "Bạn không có quyền thực hiện thao tác này", request.getRequestURI())))
                .addFilterBefore(new JwtAuthFilter(jwtUtil, userRepository), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Passwords are stored as BCrypt hashes, never as plain text.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Writes the same JSON shape as ErrorResponse so the frontend can read "message".
    private static void writeError(HttpServletResponse response, int status, String message, String path) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"status\":" + status + ",\"message\":\"" + message + "\",\"path\":\"" + path + "\"}");
    }
}
