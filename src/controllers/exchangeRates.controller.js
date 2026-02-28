const EXCHANGE_API_BASE = 'https://v6.exchangerate-api.com/v6';

async function getRates(req, res) {
  const base = (req.query.base || 'USD').toUpperCase();
  const key = process.env.EXCHANGERATE_API_KEY;

  if (!key) {
    return res.status(503).json({
      error: 'Clave de API de tipos de cambio no configurada (EXCHANGERATE_API_KEY)',
    });
  }

  try {
    const response = await fetch(
      `${EXCHANGE_API_BASE}/${key}/latest/${base}`
    );
    const data = await response.json();

    if (data.result !== 'success') {
      return res.status(502).json({
        error: data['error-type'] || 'Error en la API de tipos de cambio',
      });
    }

    return res.json({
      base_code: data.base_code,
      conversion_rates: data.conversion_rates,
      time_last_update_utc: data.time_last_update_utc,
    });
  } catch (err) {
    console.error('Error al obtener tipos de cambio:', err.message);
    return res.status(502).json({
      error: 'Error al obtener los tipos de cambio',
    });
  }
}

module.exports = { getRates };
