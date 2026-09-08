import { BadRequestException } from '@nestjs/common';
import {
  imageFileFilter,
  createUserAvatarStorage,
  deleteUploadedFile,
  ALLOWED_IMAGE_MIME_TYPES,
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
    it('doit accepter les types MIME autorisés', (done) => {
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

    it('doit rejeter les formats non autorisés avec BadRequestException', (done) => {
      const mockReq = {} as Request;
      const mockFile = { mimetype: 'application/pdf' } as Express.Multer.File;

      imageFileFilter(mockReq, mockFile, (err, accept) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(accept).toBe(false);
        done();
      });
    });
  });

  describe('createUserAvatarStorage', () => {
    it('doit retourner une instance de moteur de stockage', () => {
      const storage = createUserAvatarStorage();
      expect(storage).toBeDefined();
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

      deleteUploadedFile('/uploads/users/usr-123/profile/avatar.jpg');

      expect(existsSync).toHaveBeenCalled();
      expect(unlinkSync).toHaveBeenCalled();
    });
  });
});
