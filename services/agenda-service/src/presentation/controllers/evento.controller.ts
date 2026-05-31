import { Request, Response } from 'express';
import { PrismaEventoRepository } from '../../infrastructure/repositories/prisma-evento.repository';
import { GetAllEventos } from '../../application/use-cases/get-all-eventos.use-case';
import { CreateEvento } from '../../application/use-cases/create-evento.use-case';

const repository = new PrismaEventoRepository();

export class EventoController {
  
  static async getEventos(req: Request, res: Response) {
    try {
      const useCase = new GetAllEventos(repository);
      const eventos = await useCase.execute();
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async postEvento(req: Request, res: Response) {
    try {
      const useCase = new CreateEvento(repository);
      const evento = await useCase.execute(req.body);
      res.status(201).json(evento);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
