import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateScoreInput } from './dto/create-score.input';
import { UpdateScoreInput } from './dto/update-score.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Score } from './entities/score.entity';
import { Roles } from 'common/decorators/roles.decorator';
import { User } from '../users/entities/user.entity';
import { Class } from '../class/entities/class.entity';


@Injectable()
export class ScoreService {

  constructor(
    @InjectModel('Score') private readonly scoreModel: Model<Score>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Class') private readonly classModel: Model<Class>
  ) { }

  async create(createScoreInput: CreateScoreInput) {
    const student = await this.userModel.findById(createScoreInput.studentId);
    if (!student) throw new NotFoundException('Student not found');
    const classExists = await this.classModel.findById(createScoreInput.classId);
    if (!classExists) throw new NotFoundException('Class not found');
    const created = new this.scoreModel(createScoreInput);
    return created.save();
  }

  async findByStudent(studentId: string): Promise<Score[]> {
    return this.scoreModel.find({ studentId });
  }

  @Roles('ADMIN', 'TEACHER')
  async findByClass(classId: string): Promise<Score[]> {
    return this.scoreModel.find({ classId });
  }

  @Roles('ADMIN', 'TEACHER')
  async findAll(): Promise<Score[]> {
    return this.scoreModel.find();
  }

  async findOne(id: string): Promise<Score | null> {
    return this.scoreModel.findById(id);
  }

  async update(id: string, updateScoreInput: UpdateScoreInput): Promise<Score | null> {
    return this.scoreModel.findByIdAndUpdate(id, updateScoreInput, { new: true });
  }

  async remove(id: string): Promise<Score | null> {
    return this.scoreModel.findByIdAndDelete(id);
  }
}
