/**
 * Presentation Request DTOs Package - API Input Models
 *
 * <p>Package này chứa các Request DTOs đại diện cho input data từ clients qua HTTP requests.
 * Đây là API contracts cho input.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Định nghĩa API input contracts</li>
 *   <li>Request data validation (format, constraints)</li>
 *   <li>Deserialization từ JSON/XML</li>
 *   <li>API documentation (schema definitions)</li>
 * </ul>
 *
 * <h2>Đặc điểm:</h2>
 * <ul>
 *   <li><strong>API-focused:</strong> Designed cho external clients</li>
 *   <li><strong>Validated:</strong> Bean Validation annotations</li>
 *   <li><strong>Documented:</strong> Swagger/OpenAPI annotations</li>
 *   <li><strong>Immutable:</strong> Không thay đổi sau khi deserialize</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Validation annotations (JSR-303/380)</li>
 *   <li>✅ Clear, descriptive property names</li>
 *   <li>✅ One request DTO per endpoint action</li>
 *   <li>✅ Swagger annotations cho documentation</li>
 *   <li>❌ KHÔNG chứa business logic</li>
 *   <li>❌ KHÔNG reference domain entities</li>
 *   <li>❌ KHÔNG reuse giữa các endpoints khác nhau</li>
 * </ul>
 *
 * <h2>Naming Convention:</h2>
 * <ul>
 *   <li><strong>Pattern:</strong> {Action}{Resource}Request</li>
 *   <li><strong>Examples:</strong> CreateUserRequest, UpdateProductRequest, LoginRequest</li>
 * </ul>
 *
 * <h2>Validation Annotations:</h2>
 * <ul>
 *   <li>@NotNull, @NotBlank, @NotEmpty - Bắt buộc</li>
 *   <li>@Size, @Min, @Max - Size constraints</li>
 *   <li>@Email, @Pattern - Format validation</li>
 *   <li>@Past, @Future - Date constraints</li>
 * </ul>
 *
 * <h2>Ví dụ:</h2>
 * <pre>
 * {@code
 * @Data
 * @Builder
 * @NoArgsConstructor
 * @AllArgsConstructor
 * @Schema(description = "Request để tạo user mới")
 * public class CreateUserRequest {
 *
 *     @Schema(description = "Email của user", example = "user@example.com", required = true)
 *     @NotBlank(message = "Email không được để trống")
 *     @Email(message = "Email không hợp lệ")
 *     private String email;
 *
 *     @Schema(description = "Tên đầy đủ", example = "Nguyễn Văn A", required = true)
 *     @NotBlank(message = "Tên không được để trống")
 *     @Size(min = 2, max = 100, message = "Tên phải từ 2-100 ký tự")
 *     private String name;
 *
 *     @Schema(description = "Mật khẩu", required = true)
 *     @NotBlank(message = "Mật khẩu không được để trống")
 *     @Size(min = 8, message = "Mật khẩu phải ít nhất 8 ký tự")
 *     @Pattern(
 *         regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
 *         message = "Mật khẩu phải chứa chữ hoa, chữ thường và số"
 *     )
 *     private String password;
 *
 *     @Schema(description = "Tuổi của user")
 *     @Min(value = 18, message = "Phải từ 18 tuổi trở lên")
 *     @Max(value = 120, message = "Tuổi không hợp lệ")
 *     private Integer age;
 * }
 * }
 * </pre>
 *
 * <h2>Custom Validation:</h2>
 * <pre>
 * {@code
 * // Custom constraint annotation
 * @Target({ElementType.FIELD})
 * @Retention(RetentionPolicy.RUNTIME)
 * @Constraint(validatedBy = PhoneNumberValidator.class)
 * public @interface ValidPhoneNumber {
 *     String message() default "Invalid phone number";
 *     Class<?>[] groups() default {};
 *     Class<? extends Payload>[] payload() default {};
 * }
 *
 * // Usage in request
 * public class CreateUserRequest {
 *     @ValidPhoneNumber
 *     private String phoneNumber;
 * }
 * }
 * </pre>
 *
 * <h2>Nested Objects:</h2>
 * <pre>
 * {@code
 * @Data
 * public class CreateOrderRequest {
 *     @NotBlank
 *     private String customerName;
 *
 *     @Valid // Important: validate nested object
 *     @NotNull
 *     private AddressRequest shippingAddress;
 *
 *     @Valid
 *     @NotEmpty
 *     private List<OrderItemRequest> items;
 * }
 * }
 * </pre>
 *
 * <h2>So sánh với Application DTOs:</h2>
 * <table>
 *   <tr>
 *     <th>Request DTOs</th>
 *     <th>Application DTOs</th>
 *   </tr>
 *   <tr>
 *     <td>API contracts (external)</td>
 *     <td>Internal data transfer</td>
 *   </tr>
 *   <tr>
 *     <td>Validation annotations</td>
 *     <td>Minimal validation</td>
 *   </tr>
 *   <tr>
 *     <td>Swagger documentation</td>
 *     <td>No documentation needed</td>
 *   </tr>
 *   <tr>
 *     <td>Client-friendly naming</td>
 *     <td>Domain-aligned naming</td>
 *   </tr>
 *   <tr>
 *     <td>Versioned with API</td>
 *     <td>Internal, can change freely</td>
 *   </tr>
 * </table>
 *
 * <h2>Best Practices:</h2>
 * <ul>
 *   <li>✅ Một request DTO cho mỗi action (create vs update có thể khác nhau)</li>
 *   <li>✅ Validation messages tiếng Việt cho user-friendly</li>
 *   <li>✅ Example values trong Swagger annotations</li>
 *   <li>✅ Required fields được mark rõ ràng</li>
 *   <li>✅ Sensitive data (password) không log ra</li>
 * </ul>
 *
 * @see org.phc.templatejavabe.presentation.controller
 * @see org.phc.templatejavabe.presentation.response
 * @see org.phc.templatejavabe.application.dto
 * @since 1.0
 */
package org.phc.templatejavabe.presentation.request;