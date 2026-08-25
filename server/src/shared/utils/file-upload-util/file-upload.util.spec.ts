import { BadRequestException } from '@nestjs/common';
import {
  imageFileFilter,
  createUserAvatarStorage,
  deleteUploadedFile,
  ALLOWED_IMAGE_MIME_TYPES,
} from './file-upload.util';
import type { Request } from 'express';
import * as fs from 'fs';

describe('FileUploadUtil', () => {
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
      const existsSpy = jest.spyOn(fs, 'existsSync');
      deleteUploadedFile(undefined);
      deleteUploadedFile(null);
      expect(existsSpy).not.toHaveBeenCalled();
    });

    it('supprime le fichier s’il existe sur le disque', () => {
      const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const unlinkSpy = jest
        .spyOn(fs, 'unlinkSync')
        .mockImplementation(() => undefined);

      deleteUploadedFile('/uploads/users/usr-123/profile/avatar.jpg');

      expect(existsSpy).toHaveBeenCalled();
      expect(unlinkSpy).toHaveBeenCalled();
    });
  });
});
