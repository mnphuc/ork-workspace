# Kiến trúc Dự án - Template Java Backend

## Tổng quan

Dự án này được tổ chức theo kiến trúc **Clean Architecture** (còn gọi là Hexagonal Architecture hoặc Ports & Adapters),
nhằm đảm bảo:

- **Tách biệt rõ ràng** giữa business logic và technical implementation
- **Dễ dàng test** từng layer độc lập
- **Linh hoạt** trong việc thay đổi framework, database, hoặc UI
- **Maintainable** và dễ mở rộng

## Cấu trúc Package

```
org.phc.templatejavabe/
├── presentation/          # Layer Giao diện (Adapter Input)
│   ├── controller/        # REST API Controllers
│   ├── request/           # Request DTOs từ client
│   └── response/          # Response DTOs trả về client
│
├── application/           # Layer Ứng dụng (Use Cases)
│   ├── dto/               # Data Transfer Objects
│   ├── mapper/            # Chuyển đổi giữa Domain và DTO
│   └── usecase/           # Business Use Cases / Application Services
│
├── domain/                # Layer Domain (Core Business Logic)
│   ├── model/             # Domain Entities / Aggregates
│   ├── repository/        # Repository Interfaces (Ports)
│   └── service/           # Domain Services (Business Rules)
│
└── infrastructure/        # Layer Hạ tầng (Adapter Output)
    ├── config/            # Spring Configuration
    └── repository/        # Repository Implementations (Adapters)
```

## Chi tiết từng Layer

### 1. Domain Layer (Core)

**Vị trí**: `org.phc.templatejavabe.domain`

**Mục đích**: Chứa business logic thuần túy, không phụ thuộc vào framework hay technology

**Các package con**:

#### `domain.model`

- Chứa các **Domain Entities** và **Value Objects**
- Đại diện cho các khái niệm nghiệp vụ cốt lõi
- Không có dependency vào Spring hay bất kỳ framework nào
- **Ví dụ**: `User`, `Product`, `Order`, `Money`, `Email`

#### `domain.repository`

- Định nghĩa **Repository Interfaces** (Ports)
- Đây là contract để truy xuất/lưu trữ domain entities
- Implementation sẽ nằm ở infrastructure layer
- **Ví dụ**: `UserRepository`, `ProductRepository`

#### `domain.service`

- Chứa **Domain Services** - business logic không thuộc về một entity cụ thể nào
- Xử lý các nghiệp vụ phức tạp liên quan đến nhiều entities
- **Ví dụ**: `OrderPricingService`, `InventoryService`

**Nguyên tắc quan trọng**:

- ✅ Domain layer không phụ thuộc vào bất kỳ layer nào khác
- ✅ Domain entities chứa business rules
- ✅ Domain services xử lý business logic cross-entity
- ❌ Không sử dụng annotation của framework (trừ @Value, @Data của Lombok)
- ❌ Không có business logic trong repository

---

### 2. Application Layer (Use Cases)

**Vị trí**: `org.phc.templatejavabe.application`

**Mục đích**: Điều phối (orchestrate) các domain objects để thực hiện use cases cụ thể

**Các package con**:

#### `application.usecase`

- Chứa các **Application Services** / **Use Cases**
- Điều phối flow của business logic
- Gọi domain services, repositories để hoàn thành nghiệp vụ
- Transaction management thường nằm ở đây
- **Ví dụ**: `CreateUserUseCase`, `PlaceOrderUseCase`, `UpdateProductUseCase`

#### `application.dto`

- **Data Transfer Objects** để truyền dữ liệu giữa các layer
- Không chứa business logic
- **Ví dụ**: `UserDTO`, `ProductDTO`

#### `application.mapper`

- Chuyển đổi giữa Domain Models và DTOs
- **Ví dụ**: `UserMapper`, `ProductMapper`
- Có thể dùng MapStruct để tự động generate

**Nguyên tắc quan trọng**:

- ✅ Use cases phụ thuộc vào domain layer
- ✅ Một use case thường tương ứng với một nghiệp vụ cụ thể
- ✅ Use cases orchestrate, không chứa business rules
- ❌ Không có business logic phức tạp ở đây (business logic thuộc domain)
- ❌ Không biết về presentation layer (controller, request/response)

---

### 3. Presentation Layer (Input Adapters)

**Vị trí**: `org.phc.templatejavabe.presentation`

**Mục đích**: Xử lý giao tiếp với bên ngoài (REST API, GraphQL, gRPC, etc.)

