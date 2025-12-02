import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { RejectQuestionDto } from './dto/reject-question.dto';
import { QuestionStatus, Category } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('questions/pending')
  async getPendingQuestions() {
    return this.adminService.getPendingQuestions();
  }

  @Get('questions')
  async getAllQuestions(
    @Query('status') status?: QuestionStatus,
    @Query('category') category?: Category,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllQuestions({ status, category, search });
  }

  @Get('questions/:id')
  async getQuestion(@Param('id') id: string) {
    return this.adminService.getQuestionById(id);
  }

  @Post('questions/:id/approve')
  async approveQuestion(@Param('id') id: string) {
    return this.adminService.approveQuestion(id);
  }

  @Post('questions/:id/reject')
  async rejectQuestion(@Param('id') id: string, @Body() dto: RejectQuestionDto) {
    return this.adminService.rejectQuestion(id, dto.reason);
  }

  @Put('questions/:id')
  async updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.adminService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }
}
