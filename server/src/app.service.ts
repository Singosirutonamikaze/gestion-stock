import { Injectable } from '@nestjs/common';

/**
 * Service racine de l'application fournissant les informations générales.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class AppService {
  /**
   * Retourne la chaîne de bienvenue de l'API.
   *
   * @returns {string} Message de bienvenue
   */
  getHello(): string {
    return 'Hello World!';
  }
}
