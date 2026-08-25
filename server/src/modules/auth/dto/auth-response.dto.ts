import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de réponse d'authentification retournant la paire de tokens JWT.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOi...', description: 'Jeton d\'accès JWT' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOi...', description: 'Jeton de rafraîchissement JWT' })
  refreshToken: string;

  @ApiProperty({ example: 900, description: 'Durée de validité du jeton d\'accès en secondes' })
  expiresIn: number;
}
