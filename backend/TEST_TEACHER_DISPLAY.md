# Test Teacher Display

## Mục tiêu
Đảm bảo frontend hiển thị tên giáo viên thay vì ID

## Các thay đổi đã thực hiện:

### 1. Backend Entity
- Thêm field `teacher: User` với populate
- Thêm field `students: User[]` với populate
- Giữ nguyên `teacherId: string` và `studentIds: string[]` để tương thích

### 2. Backend Service
- Tất cả methods đều populate teacher và students
- `findAll()`, `findOne()`, `create()`, `addStudentToClass()` đều populate

### 3. Frontend Queries/Mutations
- Cập nhật GraphQL queries để lấy thông tin teacher và students
- Hiển thị `teacher.fullName` thay vì `teacherId`

### 4. Frontend UI
- Teacher dashboard: `c.teacher?.fullName || c.teacher?.username`
- Admin dashboard: `c.teacher?.fullName || c.teacher?.username`
- Students: `c.students?.map(s => s.fullName || s.username)`

## Test Steps:
1. Restart backend
2. Login as TEACHER
3. Create a class
4. Check if teacher name appears instead of ID
5. Login as ADMIN
6. Check if teacher names appear in class list

## Expected Result:
- Frontend shows teacher names, not IDs
- Students show names, not IDs
- No sensitive information (IDs) exposed to frontend 