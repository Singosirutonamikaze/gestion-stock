import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth-guard';
import { CurrentUser } from '../../../shared/decorators/current-user-decorator';
import type { JwtPayload } from '../types/jwt-payload.type';
import { RequestMeta } from '../../../shared/types/request-meta.type';

/**
 * Contrôleur d'authentification exposant les endpoints de connexion, enregistrement,
 * rafraîchissement de token et déconnexion.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Connexion d'un utilisateur avec email et mot de passe.
   *
   * @param {LoginDto} dto - Les identifiants de connexion
   * @param {Request} req - La requête HTTP
   * @returns {Promise<AuthResponseDto>} La paire de tokens JWT
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(
    @Body() dto: LoginDto,
    @Request() req: { ip: string; headers: Record<string, string> },
  ): Promise<AuthResponseDto> {
    const meta: RequestMeta = {
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] ?? 'unknown',
    };
    return this.authService.login(dto, meta);
  }

  /**
   * Enregistrement d'un utilisateur ou premier administrateur.
   *
   * @param {RegisterDto} dto - Les informations du nouvel utilisateur
   * @returns {Promise<AuthResponseDto>} La paire de tokens JWT
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enregistrement d\'un utilisateur' })
  @ApiResponse({ status: 201, description: 'Compte créé', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  /**
   * Rafraîchissement du token d'accès.
   *
   * @param {RefreshTokenDto} dto - Le refresh token
   * @returns {Promise<AuthResponseDto>} La nouvelle paire de tokens JWT
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchissement du token d\'accès' })
  @ApiResponse({ status: 200, description: 'Token rafraîchi', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token invalide' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  /**
   * Déconnexion de la session courante.
   *
   * @param {JwtPayload} user - Le payload JWT de l'utilisateur courant
   * @param {RefreshTokenDto} dto - Le refresh token à révoquer
   * @param {Request} req - La requête HTTP pour récupérer l'access token
   * @returns {Promise<{ message: string }>} Message de confirmation
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Déconnexion (révocation du token)' })
  @ApiResponse({ status: 200, description: 'Déconnecté avec succès' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RefreshTokenDto,
    @Request() req: { headers: Record<string, string> },
  ): Promise<{ message: string }> {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    await this.authService.logout(user.sub, dto.refreshToken, accessToken);
    return { message: 'Déconnexion réussie' };
  }

  /**
   * Déconnexion de toutes les sessions de l'utilisateur.
   *
   * @param {JwtPayload} user - Le payload JWT de l'utilisateur courant
   * @returns {Promise<{ message: string }>} Message de confirmation
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Déconnexion de toutes les sessions' })
  @ApiResponse({ status: 200, description: 'Toutes les sessions révoquées' })
  async logoutAll(@CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    await this.authService.logoutAll(user.sub);
    return { message: 'Toutes les sessions ont été révoquées' };
  }
}
