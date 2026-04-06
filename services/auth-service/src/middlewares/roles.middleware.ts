// src/middleware/roles.middleware.ts
export const authorize = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}