import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { MovementType } from '@prisma/client';
import { ReportFormat } from '../stock-report-query-dto';

/**
 * DTO de filtrage pour le rapport des mouvements de stock sur une période.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class MovementsReportQueryDto {
  @ApiProperty({
    description: 'Date de début de la période d’analyse (format ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsNotEmpty({ message: 'La date de début (from) est obligatoire' })
  @IsDateString(
    {},
    { message: 'La date de début (from) doit être au format ISO 8601' },
  )
  from!: string;

  @ApiProperty({
    description: 'Date de fin de la période d’analyse (format ISO 8601)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsNotEmpty({ message: 'La date de fin (to) est obligatoire' })
  @IsDateString(
    {},
    { message: 'La date de fin (to) doit être au format ISO 8601' },
  )
  to!: string;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant UUID de produit',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le productId doit être un UUID valide' })
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par identifiant UUID d’entrepôt',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le warehouseId doit être un UUID valide' })
  warehouseId?: string;

  @ApiPropertyOptional({
    description:
      'Filtrer par type de mouvement (IN, OUT, ADJUSTMENT, TRANSFER, etc.)',
    enum: MovementType,
  })
  @IsOptional()
  @IsEnum(MovementType, { message: 'Le type de mouvement doit être valide' })
  type?: MovementType;

  @ApiPropertyOptional({
    description: 'Format d’export du rapport (json ou csv)',
    enum: ReportFormat,
    default: ReportFormat.JSON,
  })
  @IsOptional()
  @IsEnum(ReportFormat, { message: 'Le format doit être json ou csv' })
  format?: ReportFormat = ReportFormat.JSON;
}