**Các package con**:

#### `presentation.controller`

- REST Controllers để expose API endpoints
- Gọi use cases từ application layer
- Xử lý HTTP request/response
- **Ví dụ**: `UserController`, `ProductController`

#### `presentation.request`

- Request DTOs từ client
- Chứa validation annotations
- **Ví dụ**: `CreateUserRequest`, `UpdateProductRequest`

#### `presentation.response`

- Response DTOs trả về client
- Format dữ liệu phù hợp với API contract
- **Ví dụ**: `UserResponse`, `ProductResponse`, `ErrorResponse`

**Nguyên tắc quan trọng**:

- ✅ Controller chỉ gọi use cases, không chứa business logic
- ✅ Request/Response DTOs khác với Application DTOs
- ✅ Xử lý exception và trả về HTTP status code phù hợp
- ❌ Không gọi trực tiếp repository từ controller
- ❌ Không chứa business logic

---

### 4. Infrastructure Layer (Output Adapters)

**Vị trí**: `org.phc.templatejavabe.infrastructure`

**Mục đích**: Cung cấp implementation cho các technical concerns

**Các package con**:

#### `infrastructure.repository`

- **Implementation** của repository interfaces từ domain layer
- Sử dụng Spring Data JPA, MongoDB, etc.
- **Ví dụ**: `JpaUserRepository`, `MongoProductRepository`

#### `infrastructure.config`

- Spring Configuration classes
- Bean definitions
- Security configuration
- Database configuration
- **Ví dụ**: `SecurityConfig`, `DatabaseConfig`, `SwaggerConfig`

**Nguyên tắc quan trọng**:

- ✅ Implement repository interfaces từ domain
- ✅ Chứa tất cả framework-specific code
- ✅ Có thể thay đổi implementation mà không ảnh hưởng domain
- ❌ Không chứa business logic

---

## Dependency Rules (Nguyên tắc Phụ thuộc)

Một trong những nguyên tắc quan trọng nhất của Clean Architecture là **Dependency Rule**:

```
Presentation → Application → Domain ← Infrastructure
                              ↑
                         (Core - Không phụ thuộc gì)
```

### Các quy tắc:

1. **Domain Layer** (center):
    - ✅ Không phụ thuộc vào bất kỳ layer nào
    - ✅ Không import Spring annotations (trừ một số Lombok annotations)
    - ✅ Chỉ chứa Java thuần và business logic

2. **Application Layer**:
    - ✅ Phụ thuộc vào Domain layer
    - ❌ KHÔNG phụ thuộc vào Presentation hay Infrastructure

3. **Presentation Layer**:
    - ✅ Phụ thuộc vào Application layer (thông qua interfaces)
    - ❌ KHÔNG phụ thuộc vào Infrastructure
    - ❌ KHÔNG gọi trực tiếp Domain repositories

4. **Infrastructure Layer**:
    - ✅ Phụ thuộc vào Domain layer (implement repository interfaces)
    - ❌ KHÔNG phụ thuộc vào Presentation
    - ❌ KHÔNG phụ thuộc vào Application

---

## Luồng Xử lý (Request Flow)

```
1. Client → HTTP Request
              ↓
2. Controller (Presentation)
   - Validate request
   - Map request → DTO
              ↓
3. Use Case (Application)
   - Orchestrate business logic
   - Call domain services
   - Call repositories
              ↓
4. Domain Service/Entity
   - Execute business rules
              ↓
5. Repository Implementation (Infrastructure)
   - Query/Save to Database
              ↓
6. Domain Entity (returned)
              ↓
7. Use Case
   - Map entity → DTO
              ↓
8. Controller
   - Map DTO → Response
              ↓
9. Client ← HTTP Response
```

---

## Ví dụ Cụ thể

### Use Case: Tạo User mới

#### 1. Domain Model

```java
// domain/model/User.java
@Getter
@AllArgsConstructor
public class User {
    private Long id;
    private String email;
    private String name;
    
    public void validate() {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }
    }
}
```

#### 2. Domain Repository Interface

```java
// domain/repository/UserRepository.java
public interface UserRepository {
    User save(User user);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
}
```

#### 3. Application Use Case

```java
// application/usecase/CreateUserUseCase.java
@Service
@RequiredArgsConstructor
public class CreateUserUseCase {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    public UserDTO execute(UserDTO userDTO) {
        // Check if email exists
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new BusinessException("Email already exists");
        }
        
        // Map DTO to Domain
        User user = userMapper.toDomain(userDTO);
        
        // Validate business rules
        user.validate();
        
        // Save
        User savedUser = userRepository.save(user);
        
        // Map back to DTO
        return userMapper.toDTO(savedUser);
    }
}
```

