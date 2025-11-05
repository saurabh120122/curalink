class ApiError extends Error {
  /**
   * @param {number} statusCode - The HTTP status code (e.g., 404, 400, 500)
   * @param {string} message - The error message for the client
   * @param {Array} errors - (Optional) A list of specific validation errors
   * @param {string} stack - (Optional) The error stack trace
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    // Call the parent constructor (Error) with the message
    super(message);
    
    // Set properties
    this.statusCode = statusCode;
    this.data = null; // 'data' is always null for an error
    this.message = message;
    this.success = false; // 'success' is always false for an error
    this.errors = errors;

    // Capture the stack trace, or use the one provided
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError }