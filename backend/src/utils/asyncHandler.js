/**
 * A wrapper for async functions to catch errors and pass them to the global error handler.
 * @param {Function} requestHandler - The async controller function (e.g., signUp, searchTrials)
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    // We wrap the requestHandler in a Promise.resolve()
    // This ensures that if the handler is not async, it still works
    // and any error it throws will be caught by the .catch()
    Promise.resolve(requestHandler(req, res, next))
           .catch((err) => next(err)); // Pass any errors to Express's 'next' middleware
  };
};

export { asyncHandler };