import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Benutzername ist erforderlich' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Passwort ist erforderlich' })
  @MinLength(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' })
  password: string;
}
