// --- API Response Formatter ---

/**
 * @class ApiResponse
 * @description Standardized generic response formatter for the application.
 * Ensures all successful HTTP responses follow a uniform structure, making it easier
 * for frontend clients to parse the incoming data.
 * * @template T - The type of the data payload being returned.
 */
export class ApiResponse<T> {
    public statusCode: number;
    public data: T;
    public message: string;
    public success: boolean;

    /**
     * Instantiates a structured API Response.
     * * @param statusCode - The HTTP status code indicating success (e.g., 200, 201).
     * @param data - The main payload or data object to be sent to the client.
     * @param message - A success message.
     */
    constructor(
        statusCode: number,
        data: T,
        message: string = "Success"
    ){
        this.statusCode = statusCode;
        this.data = data,
        this.message = message,
        this.success = statusCode < 400
    }
}