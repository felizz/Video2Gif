var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
function createVideo(id) {
	player = new YT.Player('player', {
		height: '390',
		width: '640',
		videoId: id,
		playerVars: {
			controls: 0,
			showinfo: 0,
			disablekb: 1
		},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}
function onPlayerReady(event) {
	$('.video-container').removeClass('hidden');
	event.target.playVideo();
	var mytimer = setInterval(function() {
		var playerCurrentTime = player.getCurrentTime();
		var playerTimeDifference = (playerCurrentTime / player.getDuration()) * 100;
		progress(playerTimeDifference, $('.select-time-start'));
	}, 1000);
}
function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING && !done) {
		$('.play .click-active').hide();
		$('.play .click-hidden').show();
		$('.btn-submit').removeClass('hidden');
	}
}
var selectTimeStartObject;
var selectTimeEndObject
$(document).ready(function() {
	$('#url-input').change(function() {
		selectTimeStartObject = document.querySelector('.js-min-max-start');
		var initTimeBar = new Powerange(selectTimeStartObject, {min: 0, max: 1000, start: 500});
		$('.select-time-start').find($('.range-bar')).addClass('range-bar-start').append('<span class="time-point"></span>');
		selectTimeEndObject = document.querySelector('.js-min-max-start-1');
		var initTimeBar2 = new Powerange(selectTimeEndObject, {min: 0, max: 1000, start: 500});
		$('.select-time-end').find($('.range-bar')).addClass('range-bar-end').append('<span class="time-point"></span>');
		createVideo($(this).val());
	});
});
var startTime;
var endTime;
function releaseTimeButton(select) {
	if($(select).hasClass('range-bar-start')){
		player.seekTo(selectTimeStartObject.value / 1000 * player.getDuration());
		$('.select-end-time').css('left', parseInt($('.range-handle').css('left')) + 40);
	}
	if($(select).hasClass('range-bar-end')){
		startTime = selectTimeStartObject.value / 1000 * player.getDuration();
		endTime = (selectTimeStartObject.value + parseInt($('.select-time-end').find($('.range-quantity')).css("width"))) / 1000 * player.getDuration();
	}
}
function progress(percent, $element) {
	var progressBarWidth = percent * $element.width() / 100;

	$element.find($('.time-point')).animate({ left: progressBarWidth });
}