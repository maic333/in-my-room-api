export class UnauthorizedError extends Error {
  statusCode = 401;
}
export class ForbiddenError extends Error {
  statusCode = 403;
}
export class ResourceNotFoundError extends Error {
  statusCode = 404;
}
