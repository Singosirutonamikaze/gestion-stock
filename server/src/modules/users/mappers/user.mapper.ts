import { User } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserRole } from '../../../shared/enums/user-role-enum';

/**
 * Mapper responsable de la transformation sécurisée de l'entité Prisma User vers le DTO UserResponseDto.
 * Exclut systématiquement le mot de passe haché.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UserMapper {
  /**
   * Convertit une entité Prisma User en UserResponseDto.
   *
   * @param {User} user - L'entité utilisateur issue de la base de données
   * @returns {UserResponseDto} Le DTO d'exposition sécurisé
   */
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
