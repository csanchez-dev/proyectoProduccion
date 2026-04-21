import { Ponencia } from '../entities/ponencia.entity';

export interface PonenciaRepository {
  findAll(): Promise<Ponencia[]>;
  create(ponencia: Partial<Ponencia>): Promise<Ponencia>;
  findById(id: string): Promise<Ponencia | null>;
}
