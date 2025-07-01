# GraphQL Testing Guide

## 🧪 CÁCH TEST GRAPHQL OPERATIONS

### 1. **Test Mutations (Score & Class)**

#### Create Class (Chỉ cần thông tin cơ bản)
```javascript
// Test trong browser console hoặc GraphQL Playground
mutation CreateClass {
  createClass(createClassInput: {
    className: "Toán 10A"
    subject: "Toán học"
    teacherId: "1"
  }) {
    id
    className
    subject
    teacherId
    studentIds
  }
}
```

#### Add Student to Class (Thêm học sinh vào lớp đã tạo)
```javascript
mutation AddStudentToClass {
  addStudentToClass(classId: "1", studentId: "2") {
    id
    className
    subject
    teacherId
    studentIds
  }
}
```

#### Create Score
```javascript
mutation CreateScore {
  createScore(createScoreInput: {
    studentId: "1"
    classId: "1"
    subject: "Toán học"
    score: 8.5
  }) {
    id
    studentId
    classId
    subject
    score
  }
}
```

#### Update Class
```javascript
mutation UpdateClass {
  updateClass(updateClassInput: {
    id: 1
    className: "Toán 10A - Nâng cao"
    subject: "Toán học"
    teacherId: "1"
  }) {
    id
    className
    subject
    teacherId
    studentIds
  }
}
```

#### Update Score
```javascript
mutation UpdateScore {
  updateScore(updateScoreInput: {
    id: 1
    studentId: "1"
    classId: "1"
    subject: "Toán học"
    score: 9.0
  }) {
    id
    studentId
    classId
    subject
    score
  }
}
```

### 2. **Test Queries (Individual)**

#### Get Class by ID
```javascript
query GetClassById {
  class(id: 1) {
    id
    className
    subject
    teacherId
    studentIds
  }
}
```

#### Get Score by ID
```javascript
query GetScoreById {
  score(id: 1) {
    id
    studentId
    classId
    subject
    score
  }
}
```

### 3. **Test trong Frontend**

#### Bước 1: Đăng nhập Admin
1. Mở `/login`
2. Đăng nhập với tài khoản admin
3. Chuyển đến `/dashboard`

#### Bước 2: Test Create Class
1. Click "Thêm lớp"
2. Điền thông tin:
   - Tên lớp: "Toán 10A"
   - Giáo viên: "1" (ID của teacher)
3. Click "Lưu"
4. Ghi nhớ ID của lớp vừa tạo

#### Bước 3: Test Add Student to Class
1. Click "Thêm học sinh vào lớp"
2. Điền thông tin:
   - Lớp: "1" (ID của lớp vừa tạo)
   - Học sinh: "2" (ID của student)
3. Click "Thêm"
4. Kiểm tra xem học sinh đã được thêm vào lớp chưa

#### Bước 4: Test Create Score
1. Click "Thêm điểm"
2. Điền thông tin:
   - Học sinh: "1"
   - Lớp: "1"
   - Môn: "Toán học"
   - Điểm: 8.5
3. Click "Lưu"

## 🚨 VẤN ĐỀ CÓ THỂ GẶP

### 1. **Queries List sẽ fail**
- `getAllClasses` - Backend chưa có
- `getAllScores` - Backend chưa có
- `findAllUser` - Trả về single User, không phải array

### 2. **Backend cần thêm**
```graphql
# Thêm vào Query type
getAllClasses: [Class!]!
getAllScores: [Score!]!
findAllUsers: [User!]!  # Thay vì findAllUser: User!
```

## ✅ KẾT QUẢ MONG ĐỢI

### Mutations sẽ hoạt động:
- ✅ Create Class (chỉ cần className, subject, teacherId)
- ✅ Add Student to Class (thêm học sinh vào lớp đã tạo)
- ✅ Update Class  
- ✅ Delete Class
- ✅ Create Score
- ✅ Update Score
- ✅ Delete Score

### Queries sẽ fail (cần backend update):
- ❌ GetAllClasses
- ❌ GetAllScores
- ❌ GetAllUsers

### Queries sẽ hoạt động:
- ✅ GetClassById
- ✅ GetScoreById
- ✅ GetAttendance
- ✅ CurrentUser

## 🔄 WORKFLOW MỚI

### Tạo lớp và quản lý học sinh:
1. **Tạo lớp** → Chỉ cần: tên lớp, môn học, giáo viên
2. **Thêm học sinh** → Dùng mutation riêng: `addStudentToClass`
3. **Xem danh sách** → Hiển thị tất cả học sinh trong lớp

### Ưu điểm:
- ✅ Tách biệt việc tạo lớp và quản lý học sinh
- ✅ Có thể thêm học sinh từng người một
- ✅ Dễ quản lý và kiểm soát
- ✅ Phù hợp với thực tế (lớp có thể thay đổi học sinh) 