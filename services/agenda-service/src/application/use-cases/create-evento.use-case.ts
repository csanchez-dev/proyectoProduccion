import { Evento } from '../../domain/entities/evento.entity';
import { EventoRepository } from '../../domain/repositories/evento.repository';

export class CreateEvento {
  constructor(private readonly eventoRepository: EventoRepository) {}

  async execute(params: Partial<Evento>) {
    return await this.eventoRepository.create(params);
  }
}
