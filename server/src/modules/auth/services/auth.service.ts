import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../core/database/prisma-service';
import { RedisService } from '../../../core/database/redis-service';
import { AppConfigService } from '../../../core/config/config-service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenPair } from '../types/token-pair.type';
import { JwtPayload } from '../types/jwt-payload.type';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { RequestMeta } from '../../../shared/types/request-meta.type';

/**
 * Service d'authentification gérant les opérations de connexion, d'enregistrement,
 * de rafraîchissement des tokens et de déconnexion via Redis.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  /**
   * Authentifie un utilisateur et retourne une paire de tokens JWT.
   *
   * @param {LoginDto} dto - Les identifiants de connexion
   * @param {RequestMeta} meta - Les métadonnées de la requête (IP, User-Agent)
   * @returns {Promise<TokenPair>} La paire de tokens JWT
   * @throws {UnauthorizedException} Si les identifiants sont invalides ou le compte inactif
   */
  async login(dto: LoginDto, _meta: RequestMeta): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Mettre à jour la date de dernière connexion
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokenPair = await this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Enregistrer le refresh token dans Redis (7 jours TTL)
    const refreshTtl = this.parseExpiry(this.configService.jwtRefreshExpiresIn);
    await this.redisService.setRefreshToken(user.id, tokenPair.refreshToken, refreshTtl);

    return tokenPair;
  }

  /**
   * Enregistre un nouvel utilisateur et retourne une paire de tokens JWT.
   *
   * @param {RegisterDto} dto - Les informations du nouvel utilisateur
   * @returns {Promise<TokenPair>} La paire de tokens JWT
   * @throws {ConflictException} Si l'email est déjà utilisé
   */
  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? UserRole.ADMINISTRATOR,
      },
    });

    const tokenPair = await this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshTtl = this.parseExpiry(this.configService.jwtRefreshExpiresIn);
    await this.redisService.setRefreshToken(user.id, tokenPair.refreshToken, refreshTtl);

    return tokenPair;
  }

  /**
   * Rafraîchit la paire de tokens à partir d'un refresh token valide.
   *
   * @param {string} refreshToken - Le refresh token
   * @returns {Promise<TokenPair>} La nouvelle paire de tokens JWT
   * @throws {UnauthorizedException} Si le token est invalide ou révoqué
   */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    const isValidInRedis = await this.redisService.isRefreshTokenValid(
      payload.sub,
      refreshToken,
    );

    if (!isValidInRedis) {
      throw new UnauthorizedException('Refresh token révoqué ou expiré');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Compte inactif ou introuvable');
    }

    // Révoquer l'ancien refresh token
    await this.redisService.revokeRefreshToken(user.id, refreshToken);

    // Générer une nouvelle paire
    const tokenPair = await this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshTtl = this.parseExpiry(this.configService.jwtRefreshExpiresIn);
    await this.redisService.setRefreshToken(user.id, tokenPair.refreshToken, refreshTtl);

    return tokenPair;
  }

  /**
   * Révoque un Refresh Token et ajoute le Jeton d'Accès à la liste noire (Déconnexion).
   *
   * @param {string} userId - Identifiant de l'utilisateur
   * @param {string} refreshToken - Refresh token à révoquer
   * @param {string} [accessToken] - Access token à blacklister (optionnel)
   * @returns {Promise<void>}
   */
  async logout(userId: string, refreshToken?: string, accessToken?: string): Promise<void> {
    if (refreshToken) {
      await this.redisService.revokeRefreshToken(userId, refreshToken);
    }
    if (accessToken) {
      const accessTtl = this.parseExpiry(this.configService.jwtAccessExpiresIn);
      await this.redisService.blacklistAccessToken(accessToken, accessTtl);
    }
  }

  /**
   * Révoque toutes les sessions actives d'un utilisateur.
   *
   * @param {string} userId - Identifiant de l'utilisateur
   * @returns {Promise<void>}
   */
  async logoutAll(userId: string): Promise<void> {
    await this.redisService.revokeAllUserSessions(userId);
  }

  /**
   * Génère une paire de tokens JWT (access + refresh).
   *
   * @param {Omit<JwtPayload, 'iat' | 'exp'>} payload - Le payload du token
   * @returns {Promise<TokenPair>} La paire de tokens générée
   * @private
   */
  private async generateTokenPair(
    payload: Omit<JwtPayload, 'iat' | 'exp'>,
  ): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.jwtSecret,
        expiresIn: this.configService.jwtAccessExpiresIn,
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.jwtRefreshSecret,
        expiresIn: this.configService.jwtRefreshExpiresIn,
      },
    );

    const expiresIn = this.parseExpiry(this.configService.jwtAccessExpiresIn);

    return { accessToken, refreshToken, expiresIn };
  }

  /**
   * Convertit une chaîne d'expiration (ex: '15m', '7d') en secondes.
   *
   * @param {string} expiry - La chaîne d'expiration
   * @returns {number} Le nombre de secondes
   * @private
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] ?? 60);
  }
}
