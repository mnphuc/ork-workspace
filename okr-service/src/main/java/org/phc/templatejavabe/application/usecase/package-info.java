/**
 * Application Use Cases Package - Business Workflows
 *
 * <p>Package này chứa các Application Services (hay Use Cases) - orchestrate việc thực thi
 * các business workflows và use cases cụ thể của hệ thống.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Orchestrate business workflows</li>
 *   <li>Coordinate giữa domain services, repositories, và entities</li>
 *   <li>Define transaction boundaries</li>
 *   <li>Convert giữa DTOs và domain entities (via mappers)</li>
 *   <li>Application-level validations và error handling</li>
 * </ul>
 *
 * <h2>Use Case Characteristics:</h2>
 * <ul>
 *   <li>Mỗi use case đại diện cho một user action hoặc system workflow</li>
 *   <li>Single Responsibility - mỗi use case làm một việc</li>
 *   <li>Stateless - không lưu state giữa các calls</li>
 *   <li>Transactional boundaries - @Transactional ở đây</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Orchestrate flow, KHÔNG chứa business logic phức tạp</li>
 *   <li>✅ Gọi domain services để xử lý business rules</li>
 *   <li>✅ Transaction management (@Transactional)</li>
 *   <li>✅ Input/Output là DTOs, không phải domain entities</li>
 *   <li>✅ Handle application-level exceptions</li>
 *   <li>❌ KHÔNG chứa business rules (business rules thuộc domain)</li>
 *   <li>❌ KHÔNG có SQL/JPQL queries</li>
 *   <li>❌ KHÔNG phụ thuộc vào presentation layer</li>
 * </ul>
 *
 * <h2>Naming Convention:</h2>
 * <ul>
 *   <li><strong>Pattern 1:</strong> {Verb}{Entity}UseCase - CreateUserUseCase</li>
 *   <li><strong>Pattern 2:</strong> {Action}Service - UserCreationService</li>
 *   <li><strong>Verbs:</strong> Create, Update, Delete, Find, Get, Process, Calculate, etc.</li>
 * </ul>
 *
 * <h2>Ví dụ:</h2>
 * <pre>
 * {@code
 * @Service
 * @RequiredArgsConstructor
 * @Transactional
 * public class CreateUserUseCase {
 *     private final UserRepository userRepository;
 *     private final UserMapper userMapper;
 *     private final EmailService emailService; // Domain service
 *
 *     public UserDTO execute(CreateUserDTO dto) {
 *         // 1. Validate business rules
 *         if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
 *             throw new BusinessException("Email already exists");
 *         }
 *
 *         // 2. Map DTO to Domain
 *         User user = userMapper.toDomain(dto);
 *
 *         // 3. Execute domain logic
 *         user.validate(); // Domain logic
 *
 *         // 4. Persist
 *         User savedUser = userRepository.save(user);
 *
 *         // 5. Side effects (optional)
 *         emailService.sendWelcomeEmail(savedUser.getEmail());
 *
 *         // 6. Map back to DTO and return
 *         return userMapper.toDTO(savedUser);
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Use Case Flow Pattern:</h2>
 * <pre>
 * 1. Validate input (business validation)
 * 2. Map DTO → Domain Entity
 * 3. Execute domain logic (via domain services/entities)
 * 4. Persist changes (via repositories)
 * 5. Handle side effects (events, notifications, etc.)
 * 6. Map Domain Entity → DTO
 * 7. Return result
 * </pre>
 *
 * <h2>Difference từ Domain Services:</h2>
 * <table>
 *   <tr>
 *     <th>Use Case (Application Service)</th>
 *     <th>Domain Service</th>
 *   </tr>
 *   <tr>
 *     <td>Orchestrate workflow</td>
 *     <td>Business logic</td>
 *   </tr>
 *   <tr>
 *     <td>Transaction management</td>
 *     <td>Stateless calculations</td>
 *   </tr>
 *   <tr>
 *     <td>Use DTOs</td>
 *     <td>Use domain entities</td>
 *   </tr>
 *   <tr>
 *     <td>Handle application concerns</td>
 *     <td>Handle business concerns</td>
 *   </tr>
 * </table>
 *
 * <p><strong>Lưu ý:</strong> Use cases là entry point vào application logic từ presentation layer.
 * Controllers chỉ nên gọi use cases, không gọi trực tiếp repositories hay domain services.</p>
 *
 * @see org.phc.templatejavabe.application.dto
 * @see org.phc.templatejavabe.domain.service
 * @see org.phc.templatejavabe.presentation.controller
 * @since 1.0
 */
package org.phc.templatejavabe.application.usecase;