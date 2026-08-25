import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth-guard';
import { CurrentUser } from '../../../shared/decorators/current-user-decorator';
import type { JwtPayload } from '../types/jwt-payload.type';

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
   * @returns {Promise<AuthResponseDto>} La paire de tokens JWT
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion utilisateur',
    description:
      'Authentifie un utilisateur à partir de ses identifiants (email et mot de passe). Retourne une paire de jetons JWT (access token court terme + refresh token long terme).',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Identifiants de connexion (email et mot de passe)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authentification réussie, jetons JWT générés avec succès',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Format de la charge utile invalide ou champs obligatoires manquants',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Identifiants incorrects ou compte inactif/désactivé',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  /**
   * Enregistrement d'un utilisateur ou premier administrateur.
   *
   * @param {RegisterDto} dto - Les informations du nouvel utilisateur
   * @returns {Promise<AuthResponseDto>} La paire de tokens JWT
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Enregistrement d'un utilisateur",
    description:
      "Crée un nouveau compte utilisateur. Si aucun utilisateur n'existe encore dans la base, le premier compte sera automatiquement promu ADMINISTRATOR.",
  })
  @ApiBody({
    type: RegisterDto,
    description: "Informations d'inscription du nouvel utilisateur",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Compte utilisateur créé avec succès et connecté automatiquement',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Erreur de validation sur les champs transmis',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflit - Une adresse email identique est déjà enregistrée',
  })
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
  @ApiOperation({
    summary: "Rafraîchir les jetons d'accès",
    description:
      'Génère une nouvelle paire de jetons JWT à partir d’un Refresh Token valide et non révoqué dans Redis (mécanisme de rotation).',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh Token valide transmis par le client',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nouvelle paire de jetons émise avec succès',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Format de Refresh Token invalide',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh Token invalide, expiré ou révoqué',
  })
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
  @ApiOperation({
    summary: 'Déconnexion (Session courante)',
    description:
      'Invalide la session actuelle en révoquant le Refresh Token et en plaçant le Access Token sur liste noire Redis.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh Token de la session à révoquer',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Déconnexion effectuée et session révoquée avec succès',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non authentifié - Jeton JWT manquant ou expiré',
  })
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
  @ApiOperation({
    summary: 'Déconnexion globale (Toutes les sessions)',
    description:
      'Révoque l’ensemble des sessions actives et Refresh Tokens associés à cet utilisateur sur Redis.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Toutes les sessions de l’utilisateur ont été révoquées',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non authentifié - Jeton JWT manquant ou expiré',
  })
  async logoutAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.authService.logoutAll(user.sub);
    return { message: 'Toutes les sessions ont été révoquées' };
  }
}
