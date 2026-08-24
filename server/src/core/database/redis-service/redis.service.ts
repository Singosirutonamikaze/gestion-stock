import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../../config/config-service';

/**
 * Service de gestion du client Redis pour le stockage des sessions et la liste noire des jetons révoqués.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: AppConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.redisHost,
      port: this.configService.redisPort,
      password: this.configService.redisPassword,
      lazyConnect: true,
    });

    this.client.on('error', (err) => {
      this.logger.error(`Erreur de connexion Redis: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Enregistre un Refresh Token pour un utilisateur donné avec une durée de rétention (TTL).
   *
   * @param {string} userId - Identifiant de l'utilisateur
   * @param {string} refreshToken - Le jeton de rafraîchissement
   * @param {number} ttlSeconds - Durée de vie en secondes (par défaut 7 jours = 604800s)
   */
  async setRefreshToken(
    userId: string,
    refreshToken: string,
    ttlSeconds = 604800,
  ): Promise<void> {
    const key = `refresh_token:${userId}:${refreshToken}`;
    await this.client.set(key, 'valid', 'EX', ttlSeconds);
  }

  /**
   * Vérifie si un Refresh Token donné est toujours valide dans Redis.
   *
   * @param {string} userId - Identifiant de l'utilisateur
   * @param {string} refreshToken - Le jeton de rafraîchissement
   * @returns {Promise<boolean>} True si le jeton existe et est valide
   */
  async isRefreshTokenValid(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const key = `refresh_token:${userId}:${refreshToken}`;
    const status = await this.client.get(key);
    return status === 'valid';
  }

  /**
   * Révoque immédiatement un Refresh Token spécifique (Déconnexion).
   *
   * @param {string} userId - Identifiant de l'utilisateur
   * @param {string} refreshToken - Le jeton de rafraîchissement à supprimer
   */
  async revokeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const key = `refresh_token:${userId}:${refreshToken}`;
    await this.client.del(key);
  }

  /**
   * Révoque TOUTES les sessions actives d'un utilisateur (Changement de mot de passe / Bannissement).
   *
   * @param {string} userId - Identifiant de l'utilisateur
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    const pattern = `refresh_token:${userId}:*`;
    const keys = await this.client.keys(pattern);
    const hasKeys = Boolean(keys?.length);

    if (hasKeys) {
      await this.client.del(...keys);
    }
  }

  /**
   * Ajoute un Access Token à la liste noire (Blacklist) jusqu'à sa date d'expiration pour révocation instantanée.
   *
   * @param {string} accessToken - Le jeton d'accès à révoquer
   * @param {number} ttlSeconds - Temps restant avant expiration du jeton en secondes
   */
  async blacklistAccessToken(
    accessToken: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `blacklist:${accessToken}`;
    await this.client.set(key, 'revoked', 'EX', ttlSeconds);
  }

  /**
   * Vérifie si un Access Token est présent dans la liste noire.
   *
   * @param {string} accessToken - Le jeton d'accès
   * @returns {Promise<boolean>} True si le jeton est dans la liste noire
   */
  async isAccessTokenBlacklisted(accessToken: string): Promise<boolean> {
    const key = `blacklist:${accessToken}`;
    const status = await this.client.get(key);
    return status === 'revoked';
  }
}
