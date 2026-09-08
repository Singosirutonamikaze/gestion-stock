import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Contrôleur de vérification de l'état de santé du serveur.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  /**
   * Retourne l'état de fonctionnement et l'horodatage actuel.
   *
   * @returns {{ status: string; timestamp: string }} État de santé du serveur
   */
  @Get()
  @ApiOperation({ summary: 'Verification de sante du serveur' })
  @ApiResponse({
    status: 200,
    description: 'Le serveur fonctionne correctement',
  })
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
