/**
 * Created with JetBrains PhpStorm.
 * User: Kenvin
 * Date: 8/1/15
 * Time: 3:04 PM
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function () {
    $('.bxslider').bxSlider({
        mode: 'vertical'
    });
    $('.search-btn').click(function(e) {
        $('.search-form').toggleClass('active');
        $('.search-form input').focus();
        e.stopPropagation();
    });
    $('body').click(function(e) {
        if (e.target.className == "search-form" || e.target.className == "form-control search") {
        } else {
            $('.search-form').removeClass('active');
        }
    });
    $('.slider-home .next-slide a').click(function(){
        $('.slider-home .bx-wrapper .bx-next').trigger('click');
    });

    if($(window).width() < 768){
        $('.header .navbar-nav .expand').click(function(){
            $(this).toggleClass('active');
            $(this).next('.sub-menu').slideToggle(200);
        })
    }
});