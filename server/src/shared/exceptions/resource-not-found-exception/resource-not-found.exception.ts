import { NotFoundException } from '@nestjs/common';

export class ResourceNotFoundException extends NotFoundException {
  constructor(resourceName: string, id: string | number) {
    super(`La ressource ${resourceName} avec l'identifiant ${id} est introuvable`);
  }
}
