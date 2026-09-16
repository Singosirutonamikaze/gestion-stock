import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

/**
 * DTO de création d'une nouvelle catégorie de produits.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nom de la catégorie',
    example: 'Électronique',
    maxLength: 100,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(100, { message: 'Le nom ne peut excéder 100 caractères' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Slug URL convivial (généré automatiquement si omis)',
    example: 'electronique',
  })
  @IsOptional()
  @IsString({ message: 'Le slug doit être une chaîne de caractères' })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la catégorie',
    example: 'Produits électroniques grand public et accessoires',
  })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères' })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL de image représentative',
    example: 'https://cdn.example.com/categories/electronics.png',
  })
  @IsOptional()
  @IsString({ message: "L'URL de l'image doit être une chaîne de caractères" })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Nom ou identifiant de icône',
    example: 'icon-device-laptop',
  })
  @IsOptional()
  @IsString({ message: "L'icône doit être une chaîne de caractères" })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Identifiant UUID de la catégorie parente',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le parentId doit être un UUID valide' })
  parentId?: string;

  @ApiPropertyOptional({
    description: "Ordre d'affichage dans la navigation",
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: "L'ordre d'affichage doit être un entier" })
  @Min(0, { message: "L'ordre d'affichage ne peut être négatif" })
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Statut actif de la catégorie',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit être un booléen' })
  isActive?: boolean;
}
