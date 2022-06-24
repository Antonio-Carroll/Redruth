/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
// initialize elements we'll use
const recordButton = document.getElementById('recordButton');
const recordButtonImage = recordButton.firstElementChild;
const recordedAudioContainer = document.getElementById('recordedAudioContainer');
const saveAudioButton = document.getElementById('saveButton');
saveAudioButton.setAttribute('onclick', "window.location.assign('/saved.html')");
const discardAudioButton = document.getElementById('discardButton');
discardAudioButton.setAttribute('onclick', 'recordReset()')



let chunks = []; // will be used later to record audio
let mediaRecorder = null; // will be used later to record audio
let audioBlob = null; // the blob that will hold the recorded audio


function mediaRecorderDataAvailable(e) {
  chunks.push(e.data);
}

function mediaRecorderStop() {
  // check if there are any previous recordings and remove them
  if (recordedAudioContainer.firstElementChild.tagName === 'AUDIO') {
    recordedAudioContainer.firstElementChild.remove();
  }
  const audioElm = document.createElement('audio');
  audioElm.setAttribute('controls', ''); // add controls
  audioBlob = new Blob(chunks, { type: 'audio/mp3' });
  const audioURL = window.URL.createObjectURL(audioBlob);
  audioElm.src = audioURL;
  // show audio
  recordedAudioContainer.insertBefore(audioElm, recordedAudioContainer.firstElementChild);
  recordedAudioContainer.classList.add('d-flex');
  recordedAudioContainer.classList.remove('d-none');
  // reset to default
  mediaRecorder = null;
  chunks = [];
}

function record() {
  /* this seems to not be working, maybe we can find a way to update this */
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Your browser does not support recording! We would still love to hear from you, come by and see us to tell your story');
    return;
  }

  // browser supports getUserMedia
  // change image in button
  startCountDown = true;//begin timer countdown
  recordButtonImage.src = `/images/${mediaRecorder && mediaRecorder.state === 'recording' ? 'microphone' : 'stop'}.png`;
  if (!mediaRecorder) {
    // start recording
    navigator.mediaDevices.getUserMedia({
      audio: true,
    })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        mediaRecorder.ondataavailable = mediaRecorderDataAvailable;
        mediaRecorder.onstop = mediaRecorderStop;
        /* this doesn't seem to be working, need to find way to stop recording when time expires. */
        if (time < 0) {
          clearInterval(countdown);
          mediaRecorder.stop();
        }
      })
      .catch((err) => {
        alert(`The following error occurred: ${err}`);
        // change image in button
        recordButtonImage.src = '/images/microphone.png';
      });
  } else {
    // stop recording
    mediaRecorder.stop();
    startCountDown = false;// stop countdown
    countDownTimer.innerHTML = '';//make the counter disappear
    time = 15 * 60;
  }
}

/* line that calls recording to start when user clicks microphone jpg */
recordButton.addEventListener('click', record);

/* variables for setting time limit */
const startingMinutes = 15; //set this variable for desired time limit
let time = startingMinutes * 60;

/* grabbing html element */
const countDownTimer = document.getElementById('countDownTimer');
setInterval(countdown, 1000);
let startCountDown = false;

function countdown() {
  if (startCountDown) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    countDownTimer.innerHTML = `${minutes}: ${seconds}`
    time--;
    time = time < 0 ? 0 : time;
  }
}

function resetRecording() {
  if (recordedAudioContainer.firstElementChild.tagName === 'AUDIO') {
    recordedAudioContainer.firstElementChild.remove();
    // hide recordedAudioContainer
    recordedAudioContainer.classList.add('d-none');
    recordedAudioContainer.classList.remove('d-flex');
  }
  audioBlob = null;
}

function playRecording(e) {
  let button = e.target;
  if (button.tagName === 'IMG') {
    // get parent button
    button = button.parentElement;
  }
  const audio = button.previousElementSibling;
  if (audio && audio.tagName === 'AUDIO') {
    if (audio.paused) {
      audio.play();
      button.firstElementChild.src = 'images/pause.png';
    } else {
      audio.pause();
      button.firstElementChild.src = 'images/play2.png';
    }
  }
}

function createRecordingElement(file, i) {
  const recordingElement = document.createElement('div');
  let k = 0;
  if (k === 0) {
    recordingElement.classList.add("slider-item", 'active');
    k++;
  } else {
    recordingElement.classList.add("slider-item");
  }
  recordingElement.setAttribute('id', 'cont' + i)
  const audio = document.createElement('audio');
  //audio.classList.add('col-lg-2');
  audio.src = file;
  audio.onended = (e) => {
    e.target.nextElementSibling.firstElementChild.src = 'images/play2.png';

  };
  recordingElement.appendChild(audio);
  const playButton = document.createElement('button');
  playButton.setAttribute('id', 'aButton');
  playButton.classList.add('play-button', 'btn', 'shadow-sm', 'text-center');
  const playImage = document.createElement('img');
  playImage.src = '/images/play2.png';
  playImage.classList.add('img-fluid');
  playButton.appendChild(playImage);

  playButton.addEventListener('click', playRecording);
  recordingElement.appendChild(playButton);
  return recordingElement;
}



function saveRecording() {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.mp3');
  fetch('/record', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then(() => {
      alert('Your recording is saved');
      window.location.assign('/saved.html');
    })
    .catch((err) => {
      //console.error(err);
      alert(err + 'Your recording is saved');//temp fix for mobile device
      window.location.assign('/saved.html');//replace with commented out code below
      //alert('An error occurred, please try again later');
      //resetRecording();
    });
}

saveAudioButton.addEventListener('click', saveRecording);

function discardRecording() {
  if (confirm('Are you sure you want to discard the recording?')) {
    // discard audio just recorded
    resetRecording();
  }
}

discardAudioButton.addEventListener('click', discardRecording);





