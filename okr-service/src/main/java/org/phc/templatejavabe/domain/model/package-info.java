/**
 * Domain Model Package - Core Business Entities
 *
 * <p>Package này chứa các Domain Entities, Value Objects và Aggregates đại diện
 * cho các khái niệm nghiệp vụ cốt lõi của hệ thống.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Chứa các domain entities với business logic</li>
 *   <li>Định nghĩa các value objects bất biến</li>
 *   <li>Aggregate roots để đảm bảo consistency</li>
 *   <li>Encapsulate business rules và invariants</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Rich domain models với behavior, không phải anemic models</li>
 *   <li>✅ Business logic nằm trong entities</li>
 *   <li>✅ Immutable value objects</li>
 *   <li>✅ Pure Java, không phụ thuộc framework (trừ Lombok)</li>
 *   <li>❌ KHÔNG có dependency vào Spring, JPA annotations</li>
 *   <li>❌ KHÔNG có logic liên quan đến persistence</li>
 * </ul>
 *
 * <h2>Ví dụ:</h2>
 * <pre>
 * {@code
 * @Getter
 * @AllArgsConstructor
 * public class User {
 *     private Long id;
 *     private Email email;
 *     private String name;
 *     private UserStatus status;
 *
 *     public void activate() {
 *         if (this.status == UserStatus.BANNED) {
 *             throw new BusinessException("Cannot activate banned user");
 *         }
 *         this.status = UserStatus.ACTIVE;
 *     }
 * }
 * }
 * </pre>
 *
 * @see org.phc.templatejavabe.domain.service
 * @since 1.0
 */
package org.phc.templatejavabe.domain.model;