import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role-enum';

/**
 * DTO de filtrage pour les statistiques d'utilisateurs.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UserStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Date de début de période au format ISO (ex: 2026-01-01)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La date de début doit être au format ISO-8601' },
  )
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin de période au format ISO (ex: 2026-12-31)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit être au format ISO-8601' })
  endDate?: string;
}

/**
 * DTO de réponse pour les métriques et agrégations sur les utilisateurs.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UserStatisticsDto {
  @ApiProperty({
    description: "Nombre total d'utilisateurs enregistrés",
    example: 42,
  })
  totalUsers!: number;

  @ApiProperty({
    description: "Nombre d'utilisateurs actifs",
    example: 38,
  })
  activeUsers!: number;

  @ApiProperty({
    description: "Nombre d'utilisateurs inactifs ou désactivés",
    example: 4,
  })
  inactiveUsers!: number;

  @ApiProperty({
    description: 'Répartition des utilisateurs par rôle système',
    example: {
      ADMINISTRATOR: 2,
      MANAGER: 5,
      STOCK_KEEPER: 15,
      SALES: 12,
      VIEWER: 8,
    },
  })
  byRole!: Record<UserRole, number>;

  @ApiProperty({
    description:
      'Nombre de nouveaux utilisateurs inscrits lors des 30 derniers jours',
    example: 7,
  })
  recentRegistrationsLast30Days!: number;

  @ApiPropertyOptional({
    description:
      "Nombre d'inscriptions sur la plage de dates personnalisée demandée",
    example: 12,
  })
  createdInRange?: number;
}
