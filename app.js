/* eslint-disable */
// set up basic variables for app

var soundClips  = document.querySelector('.sound-clips');

// disable stop button while not recording

stop.disabled = true;

//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {
	console.log('getUserMedia supported.');

	var onSuccess = function(stream, chunks, i) {
		var mediaRecorder = new MediaRecorder(stream);
		var record        = document.querySelector('.record' + i);
		var stop          = document.querySelector('.stop' + i);

		record.onclick = function() {
			mediaRecorder.start();

			console.log(mediaRecorder.state);
			console.log("recorder started");

			record.style.background = "red";

			stop.disabled   = false;
			record.disabled = true;
		}

		stop.onclick = function() {
			mediaRecorder.stop();

			console.log(mediaRecorder.state);
			console.log("recorder stopped");

			record.style.background = "";
			record.style.color = "";
			// mediaRecorder.requestData();

			stop.disabled   = true;
			record.disabled = false;
		}

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
			var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });

			chunks = [];

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

		mediaRecorder.ondataavailable = function(e) {
			chunks.push(e.data);
		}
	}

	var onError = function(err) {
		console.log('The following error occured: ' + err);
	}

	navigator.mediaDevices.enumerateDevices().then(
		function (dev) {
			let audioSelect = {};
			let count = 0;

			for (let i = 0; i < dev.length; i++) {
				if (dev[i].kind == 'audioinput' && dev[i].deviceId !== 'default') {
					audioSelect['value'] = dev[i].deviceId;

					var chunks      = [];
					var constraints = { 
						audio: {
							deviceId: {
								exact: audioSelect.value
							}
						}
					};

					navigator.mediaDevices.getUserMedia(constraints).then(
						function (stream) {
							count++;
							onSuccess (stream, chunks, count);
						},
						function (err) {
							onError (err);
						}
					);
				}
			}
		});

} else {
	console.log('getUserMedia not supported on your browser!');
}
