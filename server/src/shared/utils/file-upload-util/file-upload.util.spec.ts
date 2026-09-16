import { BadRequestException } from '@nestjs/common';
import {
  imageFileFilter,
  documentFileFilter,
  videoFileFilter,
  createUserAvatarStorage,
  createProductImageStorage,
  createProductVideoStorage,
  createProductDocumentStorage,
  createSupplierLogoStorage,
  createCategoryImageStorage,
  createBrandLogoStorage,
  deleteUploadedFile,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
} from './file-upload.util';
import type { Request } from 'express';
import { existsSync, unlinkSync } from 'node:fs';

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('FileUploadUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('imageFileFilter', () => {
    it('doit accepter les types MIME autorisés (dont image/avif)', (done) => {
      const mockReq = {} as Request;
      for (const mime of ALLOWED_IMAGE_MIME_TYPES) {
        const mockFile = { mimetype: mime } as Express.Multer.File;
        imageFileFilter(mockReq, mockFile, (err, accept) => {
          expect(err).toBeNull();
          expect(accept).toBe(true);
        });
      }
      done();
    });

    it('doit rejeter les formats d’images non autorisés avec BadRequestException', (done) => {
      const mockReq = {} as Request;
      const mockFile = { mimetype: 'application/pdf' } as Express.Multer.File;

      imageFileFilter(mockReq, mockFile, (err, accept) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(accept).toBe(false);
        done();
      });
    });
  });

  describe('documentFileFilter', () => {
    it('doit accepter les documents autorisés (PDF, CSV, XLSX)', (done) => {
      const mockReq = {} as Request;
      for (const mime of ALLOWED_DOCUMENT_MIME_TYPES) {
        const mockFile = { mimetype: mime } as Express.Multer.File;
        documentFileFilter(mockReq, mockFile, (err, accept) => {
          expect(err).toBeNull();
          expect(accept).toBe(true);
        });
      }
      done();
    });

    it('doit rejeter les types non autorisés pour les documents', (done) => {
      const mockReq = {} as Request;
      const mockFile = { mimetype: 'image/jpeg' } as Express.Multer.File;

      documentFileFilter(mockReq, mockFile, (err, accept) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(accept).toBe(false);
        done();
      });
    });
  });

  describe('videoFileFilter', () => {
    it('doit accepter les vidéos autorisées (MP4, WEBM)', (done) => {
      const mockReq = {} as Request;
      for (const mime of ALLOWED_VIDEO_MIME_TYPES) {
        const mockFile = { mimetype: mime } as Express.Multer.File;
        videoFileFilter(mockReq, mockFile, (err, accept) => {
          expect(err).toBeNull();
          expect(accept).toBe(true);
        });
      }
      done();
    });

    it('doit rejeter les types non autorisés pour les vidéos', (done) => {
      const mockReq = {} as Request;
      const mockFile = { mimetype: 'audio/mp3' } as Express.Multer.File;

      videoFileFilter(mockReq, mockFile, (err, accept) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(accept).toBe(false);
        done();
      });
    });
  });

  describe('Storage Engines par entité et par produit', () => {
    it('doit instancier les moteurs de stockage dédiés', () => {
      expect(createUserAvatarStorage()).toBeDefined();
      expect(createProductImageStorage()).toBeDefined();
      expect(createProductVideoStorage()).toBeDefined();
      expect(createProductDocumentStorage()).toBeDefined();
      expect(createSupplierLogoStorage()).toBeDefined();
      expect(createCategoryImageStorage()).toBeDefined();
      expect(createBrandLogoStorage()).toBeDefined();
    });
  });

  describe('deleteUploadedFile', () => {
    it('ne fait rien si le chemin est indéfini ou vide', () => {
      deleteUploadedFile(undefined);
      deleteUploadedFile(null);
      expect(existsSync).not.toHaveBeenCalled();
    });

    it('supprime le fichier s’il existe sur le disque', () => {
      (existsSync as unknown as jest.Mock).mockReturnValue(true);

      deleteUploadedFile('/uploads/images/avatars/usr-123/avatar.avif');

      expect(existsSync).toHaveBeenCalled();
      expect(unlinkSync).toHaveBeenCalled();
    });
  });
});
