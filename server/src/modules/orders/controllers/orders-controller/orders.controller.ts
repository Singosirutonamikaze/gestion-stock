import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from '../../services/orders-service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderQueryDto,
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from '../../dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../../core/guards/roles-guard';
import { Roles } from '../../../../shared/decorators/roles-decorator';
import { CurrentUser } from '../../../../shared/decorators/current-user-decorator';
import { UserRole } from '../../../../shared/enums/user-role-enum';
import { OrderType } from '@prisma/client';
import type { JwtPayload } from '../../../auth/types/jwt-payload.type';

/**
 * Contrôleur REST pour la gestion des commandes d'achat et de vente.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Commandes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Liste les commandes avec filtres et pagination.
   */
  @Get()
  @ApiOperation({
    summary: 'Lister les commandes',
    description: 'Récupère la liste paginée des commandes d’achat et de vente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des commandes récupérée avec succès',
    type: PaginatedOrdersResponseDto,
  })
  async findAll(
    @Query() query: OrderQueryDto,
  ): Promise<PaginatedOrdersResponseDto> {
    const data = await this.ordersService.findAll(query);
    return {
      success: true,
      data: data as unknown as PaginatedOrdersResponseDto['data'],
    };
  }

  /**
   * Récupère le détail d'une commande par son identifiant unique UUID.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Consulter une commande',
    description:
      'Retourne la fiche détaillée d’une commande avec ses articles.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la commande', type: String })
  @ApiResponse({
    status: 200,
    description: 'Commande trouvée avec succès',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    return (await this.ordersService.findById(
      id,
    )) as unknown as OrderResponseDto;
  }

  /**
   * Crée une nouvelle commande (Achat ou Vente).
   */
  @Post()
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER, UserRole.SALES)
  @ApiOperation({
    summary: 'Créer une commande',
    description:
      'Enregistre une nouvelle commande d’achat ou de vente avec calcul automatique des totaux.',
  })
  @ApiResponse({
    status: 201,
    description: 'Commande créée avec succès',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({
    status: 403,
    description: 'Action non autorisée pour ce rôle',
  })
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderResponseDto> {
    // Si l'utilisateur a le rôle SALES, il ne peut créer que des commandes de vente
    const userRole = (user as unknown as { role?: string })?.role;
    if (userRole === UserRole.SALES && dto.type !== OrderType.SALE) {
      throw new ForbiddenException(
        'Le rôle SALES ne peut créer que des commandes de vente (SALE)',
      );
    }

    const userId = user?.sub || (user as unknown as { id?: string })?.id || '';
    return (await this.ordersService.create(
      dto,
      userId,
    )) as unknown as OrderResponseDto;
  }

  /**
   * Met à jour une commande ou fait évoluer son statut.
   */
  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Mettre à jour une commande',
    description:
      'Modifie les informations d’une commande ou valide une transition de statut.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la commande', type: String })
  @ApiResponse({
    status: 200,
    description: 'Commande mise à jour avec succès',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Transition ou données invalides' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderResponseDto> {
    const userId = user?.sub || (user as unknown as { id?: string })?.id || '';
    return (await this.ordersService.update(
      id,
      dto,
      userId,
    )) as unknown as OrderResponseDto;
  }

  /**
   * Annule une commande existante.
   */
  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Annuler une commande',
    description: 'Passe le statut de la commande à CANCELLED.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la commande', type: String })
  @ApiResponse({
    status: 200,
    description: 'Commande annulée avec succès',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Annulation non autorisée' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrderResponseDto> {
    const userId = user?.sub || (user as unknown as { id?: string })?.id || '';
    return (await this.ordersService.cancel(
      id,
      userId,
    )) as unknown as OrderResponseDto;
  }
}
