// export default class CustomError extends Error {
//     constructor(message, statusCode) {
//         super(message);
//         this.statusCode = statusCode;
//         this.cause = statusCode;
//     }
// }


// src/utilities/customError.js
export default class CustomError extends Error {
  constructor(message, statusCode = 500, cause = null) {
    // Node supports Error options like { cause } but for compatibility set manually too
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    if (cause) this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }
}
