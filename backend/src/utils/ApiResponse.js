class ApiResponse {
  /**
   * @param {number} statusCode - The HTTP status code (e.g., 200, 201)
   * @param {any} data - The data payload to send to the client
   * @param {string} message - A success message
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // Success is true if status code is < 400
  }
}

export{ ApiResponse };