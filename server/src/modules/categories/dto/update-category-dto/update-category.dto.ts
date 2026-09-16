import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from '../create-category-dto/create-category.dto';

/**
 * DTO de mise à jour d'une catégorie existante.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
