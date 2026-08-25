import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenPair } from '../types/token-pair.type';
import { RequestMeta } from '../../../shared/types/request-meta.type';

/**
 * Contrat du service d'authentification.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface IAuthService {
  login(dto: LoginDto, meta: RequestMeta): Promise<TokenPair>;
  register(dto: RegisterDto): Promise<TokenPair>;
  refresh(refreshToken: string): Promise<TokenPair>;
  logout(userId: string, refreshToken: string): Promise<void>;
  logoutAll(userId: string): Promise<void>;
}
