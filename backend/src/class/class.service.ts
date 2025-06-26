import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassInput } from './dto/create-class.input';
import { UpdateClassInput } from './dto/update-class.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class } from './entities/class.entity';


@Injectable()
export class ClassService {

  constructor(
    @InjectModel('Class') private readonly classModel: Model<Class>,
  ) { }

  create(createClassInput: CreateClassInput) {
    const created = new this.classModel(createClassInput);
    return created.save();
  }

  async findAll(): Promise<Class[]> {
    return this.classModel
      .find()
      .populate('teacherId')
      .populate('studentIds')
      .exec();
  }

  async addStudentToClass(classId: string, studentId: string): Promise<Class> {
    const updatedClass = await this.classModel.findByIdAndUpdate(
      classId,
      { $addToSet: { studentIds: studentId } },
      { new: true }
    ).exec();

    if (!updatedClass) {
      throw new NotFoundException('Class not found');
    }

    return updatedClass;
  }

  findOne(id: number) {
    return `This action returns a #${id} class`;
  }

  update(id: number, updateClassInput: UpdateClassInput) {
    return `This action updates a #${id} class`;
  }

  remove(id: number) {
    return `This action removes a #${id} class`;
  }
}
