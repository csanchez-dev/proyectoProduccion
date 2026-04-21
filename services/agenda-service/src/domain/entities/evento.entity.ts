export class Evento {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly fecha_inicio: Date,
    public readonly fecha_fin: Date,
    public readonly descripcion?: string,
    public readonly creado_en?: Date
  ) {}
}
