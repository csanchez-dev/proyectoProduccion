export class Ponencia {
  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly hora_inicio: Date,
    public readonly hora_fin: Date,
    public readonly cupo_maximo: number,
    public readonly diaEventoId: string,
    public readonly salaId: string,
    public readonly estado: string = 'programada',
    public readonly descripcion?: string
  ) {}
}
