/**
 * Created by kyle on 1/6/16.
 */

var appName = 'anhdong';
var databaseName = 'anhdong';
var TMP_DIR = '/tmp/anhdong/';
var S3_BACKUP_DIR = 'ad-backup/';
var logger = require('utils/logger');
var mUtils = require('./utils');

var uniqueName = appName + '_' + new Date().toISOString().replace(/T/g, '_').replace(/:/g, '-').replace(/\./g, '_').replace(/Z/g, '');
var tmpDatabaseExportFolder = TMP_DIR + uniqueName;

// Export DB to files
mUtils.execCommand(`mongodump -d ${databaseName} -o ${tmpDatabaseExportFolder}`, function exportDbCallback(err, stdout){
    if(err){
        logger.error('Failed to export Database ' + databaseName);
        logger.prettyError(err);
        process.exit(1);
    }

    logger.info(`Successfully exported ${databaseName} to Directory ${tmpDatabaseExportFolder}`);

    //Tar directory for uploading
    var tarFileName = uniqueName + '.tar.gz';
    mUtils.execCommand(`tar zcvf ${TMP_DIR + tarFileName}  -C ${TMP_DIR + uniqueName} .`, function tarCallback(err, stdout){
        if(err){
            logger.error('Failed to tar database folder ' + tmpDatabaseExportFolder);
            logger.prettyError(err);
            process.exit(1);
        }

        logger.info(`Successfully tar Directory ${tmpDatabaseExportFolder} to File ${tarFileName}`);

        // Upload tar file to S3 Backup folder
        mUtils.uploadFileToS3(TMP_DIR + tarFileName, S3_BACKUP_DIR + tarFileName, function s3UploadCallback(err){
            if(err){
                logger.error('Failed to upload database exported files to S3 ' + tarFileName);
                logger.prettyError(err);
                process.exit(1);
            }

            logger.info(`Successfuly backed up Database ${databaseName} to S3 path ${S3_BACKUP_DIR + tarFileName}`);

            //Clean up tmp directory
            mUtils.execCommand(`rm ${TMP_DIR + tarFileName}`);
            mUtils.execCommand(`rm -rf ${TMP_DIR + uniqueName}`);

            logger.info('Database back up finished.');
        })
    });
});