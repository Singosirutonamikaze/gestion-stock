import { Category as PrismaCategory } from '@prisma/client';

/**
 * Entité métier représentant une catégorie de produits du catalogue.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class CategoryEntity implements PrismaCategory {
  id!: string;
  name!: string;
  slug!: string;
  description!: string | null;
  imageUrl!: string | null;
  icon!: string | null;
  parentId!: string | null;
  displayOrder!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  parent?: CategoryEntity | null;
  children?: CategoryEntity[];
}
