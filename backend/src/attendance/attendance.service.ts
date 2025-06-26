import { Injectable } from '@nestjs/common';
import { CreateAttendanceInput } from './dto/create-attendance.input';
import { UpdateAttendanceInput } from './dto/update-attendance.input';
import { Attendance } from './entities/attendance.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AttendanceService {

  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<Attendance>,
  ) { }


  async create(input: CreateAttendanceInput): Promise<Attendance> {
    const created = new this.attendanceModel(input);
    return created.save();
  }

  findAll() {
    return `This action returns all attendance`;
  }

  async getByClass(classId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ classId }).populate('records.studentId').exec();
  }

  // 📥 Lấy điểm danh theo ID học sinh
  async getByStudent(studentId: string): Promise<Attendance[]> {
    return this.attendanceModel
      .find({ 'records.studentId': studentId })
      .populate('records.studentId')
      .exec();
  }

  update(id: number, updateAttendanceInput: UpdateAttendanceInput) {
    return `This action updates a #${id} attendance`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendance`;
  }
}
