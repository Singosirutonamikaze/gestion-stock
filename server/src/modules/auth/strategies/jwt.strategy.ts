import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AppConfigService } from '../../../core/config/config-service';
import { RedisService } from '../../../core/database/redis-service';
import { JwtPayload } from '../types/jwt-payload.type';
import { jwtPayloadSchema } from '../schemas/jwt-payload.schema';

/**
 * Stratégie Passport JWT pour la validation des tokens d'accès.
 * Extrait le token depuis le header Authorization Bearer et vérifie sa présence dans la blacklist.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: AppConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
      passReqToCallback: true,
    });
  }

  /**
   * Valide le payload JWT décodé et vérifie que le token n'est pas révoqué/blacklisté.
   *
   * @param {Request} req - Requête HTTP entrante
   * @param {Record<string, unknown>} payload - Payload JWT décodé
   * @returns {Promise<JwtPayload>} Le payload validé attaché à `req.user`
   * @throws {UnauthorizedException} Si le payload est invalide ou le token révoqué
   */
  async validate(
    req: Request,
    payload: Record<string, unknown>,
  ): Promise<JwtPayload> {
    const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (rawToken) {
      const isBlacklisted =
        await this.redisService.isAccessTokenBlacklisted(rawToken);
      if (isBlacklisted) {
        throw new UnauthorizedException("Jeton d'accès révoqué");
      }
    }

    const result = jwtPayloadSchema.safeParse(payload);
    if (!result.success) {
      throw new UnauthorizedException('Token JWT invalide ou expiré');
    }
    return result.data;
  }
}
