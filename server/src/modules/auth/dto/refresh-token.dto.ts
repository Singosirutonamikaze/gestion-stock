import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour le rafraîchissement du token d'accès.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class RefreshTokenDto {
  @ApiProperty({ description: 'Jeton de rafraîchissement JWT' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
