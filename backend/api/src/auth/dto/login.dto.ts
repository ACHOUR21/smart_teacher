import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'student@edu.com' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
