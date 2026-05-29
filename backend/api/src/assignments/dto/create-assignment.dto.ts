import {
  IsArray, IsDateString, IsEnum, IsInt, IsOptional,
  IsString, IsUUID, Min, MinLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum QuestionType { MCQ = 'MCQ', TEXT = 'TEXT' }

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  text: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  points: number;
}

export class CreateAssignmentDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  totalPoints: number;

  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({ type: [CreateQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}
