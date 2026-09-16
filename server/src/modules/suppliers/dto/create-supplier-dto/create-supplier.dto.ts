import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

/**
 * DTO de création d'un nouveau fournisseur.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class CreateSupplierDto {
  @ApiProperty({
    description: 'Nom ou raison sociale du fournisseur',
    example: 'Fournisseur Global SARL',
    maxLength: 150,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(150, { message: 'Le nom ne peut excéder 150 caractères' })
  name!: string;

  @ApiPropertyOptional({
    description: 'URL du logo du fournisseur',
    example: 'https://cdn.example.com/suppliers/logo.png',
  })
  @IsOptional()
  @IsString({ message: "L'URL du logo doit être une chaîne de caractères" })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Adresse email principale',
    example: 'contact@fournisseurglobal.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Adresse email invalide' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone principal',
    example: '+225 07 00 00 00 00',
  })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Site web officiel',
    example: 'https://www.fournisseurglobal.com',
  })
  @IsOptional()
  @IsString({ message: 'Le site web doit être une chaîne de caractères' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Numéro d’identification fiscale / Registre de commerce',
    example: 'CI-ABJ-2024-B-1234',
  })
  @IsOptional()
  @IsString({
    message: "L'identifiant fiscal doit être une chaîne de caractères",
  })
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Nom de la personne de contact',
    example: 'Jean Dupont',
  })
  @IsOptional()
  @IsString({ message: 'Le contact doit être une chaîne de caractères' })
  contactPerson?: string;

  @ApiPropertyOptional({
    description: 'Email direct de la personne de contact',
    example: 'jean.dupont@fournisseurglobal.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email de contact invalide' })
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Téléphone direct de la personne de contact',
    example: '+225 05 00 00 00 00',
  })
  @IsOptional()
  @IsString({
    message: 'Le téléphone de contact doit être une chaîne de caractères',
  })
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Modalités de paiement convenues',
    example: '30 jours fin de mois',
  })
  @IsOptional()
  @IsString({
    message: 'Les modalités de paiement doivent être une chaîne de caractères',
  })
  paymentTerms?: string;

  @ApiPropertyOptional({
    description: 'Devise par défaut des transactions',
    example: 'XOF',
    default: 'XOF',
  })
  @IsOptional()
  @IsString({ message: 'La devise doit être une chaîne de caractères' })
  currency?: string;

  @ApiPropertyOptional({
    description: 'Note d’évaluation du fournisseur (0 à 5)',
    example: 4.5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La note doit être un nombre' })
  @Min(0, { message: 'La note minimum est 0' })
  @Max(5, { message: 'La note maximum est 5' })
  rating?: number;

  @ApiPropertyOptional({
    description: 'Remarques ou observations internes',
    example: 'Fournisseur prioritaire pour le matériel réseau',
  })
  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Statut actif du fournisseur',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit être un booléen' })
  isActive?: boolean;
}
