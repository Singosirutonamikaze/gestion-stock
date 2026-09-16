import { PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from '../create-supplier-dto/create-supplier.dto';

/**
 * DTO de modification d'un fournisseur existant.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
