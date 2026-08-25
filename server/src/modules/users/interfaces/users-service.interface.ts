import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { Paginated } from '../../../shared/types/paginated.type';

/**
 * Contrat du service utilisateurs.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface IUsersService {
  findAll(query: UserQueryDto): Promise<Paginated<UserResponseDto>>;
  findById(id: string): Promise<UserResponseDto>;
  create(dto: CreateUserDto): Promise<UserResponseDto>;
  update(id: string, dto: UpdateUserDto): Promise<UserResponseDto>;
  softDelete(id: string): Promise<void>;
}
