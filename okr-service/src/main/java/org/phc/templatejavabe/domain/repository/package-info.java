/**
 * Domain Repository Interfaces Package - Persistence Contracts
 *
 * <p>Package này định nghĩa các repository interfaces (ports) cho việc truy xuất
 * và lưu trữ domain entities. Đây là contracts mà infrastructure layer sẽ implement.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Định nghĩa repository interfaces</li>
 *   <li>Cung cấp abstraction cho data access</li>
 *   <li>Methods trả về domain entities, không phải DTOs</li>
 *   <li>Collection-like interface cho aggregates</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Interface-only, không có implementation</li>
 *   <li>✅ Domain-centric methods (findByEmail, không phải findByEmailEquals)</li>
 *   <li>✅ Return domain entities</li>
 *   <li>✅ Optional cho single results</li>
 *   <li>❌ KHÔNG có SQL, JPQL, hoặc query logic</li>
 *   <li>❌ KHÔNG có Spring Data annotations</li>
 *   <li>❌ KHÔNG có business logic</li>
 * </ul>
 *
 * <h2>Ví dụ:</h2>
 * <pre>
 * {@code
 * public interface UserRepository {
 *     User save(User user);
 *     Optional<User> findById(Long id);
 *     Optional<User> findByEmail(String email);
 *     List<User> findActiveUsers();
 *     void delete(Long id);
 * }
 * }
 * </pre>
 *
 * <p><strong>Implementation:</strong> Các implementation sẽ nằm trong
 * {@link org.phc.templatejavabe.infrastructure.repository}</p>
 *
 * @see org.phc.templatejavabe.domain.model
 * @see org.phc.templatejavabe.infrastructure.repository
 * @since 1.0
 */
package org.phc.templatejavabe.domain.repository;