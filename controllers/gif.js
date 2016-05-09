/**
 * Created by kyle on 9/5/16.
 */
/**
 * Created by kyle on 28/12/15.
 */

var statusCodes = require('infra/status-codes');
var errReason = require('infra/error-reason');
var apiErrors = require('infra/api-errors');

var validator = require('utils/validator');

var user = {
    handleCreateGif: function (req, res) {

        var errRes = apiErrors.INVALID_PARAMETERS.new();

        //Request Validation
        if(!validator.isURL(req.body.video_url)){
            errRes.putError('video_url', errReason.INVALID_FORMAT);
        }

        if(!validator.isNumeric(req.body.start_time)){
            errRes.putError('start_time', errReason.NON_NUMERIC);
        }

        if(!validator.isNumeric(req.body.duration)){
            errRes.putError('duration', errReason.NON_NUMERIC);
        }

        if (errRes.hasError()) {
            return errRes.sendWith(res);
        }

        var startTime = parseInt(req.body.start_time), duration = parseInt(req.body.duration);

        //Mocking Response
        return res.status(statusCodes.OK).send({url : '/6Wu2IRK', name: "6Wu2IRK"})

        //Call to service create gif

    }
};

module.exports = user;


