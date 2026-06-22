import {
  IsString,
  MinLength,
  Length,
  Matches,
} from 'class-validator';

const PHONE_PATTERN = /^\+?[0-9\s\-()]{10,20}$/;

export class RegisterDto {
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Укажите корректный телефон' })
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(2)
  name!: string;
}

export class LoginDto {
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Укажите корректный телефон' })
  phone!: string;

  @IsString()
  password!: string;
}

export class VerifyPhoneDto {
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Укажите корректный телефон' })
  phone!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}

export class ResendCodeDto {
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Укажите корректный телефон' })
  phone!: string;
}

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

export class ResetPasswordRequestDto {
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Укажите корректный телефон' })
  phone!: string;
}

export class ResetPasswordConfirmDto {
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Укажите корректный телефон' })
  phone!: string;

  @IsString()
  @Length(6, 6)
  code!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}
