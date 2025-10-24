/**
 * Domain Services Package - Complex Business Logic
 *
 * <p>Package này chứa các domain services xử lý business logic phức tạp không thuộc
 * về một entity cụ thể nào, hoặc liên quan đến nhiều entities/aggregates.</p>
 *
 * <h2>Trách nhiệm:</h2>
 * <ul>
 *   <li>Xử lý business logic cross-entity</li>
 *   <li>Orchestrate interactions giữa nhiều domain objects</li>
 *   <li>Implement business rules phức tạp</li>
 *   <li>Domain calculations và validations</li>
 * </ul>
 *
 * <h2>Khi nào dùng Domain Service:</h2>
 * <ul>
 *   <li>Logic liên quan đến nhiều entities</li>
 *   <li>Không rõ entity nào nên chứa logic đó</li>
 *   <li>Business rules phụ thuộc vào external factors</li>
 *   <li>Complex calculations hoặc validations</li>
 * </ul>
 *
 * <h2>Nguyên tắc:</h2>
 * <ul>
 *   <li>✅ Stateless services</li>
 *   <li>✅ Chỉ chứa business logic thuần túy</li>
 *   <li>✅ Methods với parameters rõ ràng</li>
 *   <li>✅ Có thể gọi repository interfaces</li>
 *   <li>❌ KHÔNG orchestrate use cases (đó là job của application layer)</li>
 *   <li>❌ KHÔNG handle transactions</li>
 *   <li>❌ KHÔNG phụ thuộc vào infrastructure</li>
 * </ul>
 *
 * <h2>Ví dụ:</h2>
 * <pre>
 * {@code
 * public class OrderPricingService {
 *     public Money calculateTotal(Order order, Discount discount) {
 *         Money subtotal = order.getSubtotal();
 *         Money discountAmount = discount.apply(subtotal);
 *         Money tax = calculateTax(subtotal.minus(discountAmount));
 *         return subtotal.minus(discountAmount).plus(tax);
 *     }
 *
 *     private Money calculateTax(Money amount) {
 *         // Business rules for tax calculation
 *         return amount.multiply(0.1);
 *     }
 * }
 * }
 * </pre>
 *
 * <p><strong>Lưu ý:</strong> Domain services khác với Application services (use cases).
 * Domain services chứa business logic, còn application services orchestrate flow.</p>
 *
 * @see org.phc.templatejavabe.domain.model
 * @see org.phc.templatejavabe.application.usecase
 * @since 1.0
 */
package org.phc.templatejavabe.domain.service;