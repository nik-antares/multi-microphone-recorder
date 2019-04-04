/* eslint-disable */
// set up basic variables for app

var soundClips  = document.querySelector('.sound-clips');

// disable stop button while not recording

stop.disabled = true;

//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {
	console.log('getUserMedia supported.');
	let record    = document.querySelector('.record');
	let stop      = document.querySelector('.stop');

	let mediaRecorders = [];
	let chunks_array   = [];

	var onSuccess = function(stream) {
		var ac       = new AudioContext();
		var source   = ac.createMediaStreamSource(stream);
		var splitter = ac.createChannelSplitter(2);

		source.connect(splitter);

		var merger1 = ac.createChannelMerger(2);
		var merger2 = ac.createChannelMerger(2);

		splitter.connect(merger1, 0, 0);
		splitter.connect(merger2, 1, 1);

		var dest1 = ac.createMediaStreamDestination();
		var dest2 = ac.createMediaStreamDestination();

		merger1.connect(dest1);
		merger2.connect(dest2);

		mediaRecorders.push (new MediaRecorder(dest1.stream));
		mediaRecorders.push (new MediaRecorder(dest2.stream));

		record.onclick = function() {
			mediaRecorders.forEach ((mediaRecorder) => { 
				mediaRecorder.start(); 

				console.log(mediaRecorder.state);
			});

			console.log("recorder started");

			record.style.background = "red";

			stop.disabled   = false;
			record.disabled = true;
		}

		stop.onclick = function() {
			mediaRecorders.forEach ((mediaRecorder) => { 
				mediaRecorder.stop();

				console.log(mediaRecorder.state);
			});

			console.log("recorder stopped");

			record.style.background = "";
			record.style.color = "";
			// mediaRecorder.requestData();

			stop.disabled   = true;
			record.disabled = false;
		}

		mediaRecorders.forEach ((mediaRecorder, index) => {
			mediaRecorder.onstop = function(e) {
				console.log("data available after MediaRecorder.stop() called.");

				var clipName = prompt('Enter a name for your sound clip?','My unnamed clip');

				console.log(clipName);

				var clipContainer = document.createElement('article');
				var clipLabel     = document.createElement('p');
				var audio         = document.createElement('audio');
				var deleteButton  = document.createElement('button');

				clipContainer.classList.add('clip');
				audio.setAttribute('controls', '');
				deleteButton.textContent = 'Delete';
				deleteButton.className = 'delete';

				if (clipName === null)
					clipLabel.textContent = 'My unnamed clip';
				else
					clipLabel.textContent = clipName;

				clipContainer.appendChild(audio);
				clipContainer.appendChild(clipLabel);
				clipContainer.appendChild(deleteButton);
				soundClips.appendChild(clipContainer);

				audio.controls = true;
				var blob = new Blob(chunks_array[index], { 'type' : 'audio/wav; codecs=opus' });

				chunks_array[index] = [];

				var audioURL = window.URL.createObjectURL(blob);
				audio.src = audioURL;
				console.log("recorder stopped");

				deleteButton.onclick = function(e) {
					evtTgt = e.target;
					evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
				}

				clipLabel.onclick = function() {
					var existingName = clipLabel.textContent;
					var newClipName = prompt('Enter a new name for your sound clip?');
					if(newClipName === null) {
						clipLabel.textContent = existingName;
					} else {
						clipLabel.textContent = newClipName;
					}
				}
			}
		});

		mediaRecorders.forEach ((mediaRecorder, index) => {
			mediaRecorder.ondataavailable = function(e) {
				chunks_array[index] = [];
				chunks_array[index].push(e.data);
			}
		});
	}

	var onError = function(err) {
		console.log('The following error occured: ' + err);
	}

	navigator.mediaDevices.enumerateDevices().then(
		function (dev) {
			for (let i = 0; i < dev.length; i++) {
				if (dev[i].kind == 'audioinput' && dev[i].deviceId !== 'default') {
					let deviceId    = dev[i].deviceId;
					let constraints = { 
						audio: { 
							deviceId,
							channelCount: 2
						}
					};

					navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
				}
			}
		});

} else {
	console.log('getUserMedia not supported on your browser!');
}
