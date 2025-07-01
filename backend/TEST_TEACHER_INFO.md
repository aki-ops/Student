# Test Teacher Information Display

## Vấn đề hiện tại
- Frontend nhận được teacherId nhưng không có fullName
- Populate có thể không hoạt động đúng

## Giải pháp đã thực hiện:

### 1. Backend - Populate + Fallback
- Thêm populate cho teacher field
- Nếu populate không hoạt động, dùng UsersService để lấy thông tin teacher từ teacherId
- Debug logging để theo dõi quá trình

### 2. Frontend - Fallback Display
- Ưu tiên: `teacher.fullName` → `teacher.username` → `teacherId` → "Chưa có giáo viên"
- Debug logging để kiểm tra dữ liệu nhận được

### 3. Debug Steps:
1. Restart backend
2. Login as TEACHER
3. Create a class
4. Check backend console logs:
   - `DEBUG ClassService.findAll - starting query`
   - `DEBUG Getting teacher info for class...`
   - `DEBUG Found teacher for class...`
5. Check frontend console logs:
   - `DEBUG Class X teacher info:`
   - `teacherFullName`, `teacherUsername`

## Expected Results:
- Backend logs show teacher info being fetched
- Frontend shows teacher name instead of ID
- If populate fails, fallback to manual lookup works

## Next Steps:
- If still showing ID, check if UsersService.findById works
- Verify teacherId matches actual user ID in database 