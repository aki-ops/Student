# Test New Queries & Mutations

## 🚀 CÁC QUERIES & MUTATIONS MỚI ĐÃ IMPLEMENT

### 1. **getAllClasses Query**
```graphql
query TestGetAllClasses {
  getAllClasses {
    id
    className
    subject
    teacherId
    studentIds
  }
}
```

### 2. **getAllScores Query**
```graphql
query TestGetAllScores {
  getAllScores {
    id
    studentId
    classId
    subject
    score
  }
}
```

### 3. **findAllUsers Query**
```graphql
query TestFindAllUsers {
  findAllUsers {
    id
    username
    fullName
    role
  }
}
```

### 4. **updateUser Mutation**
```graphql
mutation TestUpdateUser {
  updateUser(input: {
    id: 1
    fullName: "Updated Name"
    username: "updated_user"
    role: TEACHER
  }) {
    id
    username
    fullName
    role
  }
}
```

### 5. **removeUser Mutation**
```graphql
mutation TestRemoveUser {
  removeUser(id: 1) {
    id
    username
    fullName
    role
  }
}
```

## 🧪 CÁCH TEST

### Bước 1: Restart Backend
```bash
cd backend
npm run start:dev
```

### Bước 2: Mở GraphQL Playground
- Truy cập: `http://localhost:3000/graphql`
- Hoặc dùng Apollo Studio

### Bước 3: Test từng query/mutation

#### Test getAllClasses
```graphql
query {
  getAllClasses {
    id
    className
    subject
    teacherId
    studentIds
  }
}
```

#### Test getAllScores
```graphql
query {
  getAllScores {
    id
    studentId
    classId
    subject
    score
  }
}
```

#### Test findAllUsers (cần admin token)
```graphql
query {
  findAllUsers {
    id
    username
    fullName
    role
  }
}
```

## 🔐 AUTHENTICATION

### Cho findAllUsers, updateUser, removeUser:
- Cần đăng nhập với role ADMIN
- Thêm header: `Authorization: Bearer <token>`

### Cho getAllClasses, getAllScores:
- Có thể test mà không cần authentication
- Hoặc đăng nhập với role TEACHER/ADMIN

## ✅ EXPECTED RESULTS

### getAllClasses
- Trả về array của tất cả classes
- Mỗi class có: id, className, subject, teacherId, studentIds

### getAllScores
- Trả về array của tất cả scores
- Mỗi score có: id, studentId, classId, subject, score

### findAllUsers
- Trả về array của tất cả users (chỉ admin mới thấy)
- Mỗi user có: id, username, fullName, role

## 🚨 NẾU CÓ LỖI

### 1. **Schema not updated**
- Restart backend: `npm run start:dev`
- Kiểm tra `src/schema.gql` có queries mới không

### 2. **Authentication error**
- Đăng nhập với tài khoản admin
- Kiểm tra token trong header

### 3. **Database empty**
- Tạo một số test data trước
- Dùng mutations create để tạo dữ liệu

## 📝 TEST DATA

### Tạo test class
```graphql
mutation {
  createClass(createClassInput: {
    className: "Test Class"
    subject: "Test Subject"
    teacherId: "1"
  }) {
    id
    className
  }
}
```

### Tạo test score
```graphql
mutation {
  createScore(createScoreInput: {
    studentId: "1"
    classId: "1"
    subject: "Math"
    score: 8.5
  }) {
    id
    score
  }
}
```

### Tạo test user
```graphql
mutation {
  CreateUser(input: {
    fullName: "Test User"
    username: "testuser"
    password: "123456"
    role: STUDENT
  }) {
    id
    username
  }
}
``` 