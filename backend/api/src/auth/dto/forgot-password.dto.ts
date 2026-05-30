import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@edu.com' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;
}
