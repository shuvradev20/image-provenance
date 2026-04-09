// --- Custom Error Handler ---

/**
 * @class ApiError
 * @description Standardized error handler for the application.
 * Extends the native JavaScript Error class to provide structured HTTP error responses
 * with consistent properties across the entire API.
 */
export class ApiError extends Error {
    public statusCode: number;
    public data: any;
    public success: boolean;
    public errors: any[];

    /**
     * Instantiates a custom API Error.
     * *@param statusCode - The HTTP status code indicating the error type (e.g., 400, 401, 500).
     * @param message - A message explaining the error.
     * @param errors - An array of detailed validation or execution errors.
     * @param stack - An optional custom stack trace for advanced debugging.
     */
    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: any[] = [],
        stack: string = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        // Capture the exact location (stack trace) where the error occurred for easier debugging
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
