// handle 404 Not Found errors
exports.notFound = (req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    status: 404
  });
};

// global error handler
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).render('error', {
    title: status === 500 ? 'Server Error' : 'Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message,
    status
  });
};