# Backend Requirements for Frontend

## 🚨 QUERIES CẦN THÊM VÀO BACKEND

### 1. **getAllClasses Query**
```graphql
# Thêm vào Query type trong schema
getAllClasses: [Class!]!

# Implementation cần trả về tất cả classes
```

### 2. **getAllScores Query**
```graphql
# Thêm vào Query type trong schema
getAllScores: [Score!]!

# Implementation cần trả về tất cả scores
```

### 3. **findAllUsers Query (Thay thế findAllUser)**
```graphql
# Thay thế findAllUser: User! bằng:
findAllUsers: [User!]!

# Implementation cần trả về array của tất cả users
```

## 🔧 MUTATIONS CẦN THÊM VÀO BACKEND

### 1. **updateUser Mutation**
```graphql
# Thêm vào Mutation type
updateUser(input: UpdateUserInput!): User!

# Input type cần thêm:
input UpdateUserInput {
  id: Int!
  fullName: String
  username: String
  role: UserRole
}
```

### 2. **removeUser Mutation**
```graphql
# Thêm vào Mutation type
removeUser(id: Int!): User!
```

### 3. **Cập nhật UpdateAttendanceInput**
```graphql
# Hiện tại chỉ có id field, cần thêm:
input UpdateAttendanceInput {
  id: Int!
  classId: String
  date: DateTime
  records: [AttendanceRecordInput!]
}
```

## 📝 IMPLEMENTATION GUIDE

### 1. **Trong Resolver Files**

#### Classes Resolver
```typescript
// Thêm vào class.resolver.ts
@Query(() => [Class])
async getAllClasses(): Promise<Class[]> {
  return this.classService.findAll();
}

// Trong class.service.ts
async findAll(): Promise<Class[]> {
  return this.classRepository.find();
}
```

#### Scores Resolver
```typescript
// Thêm vào score.resolver.ts
@Query(() => [Score])
async getAllScores(): Promise<Score[]> {
  return this.scoreService.findAll();
}

// Trong score.service.ts
async findAll(): Promise<Score[]> {
  return this.scoreRepository.find();
}
```

#### Users Resolver
```typescript
// Thay thế findAllUser bằng findAllUsers
@Query(() => [User])
async findAllUsers(): Promise<User[]> {
  return this.usersService.findAll();
}

// Thêm updateUser và removeUser
@Mutation(() => User)
async updateUser(@Args('input') input: UpdateUserInput): Promise<User> {
  return this.usersService.update(input.id, input);
}

@Mutation(() => User)
async removeUser(@Args('id') id: number): Promise<User> {
  return this.usersService.remove(id);
}
```

### 2. **Cập nhật Schema**

Sau khi thêm resolvers, chạy lại backend để generate schema mới:
```bash
npm run start:dev
```

Schema sẽ tự động được cập nhật trong `src/schema.gql`.

## ✅ TESTING

### 1. **Test Queries**
```graphql
# Test trong GraphQL Playground
query TestGetAllClasses {
  getAllClasses {
    id
    className
    subject
    teacherId
    studentIds
  }
}

query TestGetAllScores {
  getAllScores {
    id
    studentId
    classId
    subject
    score
  }
}

query TestFindAllUsers {
  findAllUsers {
    id
    username
    fullName
    role
  }
}
```

### 2. **Test Mutations**
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

mutation TestRemoveUser {
  removeUser(id: 1) {
    id
  }
}
```

## 🎯 PRIORITY

### High Priority (Frontend không hoạt động)
1. ✅ `getAllClasses` - Cần để hiển thị danh sách lớp
2. ✅ `getAllScores` - Cần để hiển thị danh sách điểm
3. ✅ `findAllUsers` - Cần để hiển thị danh sách user

### Medium Priority (Chức năng bị hạn chế)
1. `updateUser` - Cần để sửa thông tin user
2. `removeUser` - Cần để xóa user
3. `UpdateAttendanceInput` - Cần để sửa attendance

## 📞 CONTACT

Sau khi implement xong, test lại frontend để đảm bảo tất cả chức năng hoạt động bình thường. 