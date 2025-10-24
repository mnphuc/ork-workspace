/**
 * Infrastructure Repository Implementations Package - Data Access Layer
 *
 * <p>Package này chứa các implementations của repository interfaces được định nghĩa
 * trong domain layer. Đây là nơi xử lý tất cả các technical details của data persistence.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Implement repository interfaces từ domain layer</li>
 *   <li>Database queries và operations</li>
 *   <li>Entity mapping giữa domain models và persistence entities</li>
 *   <li>Transaction handling (nếu cần ở repository level)</li>
 *   <li>Caching strategies</li>
 * </ul>
 *
 * <h2>Architecture Pattern:</h2>
 * <ul>
 *   <li><strong>Domain Interface:</strong> {@code domain.repository.UserRepository}</li>
 *   <li><strong>Infrastructure Adapter:</strong> {@code infrastructure.repository.JpaUserRepositoryAdapter}</li>
 *   <li><strong>Spring Data Repository:</strong> {@code infrastructure.repository.JpaUserRepository}</li>
 *   <li><strong>JPA Entity:</strong> {@code infrastructure.persistence.UserEntity}</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Implement domain repository interfaces</li>
 *   <li>✅ Convert giữa domain models và JPA entities</li>
 *   <li>✅ Sử dụng Spring Data JPA khi có thể</li>
 *   <li>✅ Custom queries cho complex scenarios</li>
 *   <li>✅ Handle exceptions và convert sang domain exceptions</li>
 *   <li>❌ KHÔNG expose JPA entities ra ngoài infrastructure layer</li>
 *   <li>❌ KHÔNG chứa business logic</li>
 *   <li>❌ KHÔNG có dependencies về presentation hoặc application layers</li>
 * </ul>
 *
 * <h2>Naming Convention:</h2>
 * <ul>
 *   <li><strong>Adapter:</strong> Jpa{Entity}RepositoryAdapter</li>
 *   <li><strong>Spring Data:</strong> Jpa{Entity}Repository</li>
 *   <li><strong>Entity:</strong> {Entity}Entity (trong persistence package)</li>
 * </ul>
 *
 * <h2>Ví dụ - Domain Interface:</h2>
 * <pre>
 * {@code
 * // domain/repository/UserRepository.java
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
 * <h2>Ví dụ - Repository Adapter:</h2>
 * <pre>
 * {@code
 * // infrastructure/repository/JpaUserRepositoryAdapter.java
 * @Repository
 * @RequiredArgsConstructor
 * public class JpaUserRepositoryAdapter implements UserRepository {
 *
 *     private final JpaUserRepository jpaRepository;
 *     private final UserEntityMapper entityMapper;
 *
 *     @Override
 *     public User save(User user) {
 *         UserEntity entity = entityMapper.toEntity(user);
 *         UserEntity saved = jpaRepository.save(entity);
 *         return entityMapper.toDomain(saved);
 *     }
 *
 *     @Override
 *     public Optional<User> findById(Long id) {
 *         return jpaRepository.findById(id)
 *             .map(entityMapper::toDomain);
 *     }
 *
 *     @Override
 *     public Optional<User> findByEmail(String email) {
 *         return jpaRepository.findByEmail(email)
 *             .map(entityMapper::toDomain);
 *     }
 *
 *     @Override
 *     public List<User> findActiveUsers() {
 *         return jpaRepository.findByStatus(UserStatus.ACTIVE)
 *             .stream()
 *             .map(entityMapper::toDomain)
 *             .collect(Collectors.toList());
 *     }
 *
 *     @Override
 *     public void delete(Long id) {
 *         jpaRepository.deleteById(id);
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Ví dụ - Spring Data Repository:</h2>
 * <pre>
 * {@code
 * // infrastructure/repository/JpaUserRepository.java
 * public interface JpaUserRepository extends JpaRepository<UserEntity, Long> {
 *
 *     Optional<UserEntity> findByEmail(String email);
 *
 *     List<UserEntity> findByStatus(UserStatus status);
 *
 *     @Query("SELECT u FROM UserEntity u WHERE u.status = 'ACTIVE' AND u.createdAt > :date")
 *     List<UserEntity> findRecentActiveUsers(@Param("date") LocalDateTime date);
 *
 *     @Query(value = "SELECT * FROM users WHERE email LIKE %:keyword%", nativeQuery = true)
 *     List<UserEntity> searchByEmail(@Param("keyword") String keyword);
 *
 *     boolean existsByEmail(String email);
 * }
 * }
 * </pre>
 *
 * <h2>Ví dụ - JPA Entity:</h2>
 * <pre>
 * {@code
 * // infrastructure/persistence/UserEntity.java
 * @Entity
 * @Table(name = "users")
 * @Data
 * @NoArgsConstructor
 * @AllArgsConstructor
 * public class UserEntity {
 *
 *     @Id
 *     @GeneratedValue(strategy = GenerationType.IDENTITY)
 *     private Long id;
 *
 *     @Column(nullable = false, unique = true, length = 100)
 *     private String email;
 *
 *     @Column(nullable = false, length = 100)
 *     private String name;
 *
 *     @Enumerated(EnumType.STRING)
 *     @Column(nullable = false, length = 20)
 *     private UserStatus status;
 *
 *     @Column(name = "created_at", nullable = false, updatable = false)
 *     private LocalDateTime createdAt;
 *
 *     @Column(name = "updated_at")
 *     private LocalDateTime updatedAt;
 *
 *     @PrePersist
 *     protected void onCreate() {
 *         createdAt = LocalDateTime.now();
 *     }
 *
 *     @PreUpdate
 *     protected void onUpdate() {
 *         updatedAt = LocalDateTime.now();
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Entity Mapper:</h2>
 * <pre>
 * {@code
 * @Component
 * public class UserEntityMapper {
 *
 *     public UserEntity toEntity(User domain) {
 *         if (domain == null) return null;
 *         return new UserEntity(
 *             domain.getId(),
 *             domain.getEmail(),
 *             domain.getName(),
 *             domain.getStatus(),
 *             domain.getCreatedAt(),
 *             domain.getUpdatedAt()
 *         );
 *     }
 *
 *     public User toDomain(UserEntity entity) {
 *         if (entity == null) return null;
 *         return new User(
 *             entity.getId(),
 *             entity.getEmail(),
 *             entity.getName(),
 *             entity.getStatus()
 *         );
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Custom Repository Implementation:</h2>
 * <pre>
 * {@code
 * // For complex queries không thể làm với Spring Data
 * public interface CustomUserRepository {
 *     List<User> findByCriteria(UserSearchCriteria criteria);
 * }
 *
 * @Repository
 * @RequiredArgsConstructor
 * public class CustomUserRepositoryImpl implements CustomUserRepository {
 *
 *     private final EntityManager entityManager;
 *
 *     @Override
 *     public List<User> findByCriteria(UserSearchCriteria criteria) {
 *         CriteriaBuilder cb = entityManager.getCriteriaBuilder();
 *         CriteriaQuery<UserEntity> query = cb.createQuery(UserEntity.class);
 *         Root<UserEntity> user = query.from(UserEntity.class);
 *
 *         List<Predicate> predicates = new ArrayList<>();
 *
 *         if (criteria.getEmail() != null) {
 *             predicates.add(cb.like(user.get("email"), "%" + criteria.getEmail() + "%"));
 *         }
 *
 *         if (criteria.getStatus() != null) {
 *             predicates.add(cb.equal(user.get("status"), criteria.getStatus()));
 *         }
 *
 *         query.where(predicates.toArray(new Predicate[0]));
 *
 *         return entityManager.createQuery(query)
 *             .getResultList()
 *             .stream()
 *             .map(this::toDomain)
 *             .collect(Collectors.toList());
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Exception Handling:</h2>
 * <pre>
 * {@code
 * @Repository
 * public class JpaUserRepositoryAdapter implements UserRepository {
 *
 *     @Override
 *     public User save(User user) {
 *         try {
 *             UserEntity entity = entityMapper.toEntity(user);
 *             UserEntity saved = jpaRepository.save(entity);
 *             return entityMapper.toDomain(saved);
 *         } catch (DataIntegrityViolationException e) {
 *             throw new DuplicateEmailException("Email already exists");
 *         } catch (Exception e) {
 *             throw new RepositoryException("Error saving user", e);
 *         }
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Caching:</h2>
 * <pre>
 * {@code
 * @Repository
 * public class JpaUserRepositoryAdapter implements UserRepository {
 *
 *     @Cacheable(value = "users", key = "#id")
 *     @Override
 *     public Optional<User> findById(Long id) {
 *         return jpaRepository.findById(id)
 *             .map(entityMapper::toDomain);
 *     }
 *
 *     @CacheEvict(value = "users", key = "#user.id")
 *     @Override
 *     public User save(User user) {
 *         // ...
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Best Practices:</h2>
 * <ul>
 *   <li>✅ Adapter pattern để implement domain interfaces</li>
 *   <li>✅ Separate JPA entities từ domain entities</li>
 *   <li>✅ Sử dụng Spring Data JPA cho simple queries</li>
 *   <li>✅ Custom implementations cho complex queries</li>
 *   <li>✅ Entity mappers để convert domain ↔ JPA entities</li>
 *   <li>✅ Handle và convert exceptions thành domain exceptions</li>
 *   <li>✅ Use caching appropriately</li>
 *   <li>✅ Optimize queries (fetch strategies, projections)</li>
 * </ul>
 *
 * @see org.phc.templatejavabe.domain.repository
 * @see org.springframework.data.jpa.repository.JpaRepository
 * @since 1.0
 */
package org.phc.templatejavabe.infrastructure.repository;