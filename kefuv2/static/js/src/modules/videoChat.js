easemobim.videoChat = (function(dialog){
	var imChat = document.getElementById('em-kefu-webim-chat');
	var btnVideoInvite = document.querySelector('.em-video-invite');
	var videoWidget = document.querySelector('.em-widget-video');
	var dialBtn = videoWidget.querySelector('.btn-accept-call');
	var ctrlPanel = videoWidget.querySelector('.toolbar-control');
	var subVideoWrapper = videoWidget.querySelector('.sub-win');
	var mainVideo = videoWidget.querySelector('video.main');
	var subVideo = videoWidget.querySelector('video.sub');

	var config = null;
	var call = null;
	var sendMessageAPI = null;
	var localStream = null;
	var remoteStream = null;

	var statusTimer = {
		timer: null,
		counter: 0,
		prompt: videoWidget.querySelector('.status p.prompt'),
		timeSpan: videoWidget.querySelector('.status p.time-escape'),
		start: function(prompt){
			var me = this;
			me.counter = 0;
			me.prompt.innerHTML = prompt;
			me.timeSpan.innerHTML = '00:00';
			me.timer = setInterval(function(){
				me.timeSpan.innerHTML = format(++me.counter);
			}, 1000)

			function format(second){
				return (new Date(second * 1000))
					.toISOString()
					.slice(-'00:00.000Z'.length)
					.slice(0, '00:00'.length);
			}
		},
		stop: function(){
			var me = this;
			clearInterval(me.timer);
		}
	};

	var closingTimer = {
		isConnected: false,
		timer: null,
		delay: 3000,
		closingPrompt: videoWidget.querySelector('.full-screen-prompt'),
		timeSpan: videoWidget.querySelector('.full-screen-prompt p.time-escape'),
		show: function(){
			var me = this;
			if(me.isConnected){
				me.timeSpan.innerHTML = statusTimer.timeSpan.innerHTML;
			}
			else{
				me.timeSpan.innerHTML = '00:00';
			}
			me.closingPrompt.classList.remove('hide');
			setTimeout(function(){
				imChat.classList.remove('has-video');
				me.closingPrompt.classList.add('hide');
			}, me.delay);
		}
	}

	var endCall = function(){
		statusTimer.stop();
		closingTimer.show();
		localStream && localStream.getTracks().forEach(function(track){
			track.stop();
		})
		remoteStream && remoteStream.getTracks().forEach(function(track){
			track.stop();
		})
		mainVideo.src = '';
		subVideo.src = '';
	};

	var events = {
		'btn-end-call': function(){
			try {
				call.endCall();
			}
			catch (e) {
				console.error('end call:', e);
			}
			finally {
				endCall();
			}			
		},
		'btn-accept-call': function(){
			closingTimer.isConnected = true;
			dialBtn.classList.add('hide');
			ctrlPanel.classList.remove('hide');
			subVideoWrapper.classList.remove('hide');
			statusTimer.stop();
			statusTimer.start('???????????????');
			call.acceptCall();
		},
		'btn-toggle': function(){
			localStream && localStream.getVideoTracks().forEach(function(track){
				track.enabled = !track.enabled;
			});
		},
		'btn-change': function(){
			var tmp;

			tmp = subVideo.src;
			subVideo.src = mainVideo.src;
			mainVideo.src = tmp;
			subVideo.play();
			mainVideo.play();

			subVideo.muted = !subVideo.muted;
			mainVideo.muted = !mainVideo.muted;
		},
		'btn-minimize': function(){
			videoWidget.classList.add('minimized');
		},
		'btn-maximize': function(){
			videoWidget.classList.remove('minimized');
		}
	};


	function sendVideoInvite() {
		console.log('send video invite');
		sendMessageAPI('txt', '??????????????????????????????', false, {
				ext: {
				type: 'rtcmedia/video',
				msgtype: {
					liveStreamInvitation: {
						msg: '??????????????????????????????',
						orgName: config.orgName,
						appName: config.appName,
						userName: config.user.username,
						resource: 'webim'
					}
				}
			}
		});
	}

	function init(conn, sendMessage, cfg){
		sendMessageAPI = sendMessage;
		config = cfg;

		// ?????????????????????
		// ????????????style???????????????video?????????????????????????????????????????????
		videoWidget.style.display = '';
		// ???????????????
		btnVideoInvite.classList.remove('hide');
		btnVideoInvite.addEventListener('click', function(){
			dialog.init(sendVideoInvite);
		}, false);

		// ????????????????????????
		videoWidget.addEventListener('click', function(evt){
			var className = evt.target.className;

			Object.keys(events).forEach(function(key){
				~className.indexOf(key) && events[key]();
			})
		}, false);

		call = new WebIM.WebRTC.Call({
			connection: conn,

			mediaStreamConstaints: {
				audio: true,
				video: true
			},

			listener: {
				onAcceptCall: function (from, options) {
					console.log('onAcceptCall', from, options);
				},
				onGotRemoteStream: function (stream) {
					// for debug
					console.log('onGotRemoteStream', stream);
					mainVideo.src = URL.createObjectURL(stream);
					remoteStream = stream;
					mainVideo.play();
				},
				onGotLocalStream: function (stream) {
					// for debug
					console.log('onGotLocalStream', stream);
					subVideo.src = URL.createObjectURL(stream);
					localStream = stream;
					subVideo.play();
				},
				onRinging: function (caller) {
					// for debug
					console.log('onRinging', caller);
					// init
					subVideo.muted = true;
					mainVideo.muted = false;
					closingTimer.isConnected = false;

					subVideoWrapper.classList.add('hide');
					ctrlPanel.classList.add('hide');
					imChat.classList.add('has-video');
					statusTimer.start('???????????????????????????????????????');
					dialBtn.classList.remove('hide');
				},
				onTermCall: function () {
					// for debug
					console.log('onTermCall');
					endCall();
				},
				onError: function (e) {
					console.log(e && e.message ? e.message : 'An error occured when calling webrtc');
				}
			}
		});
	}

	return {
		init: init,
		onOffline: function() {
			// for debug
			console.log('onOffline');
			endCall();
		}
	}
}(easemobim.ui.videoConfirmDialog));
