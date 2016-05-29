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
	window.entered = 0;
		urlInput.keydown(function(event){
			if(event.keyCode == 13) {
				//event.preventDefault();
				displayVideoController();
				window.entered=1;
				return false;
			}
		});
});
function validURL(url) {
	if (url != undefined || url != '') {
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
		var match = url.match(regExp);
		if (match && match[2].length == 11) {
			// Do anything for being valid
			// if need to change the url to embed url then use below line
			return true;
		}
		else {
			// Do anything for not being valid
			return false;
		}
	}
}
var displayVideoController = function () {
	var url = $('#url-input').val();

	if(validURL(url)){
		document.getElementById("url-input").disabled = true;
		selectTimeStartObject = document.querySelector('.js-min-max-start');
		var initTimeBar = new Powerange(selectTimeStartObject, {min: 0, max: 1000, start: 500});
		$('.select-time-start').find($('.range-bar')).addClass('range-bar-start');
		selectTimeEndObject = document.querySelector('.js-min-max-start-1');
		var initTimeBar2 = new Powerange(selectTimeEndObject, {min: 0, max: 1000, start: 500});
		$('.select-time-end').find($('.range-bar')).addClass('range-bar-end').append('<span class="time-point-end"></span>');

		//Set Youtube Video Id
		var video_id = "";

		if (url.split("v=")[1]) {
			video_id = url.split("v=")[1].substring(0, 11);
		}
		if (video_id !== "") {
			createVideo(video_id);
		}
		$('#divColapse').removeClass("in");
	}else{
		//alert("link is not valid");
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
	$('.btn-submit').removeClass('hidden');
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
		$('.create-section').removeClass('hidden');
		window.scrollTo(0,document.body.scrollHeight);
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
	$('.hidden-progress').removeClass('hidden');
	$('.btn-submit').attr('disabled','disabled');
	$.ajax({
		url: '/api/v1/image/create-gif',
		type: "POST",
		data: {
			video_url: player.getVideoUrl(),
			start_time: startTime,
			duration: duration
		},
		success: function (data) {
			window.imageID = data.image_id;
			window.polling = setInterval(function () {
				pollGif(data.image_id);
			}, 800);
		},
		error: function () {
			alert("Co loi xay ra khi tao anh !");
			location.reload();
		}
	});
}

function pollGif(imageId) {
	$.ajax({
		url: '/api/v1/image/' + imageId + '/progress',
		type: "GET",
		success: function(data) {
			move(data.percent_completed);
		},
		error: function () {
			clearInterval(window.polling);
			$('.btn-submit').removeAttr('disabled');
			alert("Hệ thống quá tải, Xin vui lòng thử lại!");
			document.getElementById("myBar").style.width = 0 + '%';
			document.getElementById("label").innerHTML = 0  + '%';
		}
	});
}

function move(percentCompleted) {
	$('#timemark').html(percentCompleted);
	clearInterval(window.id);
	var elem = document.getElementById("myBar");
	var widthBar = $('#myBar').width();
	var parentWidth = $('#myBar').offsetParent().width();
	var width = Math.floor(100*widthBar/parentWidth);
	window.id = setInterval(frame, 20);
	function frame() {
		if (width > (+percentCompleted)) {
			clearInterval(window.id);
		} else if(width>=100){
			clearInterval(window.id);
			clearInterval(window.polling);
			window.location.href = '/' + window.imageID;
		}
		else{
			width++;
			elem.style.width = width + '%';
			document.getElementById("label").innerHTML = width  + '%';
		}
	}
}

function inputBlur() {
	if(!window.entered){
		displayVideoController();
	}
}

