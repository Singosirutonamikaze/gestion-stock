import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from '../create-product-dto/create-product.dto';

/**
 * DTO de modification d'un produit existant.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
