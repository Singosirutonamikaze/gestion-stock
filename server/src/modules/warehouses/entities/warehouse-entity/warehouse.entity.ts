import {
  Warehouse as PrismaWarehouse,
  WarehouseType,
  Prisma,
} from '@prisma/client';

/**
 * Entité métier représentant un entrepôt ou site de stockage.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class WarehouseEntity implements PrismaWarehouse {
  id!: string;
  name!: string;
  code!: string;
  type!: WarehouseType;
  addressId!: string | null;
  phone!: string | null;
  email!: string | null;
  managerId!: string | null;
  capacity!: number | null;
  surfaceM2!: Prisma.Decimal | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
