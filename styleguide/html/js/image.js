/**
 * Created by Tuanguyen on 25/05/2016.
 */
$(document).ready( function(){
    window.loved = 1;
    $('#shortLink').val(window.location.href);
    $('[data-toggle="tooltip"]').tooltip({trigger: 'manual'});
    setTimeout(function() {
        $('[data-toggle="tooltip"]').tooltip('show');
    }, 2000);

    setTimeout(function() {
        $('[data-toggle="tooltip"]').tooltip('hide');
    }, 10000);
});

function loveAction(loveVal) {
    var imageID = window.location.href.split('/')[3];
     $.ajax({
         url: 'api/v1/image/'+imageID+'/love',
         type: "POST",
         data: {
            love_val: window.loved
         },
         success: function(data) {
             if(window.loved){
                 $("#loveAction").html("<i id=\"heart_icon\" class=\"fa fa-heart fa-lg\" aria-hidden=\"true\" style=\"color: #3d5fa1;\"></i>");
                 window.loved=0;
             }else{
                 $("#loveAction").html("<i id=\"heart_icon\" class=\"fa fa-heart fa-lg\" aria-hidden=\"true\" style=\"color: #babcbf;\"></i>");
                 window.loved=1;
             }
             $('#loveNum').html(data.love_count);

         },
         error: function () {
            alert("Hệ thống quá tải, Xin vui lòng thử lại!");
         }
     });
}
function isEmpty(str){
    return !str.replace(/^\s+/g, '').length; // boolean (`true` if field is empty)
}

function actionEditTitle(imageId){
    var newTitle = $('#inputTitle').val();
    if(!isEmpty(newTitle)){
        $.ajax({
            url: 'api/v1/image/'+imageId+'/title/update',
            type: "POST",
            data: {
                new_title: newTitle
            },
            success: function() {
                $("#staticTitle  b").html(newTitle);
                $('#editTitleForm').addClass("hidden");
                $('#staticTitle').removeClass("hidden");

            },
            error: function () {
                alert("Hệ thống quá tải, Xin vui lòng thử lại!");
            }
        });
    }else{
        alert("Tiêu đề của ảnh không nên để trống !");
    }

}
function actionCancel() {
    $('#editTitleForm').addClass("hidden");
    $('#staticTitle').removeClass("hidden");
}

function editTitle() {
    $('#editTitleForm').removeClass("hidden");
    $('#staticTitle').addClass("hidden");
}

function deleteImage(image_id) {
    $.ajax({
        url: 'api/v1/image/delete',
        type: "POST",
        data: {
            image_id: image_id
        },
        success: function() {
            //redirect to homepage
            window.location='/';
        },
        error: function () {
            alert("Hệ thống quá tải, Xin vui lòng thử lại!");
        }
    });
}

function  claim(image_id, user_id) {
    $.ajax({
        url: 'api/v1/image/delete',
        type: "POST",
        data: {
            image_id: image_id
        },
        success: function() {
            //redirect to homepage
            window.location='/';
        },
        error: function () {
            alert("Hệ thống quá tải, Xin vui lòng thử lại!");
        }
    });
}