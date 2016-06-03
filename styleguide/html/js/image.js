/**
 * Created by Tuanguyen on 25/05/2016.
 */
$(document).ready( function(){
    window.loved = 1;
    $('#shortLink').val(window.location.href);
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

function actionEditTitle(imageId){
    var newTitle = $('#inputTitle').val();
    $.ajax({
        url: 'api/v1/image/'+imageId+'/change-title',
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
}
function actionCancel() {
    $('#editTitleForm').addClass("hidden");
    $('#staticTitle').removeClass("hidden");
}

function editTitle() {
    $('#editTitleForm').removeClass("hidden");
    $('#staticTitle').addClass("hidden");
}