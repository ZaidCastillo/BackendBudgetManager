const jwt = require('jsonwebtoken');
const { sign, requireRole } = require('../auth');

describe('Auth', () => {
  describe('sign()', () => {
    it('returns a JWT string that can be verified and contains the payload', () => {
      const payload = { id: 1, email: 'test@test.com', role: 'user' };
      const token = sign(payload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      const decoded = jwt.decode(token);
      expect(decoded).toBeTruthy();
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.exp).toBeTruthy();
    });
  });

  describe('requireRole()', () => {
    it('calls next() when user has one of the allowed roles', () => {
      const middleware = requireRole('admin', 'user');
      const req = { user: { role: 'user' } };
      const res = {};
      const next = jest.fn();
      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('returns 403 when user role is not allowed', () => {
      const middleware = requireRole('admin');
      const req = { user: { role: 'user' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'No autorizado' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
