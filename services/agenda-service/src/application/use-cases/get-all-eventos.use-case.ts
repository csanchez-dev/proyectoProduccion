import { EventoRepository } from '../../domain/repositories/evento.repository';

export class GetAllEventos {
  constructor(private readonly eventoRepository: EventoRepository) {}

  async execute() {
    return await this.eventoRepository.findAll();
  }
}
