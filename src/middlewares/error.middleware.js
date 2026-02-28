function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : (err.message || 'Error');

  return res.status(status).json({ error: message });
}

module.exports = { errorHandler };