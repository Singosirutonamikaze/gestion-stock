import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../shared/enums/user-role-enum';

/**
 * DTO de réponse HTTP représentant un compte utilisateur sans le champ sensible password.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'jean.dupont@entreprise.com' })
  email: string;

  @ApiProperty({ example: 'Jean' })
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SALES })
  role: UserRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-08-24T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-24T12:00:00.000Z' })
  updatedAt: Date;
}
