/**
 * Presentation Response DTOs Package - API Output Models
 *
 * <p>Package này chứa các Response DTOs đại diện cho output data trả về clients qua HTTP responses.
 * Đây là API contracts cho output.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Định nghĩa API output contracts</li>
 *   <li>Format dữ liệu cho clients</li>
 *   <li>Serialization sang JSON/XML</li>
 *   <li>API documentation (response schemas)</li>
 *   <li>Consistent error response format</li>
 * </ul>
 *
 * <h2>Đặc điểm:</h2>
 * <ul>
 *   <li><strong>Client-friendly:</strong> Format phù hợp với client needs</li>
 *   <li><strong>Documented:</strong> Swagger/OpenAPI annotations</li>
 *   <li><strong>Consistent:</strong> Standardized structure</li>
 *   <li><strong>Secure:</strong> Không expose sensitive data</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Clear, descriptive property names</li>
 *   <li>✅ Swagger annotations cho documentation</li>
 *   <li>✅ Không expose domain entity structure</li>
 *   <li>✅ Hide sensitive information (passwords, tokens, etc.)</li>
 *   <li>✅ Consistent date/time formats</li>
 *   <li>❌ KHÔNG chứa business logic</li>
 *   <li>❌ KHÔNG reference domain entities trực tiếp</li>
 *   <li>❌ KHÔNG expose internal IDs hoặc technical details</li>
 * </ul>
 *
 * <h2>Naming Convention:</h2>
 * <ul>
 *   <li><strong>Pattern:</strong> {Resource}Response hoặc {Action}Response</li>
 *   <li><strong>Examples:</strong> UserResponse, ProductResponse, ErrorResponse, PageResponse</li>
 * </ul>
 *
 * <h2>Ví dụ Success Response:</h2>
 * <pre>
 * {@code
 * @Data
 * @Builder
 * @NoArgsConstructor
 * @AllArgsConstructor
 * @Schema(description = "Thông tin user")
 * public class UserResponse {
 *
 *     @Schema(description = "ID của user", example = "123")
 *     private Long id;
 *
 *     @Schema(description = "Email", example = "user@example.com")
 *     private String email;
 *
 *     @Schema(description = "Tên đầy đủ", example = "Nguyễn Văn A")
 *     private String name;
 *
 *     @Schema(description = "Trạng thái", example = "ACTIVE")
 *     private String status;
 *
 *     @Schema(description = "Ngày tạo", example = "2024-01-15T10:30:00")
 *     @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
 *     private LocalDateTime createdAt;
 *
 *     @Schema(description = "Ngày cập nhật cuối", example = "2024-01-20T15:45:00")
 *     @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
 *     private LocalDateTime updatedAt;
 *
 *     // NOTE: Không bao gồm password hoặc sensitive data
 * }
 * }
 * </pre>
 *
 * <h2>Error Response Standard:</h2>
 * <pre>
 * {@code
 * @Data
 * @Builder
 * @AllArgsConstructor
 * @Schema(description = "Error response format")
 * public class ErrorResponse {
 *
 *     @Schema(description = "Timestamp của error", example = "2024-01-15T10:30:00")
 *     private LocalDateTime timestamp;
 *
 *     @Schema(description = "HTTP status code", example = "400")
 *     private Integer status;
 *
 *     @Schema(description = "Error message", example = "Email already exists")
 *     private String message;
 *
 *     @Schema(description = "Detailed errors")
 *     private List<FieldError> errors;
 *
 *     @Schema(description = "Request path", example = "/api/users")
 *     private String path;
 * }
 *
 * @Data
 * @AllArgsConstructor
 * public class FieldError {
 *     private String field;
 *     private String message;
 * }
 * }
 * </pre>
 *
 * <h2>Paginated Response:</h2>
 * <pre>
 * {@code
 * @Data
 * @Builder
 * @Schema(description = "Paginated response wrapper")
 * public class PageResponse<T> {
 *
 *     @Schema(description = "List of items")
 *     private List<T> content;
 *
 *     @Schema(description = "Current page number", example = "0")
 *     private Integer page;
 *
 *     @Schema(description = "Page size", example = "20")
 *     private Integer size;
 *
 *     @Schema(description = "Total elements", example = "150")
 *     private Long totalElements;
 *
 *     @Schema(description = "Total pages", example = "8")
 *     private Integer totalPages;
 *
 *     @Schema(description = "Is first page")
 *     private Boolean first;
 *
 *     @Schema(description = "Is last page")
 *     private Boolean last;
 * }
 * }
 * </pre>
 *
 * <h2>Success Response Wrapper (Optional):</h2>
 * <pre>
 * {@code
 * @Data
 * @Builder
 * @Schema(description = "Standard API response wrapper")
 * public class ApiResponse<T> {
 *
 *     @Schema(description = "Success flag", example = "true")
 *     private Boolean success;
 *
 *     @Schema(description = "Response message", example = "User created successfully")
 *     private String message;
 *
 *     @Schema(description = "Response data")
 *     private T data;
 *
 *     @Schema(description = "Timestamp", example = "2024-01-15T10:30:00")
 *     private LocalDateTime timestamp;
 * }
 * }
 * </pre>
 *
 * <h2>Nested Response Objects:</h2>
 * <pre>
 * {@code
 * @Data
 * @Builder
 * public class OrderResponse {
 *     private Long id;
 *     private String orderNumber;
 *
 *     // Nested object
 *     private CustomerResponse customer;
 *
 *     // Nested list
 *     private List<OrderItemResponse> items;
 *
 *     private BigDecimal totalAmount;
 *     private String status;
 *     private LocalDateTime createdAt;
 * }
 * }
 * </pre>
 *
 * <h2>JSON Customization:</h2>
 * <pre>
 * {@code
 * @Data
 * public class ProductResponse {
 *     private Long id;
 *
 *     // Rename field in JSON
 *     @JsonProperty("product_name")
 *     private String name;
 *
 *     // Exclude null values
 *     @JsonInclude(JsonInclude.Include.NON_NULL)
 *     private String description;
 *
 *     // Custom serialization
 *     @JsonSerialize(using = MoneySerializer.class)
 *     private BigDecimal price;
 *
 *     // Ignore field
 *     @JsonIgnore
 *     private String internalCode;
 * }
 * }
 * </pre>
 *
 * <h2>HATEOAS (Optional - for RESTful Level 3):</h2>
 * <pre>
 * {@code
 * @Data
 * @Builder
 * public class UserResponse {
 *     private Long id;
 *     private String name;
 *     private String email;
 *
 *     // Links for resource navigation
 *     private Map<String, String> links;
 *
 *     public static UserResponse withLinks(User user, String baseUrl) {
 *         return UserResponse.builder()
 *             .id(user.getId())
 *             .name(user.getName())
 *             .email(user.getEmail())
 *             .links(Map.of(
 *                 "self", baseUrl + "/api/users/" + user.getId(),
 *                 "orders", baseUrl + "/api/users/" + user.getId() + "/orders",
 *                 "update", baseUrl + "/api/users/" + user.getId()
 *             ))
 *             .build();
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Best Practices:</h2>
 * <ul>
 *   <li>✅ Consistent naming conventions across all responses</li>
 *   <li>✅ Use ISO-8601 format cho dates (yyyy-MM-dd'T'HH:mm:ss)</li>
 *   <li>✅ Standardized error response format</li>
 *   <li>✅ Include meaningful HTTP status codes</li>
 *   <li>✅ Hide sensitive data (passwords, internal IDs, etc.)</li>
 *   <li>✅ Swagger documentation đầy đủ</li>
 *   <li>✅ Version API responses khi có breaking changes</li>
 * </ul>
 *
 * @see org.phc.templatejavabe.presentation.controller
 * @see org.phc.templatejavabe.presentation.request
 * @see org.phc.templatejavabe.application.dto
 * @since 1.0
 */
package org.phc.templatejavabe.presentation.response;