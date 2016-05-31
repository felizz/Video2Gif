/**
 * Created by Tuanguyen on 31/05/2016.
 */
$.Home = function() {
};

$.Home.prototype = (function() {
    var loadMoreImageEndPoint = "/user/loadmore";
    var setting = {
        tabHot: $('#hot'),
        tabNew: $('#new'),
        tabTop: $('#top'),
        tabDiscuss: $('#discuss'),
        offset: 10,
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
                    // ajax call get data from server and append to the div
                    //var tabActive = $('.home-tab').find($('.active'));
                    //$('#' + tabActive.attr('data-type') + " .post-loading").removeClass('hide');
                    //setting.offset = parseInt(tabActive.attr('data-offset'));
                    $.ajax({
                        url: loadMoreImageEndPoint,
                        type: "GET",
                        data: {
                            //type: tabActive.attr('data-type'),
                            limit: 10,
                            offset: setting.offset
                            //_csrf: common.getCSRF()
                        },
                        success: function(data) {
                            alert(data);
                            home.setStatus(0);
                            //document.getElementById("post").appendChild(data);
                            //$('#post').innerHTML =  $('#post').innerHTML+ data;
                            var divPost = document.getElementById("loaded-post");
                            divPost.lastElementChild.insertAdjacentHTML('afterend',data);
                            /*


                            $('#' + tabActive.attr('data-type') + " .post-loading").addClass('hide');

                            if (data.code == "SUCCESS") {
                                if (data.posts.length > 0) {
                                    var template = $('.post-template').html();
                                    Mustache.parse(template);   // optional, speeds up future uses
                                    data.posts.forEach(function(post) {
                                        post.created_at = common.timeago(post.created_at);
                                        post.quote_link = common.getQuoteLinkOfPost(post);
                                    });
                                    var rendered = Mustache.render(template, data);
                                    $('#' + tabActive.attr('data-type') + " .list-post").append(rendered);
                                    setting.offset += data.posts.length;
                                    tabActive.attr('data-offset', setting.offset);
                                    common.setVoteContainer($('.item-vote'));
                                    common.makeEventVote($('.more-item'));
                                    common.makeEventPopoverForNewPost($('.more-item'));
                                    $('.more-item').removeClass('more-item');
                                    $('.post-template').find($('.post-item')).addClass('more-item');
                                }
                            }
                             */
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
