import { prisma } from '../../config/prisma';
import { Ponencia } from '../../domain/entities/ponencia.entity';
import { PonenciaRepository } from '../../domain/repositories/ponencia.repository';

export class PrismaPonenciaRepository implements PonenciaRepository {
  async findAll(): Promise<Ponencia[]> {
    const data = await prisma.ponencia.findMany();
    return data.map(p => new Ponencia(p.id, p.titulo, p.hora_inicio, p.hora_fin, p.cupo_maximo, p.diaEventoId, p.salaId, p.estado, p.descripcion || undefined));
  }

  async create(data: Partial<Ponencia>): Promise<Ponencia> {
    const p = await prisma.ponencia.create({
      data: {
        titulo: data.titulo!,
        hora_inicio: data.hora_inicio!,
        hora_fin: data.hora_fin!,
        cupo_maximo: data.cupo_maximo!,
        diaEventoId: data.diaEventoId!,
        salaId: data.salaId!,
        estado: data.estado || 'programada',
        descripcion: data.descripcion
      }
    });
    return new Ponencia(p.id, p.titulo, p.hora_inicio, p.hora_fin, p.cupo_maximo, p.diaEventoId, p.salaId, p.estado, p.descripcion || undefined);
  }

  async findById(id: string): Promise<Ponencia | null> {
    const p = await prisma.ponencia.findUnique({ where: { id } });
    if (!p) return null;
    return new Ponencia(p.id, p.titulo, p.hora_inicio, p.hora_fin, p.cupo_maximo, p.diaEventoId, p.salaId, p.estado, p.descripcion || undefined);
  }
}
