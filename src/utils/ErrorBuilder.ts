export class ErrorBuilder {
    private readonly _error: Error;

    constructor(message: string) {
        this._error = new Error(message);
    }

    status(status: number): ErrorBuilder {
        this._error.status = status;
        return this;
    }

    build(): Error {
        return this._error;
    }
}
