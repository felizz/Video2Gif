/**
 * Created by Tuanguyen on 31/05/2016.
 */
$.Home = function() {
};

$.Home.prototype = (function() {
    var loadMoreImageEndPoint = "/user/loadmore";
    var setting = {
        limit:4,
        offset: 4,
        status: 0 // 0: nothing
    };
    return {
        init: function(options) {
            if (typeof options === "undefined" || options.length < 1) {
                return false;
            }
            $.extend(setting, options);
        },
        setStatus: function(status) {
            setting.status = status;
        },
        getStatus: function() {
            return setting.status;
        },
        makeLoadMoreEvent: function () {
            $(window).scroll(function() {

                if (home.getStatus() === 0 && $(window).scrollTop() === $(document).height() - $(window).height()) {
                    home.setStatus(1);
                    $.ajax({
                        url: loadMoreImageEndPoint,
                        type: "GET",
                        data: {
                            //type: tabActive.attr('data-type'),
                            limit: setting.limit,
                            offset: setting.offset
                            //_csrf: common.getCSRF()
                        },
                        success: function(data) {
                            home.setStatus(0);
                            var divPost = document.getElementById("loaded-post");
                            divPost.lastElementChild.insertAdjacentHTML('afterend',data);
                            setting.offset += setting.limit;
                        },
                        error: {
                            400: function() {
                                home.setStatus(0);
                            }
                        }
                    });
                }
            });
        }
    };
}(jQuery));

function loveItem(imageID) {
    alert(imageID);
    $(this).addClass("abc");
    if(this.hasClass("loveIcon")){
        alert(this.class);
    }
    /*


    $.ajax({
        url: 'api/v1/image/'+imageID+'/love',
        type: "POST",
        data: {
            love_val: 1
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
    }); */
}

function foo(){
    $(this).addClass("abc");
}
