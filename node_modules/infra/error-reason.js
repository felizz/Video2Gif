/**
 * Created by kyle on 29/3/16.
 */

module.exports = {
    //The call does not expect the parameter specified under ‘field’.
    UNEXPECTED : 'UNEXPECTED',

    //The required parameter specified under ‘field’ is missing.
    MISSING : 'MISSING',

    //The parameter specified under ‘field’ has an invalid format.
    INVALID_FORMAT : 'INVALID_FORMAT',

    //The parameter specified under ‘field’ must be unique.
    NOT_UNIQUE : 'NOT_UNIQUE',

    //The parameter specified under ‘field’ is not in the list of valid values.
    UNKNOWN_VALUE : 'UNKNOWN_VALUE',

    //The parameter specified under ‘field’ exceeds one of the boundary limits
    OUT_OF_BOUND : 'OUT_OF_BOUND',

    //The parameter specified under ‘field’ is too short.
    TOO_SHORT : 'TOO_SHORT',

    //The parameter specified under ‘field’ is too long.
    TOO_LONG : 'TOO_LONG',

    //The parameter specified under ‘field’ is not a number.
    NON_NUMERIC : 'NON_NUMERIC'
}