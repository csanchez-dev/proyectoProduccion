import { Ponente } from '../entities/ponente.entity';

export interface PonenteRepository {
  findAll(): Promise<Ponente[]>;
  create(ponente: Partial<Ponente>): Promise<Ponente>;
  findById(id: string): Promise<Ponente | null>;
}
