/**
 * Application Mappers Package - Data Transformation
 *
 * <p>Package này chứa các mapper classes để chuyển đổi giữa domain entities và DTOs,
 * giúp tách biệt domain model khỏi presentation/application concerns.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Convert giữa Domain Entities ↔ Application DTOs</li>
 *   <li>Convert giữa Application DTOs ↔ Request/Response DTOs</li>
 *   <li>Handle nested objects mapping</li>
 *   <li>Transformation logic đơn giản</li>
 * </ul>
 *
 * <h2>Các loại Mappers:</h2>
 * <ul>
 *   <li><strong>Entity to DTO:</strong> Flatten domain entities cho presentation</li>
 *   <li><strong>DTO to Entity:</strong> Reconstruct domain entities từ input</li>
 *   <li><strong>Bidirectional:</strong> Both directions</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Stateless mapping methods</li>
 *   <li>✅ Sử dụng MapStruct để auto-generate (khuyến nghị)</li>
 *   <li>✅ Handle null values gracefully</li>
 *   <li>✅ One mapper per aggregate root</li>
 *   <li>❌ KHÔNG chứa business logic</li>
 *   <li>❌ KHÔNG gọi repositories hoặc services</li>
 *   <li>❌ KHÔNG có complex transformations (nên dùng factory pattern)</li>
 * </ul>
 *
 * <h2>Ví dụ với MapStruct:</h2>
 * <pre>
 * {@code
 * @Mapper(componentModel = "spring")
 * public interface UserMapper {
 *     UserDTO toDTO(User user);
 *     User toDomain(UserDTO dto);
 *     List<UserDTO> toDTOList(List<User> users);
 *
 *     @Mapping(target = "id", ignore = true)
 *     User toDomainForCreate(CreateUserRequest request);
 * }
 * }
 * </pre>
 *
 * <h2>Ví dụ Manual Mapping:</h2>
 * <pre>
 * {@code
 * @Component
 * public class UserMapper {
 *     public UserDTO toDTO(User user) {
 *         if (user == null) return null;
 *         return UserDTO.builder()
 *             .id(user.getId())
 *             .email(user.getEmail())
 *             .name(user.getName())
 *             .status(user.getStatus().name())
 *             .createdAt(user.getCreatedAt())
 *             .build();
 *     }
 *
 *     public User toDomain(UserDTO dto) {
 *         if (dto == null) return null;
 *         return new User(
 *             dto.getId(),
 *             dto.getEmail(),
 *             dto.getName(),
 *             UserStatus.valueOf(dto.getStatus())
 *         );
 *     }
 * }
 * }
 * </pre>
 *
 * <p><strong>Khuyến nghị:</strong> Sử dụng MapStruct để giảm boilerplate code và tăng
 * performance (generate code tại compile time).</p>
 *
 * @see org.phc.templatejavabe.application.dto
 * @see org.phc.templatejavabe.domain.model
 * @since 1.0
 */
package org.phc.templatejavabe.application.mapper;