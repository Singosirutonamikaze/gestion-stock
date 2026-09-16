import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReportFormat } from '../stock-report-query-dto';

/**
 * DTO de filtrage pour le rapport de valorisation du stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class StockValuationQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrer la valorisation par identifiant UUID d’entrepôt',
    example: 'e5f6a7b8-c9d0-1234-efab-345678901234',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le warehouseId doit être un UUID valide' })
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Format d’export du rapport (json ou csv)',
    enum: ReportFormat,
    default: ReportFormat.JSON,
  })
  @IsOptional()
  @IsEnum(ReportFormat, { message: 'Le format doit être json ou csv' })
  format?: ReportFormat = ReportFormat.JSON;
}
