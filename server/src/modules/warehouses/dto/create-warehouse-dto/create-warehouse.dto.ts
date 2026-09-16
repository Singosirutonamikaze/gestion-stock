import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  IsBoolean,
  IsInt,
  IsNumber,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { WarehouseType } from '@prisma/client';

/**
 * DTO de création d'un nouvel entrepôt de stockage.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class CreateWarehouseDto {
  @ApiProperty({
    description: 'Nom de l’entrepôt',
    example: 'Entrepôt Principal Abidjan Nord',
    maxLength: 100,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(100, { message: 'Le nom ne peut excéder 100 caractères' })
  name!: string;

  @ApiProperty({
    description: 'Code unique identifiant l’entrepôt (ex: WH-ABJ-01)',
    example: 'WH-ABJ-01',
    maxLength: 50,
  })
  @IsString({ message: 'Le code doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le code est obligatoire' })
  @MaxLength(50, { message: 'Le code ne peut excéder 50 caractères' })
  code!: string;

  @ApiPropertyOptional({
    description: 'Type d’entrepôt',
    enum: WarehouseType,
    example: WarehouseType.MAIN,
    default: WarehouseType.MAIN,
  })
  @IsOptional()
  @IsEnum(WarehouseType, { message: 'Type d’entrepôt non valide' })
  type?: WarehouseType;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone de contact',
    example: '+225 27 00 00 00 00',
  })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Adresse email de contact',
    example: 'entrepot.nord@entreprise.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @ApiPropertyOptional({
    description: 'UUID du gestionnaire / manager assigné',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Le managerId doit être un UUID valide' })
  managerId?: string;

  @ApiPropertyOptional({
    description: 'Capacité maximale totale en unités',
    example: 50000,
  })
  @IsOptional()
  @IsInt({ message: 'La capacité doit être un entier' })
  @Min(0, { message: 'La capacité ne peut pas être négative' })
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Surface au sol en mètres carrés (m²)',
    example: 1200.5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La surface doit être un nombre décimal' })
  @Min(0, { message: 'La surface ne peut pas être négative' })
  surfaceM2?: number;

  @ApiPropertyOptional({
    description: 'Statut actif de l’entrepôt',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit être un booléen' })
  isActive?: boolean;
}
