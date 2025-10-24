# OKR Service Backend

Backend service cho hệ thống quản lý OKR (Objectives and Key Results) với hỗ trợ đa ngôn ngữ.

## 📋 Tổng quan

Đây là backend service cho hệ thống quản lý OKR với:

- **Clean Architecture** - Tách biệt rõ ràng giữa business logic và technical concerns
- **Spring Boot 3.5.3** - Framework hiện đại với Java 17
- **Internationalization (i18n)** - Hỗ trợ đa ngôn ngữ (Tiếng Việt, English)
- **Maven** - Dependency management
- **Lombok** - Giảm boilerplate code
- **PostgreSQL** - Database với Liquibase migration
- **JWT Authentication** - Xác thực và phân quyền

## 🏗️ Kiến trúc

Dự án được tổ chức theo **Clean Architecture** với 4 layers chính:

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│            (Controllers, Request, Response)              │
│                    ↓ calls                              │
│                 Application Layer                        │
│              (Use Cases, DTOs, Mappers)                 │
│                    ↓ uses                               │
│                   Domain Layer                           │
│        (Entities, Repository Interfaces, Services)      │
│                    ↑ implemented by                     │
│                Infrastructure Layer                      │
│         (Repository Implementations, Config)            │
└─────────────────────────────────────────────────────────┘
```

### Cấu trúc Package

```
org.phc.templatejavabe/
├── presentation/          # REST API Controllers & DTOs
│   ├── controller/        # API Endpoints
│   ├── request/           # Request DTOs
│   └── response/          # Response DTOs
│
├── application/           # Use Cases (Application Services)
│   ├── dto/               # Application DTOs
│   ├── mapper/            # Entity ↔ DTO Mappers
│   └── usecase/           # Business Workflows
│
├── domain/                # Core Business Logic
│   ├── model/             # Domain Entities
│   ├── repository/        # Repository Interfaces
│   └── service/           # Domain Services
│
└── infrastructure/        # Technical Implementation
    ├── config/            # Spring Configuration
    └── repository/        # Repository Implementations
```

## 🚀 Bắt đầu

### Yêu cầu

- **Java 17** trở lên
- **Maven 3.6+**
- **Git** (cho Git Hooks)
- IDE: IntelliJ IDEA, Eclipse, hoặc VS Code

### Cài đặt

1. **Clone repository**

```bash
git clone <repository-url>
cd template-be-java
```

2. **Setup Git Hooks** (quan trọng!)

```bash
# Trên Windows:
setup-hooks.cmd

# Trên Linux/Mac:
chmod +x setup-hooks.sh
./setup-hooks.sh
```

Git Hooks sẽ tự động kiểm tra code quality khi commit/push. Xem chi tiết: [GIT_HOOKS.md](GIT_HOOKS.md)

3. **Build project**

```bash
./mvnw clean install
```

4. **Run application**

```bash
./mvnw spring-boot:run
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`

### Chạy trên Windows

```cmd
mvnw.cmd clean install
mvnw.cmd spring-boot:run
```

## 📖 Documentation

Chi tiết về kiến trúc và các best practices, xem:

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Hướng dẫn chi tiết về Clean Architecture

Mỗi package đều có `package-info.java` với documentation đầy đủ về:

- Trách nhiệm của package
- Nguyên tắc thiết kế
- Ví dụ code cụ thể
- Best practices

## 🌐 Internationalization (i18n)

Backend hỗ trợ đa ngôn ngữ với Spring i18n:

### Ngôn ngữ được hỗ trợ

- **Vietnamese (vi)** - Ngôn ngữ mặc định
- **English (en)** - Ngôn ngữ phụ

### Cấu hình i18n

- **MessageSource**: Tự động load messages từ properties files
- **LocaleResolver**: Sử dụng Accept-Language header từ frontend
- **Validation Messages**: Tất cả validation errors được dịch
- **Error Messages**: Global exception handler trả về messages đã dịch

### Thêm ngôn ngữ mới

1. Tạo file `messages_{language_code}.properties` trong `src/main/resources/`
2. Cập nhật `I18nConfig.java` để thêm locale mới
3. Thêm message keys cho tất cả validation và error messages

### Thêm message keys mới

1. Thêm key vào `messages.properties` (default - Vietnamese)
2. Thêm key vào `messages_en.properties` (English)
3. Sử dụng trong code: `messageSource.getMessage("key", null, locale)`

## 📦 Dependencies

Các dependencies chính:

- **Spring Boot Starter** - Core Spring Boot
- **Spring Boot Security** - Authentication & Authorization
- **Spring Boot Data JPA** - Database access
- **PostgreSQL Driver** - Database connection
- **JWT** - Token-based authentication
- **Liquibase** - Database migration
- **Lombok** - Giảm boilerplate code
- **Spring Boot Starter Test** - Testing framework

## 🔍 Code Quality Tools

Dự án được tích hợp các tools để đảm bảo chất lượng code:

### 1. **Spotless** - Code Formatting

- Tự động format code theo Google Java Style Guide
- Check: `./mvnw spotless:check`
- Fix: `./mvnw spotless:apply`

### 2. **Checkstyle** - Code Quality

- Kiểm tra code standards và best practices
- Run: `./mvnw checkstyle:check`
- Config: `checkstyle.xml`

### 3. **Git Hooks** - Pre-commit/Pre-push Checks

- **pre-commit**: Kiểm tra formatting, compilation, checkstyle
- **commit-msg**: Validate commit message format (Conventional Commits)
- **pre-push**: Chạy unit tests

Chi tiết: [GIT_HOOKS.md](GIT_HOOKS.md)

## 🛠️ Phát triển

### Thêm một Feature mới

Ví dụ: Tạo User Management

#### 1. Domain Layer

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

// domain/repository/UserRepository.java
public interface UserRepository {
    User save(User user);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
}
```

