import { BadRequestException } from '@nestjs/common';
import { diskStorage, StorageEngine } from 'multer';
import { extname, join } from 'node:path';
import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

/**
 * Types MIME d'images autorisés pour le téléversement (avec support AVIF et SVG).
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
] as const;

/**
 * Types MIME de documents autorisés (PDF, CSV, Excel).
 */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

/**
 * Types MIME de vidéos autorisés (MP4, WEBM).
 */
export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'] as const;

/**
 * Tailles maximales autorisées par type de fichier (en octets).
 */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15 Mo
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo
export const MAX_AVATAR_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;

/**
 * Filtre de validation pour les fichiers images.
 */
export function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return callback(
      new BadRequestException(
        'Format d’image non autorisé. Formats acceptés : AVIF, WEBP, JPEG, PNG, GIF, SVG',
      ),
      false,
    );
  }
  return callback(null, true);
}

/**
 * Filtre de validation pour les documents (PDF, CSV, Excel).
 */
export function documentFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (
    !ALLOWED_DOCUMENT_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number],
    )
  ) {
    return callback(
      new BadRequestException(
        'Format de document non autorisé. Formats acceptés : PDF, CSV, XLSX',
      ),
      false,
    );
  }
  return callback(null, true);
}

/**
 * Filtre de validation pour les vidéos (MP4, WEBM).
 */
export function videoFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (
    !ALLOWED_VIDEO_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_VIDEO_MIME_TYPES)[number],
    )
  ) {
    return callback(
      new BadRequestException(
        'Format de vidéo non autorisé. Formats acceptés : MP4, WEBM',
      ),
      false,
    );
  }
  return callback(null, true);
}

/**
 * Génère un moteur de stockage Multer où chaque élément possède son propre sous-dossier dédié.
 *
 * Structure cible : `uploads/:mediaType/:entityFolder/:entityId/:prefix-{timestamp}-{uuid}.{ext}`
 *
 * @param {'images' | 'documents' | 'videos'} mediaType - Dossier principal (images, documents, videos)
 * @param {string} entityFolder - Sous-dossier de l'entité (products, avatars, categories, suppliers, brands, orders)
 * @param {string} prefix - Préfixe du fichier (product, avatar, category, logo, doc, vid)
 * @param {string} [idParamKey='id'] - Nom du paramètre de route contenant l'ID (ex: 'id', 'productId')
 * @returns {StorageEngine}
 */
export function createEntityStorage(
  mediaType: 'images' | 'documents' | 'videos',
  entityFolder: string,
  prefix: string,
  idParamKey: string = 'id',
): StorageEngine {
  return diskStorage({
    destination: (req, _file, callback) => {
      const params = req.params as Record<string, string>;
      const entityId = params?.[idParamKey] || 'general';
      const uploadPath = join(
        process.cwd(),
        'uploads',
        mediaType,
        entityFolder,
        entityId,
      );

      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      return callback(null, uploadPath);
    },
    filename: (_req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const extension = extname(file.originalname).toLowerCase() || '.bin';
      return callback(null, `${prefix}-${uniqueSuffix}${extension}`);
    },
  });
}

/**
 * Stockage dédié pour les avatars utilisateurs : `uploads/images/avatars/:userId/avatar-...`
 *
 * @returns {StorageEngine}
 */
export function createUserAvatarStorage(): StorageEngine {
  return createEntityStorage('images', 'avatars', 'avatar', 'id');
}

/**
 * Stockage dédié pour les images de produits : `uploads/images/products/:productId/product-...`
 *
 * @returns {StorageEngine}
 */
export function createProductImageStorage(): StorageEngine {
  return createEntityStorage('images', 'products', 'product', 'id');
}

/**
 * Stockage dédié pour les vidéos de produits : `uploads/videos/products/:productId/video-...`
 *
 * @returns {StorageEngine}
 */
export function createProductVideoStorage(): StorageEngine {
  return createEntityStorage('videos', 'products', 'video', 'id');
}

/**
 * Stockage dédié pour les documents de produits : `uploads/documents/products/:productId/doc-...`
 *
 * @returns {StorageEngine}
 */
export function createProductDocumentStorage(): StorageEngine {
  return createEntityStorage('documents', 'products', 'doc', 'id');
}

/**
 * Stockage dédié pour les logos de fournisseurs : `uploads/images/suppliers/:supplierId/logo-...`
 *
 * @returns {StorageEngine}
 */
export function createSupplierLogoStorage(): StorageEngine {
  return createEntityStorage('images', 'suppliers', 'logo', 'id');
}

/**
 * Stockage dédié pour les images de catégories : `uploads/images/categories/:categoryId/category-...`
 *
 * @returns {StorageEngine}
 */
export function createCategoryImageStorage(): StorageEngine {
  return createEntityStorage('images', 'categories', 'category', 'id');
}

/**
 * Stockage dédié pour les logos de marques : `uploads/images/brands/:brandId/logo-...`
 *
 * @returns {StorageEngine}
 */
export function createBrandLogoStorage(): StorageEngine {
  return createEntityStorage('images', 'brands', 'logo', 'id');
}

/**
 * Supprime en toute sécurité un fichier physique stocké sur le disque s'il existe.
 *
 * @param {string | null | undefined} relativeOrAbsolutePath - Chemin relatif ou absolu du fichier
 */
export function deleteUploadedFile(
  relativeOrAbsolutePath?: string | null,
): void {
  if (!relativeOrAbsolutePath) {
    return;
  }

  try {
    const sanitizedPath = relativeOrAbsolutePath.replace(/^\//, '');
    const fullPath = relativeOrAbsolutePath.startsWith('/')
      ? join(process.cwd(), sanitizedPath)
      : join(process.cwd(), relativeOrAbsolutePath);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  } catch {
    // Ignorer si le fichier n'existe plus ou est inaccessible
  }
}
