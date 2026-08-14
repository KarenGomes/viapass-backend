import { IsEmail, IsOptional, IsString, Length } from 'class-validator'

export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: 'Nome inválido' })
  @Length(2, 255, { message: 'Nome deve ter entre 2 e 255 caracteres' })
  name?: string

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  email?: string
}
