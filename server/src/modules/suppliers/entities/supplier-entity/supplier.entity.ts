import { Supplier as PrismaSupplier, Prisma } from '@prisma/client';

/**
 * Entité métier représentant un fournisseur de produits ou matières.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class SupplierEntity implements PrismaSupplier {
  id!: string;
  name!: string;
  logoUrl!: string | null;
  email!: string | null;
  phone!: string | null;
  website!: string | null;
  taxId!: string | null;
  contactPerson!: string | null;
  contactEmail!: string | null;
  contactPhone!: string | null;
  paymentTerms!: string | null;
  currency!: string;
  rating!: Prisma.Decimal | null;
  notes!: string | null;
  addressId!: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
