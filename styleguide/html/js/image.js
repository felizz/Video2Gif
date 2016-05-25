/**
 * Created by Tuanguyen on 25/05/2016.
 */
$(document).ready( function(){
    window.loved = 0;
});

function loveAction(loveVal) {
    var imageID = window.location.href.split('/')[3];
     $.ajax({
         url: 'api/v1/image/'+imageID+'/love',
         type: "POST",
         data: {
            loveVal: window.loved
         },
         success: function(data) {
             if(!window.loved){
                 $("#loveAction").html("<i id=\"heart_icon\" class=\"fa fa-heart fa-lg\" aria-hidden=\"true\" style=\"color: #3d5fa1;\"></i>");
                 window.loved=1;
             }else{
                 $("#loveAction").html("<i id=\"heart_icon\" class=\"fa fa-heart fa-lg\" aria-hidden=\"true\" style=\"color: #babcbf;\"></i>");
                 window.loved=0;
             }
             $('#loveNum').html(data.loveNum);

         },
         error: function () {
            alert("Hệ thống quá tải, Xin vui lòng thử lại!");
         }
     });
}