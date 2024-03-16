export default class ApiError extends Error {
    success: boolean;
    data: any;
    constructor(
        public statusCode: number,
        public message = 'Something went wrong',
        public errors: Error[] = [],
        public stack = ''
    ) {
        super(message);
        this.data = null;
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}