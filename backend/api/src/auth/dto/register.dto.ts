import { IsEmail, IsEnum, IsString, Matches, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'student@edu.com' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password must contain at least one uppercase letter and one number',
  })
  password: string;

  @ApiProperty({ example: 'Amir' })
  @IsString()
  @MinLength(1, { message: 'First name is required' })
  firstName: string;

  @ApiProperty({ example: 'Hassan' })
  @IsString()
  @MinLength(1, { message: 'Last name is required' })
  lastName: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role, { message: 'Role must be STUDENT, TEACHER, PARENT, or ADMIN' })
  role: Role;
}
