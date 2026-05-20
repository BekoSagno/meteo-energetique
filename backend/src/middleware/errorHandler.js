export function notFoundHandler(_req, res) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Ressource introuvable',
  });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);

  const status = err.status ?? err.statusCode ?? 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Erreur interne du serveur'
      : err.message;

  res.status(status).json({
    error: err.code ?? 'INTERNAL_ERROR',
    message,
  });
}
