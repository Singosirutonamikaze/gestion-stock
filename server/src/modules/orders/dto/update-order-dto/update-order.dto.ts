import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { CreateOrderItemDto } from '../create-order-dto';

/**
 * DTO de mise à jour d'une commande existante.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Nouveau statut de la commande',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Le statut de commande est invalide' })
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Statut du règlement de la commande',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Le statut de paiement est invalide' })
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Méthode de règlement utilisée',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'La méthode de paiement est invalide' })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Nom du client pour commande de vente',
    example: 'Société Générale de Distribution SARL',
  })
  @IsOptional()
  @IsString({ message: 'Le nom du client doit être une chaîne de caractères' })
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Identifiant UUID de l’adresse de livraison',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le shippingAddressId doit être un UUID valide' })
  shippingAddressId?: string;

  @ApiPropertyOptional({
    description: 'Date prévisionnelle de livraison (format ISO 8601)',
    example: '2026-10-20T14:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La date prévue de livraison doit être au format ISO 8601' },
  )
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({
    description: 'Notes ou instructions complémentaires sur la commande',
    example: 'Commande validée par le service achat',
  })
  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Mise à jour des lignes d’articles (uniquement permis si la commande est en statut DRAFT)',
    type: [CreateOrderItemDto],
  })
  @IsOptional()
  @IsArray({
    message: 'Les articles doivent être fournis sous forme de tableau',
  })
  @ArrayMinSize(1, {
    message: 'La commande doit comporter au moins un article',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];
}
