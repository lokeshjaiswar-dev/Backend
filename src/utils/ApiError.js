class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something Went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);                  // 1. Call parent Error → sets message & initializes error object
        this.statusCode = statusCode;    // 2. HTTP status (e.g., 404, 500)
        this.data = null;                // 3. Extra data placeholder (keeps response format consistent)
        this.message = message;          // 4. Ensures message exists on the object for APIs
        this.success = false;            // 5. Always false (API error flag)
        this.errors = errors;            // 6. Array of details (e.g., validation errors)

        if (stack) {
            this.stack = stack;          // 7. Use a custom stack trace if provided
        } else {
            Error.captureStackTrace(this, this.constructor);
            // Error.captureStackTrace(targetObject, constructorOpt);  
            // 8. Otherwise, generate a clean stack trace, excluding the constructor
        }
    }
}

export {ApiError}