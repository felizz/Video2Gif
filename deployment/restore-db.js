/**
 * Created by kyle on 1/6/16.
 */


var S3_FILE_TO_RESTORE = process.argv[2];
var config = require('utils/config');
var appName = config.app_name;
var databaseName = config.database.name;
var TMP_DIR = '/tmp/' + appName + "/";
var S3_BACKUP_DIR = 'ad-backup/';
var logger = require('utils/logger');
var mUtils = require('./utils');
var uniqueName = appName + '_' + new Date().toISOString().replace(/T/g, '_').replace(/:/g, '-').replace(/\./g, '_').replace(/Z/g, '');

if(!S3_FILE_TO_RESTORE || !S3_FILE_TO_RESTORE.endsWith('.tar.gz')){
    logger.error('File to restore must be .tar.gz');
    process.exit(1);
}

var uniqueDir = TMP_DIR + uniqueName + '/';
var downloadFile = uniqueDir  +  S3_FILE_TO_RESTORE;


mUtils.execCommand(`mkdir ${uniqueDir}`, function mkdirCallback(err, stdout) {

    //Retrieve file from S3
    mUtils.getFileFromS3(S3_BACKUP_DIR + S3_FILE_TO_RESTORE, downloadFile, function s3DownloadCallback(err){
        if(err){
            logger.info('failed to download file ' + S3_FILE_TO_RESTORE);
            logger.prettyError(err);
            process.exit(1);
        }

        logger.info('Successfully download file from S3 : ' + S3_FILE_TO_RESTORE);

        //Extracted Downloaded file
        mUtils.execCommand(`tar -xvf  ${downloadFile} -C ${uniqueDir}`, function extractCallback(err, stdout) {
            if (err) {
                logger.info('failed to extract downloaded file ' + downloadFile);
                logger.prettyError(err);
                process.exit(1);
            }

            logger.info(`Successfully extracted downloaded file ${downloadFile} to ${TMP_DIR + uniqueName}`);

            //Reset current database
            mUtils.execCommand(`mongo localhost:27017/${databaseName} --eval "db.dropDatabase()"`, function resetDbCallback(err, stdout) {
                if (err) {
                    logger.info('failed to reset database  ' + databaseName);
                    logger.prettyError(err);
                    process.exit(1);
                }

                logger.info('Successfully reset/drop database ' + databaseName);

                //Restore Database from downloaded sources
                var extractedDatabaseDir = uniqueDir + databaseName;
                mUtils.execCommand(`mongorestore -d ${databaseName}  ${extractedDatabaseDir}`, function restoreCallback(err, stdout) {
                    if (err) {
                        logger.info('failed to restore database from ' + extractedDatabaseDir);
                        logger.prettyError(err);
                        process.exit(1);
                    }

                    logger.info(`Successfully restore database ${databaseName} from ${S3_FILE_TO_RESTORE} `);

                    //Clean up tmp directory
                    mUtils.execCommand(`rm -rf ${uniqueDir}`);

                    logger.info('Restore Database finished.');
                });

            });

        });


    });

});






