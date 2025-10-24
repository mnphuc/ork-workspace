/**
 * Presentation Controllers Package - REST API Endpoints
 *
 * <p>Package này chứa các REST Controllers để expose API endpoints cho clients.
 * Controllers là entry point của application từ HTTP layer.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Handle HTTP requests/responses</li>
 *   <li>Routing và endpoint definitions</li>
 *   <li>Request validation (format, structure)</li>
 *   <li>Response formatting và HTTP status codes</li>
 *   <li>Exception handling và error responses</li>
 *   <li>API documentation (Swagger/OpenAPI annotations)</li>
 * </ul>
 *
 * <h2>Controller Characteristics:</h2>
 * <ul>
 *   <li><strong>Thin Controllers:</strong> Không chứa business logic</li>
 *   <li><strong>Delegation:</strong> Gọi use cases từ application layer</li>
 *   <li><strong>Transformation:</strong> Request → DTO → Use Case → DTO → Response</li>
 *   <li><strong>RESTful:</strong> Tuân thủ REST principles</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Controllers chỉ handle HTTP concerns</li>
 *   <li>✅ Gọi use cases, KHÔNG gọi repositories trực tiếp</li>
 *   <li>✅ Validate request format (không phải business rules)</li>
 *   <li>✅ Map Request → DTO và DTO → Response</li>
 *   <li>✅ Handle exceptions và return proper HTTP status</li>
 *   <li>❌ KHÔNG chứa business logic</li>
 *   <li>❌ KHÔNG có database queries</li>
 *   <li>❌ KHÔNG gọi domain services trực tiếp</li>
 * </ul>
 *
 * <h2>RESTful Conventions:</h2>
 * <ul>
 *   <li><strong>GET:</strong> Retrieve resources (200 OK, 404 Not Found)</li>
 *   <li><strong>POST:</strong> Create resources (201 Created, 400 Bad Request)</li>
 *   <li><strong>PUT:</strong> Update entire resource (200 OK, 404 Not Found)</li>
 *   <li><strong>PATCH:</strong> Partial update (200 OK)</li>
 *   <li><strong>DELETE:</strong> Delete resource (204 No Content, 404 Not Found)</li>
 * </ul>
 *
 * <h2>Naming Convention:</h2>
 * <ul>
 *   <li><strong>Pattern:</strong> {Resource}Controller - UserController, ProductController</li>
 *   <li><strong>Endpoints:</strong> /api/{resources} - /api/users, /api/products</li>
 *   <li><strong>Methods:</strong> getUser, createUser, updateUser, deleteUser, listUsers</li>
 * </ul>
 *
 * <h2>Ví dụ:</h2>
 * <pre>
 * {@code
 * @RestController
 * @RequestMapping("/api/users")
 * @RequiredArgsConstructor
 * @Tag(name = "User Management", description = "User CRUD operations")
 * public class UserController {
 *     private final CreateUserUseCase createUserUseCase;
 *     private final GetUserUseCase getUserUseCase;
 *     private final UpdateUserUseCase updateUserUseCase;
 *
 *     @PostMapping
 *     @ResponseStatus(HttpStatus.CREATED)
 *     @Operation(summary = "Create new user")
 *     public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
 *         // 1. Map Request to DTO
 *         CreateUserDTO dto = mapToDTO(request);
 *
 *         // 2. Execute use case
 *         UserDTO created = createUserUseCase.execute(dto);
 *
 *         // 3. Map DTO to Response
 *         return mapToResponse(created);
 *     }
 *
 *     @GetMapping("/{id}")
 *     @Operation(summary = "Get user by ID")
 *     public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
 *         UserDTO user = getUserUseCase.execute(id);
 *         return ResponseEntity.ok(mapToResponse(user));
 *     }
 *
 *     @PutMapping("/{id}")
 *     public UserResponse updateUser(
 *             @PathVariable Long id,
 *             @Valid @RequestBody UpdateUserRequest request) {
 *         UpdateUserDTO dto = mapToDTO(id, request);
 *         UserDTO updated = updateUserUseCase.execute(dto);
 *         return mapToResponse(updated);
 *     }
 *
 *     @DeleteMapping("/{id}")
 *     @ResponseStatus(HttpStatus.NO_CONTENT)
 *     public void deleteUser(@PathVariable Long id) {
 *         deleteUserUseCase.execute(id);
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Exception Handling:</h2>
 * <pre>
 * {@code
 * @RestControllerAdvice
 * public class GlobalExceptionHandler {
 *     @ExceptionHandler(BusinessException.class)
 *     public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
 *         return ResponseEntity
 *             .status(HttpStatus.BAD_REQUEST)
 *             .body(new ErrorResponse(ex.getMessage()));
 *     }
 *
 *     @ExceptionHandler(NotFoundException.class)
 *     public ResponseEntity<ErrorResponse> handleNotFoundException(NotFoundException ex) {
 *         return ResponseEntity
 *             .status(HttpStatus.NOT_FOUND)
 *             .body(new ErrorResponse(ex.getMessage()));
 *     }
 * }
 * }
 * </pre>
 *
 * <h2>Best Practices:</h2>
 * <ul>
 *   <li>✅ Sử dụng @Valid cho request validation</li>
 *   <li>✅ Return proper HTTP status codes</li>
 *   <li>✅ Use ResponseEntity khi cần control headers/status</li>
 *   <li>✅ Consistent error response format</li>
 *   <li>✅ API versioning (/api/v1/users)</li>
 *   <li>✅ Swagger/OpenAPI documentation</li>
 *   <li>✅ HATEOAS cho RESTful maturity (optional)</li>
 * </ul>
 *
 * @see org.phc.templatejavabe.presentation.request
 * @see org.phc.templatejavabe.presentation.response
 * @see org.phc.templatejavabe.application.usecase
 * @since 1.0
 */
package org.phc.templatejavabe.presentation.controller;