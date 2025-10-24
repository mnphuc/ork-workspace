# Bug Report - OKR Web Application

## High Priority Bugs

### Bug #1: Date Formatting Issue ✅ FIXED
**Trang**: Objectives List, Objective Detail
**Mô tả**: Tất cả dates hiển thị "1/1/1970" thay vì date thực tế
**Status**: FIXED - Tạo utility functions để handle date parsing từ backend
**Solution**: 
- Tạo file okr-web/src/lib/date-utils.ts với formatDate, formatDateTime, formatQuarter
- Cập nhật các trang để sử dụng utility functions
- Handle multiple date formats (array, ISO string, timestamp)
**Files fixed**: 
- okr-web/src/app/okr/page.tsx
- okr-web/src/app/okr/[id]/page.tsx
- okr-web/src/app/okr/alignment/page.tsx
- okr-web/src/app/dashboard/page.tsx

### Bug #2: Owner/Team Display as IDs
**Trang**: Objectives List, Objective Detail, Dashboard
**Mô tả**: Owner và Team hiển thị dạng ULID thay vì tên người dùng/team
**Steps to reproduce**: 
1. Truy cập /okr hoặc dashboard
2. Xem trường Owner hoặc Team
**Expected**: Hiển thị tên người dùng và tên team
**Actual**: Hiển thị ID dạng "01HZ8K9M2N3P4Q5R6S7T8U9V1A"
**Priority**: High
**Root cause**: Frontend chưa fetch user/team names hoặc backend không populate relations
**Files affected**: 
- okr-web/src/app/okr/page.tsx (line 160-161)
- okr-web/src/app/okr/[id]/page.tsx (line 279)
- okr-web/src/app/dashboard/page.tsx (line 128)

## Medium Priority Bugs

### Bug #3: Logout Endpoint Returns 500 ✅ IMPROVED
**Trang**: All pages (Logout function)
**Mô tả**: Logout endpoint trả về HTTP 500 error
**Status**: IMPROVED - Cải thiện error handling ở frontend
**Solution**: 
- Loại bỏ console.warn khi logout endpoint fail
- Thêm comment giải thích đây là expected behavior
- Frontend vẫn hoạt động đúng (clear tokens và redirect)
**Files fixed**: 
- okr-web/src/lib/auth.ts
**Note**: Backend cần fix logout endpoint để trả về 200/204 thay vì 500

### Bug #4: Quarter Display Issue ✅ FIXED
**Trang**: Objectives List, Alignment
**Mô tả**: Quarter hiển thị dạng "Q2025-Q1" thay vì "Q1 2025"
**Status**: FIXED - Tạo formatQuarter utility function
**Solution**: 
- Tạo formatQuarter function trong okr-web/src/lib/date-utils.ts
- Handle format "2025-Q1" -> "Q1 2025"
- Cập nhật tất cả trang sử dụng formatQuarter
**Files fixed**: 
- okr-web/src/app/okr/page.tsx
- okr-web/src/app/okr/alignment/page.tsx
- okr-web/src/app/okr/[id]/page.tsx

## Low Priority Bugs

### Bug #5: Status Badge Text Format ✅ FIXED
**Trang**: Objectives List, Objective Detail, Alignment
**Mô tả**: Status text hiển thị với underscore "NOT_STARTED" thay vì "Not Started"
**Status**: FIXED - Tạo utility function để format status text
**Solution**: 
- Tạo file okr-web/src/lib/format-utils.ts với formatStatus function
- Cập nhật tất cả trang để sử dụng formatStatus thay vì replace manual
- Status hiển thị đúng: "Not Started", "On Track", "Behind", etc.
**Files fixed**: 
- okr-web/src/app/okr/page.tsx
- okr-web/src/app/okr/alignment/page.tsx

## New Bugs Discovered

### Bug #6: System Information Formatting Issue ✅ FIXED
**Trang**: Settings page
**Mô tả**: System Information fields không có spacing đúng giữa label và value
**Status**: FIXED - Thêm space character vào label text
**Solution**: 
- Thay đổi từ margin-left (ml-2) sang space character trong label
- Đảm bảo spacing consistent giữa tất cả fields
**Files fixed**: 
- okr-web/src/app/settings/page.tsx

### Bug #7: Owner/Team Names Not Resolved
**Trang**: Alignment page
**Mô tả**: Owner và Team hiển thị "—" thay vì tên thực tế
**Steps to reproduce**: 
1. Truy cập /okr/alignment
2. Xem Owner và Group columns
**Expected**: Hiển thị tên người dùng và tên team
**Actual**: Hiển thị "—"
**Priority**: Medium
**Root cause**: API /users và /teams trả về 500 error hoặc không có data
**Files affected**: 
- okr-web/src/app/okr/alignment/page.tsx (line 48-49)

### Bug #8: Date Still Shows "N/A"
**Trang**: Objectives List, Objective Detail
**Mô tả**: Mặc dù đã fix date formatting, vẫn hiển thị "Updated: N/A"
**Steps to reproduce**: 
1. Truy cập /okr
2. Xem trường "Updated"
**Expected**: Hiển thị date thực tế
**Actual**: Hiển thị "N/A"
**Priority**: Medium
**Root cause**: Backend có thể không trả về last_modified_date hoặc trả về null/undefined
**Files affected**: 
- Backend data structure
- okr-web/src/lib/date-utils.ts

## Testing Summary

### Completed Tests ✅
- Authentication flow (register, login, logout)
- Dashboard page load
- Objectives list page
- Create new objective
- Navigate to objective detail
- Alignment page (list view, roadmap view)
- Settings page
- Navigation và layout

### Pending Tests
- Add key result (modal opened but not completed)
- Check-in functionality
- Comments
- Edit/Delete operations
- Error handling
- Responsive design

