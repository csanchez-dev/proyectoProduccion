export class Ponente {
  constructor(
    public readonly id: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly biografia?: string,
    public readonly email?: string,
    public readonly organizacion?: string
  ) {}
}
