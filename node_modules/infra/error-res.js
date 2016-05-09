/**
 * Created by kyle on 28/3/16.
 */
var logger = require('utils/logger');
var statusCodes = require('./status-codes');
var errorReason = require('./error-reason');

function ErrorRes(errorName, errMsg, statusCode){
    this.error_name = errorName || 'INTERNAL_SERVER_ERROR';
    this.error_message = errMsg || 'Server Encountered Error';
    this.status_code = statusCode || statusCodes.INTERNAL_SERVER_ERROR;
}

//Put errors info about the error, which will be sent to client
ErrorRes.prototype.putError = function (fieldName, errReason){

    if(typeof fieldName !== 'string' || errorReason[errReason] === undefined){
        throw new TypeError("Can't Put an Invalid Error");
    }

    if(!this.errors){
        this.errors = [];
    }

    var error = {
        'field' : fieldName,
        'reason' : errReason
    };

    this.errors.push(error);
    return this;
}

//Has Specific Errors
ErrorRes.prototype.hasError = function (){
    return this.errors !== undefined;
}

//Set the custom message to be sent to Client
ErrorRes.prototype.setMessage = function (message){
    if(typeof message !== 'string'){
        throw new TypeError('Message must be a string');
    };
    this.error_message = message;
    return this;
}


//Send back this error to client
ErrorRes.prototype.sendWith = function (res){
    logger.debug('Server Response with Error: ' + JSON.stringify(this));
    res.status(this.status_code);
    res.send(this);
}


module.exports = ErrorRes;

