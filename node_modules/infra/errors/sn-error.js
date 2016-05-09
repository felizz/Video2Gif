/**
 * Created by kyle on 24/3/16.
 */

'use strict'

/**
 *
 * @param message: string - created by developer when throwing the error.
 */
class SNError extends Error{
    /**
     * Assign a stack trace to this error object.
     * this.constructor is passed in to only start stack trace from the piotn SNError is invoked.
     */

    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
};

module.exports = SNError;
