# Fix Populate Issues

## 🚨 VẤN ĐỀ HIỆN TẠI

Lỗi `StrictPopulateError: Cannot populate path 'studentId' because it is not in your schema` xảy ra vì:

1. **Schema không đúng:** Các field references không được định nghĩa đúng
2. **Model injection sai:** `@InjectModel('Class')` thay vì `@InjectModel('Score')`
3. **Populate syntax:** Cần chỉ định model name rõ ràng

## ✅ ĐÃ SỬA

### 1. **ScoreService Constructor**
```typescript
// SAI
@InjectModel('Class') private readonly scoreModel: Model<Score>,

// ĐÚNG  
@InjectModel('Score') private readonly scoreModel: Model<Score>,
```

### 2. **Tạm thời disable populate**
```typescript
// Tạm thời để tránh lỗi
async findAll(): Promise<Score[]> {
  return this.scoreModel.find().exec();
}
```

## 🔧 GIẢI PHÁP HOÀN CHỈNH

### 1. **Kiểm tra Entity Schemas**

#### Score Entity
```typescript
@Schema()
export class Score extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  studentId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Class' })
  classId: string;
}
```

#### Class Entity  
```typescript
@Schema()
export class Class extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  teacherId: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  studentIds: string[];
}
```

### 2. **Sửa Populate Syntax**

#### Score Service
```typescript
async findAll(): Promise<Score[]> {
  return this.scoreModel
    .find()
    .populate('studentId', null, 'User')
    .populate('classId', null, 'Class')
    .exec();
}
```

#### Class Service
```typescript
async findAll(): Promise<Class[]> {
  return this.classModel
    .find()
    .populate('teacherId', null, 'User')
    .populate('studentIds', null, 'User')
    .exec();
}
```

### 3. **Alternative: Virtual Populate**

Nếu vẫn lỗi, có thể dùng virtual populate:

```typescript
// Trong Score entity
@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Score extends Document {
  // ... existing fields
}

// Trong Score service
async findAll(): Promise<Score[]> {
  return this.scoreModel
    .find()
    .populate({
      path: 'studentId',
      model: 'User',
      select: 'fullName username'
    })
    .populate({
      path: 'classId', 
      model: 'Class',
      select: 'className subject'
    })
    .exec();
}
```

## 🧪 TESTING

### 1. **Test không populate**
```bash
# Restart backend
npm run start:dev

# Test query
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

### 2. **Test với populate**
Sau khi fix, test lại với populate để lấy thông tin đầy đủ.

## 📝 NOTES

- **Tạm thời:** Disable populate để frontend hoạt động
- **Sau này:** Implement populate đúng cách để có thông tin đầy đủ
- **Performance:** Populate có thể ảnh hưởng performance với dữ liệu lớn 