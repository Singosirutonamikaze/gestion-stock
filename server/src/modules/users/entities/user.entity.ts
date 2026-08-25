import { UserRole } from '../../../shared/enums/user-role-enum';

/**
 * Entité métier User — représentation du modèle utilisateur sans champs sensibles.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UserEntity {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(partial: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = partial.id;
    this.email = partial.email;
    this.firstName = partial.firstName;
    this.lastName = partial.lastName;
    this.role = partial.role;
    this.isActive = partial.isActive;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
