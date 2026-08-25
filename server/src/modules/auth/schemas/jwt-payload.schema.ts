import { z } from 'zod';
import { UserRole } from '../../../shared/enums/user-role-enum';

/**
 * Schéma Zod de validation runtime du payload JWT décodé.
 * Garantit la conformité du payload même si le token est techniquement valide
 * mais avec un contenu inattendu.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export const jwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  sid: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JwtPayloadValidated = z.infer<typeof jwtPayloadSchema>;
