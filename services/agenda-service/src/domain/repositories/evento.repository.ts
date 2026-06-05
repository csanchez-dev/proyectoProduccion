import { Evento } from '../entities/evento.entity';

export interface EventoRepository {
  findAll(): Promise<Evento[]>;
  create(evento: Partial<Evento>): Promise<Evento>;
  findById(id: string): Promise<Evento | null>;
}