#### 2. Application Layer

```java
// application/usecase/CreateUserUseCase.java
@Service
@RequiredArgsConstructor
@Transactional
public class CreateUserUseCase {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    public UserDTO execute(CreateUserDTO dto) {
        // Check if email exists
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BusinessException("Email already exists");
        }
        
        // Map & validate
        User user = userMapper.toDomain(dto);
        user.validate();
        
        // Save
        User saved = userRepository.save(user);
        
        return userMapper.toDTO(saved);
    }
}
```

#### 3. Presentation Layer

```java
// presentation/controller/UserController.java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final CreateUserUseCase createUserUseCase;
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDTO dto = mapToDTO(request);
        UserDTO created = createUserUseCase.execute(dto);
        return mapToResponse(created);
    }
}
```

#### 4. Infrastructure Layer

```java
// infrastructure/repository/JpaUserRepositoryAdapter.java
@Repository
@RequiredArgsConstructor
public class JpaUserRepositoryAdapter implements UserRepository {
    private final JpaUserRepository jpaRepository;
    private final UserEntityMapper entityMapper;
    
    @Override
    public User save(User user) {
        UserEntity entity = entityMapper.toEntity(user);
        UserEntity saved = jpaRepository.save(entity);
        return entityMapper.toDomain(saved);
    }
    // ... other methods
}
```

### Testing

```bash
# Run all tests
./mvnw test

# Run specific test
./mvnw test -Dtest=UserServiceTest

# Run with coverage
./mvnw test jacoco:report
```

### Code Quality Commands

```bash
# Check code formatting
./mvnw spotless:check

# Auto-fix formatting
./mvnw spotless:apply

# Run checkstyle
./mvnw checkstyle:check

# Complete validation
./mvnw clean compile checkstyle:check test
```

### Commit Convention

Dự án sử dụng **Conventional Commits**:

```bash
# Format
<type>(<scope>): <subject>

# Examples
git commit -m "feat(user): add registration endpoint"
git commit -m "fix(auth): resolve token expiration"
git commit -m "docs: update README"
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

### Code Style

Tuân thủ các nguyên tắc:

- ✅ **SOLID Principles**
- ✅ **Clean Code**
- ✅ **Google Java Style Guide** (via Spotless)
- ✅ **Dependency Rule** - Domain không phụ thuộc vào bất kỳ layer nào
- ✅ **Single Responsibility** - Mỗi class làm một việc
- ✅ **DRY** - Don't Repeat Yourself
- ✅ **Conventional Commits** - Standardized commit messages

## 📚 Tài nguyên học tập

### Clean Architecture

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)

### Domain-Driven Design

- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [DDD Reference](https://www.domainlanguage.com/ddd/reference/)

### Spring Boot

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Framework Reference](https://docs.spring.io/spring-framework/reference/)

## 🤝 Đóng góp

Contributions, issues và feature requests được welcome!

### Quy trình đóng góp:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

[Thêm license của bạn ở đây]

## 👥 Authors

- **Phuc MN** - *Initial work*

## 📞 Liên hệ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng:

- Tạo issue trên GitHub
- Email: [your-email@example.com]

---

**Happy Coding!** 🚀

