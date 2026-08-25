import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Contrôleur racine de l'application.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Retourne le message d'accueil de l'application.
   *
   * @returns {string} Message d'accueil
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