#### 4. Infrastructure Repository Implementation

```java
// infrastructure/repository/JpaUserRepository.java
@Repository
@RequiredArgsConstructor
public class JpaUserRepositoryAdapter implements UserRepository {
    private final JpaUserRepositorySpring jpaRepository;
    
    @Override
    public User save(User user) {
        UserEntity entity = toEntity(user);
        UserEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }
    
    // ... other methods
}
```

#### 5. Presentation Controller

```java
// presentation/controller/UserController.java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final CreateUserUseCase createUserUseCase;
    
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        UserDTO userDTO = toDTO(request);
        UserDTO created = createUserUseCase.execute(userDTO);
        return ResponseEntity.ok(toResponse(created));
    }
}
```

---

## Lợi ích của Kiến trúc này

### 1. **Testability (Dễ test)**

- Domain logic có thể test hoàn toàn độc lập
- Mock dependencies dễ dàng thông qua interfaces
- Unit test nhanh vì không cần load Spring context

### 2. **Maintainability (Dễ bảo trì)**

- Mỗi layer có trách nhiệm rõ ràng
- Thay đổi ở một layer ít ảnh hưởng đến layer khác
- Code organization rõ ràng, dễ tìm

### 3. **Flexibility (Linh hoạt)**

- Có thể đổi database (SQL → NoSQL) mà không ảnh hưởng domain
- Có thể đổi framework (Spring → Quarkus) với ít thay đổi
- Có thể thêm presentation layer mới (REST, GraphQL, gRPC) dễ dàng

### 4. **Business Logic Protection**

- Business rules tập trung ở domain, không bị ảnh hưởng bởi technology
- Domain model thuần túy, dễ hiểu cho business analysts

### 5. **Team Collaboration**

- Team có thể làm việc song song trên các layer khác nhau
- Domain experts có thể focus vào domain layer
- Infrastructure team focus vào technical concerns

---

## Best Practices

### ✅ NÊN LÀM:

1. **Domain Layer**:
    - Giữ domain entities thuần túy (pure Java)
    - Business logic trong domain entities/services
    - Repository interfaces trong domain

2. **Application Layer**:
    - Use cases nhỏ, tập trung vào một nhiệm vụ
    - Transaction boundaries ở use case level
    - Orchestrate, không chứa business logic

3. **Presentation Layer**:
    - Controller mỏng, chỉ handle HTTP concerns
    - Validation input từ client
    - Exception handling & error responses

4. **Infrastructure Layer**:
    - Implement repository interfaces
    - Configuration tập trung
    - Framework-specific code ở đây

### ❌ KHÔNG NÊN:

1. ❌ Business logic trong controller
2. ❌ Controller gọi trực tiếp repository
3. ❌ Domain entities phụ thuộc vào JPA annotations (nếu muốn clean 100%)
4. ❌ Use case chứa business rules phức tạp (nên ở domain)
5. ❌ Infrastructure code trong domain layer
6. ❌ Presentation DTOs được sử dụng trong domain

---

## Migration từ Layered Architecture

Nếu bạn đang có codebase theo **Layered Architecture** truyền thống:

```
Traditional:                Clean Architecture:
├── controller/       →     ├── presentation/
├── service/          →     ├── application/usecase/
├── model/            →     ├── domain/model/
└── repository/       →     ├── domain/repository/ (interface)
                            └── infrastructure/repository/ (impl)
```

---

## Tools & Libraries Khuyến nghị

1. **MapStruct**: Auto-generate mappers giữa DTOs và domain models
2. **ArchUnit**: Test architecture rules tự động
3. **Lombok**: Giảm boilerplate code
4. **Spring Data JPA**: Repository implementations
5. **Hibernate Validator**: Input validation

---

## Tài liệu Tham khảo

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)

---

## Kết luận

Kiến trúc này giúp dự án:

- **Scalable**: Dễ mở rộng khi nghiệp vụ phức tạp
- **Maintainable**: Dễ bảo trì và refactor
- **Testable**: Test coverage cao, test nhanh
- **Flexible**: Linh hoạt thay đổi technology

Hãy tuân thủ các nguyên tắc và dependency rules để tận dụng tối đa lợi ích của kiến trúc này!


