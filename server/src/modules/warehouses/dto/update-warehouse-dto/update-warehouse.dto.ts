import { PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from '../create-warehouse-dto/create-warehouse.dto';

/**
 * DTO de mise à jour d'un entrepôt existant.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}
