# GraphQL Issues & Solutions

## ✅ ĐÃ ĐƯỢC IMPLEMENT

1. **Queries mới:** `getAllClasses`, `getAllScores`, `findAllUsers`
2. **Mutations mới:** `updateUser`, `removeUser`
3. **Input types:** `UpdateUserInput` đã có đầy đủ
4. **Type fixes:** Đã sửa `Float` vs `Int`, `ID` vs `Int`

## 🚨 VẤN ĐỀ CÒN LẠI

1. **UpdateAttendanceInput:** Chỉ có `id` field, thiếu các field khác
2. **Authentication:** Một số queries cần admin role

## 🚨 VẤN ĐỀ ĐÃ TÌM THẤY (ĐÃ SỬA)

### 1. **MUTATIONS KHÔNG TỒN TẠI TRONG BACKEND**
- ❌ `updateUser` - KHÔNG CÓ trong schema backend
- ❌ `removeUser` - KHÔNG CÓ trong schema backend
- ❌ `class` query - KHÔNG CÓ trong schema backend  
- ❌ `score` query - KHÔNG CÓ trong schema backend

### 2. **QUERIES SAI TÊN**
- ❌ `findAllUser` trả về `User` (single) nhưng frontend expect array
- ❌ `class` query không tồn tại, backend có `class(id: Int!)` nhưng frontend gọi `class` (không có id)

### 3. **INPUT TYPES KHÔNG KHỚP**
- ❌ `UpdateUserInput` - KHÔNG CÓ trong schema backend
- ❌ `CreateClassInput` thiếu field `studentIds` trong backend
- ❌ `UpdateAttendanceInput` chỉ có `id` field, thiếu các field khác

### 4. **TYPE MISMATCHES**
- ❌ `score` field trong `CreateScoreInput` backend là `Float!` nhưng frontend dùng `Int`
- ❌ `id` fields backend là `ID!` nhưng frontend dùng `Int`

## ✅ GIẢI PHÁP ĐÃ ÁP DỤNG

### 1. **Sửa mutations.ts**
- ✅ Loại bỏ `UPDATE_USER_MUTATION`, `DELETE_USER_MUTATION` (không tồn tại)
- ✅ Sửa `REGISTER_MUTATION` để trả về `id` thay vì `password`
- ✅ **KHÔI PHỤC** `studentIds` trong class mutations (backend có field này)
- ✅ Sửa field types để khớp với backend (Float cho score)
- ✅ Thêm comments giải thích các vấn đề

### 2. **Sửa queries.ts**
- ✅ Thêm comments giải thích `findAllUser` trả về single User
- ✅ Tạo placeholder queries cho `getAllClasses` và `getAllScores` (backend chưa có)
- ✅ Thêm individual queries `GetClassById` và `GetScoreById` (backend có)
- ✅ Giữ nguyên `attendance` query (đúng)

### 3. **Sửa admin dashboard**
- ✅ Loại bỏ import các mutations không tồn tại
- ✅ Comment out các function update/delete user
- ✅ **KHÔI PHỤC** `studentIds` field trong class form (backend có field này)
- ✅ Sửa hiển thị bảng class để hiển thị studentIds
- ✅ Sửa score form để sử dụng Float (khớp với backend)

## 🔧 BACKEND CẦN CẬP NHẬT

### 1. **Thêm các queries thiếu**
```graphql
# Cần thêm vào backend
findAllUsers: [User!]!  # Thay vì findAllUser: User!
getAllClasses: [Class!]!  # Thay vì class(id: Int!)
getAllScores: [Score!]!   # Thay vì score(id: Int!)
```

### 2. **Thêm các mutations thiếu**
```graphql
# Cần thêm vào backend
updateUser(input: UpdateUserInput!): User!
removeUser(id: Int!): User!
```

### 3. **Cập nhật input types**
```graphql
# Cần cập nhật UpdateAttendanceInput
input UpdateAttendanceInput {
  id: Int!
  classId: String
  date: DateTime
  records: [AttendanceRecordInput!]
}

# Cần thêm UpdateUserInput
input UpdateUserInput {
  id: Int!
  fullName: String
  username: String
  role: UserRole
}
```

### 4. **Cập nhật CreateClassInput** ✅ ĐÃ CÓ TRONG BACKEND
```graphql
# Backend đã có studentIds field trong Class type
# Nhưng cần thêm vào CreateClassInput và UpdateClassInput
input CreateClassInput {
  className: String!
  subject: String!
  teacherId: String!
  studentIds: [String!]  # Cần thêm field này
}
```

## 📝 GHI CHÚ

1. **Frontend hiện tại sẽ hoạt động với:**
   - ✅ Login/Register
   - ✅ Create/Update/Delete Class (có studentIds)
   - ✅ Create/Update/Delete Score (Float type)
   - ✅ Create/Delete Attendance
   - ❌ Update Attendance (backend chỉ có id field)
   - ❌ Update/Delete User (chưa có mutations)

2. **Các queries sẽ fail:**
   - ❌ `findAllUser` (trả về single User, không phải array)
   - ❌ `getAllClasses` (backend chưa có)
   - ❌ `getAllScores` (backend chưa có)

3. **Các queries sẽ hoạt động:**
   - ✅ `class(id: Int!)` (lấy 1 class theo ID)
   - ✅ `score(id: Int!)` (lấy 1 score theo ID)
   - ✅ `attendance` (lấy tất cả attendance)

3. **Cần test lại sau khi backend được cập nhật** 