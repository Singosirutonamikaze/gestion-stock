import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { AppValidationPipe } from './validation.pipe';

class SampleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

describe('AppValidationPipe', () => {
  let pipe: AppValidationPipe;

  beforeEach(() => {
    pipe = new AppValidationPipe();
  });

  it('doit être défini', () => {
    expect(pipe).toBeDefined();
  });

  it('doit valider et retourner les données conformes', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: SampleDto,
    };

    const input = { name: 'Produit test' };
    const result = await pipe.transform<SampleDto>(input, metadata);

    expect(result).toBeInstanceOf(SampleDto);
    expect(result.name).toBe('Produit test');
  });

  it('doit lever BadRequestException si des propriétés non autorisées sont envoyées', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: SampleDto,
    };

    const input = { name: 'Produit test', extraField: 'hacker' };

    await expect(pipe.transform(input, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('doit lever BadRequestException si la validation échoue', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: SampleDto,
    };

    const input = { name: '' };

    await expect(pipe.transform(input, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
