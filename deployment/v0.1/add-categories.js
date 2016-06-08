/**
 * Created by kyle on 25/5/16.
 */
var Category = require('../../models/category');
require('../../config/database');
var logger = require('utils/logger');
var fs = require('fs');
var async = require('async');

var addUpdateCategory = function (name, slug, description, callback){

    Category.findOne({slug: slug}, function (err, cate) {
        if (err) {
            logger.info('Error retrieving category with slug ' + slug);
            return callback(err);
        }

        if (cate) {
            logger.info('Category with the same slug already existed : ' + slug + ' . Try to update it');

            cate.description = description;
            cate.name = name;

            cate.save(function saveCallback(err) {
                return callback(err);
            });
        }
        else {
            var newCateObj = new Category({
                name: name,
                description: description,
                slug: slug
            });

            newCateObj.save(function saveCallback(err) {
                return callback(err);
            });
        }
    });
};

logger.info('Start adding/updating categories');

var categoryDataList = [
    {
        title : 'Sống chất',
        slug: 'song-chat'
    },
    {
        title : 'Kỹ năng',
        slug: 'ky-nang'
    },
    {
        title: 'Các mối quan hệ',
        slug: 'cac-moi-quan-he'
    },
    {
        title: 'Tri thức mới',
        slug: 'tri-thuc-moi'
    },
    {
        title: 'Đa giác cuộc sống',
        slug: 'da-giac-cuoc-song'
    }
];

categoryDataList.forEach(function forEachCallback(element, index, array){
    fs.readFile(`deployment/v1.1/${element.slug}.html`, 'utf8', function (err,data) {
        if (err) {
            logger.prettyError(err);
        }
        addUpdateCategory(element.title, element.slug, data, function addCateCallback(err){

            if(err){
                logger.info('Error adding category ' + element.slug);
            }
            logger.info('Category added successfully: ' + element.slug);
        });
    });
});

logger.info('Disable old categories');

var OLD_CATEGORIES = ['diem-tin', 'truyen-ngan', 'anh', 'video-hay', 'hoi-dap-vu-vo', 'tranh-luan', 'nghi-gi-xa-nay', 'chia-se-kien-thuc'];
OLD_CATEGORIES.forEach(function forEachCallback(slug, index, array){

    Category.findOne({slug: slug}, function (err, cate) {
        if (err) {
            logger.info('Error retrieving category with slug ' + slug);
        }

        if (cate) {
            cate.status = 0; //Disable
            cate.save(function saveCallback(err) {
                if(!err){
                    logger.info('Category disabled: ' + slug);
                }
            });
        }
        else {
            logger.info('Category not found: ' + slug);
        }
    });
});




