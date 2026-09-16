import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ProductStatus, WeightUnit, DimensionUnit } from '@prisma/client/index';

/**
 * DTO de création d'un nouveau produit dans le catalogue.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class CreateProductDto {
  @ApiProperty({
    description: 'Code SKU unique de gestion du stock',
    example: 'SKU-ELEC-001',
    maxLength: 50,
  })
  @IsString({ message: 'Le SKU doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le SKU est obligatoire' })
  @MaxLength(50, { message: 'Le SKU ne peut excéder 50 caractères' })
  sku!: string;

  @ApiPropertyOptional({
    description: 'Code-barres EAN-13 ou code produit universel',
    example: '3760123456789',
  })
  @IsOptional()
  @IsString({ message: 'Le code-barres doit être une chaîne de caractères' })
  barcode?: string;

  @ApiProperty({
    description: 'Nom commercial du produit',
    example: 'Café Arabica Pur 500g',
    maxLength: 150,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(150, { message: 'Le nom ne peut excéder 150 caractères' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Slug URL convivial (généré à partir du nom si omis)',
    example: 'cafe-arabica-pur-500g',
  })
  @IsOptional()
  @IsString({ message: 'Le slug doit être une chaîne de caractères' })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Description longue du produit',
    example: 'Café moulu haut de gamme cultivé en haute altitude.',
  })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Description courte ou accroche commerciale',
    example: 'Café moulu pur arabica',
  })
  @IsOptional()
  @IsString({
    message: 'La description courte doit être une chaîne de caractères',
  })
  shortDescription?: string;

  @ApiProperty({
    description: 'UUID de la catégorie rattachée',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID('4', { message: 'La catégorie doit être un UUID valide' })
  @IsNotEmpty({ message: 'La catégorie est obligatoire' })
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'UUID de la marque associée',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
  })
  @IsOptional()
  @IsUUID('4', { message: 'La marque doit être un UUID valide' })
  brandId?: string;

  @ApiPropertyOptional({
    description: 'UUID du fournisseur principal',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567892',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le fournisseur doit être un UUID valide' })
  supplierId?: string;

  @ApiProperty({
    description: 'Prix unitaire de vente HT',
    example: 4500.0,
  })
  @IsNumber({}, { message: 'Le prix unitaire doit être un nombre' })
  @Min(0, { message: 'Le prix unitaire ne peut pas être négatif' })
  unitPrice!: number;

  @ApiProperty({
    description: 'Prix de revient ou coût unitaire d’achat HT',
    example: 3000.0,
  })
  @IsNumber({}, { message: 'Le prix de revient doit être un nombre' })
  @Min(0, { message: 'Le prix de revient ne peut pas être négatif' })
  costPrice!: number;

  @ApiPropertyOptional({
    description: 'Devise monétaire (ex: XOF, EUR, USD)',
    example: 'XOF',
    default: 'XOF',
  })
  @IsOptional()
  @IsString({ message: 'La devise doit être une chaîne de caractères' })
  currency?: string;

  @ApiPropertyOptional({
    description: 'Taux de taxe applicable en pourcentage',
    example: 18.0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Le taux de taxe doit être un nombre' })
  @Min(0, { message: 'Le taux de taxe ne peut pas être négatif' })
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Taux de remise commerciale en pourcentage',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Le taux de remise doit être un nombre' })
  @Min(0, { message: 'Le taux de remise ne peut pas être négatif' })
  discountRate?: number;

  @ApiPropertyOptional({
    description: 'Unité de conditionnement (ex: pièce, carton, kg, litre)',
    example: 'pièce',
    default: 'pièce',
  })
  @IsOptional()
  @IsString({ message: "L'unité doit être une chaîne de caractères" })
  unit?: string;

  @ApiPropertyOptional({ description: 'Poids du produit', example: 0.5 })
  @IsOptional()
  @IsNumber({}, { message: 'Le poids doit être un nombre' })
  @Min(0, { message: 'Le poids ne peut pas être négatif' })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Unité de poids',
    enum: WeightUnit,
    example: WeightUnit.KG,
    default: WeightUnit.KG,
  })
  @IsOptional()
  @IsEnum(WeightUnit, { message: 'Unité de poids invalide' })
  weightUnit?: WeightUnit;

  @ApiPropertyOptional({ description: 'Longueur', example: 10 })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiPropertyOptional({ description: 'Largeur', example: 5 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ description: 'Hauteur', example: 15 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({
    description: 'Unité de dimension',
    enum: DimensionUnit,
    example: DimensionUnit.CM,
    default: DimensionUnit.CM,
  })
  @IsOptional()
  @IsEnum(DimensionUnit, { message: 'Unité de dimension invalide' })
  dimensionUnit?: DimensionUnit;

  @ApiPropertyOptional({ description: 'Couleur', example: 'Noir' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Matière', example: 'Aluminium' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    description: 'Statut commercial du produit',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    default: ProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Statut produit invalide' })
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Activité globale du produit',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Produit périssable',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPerishable?: boolean;

  @ApiPropertyOptional({
    description: 'Suivi par numéro de série',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSerialized?: boolean;

  @ApiPropertyOptional({
    description: 'Suivi obligatoire par numéro de lot',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresBatch?: boolean;

  @ApiPropertyOptional({
    description: 'Durée de garantie en mois',
    example: 24,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  warrantyMonths?: number;

  @ApiPropertyOptional({
    description:
      'Seuil d’alerte de stock bas (déclenche une alerte si stock <= seuil)',
    example: 10,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Le seuil d’alerte doit être un entier' })
  @Min(0)
  alertThreshold?: number;

  @ApiPropertyOptional({
    description: 'Niveau de stock minimal',
    example: 5,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Niveau de stock maximal',
    example: 500,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Point de commande automatique',
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({
    description: 'Quantité standard de réapprovisionnement',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderQty?: number;

  @ApiPropertyOptional({
    description: 'Meta titre SEO',
    example: 'Acheter Café Arabica 500g',
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'Meta description SEO',
    example: 'Découvrez notre café pur arabica',
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'Notes internes',
    example: 'Vérifier la provenance à chaque lot',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
