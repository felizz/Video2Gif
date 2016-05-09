/**
 * Created by kyle on 6/4/16.
 */

'use strict'
var DatabaseError = require('./database-error');

/**
 *
 * @param message: string - created by developer when throwing the error.
 * @param query: string - sql query
 * @param values: [
 *      value: any primitive - to replace its placeholder in query
 * ]
 */
class RecordNotFoundError extends DatabaseError{

    constructor(message, query, values) {
        super(message, query, values);
    }
};

module.exports = RecordNotFoundError;