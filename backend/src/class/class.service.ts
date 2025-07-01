import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassInput } from './dto/create-class.input';
import { UpdateClassInput } from './dto/update-class.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class } from './entities/class.entity';
import { UsersService } from '../users/users.service';


@Injectable()
export class ClassService {

  constructor(
    @InjectModel('Class') private readonly classModel: Model<Class>,
    private readonly usersService: UsersService,
  ) { }

  async create(createClassInput: CreateClassInput): Promise<Class> {
    // Đảm bảo teacher field được set
    const classData = {
      ...createClassInput,
      teacher: createClassInput.teacherId // Set teacher field để populate
    };
    
    const created = new this.classModel(classData);
    const saved = await created.save();
    
    // Populate teacher information before returning
    const populated = await this.classModel
      .findById(saved._id)
      .populate('teacher', 'id username fullName role')
      .populate('students', 'id username fullName role')
      .exec();
    
    if (!populated) {
      throw new NotFoundException('Class not found after creation');
    }
    return populated;
  }

  async findAll(): Promise<Class[]> {
    const classes = await this.classModel
      .find()
      .populate('teacher', 'id username fullName role')
      .populate('students', 'id username fullName role')
      .exec();
    
    // Nếu populate không hoạt động, thử lấy thông tin teacher từ teacherId
    const classesWithTeacherInfo = await Promise.all(
      classes.map(async (cls) => {
        if (!cls.teacher && cls.teacherId) {
          const teacher = await this.usersService.findById(cls.teacherId);
          if (teacher) {
            (cls as any).teacher = {
              id: teacher.id,
              username: teacher.username,
              fullName: teacher.fullName,
              role: teacher.role
            };
          }
        }
        return cls;
      })
    );
    
    return classesWithTeacherInfo;
  }

  async findClassesByStudentId(studentId: string): Promise<Class[]> {
    console.log('DEBUG: Finding classes for studentId:', studentId);
    
    const classes = await this.classModel
      .find({ studentIds: studentId })
      .populate('teacher', 'id username fullName role')
      .populate('students', 'id username fullName role')
      .exec();
    
    console.log('DEBUG: Found classes:', classes.length);
    
    // Nếu populate không hoạt động, thử lấy thông tin teacher từ teacherId
    const classesWithTeacherInfo = await Promise.all(
      classes.map(async (cls) => {
        if (!cls.teacher && cls.teacherId) {
          const teacher = await this.usersService.findById(cls.teacherId);
          if (teacher) {
            (cls as any).teacher = {
              id: teacher.id,
              username: teacher.username,
              fullName: teacher.fullName,
              role: teacher.role
            };
          }
        }
        return cls;
      })
    );
    
    return classesWithTeacherInfo;
  }

  async addStudentToClass(classId: string, studentId: string): Promise<Class> {
    // Thêm studentId vào class
    const updatedClass = await this.classModel.findByIdAndUpdate(
      classId,
      { $addToSet: { studentIds: studentId } },
      { new: true }
    ).exec();

    if (!updatedClass) {
      throw new NotFoundException('Class not found');
    }

    // Thêm classId vào user.classes
    await this.usersService['userModel'].findByIdAndUpdate(
      studentId,
      { $addToSet: { classes: classId } }
    );

    // Populate teacher and students information
    const populated = await this.classModel
      .findById(updatedClass._id)
      .populate('teacher', 'id username fullName role')
      .populate('students', 'id username fullName role')
      .exec();

    if (!populated) {
      throw new NotFoundException('Class not found after update');
    }

    return populated;
  }

  async findOne(id: string): Promise<Class> {
    const classDoc = await this.classModel
      .findById(id)
      .populate('teacher', 'id username fullName role')
      .populate('students', 'id username fullName role')
      .exec();
    if (!classDoc) {
      throw new NotFoundException('Class not found');
    }
    return classDoc;
  }

  async update(id: string, updateClassInput: UpdateClassInput): Promise<Class> {
    const { id: _, ...updateData } = updateClassInput;
    const updatedClass = await this.classModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();

    if (!updatedClass) {
      throw new NotFoundException('Class not found');
    }

    return updatedClass;
  }

  async remove(id: string): Promise<Class> {
    const deletedClass = await this.classModel.findByIdAndDelete(id).exec();
    
    if (!deletedClass) {
      throw new NotFoundException('Class not found');
    }

    return deletedClass;
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<Class> {
    // Xóa studentId khỏi class
    const updatedClass = await this.classModel.findByIdAndUpdate(
      classId,
      { $pull: { studentIds: studentId } },
      { new: true }
    ).exec();

    if (!updatedClass) {
      throw new NotFoundException('Class not found');
    }

    // Xóa classId khỏi user.classes
    await this.usersService['userModel'].findByIdAndUpdate(
      studentId,
      { $pull: { classes: classId } }
    );

    // Populate teacher and students information
    const populated = await this.classModel
      .findById(updatedClass._id)
      .populate('teacher', 'id username fullName role')
      .populate('students', 'id username fullName role')
      .exec();

    if (!populated) {
      throw new NotFoundException('Class not found after update');
    }

    return populated;
  }
}
