var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
var MAX_GIF_RANGE = 15; // second
var PRECISION =500 ;// milisecond

//When enter link, start Video Controller
$(document).ready( function(){

	var urlInput = $('#url-input');

	urlInput.change(displayVideoController);

	urlInput.keydown(function(event){
		if(event.keyCode == 13) {
			event.preventDefault();
			return false;
		}
	});

});

var displayVideoController = function () {
	selectTimeStartObject = document.querySelector('.js-min-max-start');
	var initTimeBar = new Powerange(selectTimeStartObject, {min: 0, max: 1000, start: 500});
	$('.select-time-start').find($('.range-bar')).addClass('range-bar-start');
	selectTimeEndObject = document.querySelector('.js-min-max-start-1');
	var initTimeBar2 = new Powerange(selectTimeEndObject, {min: 0, max: 1000, start: 500});
	$('.select-time-end').find($('.range-bar')).addClass('range-bar-end').append('<span class="time-point-end"></span>');

	//Set Youtube Video Id
	var video_id = "";
	var url = $(this).val();
	if (url.split("v=")[1]) {
		video_id = url.split("v=")[1].substring(0, 11);
	}
	if (video_id !== "") {
		createVideo(video_id);
	}
};


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

	//Move the video time tracker every second
	setInterval(function() {
		// If duration have not been set or duration < 1, do not animate
		if(duration < 1){
			return ;
		}
		//Animate the pointer
		var rangeControllBar  = $('.select-time-end');
		var timePassed = player.getCurrentTime() - startTime;
		var videoTimeTrackerPostion = timePassed / MAX_GIF_RANGE * rangeControllBar.width();
		rangeControllBar.find($('.time-point-end')).animate({left: videoTimeTrackerPostion});

		if(duration != -1 ){
			if( duration - timePassed < PRECISION / 1000.0){
				player.seekTo(startTime);
			}
		}
	}, PRECISION);
}


function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING) {
		$('.play .click-active').hide();
		$('.play .click-hidden').show();
		$('.btn-submit').removeClass('hidden');
	}
}

// Done Setup

var selectTimeStartObject;
var selectTimeEndObject;
var startTime = 0;
var duration = -1;
function releaseTimeButton(select) {
	if ($(select).hasClass('range-bar-start')) {
		startTime = parseFloat(selectTimeStartObject.value) / 1000 * player.getDuration();
		console.log('Start time changed: ' + startTime);
		player.seekTo(startTime);
		$('.select-time-end').css('left', parseInt($('.range-handle').css('left')) + 40);
	}

	if ($(select).hasClass('range-bar-end')) {
		duration = parseFloat(selectTimeEndObject.value) / 1000 * MAX_GIF_RANGE;
		console.log('Duration changed: ' + duration);
	}
}


//Create Gif Image
function createGif() {
	$.ajax({
		url: '/api/v1/gif/create',
		type: "POST",
		data: {
			video_url: player.getVideoUrl(),
			start_time: startTime,
			duration: duration
		},
		success: function(data) {
			window.location.href = '/' + data.image_id;
		},
		statusCode: {
			400: function() {
				alert('Lỗi 400');
			},
			500: function() {
				alert('Lỗi 500');
			}
		}
	});
}