import { BadRequestException } from '@nestjs/common';
import { diskStorage, StorageEngine } from 'multer';
import { extname, join } from 'node:path';
import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

/**
 * Types MIME d'images autorisés pour le téléversement.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Taille maximale autorisée pour les avatars (5 Mo).
 */
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Filtre de validation du type MIME pour les fichiers images.
 *
 * @param {Request} _req - Requête Express
 * @param {Express.Multer.File} file - Fichier téléversé
 * @param {Function} callback - Callback Multer
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
        'Format de fichier non autorisé. Formats acceptés : JPEG, PNG, WEBP, GIF',
      ),
      false,
    );
  }
  callback(null, true);
}

/**
 * Génère le moteur de stockage Multer pour les photos de profil utilisateur.
 * Arborescence de destination : `uploads/users/:userId/profile/avatar-{timestamp}-{uuid}.{ext}`
 *
 * @returns {StorageEngine} Moteur de stockage Multer configuré
 */
export function createUserAvatarStorage(): StorageEngine {
  return diskStorage({
    destination: (req, _file, callback) => {
      const params = req.params as Record<string, string>;
      const userId = params?.id || 'unknown';
      const uploadPath = join(
        process.cwd(),
        'uploads',
        'users',
        userId,
        'profile',
      );

      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },
    filename: (_req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
      const extension = extname(file.originalname).toLowerCase() || '.jpg';
      callback(null, `avatar-${uniqueSuffix}${extension}`);
    },
  });
}

/**
 * Supprime en toute sécurité un fichier physique stocké sur le disque s'il existe.
 *
 * @param {string | null | undefined} relativeOrAbsolutePath - Chemin relatif ou absolu du fichier
 */
export function deleteUploadedFile(
  relativeOrAbsolutePath?: string | null,
): void {
  if (!relativeOrAbsolutePath) return;
  try {
    const fullPath = relativeOrAbsolutePath.startsWith('/')
      ? join(process.cwd(), relativeOrAbsolutePath.replace(/^\//, ''))
      : join(process.cwd(), relativeOrAbsolutePath);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  } catch {
    // Ignorer si le fichier n'existe plus ou est inaccessible
  }
}
