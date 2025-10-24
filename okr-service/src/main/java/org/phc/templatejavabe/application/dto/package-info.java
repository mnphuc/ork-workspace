/**
 * Application DTOs Package - Data Transfer Objects
 *
 * <p>Package này chứa các Data Transfer Objects được sử dụng để truyền dữ liệu
 * giữa application layer và các layers khác (presentation, infrastructure).</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Transfer data giữa các layers</li>
 *   <li>Flatten complex domain models</li>
 *   <li>Decouple presentation từ domain</li>
 *   <li>Serialize/Deserialize dữ liệu</li>
 * </ul>
 *
 * <h2>Đặc điểm:</h2>
 * <ul>
 *   <li>Immutable data structures</li>
 *   <li>Không có business logic</li>
 *   <li>Simple POJO với getters/setters</li>
 *   <li>Có thể chứa validation annotations (Bean Validation)</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Simple data holders, không có behavior</li>
 *   <li>✅ Có thể có nested DTOs</li>
 *   <li>✅ Sử dụng Lombok để giảm boilerplate</li>
 *   <li>✅ Có thể có validation annotations</li>
 *   <li>❌ KHÔNG chứa business logic</li>
 *   <li>❌ KHÔNG reference domain entities trực tiếp</li>
 *   <li>❌ KHÔNG có dependencies phức tạp</li>
 * </ul>
 *
 * <h2>Ví dụ:</h2>
 * <pre>
 * {@code
 * @Data
 * @Builder
 * @NoArgsConstructor
 * @AllArgsConstructor
 * public class UserDTO {
 *     private Long id;
 *
 *     @NotBlank
 *     @Email
 *     private String email;
 *
 *     @NotBlank
 *     @Size(min = 2, max = 100)
 *     private String name;
 *
 *     private String status;
 *     private LocalDateTime createdAt;
 * }
 * }
 * </pre>
 *
 * <p><strong>Khác biệt với Request/Response DTOs:</strong> Application DTOs dùng nội bộ
 * giữa các layers, còn Request/Response DTOs (trong presentation) là API contracts.</p>
 *
 * @see org.phc.templatejavabe.application.mapper
 * @see org.phc.templatejavabe.presentation.request
 * @see org.phc.templatejavabe.presentation.response
 * @since 1.0
 */
package org.phc.templatejavabe.application.dto;