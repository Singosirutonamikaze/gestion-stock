import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '@prisma/client';

/**
 * DTO d'un article de commande unitaire.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Identifiant UUID du produit commandé',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID('4', { message: 'Le productId doit être un UUID valide' })
  @IsNotEmpty({ message: 'Le productId est obligatoire' })
  productId!: string;

  @ApiPropertyOptional({
    description: 'Identifiant UUID de la variante du produit (optionnel)',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le variantId doit être un UUID valide' })
  variantId?: string;

  @ApiProperty({
    description: 'Quantité commandée (doit être un entier supérieur à 0)',
    example: 5,
    minimum: 1,
  })
  @IsInt({ message: 'La quantité doit être un nombre entier' })
  @Min(1, { message: 'La quantité doit être supérieure ou égale à 1' })
  quantity!: number;

  @ApiProperty({
    description: 'Prix unitaire au moment de la commande',
    example: 2500.5,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Le prix unitaire doit être un nombre valide' })
  @Min(0, { message: 'Le prix unitaire ne peut pas être négatif' })
  unitPrice!: number;

  @ApiPropertyOptional({
    description: 'Taux de remise en pourcentage (0 à 100)',
    example: 5,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Le taux de remise doit être un nombre valide' })
  @Min(0, { message: 'Le taux de remise ne peut pas être négatif' })
  discountRate?: number;

  @ApiPropertyOptional({
    description: 'Taux de TVA en pourcentage (0 à 100)',
    example: 18,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Le taux de taxe doit être un nombre valide' })
  @Min(0, { message: 'Le taux de taxe ne peut pas être négatif' })
  taxRate?: number;
}

/**
 * DTO de création d'une commande d'achat ou de vente.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class CreateOrderDto {
  @ApiProperty({
    description: 'Type de la commande (PURCHASE pour achat, SALE pour vente)',
    enum: OrderType,
    example: OrderType.PURCHASE,
  })
  @IsEnum(OrderType, {
    message: 'Le type de commande doit être PURCHASE ou SALE',
  })
  @IsNotEmpty({ message: 'Le type de commande est obligatoire' })
  type!: OrderType;

  @ApiPropertyOptional({
    description:
      'Identifiant UUID du fournisseur (obligatoire pour une commande d’achat PURCHASE)',
    example: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  })
  @ValidateIf((o: CreateOrderDto) => o.type === OrderType.PURCHASE)
  @IsNotEmpty({
    message:
      'Le supplierId est obligatoire pour une commande d’achat (PURCHASE)',
  })
  @IsUUID('4', { message: 'Le supplierId doit être un UUID valide' })
  supplierId?: string;

  @ApiPropertyOptional({
    description:
      'Identifiant UUID du client enregistré (optionnel pour une vente)',
    example: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le customerId doit être un UUID valide' })
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Nom du client pour une commande de vente directe sans compte',
    example: 'Société Générale de Distribution SARL',
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'Le nom du client doit être une chaîne de caractères' })
  customerName?: string;

  @ApiProperty({
    description: 'Identifiant UUID de l’entrepôt concerné par la commande',
    example: 'e5f6a7b8-c9d0-1234-efab-345678901234',
  })
  @IsUUID('4', { message: 'Le warehouseId doit être un UUID valide' })
  @IsNotEmpty({ message: 'Le warehouseId est obligatoire' })
  warehouseId!: string;

  @ApiPropertyOptional({
    description: 'Identifiant UUID de l’adresse de livraison',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le shippingAddressId doit être un UUID valide' })
  shippingAddressId?: string;

  @ApiPropertyOptional({
    description: 'Date prévisionnelle de livraison (format ISO 8601)',
    example: '2026-10-15T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La date prévue de livraison doit être au format ISO 8601' },
  )
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({
    description: 'Notes ou instructions complémentaires sur la commande',
    example: 'Livraison urgente par le quai numéro 2',
  })
  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  notes?: string;

  @ApiProperty({
    description:
      'Lignes de produits de la commande (au moins 1 article requis)',
    type: [CreateOrderItemDto],
  })
  @IsArray({
    message: 'Les articles doivent être fournis sous forme de tableau',
  })
  @ArrayMinSize(1, {
    message: 'La commande doit comporter au moins un article',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
