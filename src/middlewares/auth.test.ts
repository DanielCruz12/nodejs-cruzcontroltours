import jwt from 'jsonwebtoken'
import { authenticate, authorize, AuthRequest } from './auth'

process.env.JWT_SECRET = 'test-secret'

function mockRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

function sign(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET as string)
}

describe('authenticate', () => {
  it('401 sin header Authorization', () => {
    const req = { headers: {} } as AuthRequest
    const res = mockRes()
    const next = jest.fn()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('401 con token inválido', () => {
    const req = {
      headers: { authorization: 'Bearer roto' },
    } as AuthRequest
    const res = mockRes()
    const next = jest.fn()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('401 con token expirado', () => {
    const token = jwt.sign(
      { sub: '11111111-1111-4111-8111-111111111111', role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: '-1s' },
    )
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest
    const res = mockRes()
    const next = jest.fn()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('sigue y adjunta el usuario con token válido', () => {
    const token = sign({
      sub: '11111111-1111-4111-8111-111111111111',
      email: 'a@x.com',
      role: 'host',
    })
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as AuthRequest
    const res = mockRes()
    const next = jest.fn()
    authenticate(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.user).toMatchObject({
      sub: '11111111-1111-4111-8111-111111111111',
      role: 'host',
    })
  })
})

describe('authorize', () => {
  it('401 sin usuario en la request', () => {
    const req = {} as AuthRequest
    const res = mockRes()
    const next = jest.fn()
    authorize('admin')(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('403 si el rol no está permitido', () => {
    const req = {
      user: { sub: '11111111-1111-4111-8111-111111111111', role: 'host' },
    } as AuthRequest
    const res = mockRes()
    const next = jest.fn()
    authorize('superadmin', 'admin')(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('sigue si el rol está permitido', () => {
    const req = {
      user: { sub: '11111111-1111-4111-8111-111111111111', role: 'admin' },
    } as AuthRequest
    const res = mockRes()
    const next = jest.fn()
    authorize('superadmin', 'admin')(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
