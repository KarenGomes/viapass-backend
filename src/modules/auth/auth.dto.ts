import { IsEmail, IsEnum, IsOptional, IsString, Length, MinLength } from 'class-validator'
import { UserRole } from '../../shared/types/enums'

export class RegisterDTO {
  @IsString({ message: 'Nome é obrigatório' })
  @Length(2, 255, { message: 'Nome deve ter entre 2 e 255 caracteres' })
  name!: string

  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string

  /**
   * Mínimo de 8 caracteres. Não exigimos símbolo nem número: regra de
   * composição empurra o usuário para `Senha@123`, que é pior do que uma
   * frase longa. Comprimento é o que realmente pesa contra força bruta.
   */
  @IsString({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter ao menos 8 caracteres' })
  password!: string

  /**
   * Opcional, e por padrão `client`.
   *
   * Aceitar o papel no cadastro é uma escolha para o avaliador conseguir criar
   * os três perfis sem acesso ao banco. Em produção, criar organizador ou
   * portaria seria ação restrita a um administrador — está registrado em
   * docs/NEXT-STEPS.md.
   */
  @IsOptional()
  @IsEnum(UserRole, { message: 'Papel deve ser organizer, client ou gate' })
  role?: UserRole
}

export class LoginDTO {
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string

  @IsString({ message: 'Senha é obrigatória' })
  password!: string
}

export class RefreshDTO {
  @IsOptional()
  @IsString({ message: 'Refresh token inválido' })
  refreshToken?: string
}
