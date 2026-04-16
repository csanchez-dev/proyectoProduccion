import { prisma } from '../../config/prisma';
import { Ponente } from '../../domain/entities/ponente.entity';
import { PonenteRepository } from '../../domain/repositories/ponente.repository';

export class PrismaPonenteRepository implements PonenteRepository {
  async findAll(): Promise<Ponente[]> {
    const data = await prisma.ponente.findMany();
    return data.map(p => new Ponente(p.id, p.nombres, p.apellidos, p.biografia || undefined, p.email || undefined, p.organizacion || undefined));
  }

  async create(data: Partial<Ponente>): Promise<Ponente> {
    const p = await prisma.ponente.create({
      data: {
        nombres: data.nombres!,
        apellidos: data.apellidos!,
        biografia: data.biografia,
        email: data.email,
        organizacion: data.organizacion
      }
    });
    return new Ponente(p.id, p.nombres, p.apellidos, p.biografia || undefined, p.email || undefined, p.organizacion || undefined);
  }

  async findById(id: string): Promise<Ponente | null> {
    const p = await prisma.ponente.findUnique({ where: { id } });
    if (!p) return null;
    return new Ponente(p.id, p.nombres, p.apellidos, p.biografia || undefined, p.email || undefined, p.organizacion || undefined);
  }
}
