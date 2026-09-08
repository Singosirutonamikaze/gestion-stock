import { User } from '@prisma/client';

/**
 * Type étendu d'un utilisateur avec ses relations Prisma.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export type UserWithRelations = User & {
  managedWarehouses?: {
    id: string;
    name: string;
  }[];
};
