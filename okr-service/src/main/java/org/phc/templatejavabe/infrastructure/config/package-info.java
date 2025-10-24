/**
 * Infrastructure Configuration Package - Application Configuration
 *
 * <p>Package này chứa tất cả các Spring Configuration classes cho việc setup
 * và configure các beans, security, database, và các technical concerns khác.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Spring Bean definitions và configurations</li>
 *   <li>Security configuration (authentication, authorization)</li>
 *   <li>Database configuration (DataSource, JPA, Transaction)</li>
 *   <li>Third-party integrations setup</li>
 *   <li>API documentation configuration (Swagger/OpenAPI)</li>
 *   <li>Async, scheduling, caching configurations</li>
 * </ul>
 *
 * <h2>Các loại Configuration:</h2>
 *
 * <h3>1. Security Configuration</h3>
 * <pre>
 * {@code
 * @Configuration
 * @EnableWebSecurity
 * @EnableMethodSecurity
 * public class SecurityConfig {
 *
 *     @Bean
 *     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
 *         return http
 *             .csrf(csrf -> csrf.disable())
 *             .authorizeHttpRequests(auth -> auth
 *                 .requestMatchers("/api/public/**").permitAll()
 *                 .requestMatchers("/api/admin/**").hasRole("ADMIN")
 *                 .anyRequest().authenticated()
 *             )
 *             .sessionManagement(session -> session
 *                 .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
 *             )
 *             .build();
 *     }
 *
 *     @Bean
 *     public PasswordEncoder passwordEncoder() {
 *         return new BCryptPasswordEncoder();
 *     }
 * }
 * }
 * </pre>
 *
 * <h3>2. Database Configuration</h3>
 * <pre>
 * {@code
 * @Configuration
 * @EnableJpaRepositories(basePackages = "org.phc.templatejavabe.infrastructure.repository")
 * @EnableTransactionManagement
 * public class DatabaseConfig {
 *
 *     @Bean
 *     @ConfigurationProperties(prefix = "spring.datasource")
 *     public DataSource dataSource() {
 *         return DataSourceBuilder.create().build();
 *     }
 *
 *     @Bean
 *     public LocalContainerEntityManagerFactoryBean entityManagerFactory(
 *             DataSource dataSource) {
 *         LocalContainerEntityManagerFactoryBean em =
 *             new LocalContainerEntityManagerFactoryBean();
 *         em.setDataSource(dataSource);
 *         em.setPackagesToScan("org.phc.templatejavabe.infrastructure.persistence");
 *         em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
 *         return em;
 *     }
 *
 *     @Bean
 *     public PlatformTransactionManager transactionManager(
 *             EntityManagerFactory entityManagerFactory) {
 *         return new JpaTransactionManager(entityManagerFactory);
 *     }
 * }
 * }
 * </pre>
 *
 * <h3>3. Swagger/OpenAPI Configuration</h3>
 * <pre>
 * {@code
 * @Configuration
 * public class OpenApiConfig {
 *
 *     @Bean
 *     public OpenAPI customOpenAPI() {
 *         return new OpenAPI()
 *             .info(new Info()
 *                 .title("Template Java BE API")
 *                 .version("1.0")
 *                 .description("API documentation for Template Java Backend")
 *                 .contact(new Contact()
 *                     .name("Your Team")
 *                     .email("support@example.com")
 *                 )
 *             )
 *             .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
 *             .components(new Components()
 *                 .addSecuritySchemes("Bearer Authentication",
 *                     new SecurityScheme()
 *                         .type(SecurityScheme.Type.HTTP)
 *                         .scheme("bearer")
 *                         .bearerFormat("JWT")
 *                 )
 *             );
 *     }
 * }
 * }
 * </pre>
 *
 * <h3>4. CORS Configuration</h3>
 * <pre>
 * {@code
 * @Configuration
 * public class CorsConfig implements WebMvcConfigurer {
 *
 *     @Override
 *     public void addCorsMappings(CorsRegistry registry) {
 *         registry.addMapping("/api/**")
 *             .allowedOrigins("http://localhost:3000", "https://yourdomain.com")
 *             .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
 *             .allowedHeaders("*")
 *             .allowCredentials(true)
 *             .maxAge(3600);
 *     }
 * }
 * }
 * </pre>
 *
 * <h3>5. Jackson Configuration</h3>
 * <pre>
 * {@code
 * @Configuration
 * public class JacksonConfig {
 *
 *     @Bean
 *     public ObjectMapper objectMapper() {
 *         ObjectMapper mapper = new ObjectMapper();
 *         mapper.registerModule(new JavaTimeModule());
 *         mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
 *         mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
 *         mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
 *         return mapper;
 *     }
 * }
 * }
 * </pre>
 *
 * <h3>6. Async Configuration</h3>
 * <pre>
 * {@code
 * @Configuration
 * @EnableAsync
 * public class AsyncConfig {
 *
 *     @Bean(name = "taskExecutor")
 *     public Executor taskExecutor() {
 *         ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
 *         executor.setCorePoolSize(5);
 *         executor.setMaxPoolSize(10);
 *         executor.setQueueCapacity(100);
 *         executor.setThreadNamePrefix("async-");
 *         executor.initialize();
 *         return executor;
 *     }
 * }
 * }
 * </pre>
 *
 * <h3>7. Cache Configuration</h3>
 * <pre>
 * {@code
 * @Configuration
 * @EnableCaching
 * public class CacheConfig {
 *
 *     @Bean
 *     public CacheManager cacheManager() {
 *         SimpleCacheManager cacheManager = new SimpleCacheManager();
 *         cacheManager.setCaches(Arrays.asList(
 *             new ConcurrentMapCache("users"),
 *             new ConcurrentMapCache("products")
 *         ));
 *         return cacheManager;
 *     }
 * }
 * }
 * </pre>
 *
 * <h3>8. Application Properties Configuration</h3>
 * <pre>
 * {@code
 * @Configuration
 * @ConfigurationProperties(prefix = "app")
 * @Data
 * public class ApplicationProperties {
 *     private String name;
 *     private String version;
 *     private Security security = new Security();
 *     private Mail mail = new Mail();
 *
 *     @Data
 *     public static class Security {
 *         private String jwtSecret;
 *         private Long jwtExpirationMs;
 *     }
 *
 *     @Data
 *     public static class Mail {
 *         private String host;
 *         private Integer port;
 *         private String username;
 *         private String password;
 *     }
 * }
 * }
 * </pre>
 *
 * <h3>9. Bean Definitions</h3>
 * <pre>
 * {@code
 * @Configuration
 * public class BeanConfig {
 *
 *     @Bean
 *     public ModelMapper modelMapper() {
 *         return new ModelMapper();
 *     }
 *
 *     @Bean
 *     public RestTemplate restTemplate() {
 *         return new RestTemplate();
 *     }
 *
 *     @Bean
 *     public Clock clock() {
 *         return Clock.systemDefaultZone();
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Mỗi concern có một configuration class riêng</li>
 *   <li>✅ Sử dụng @ConfigurationProperties cho external configs</li>
 *   <li>✅ Profile-specific configurations (@Profile)</li>
 *   <li>✅ Bean naming conventions rõ ràng</li>
 *   <li>✅ Document các configurations phức tạp</li>
 *   <li>❌ KHÔNG hardcode sensitive data (use environment variables)</li>
 *   <li>❌ KHÔNG mix business logic vào configuration</li>
 * </ul>
 *
 * <h2>Configuration Profiles:</h2>
 * <pre>
 * {@code
 * @Configuration
 * @Profile("dev")
 * public class DevConfig {
 *     // Development-specific beans
 * }
 *
 * @Configuration
 * @Profile("prod")
 * public class ProdConfig {
 *     // Production-specific beans
 * }
 * }
 * </pre>
 *
 * <h2>External Configuration Files:</h2>
 * <ul>
 *   <li>application.properties - Default config</li>
 *   <li>application-dev.properties - Development</li>
 *   <li>application-test.properties - Testing</li>
 *   <li>application-prod.properties - Production</li>
 * </ul>
 *
 * <h2>Best Practices:</h2>
 * <ul>
 *   <li>✅ Separate concerns - một config class cho mỗi concern</li>
 *   <li>✅ Use type-safe configuration properties</li>
 *   <li>✅ Environment-specific configurations với profiles</li>
 *   <li>✅ Externalize configurations (12-factor app)</li>
 *   <li>✅ Document non-obvious configurations</li>
 *   <li>✅ Validate configuration properties</li>
 * </ul>
 *
 * @see org.springframework.context.annotation.Configuration
 * @see org.springframework.boot.context.properties.ConfigurationProperties
 * @since 1.0
 */
package org.phc.templatejavabe.infrastructure.config;