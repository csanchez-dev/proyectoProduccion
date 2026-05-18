import { prisma } from '../../config/prisma';
import { Evento } from '../../domain/entities/evento.entity';
import { EventoRepository } from '../../domain/repositories/evento.repository';

export class PrismaEventoRepository implements EventoRepository {
  async findAll(): Promise<Evento[]> {
    const eventos = await prisma.evento.findMany();
    return eventos.map(e => new Evento(e.id, e.nombre, e.fecha_inicio, e.fecha_fin, e.descripcion || undefined, e.creado_en));
  }

  async create(data: Partial<Evento>): Promise<Evento> {
    const e = await prisma.evento.create({
      data: {
        nombre: data.nombre!,
        descripcion: data.descripcion,
        fecha_inicio: data.fecha_inicio!,
        fecha_fin: data.fecha_fin!,
      }
    });
    return new Evento(e.id, e.nombre, e.fecha_inicio, e.fecha_fin, e.descripcion || undefined, e.creado_en);
  }

  async findById(id: string): Promise<Evento | null> {
    const e = await prisma.evento.findUnique({ where: { id } });
    if (!e) return null;
    return new Evento(e.id, e.nombre, e.fecha_inicio, e.fecha_fin, e.descripcion || undefined, e.creado_en);
  }
}
