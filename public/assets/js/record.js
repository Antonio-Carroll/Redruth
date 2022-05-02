/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
// initialize elements we'll use
const recordButton = document.getElementById('recordButton');
const recordButtonImage = recordButton.firstElementChild;
const recordedAudioContainer = document.getElementById('recordedAudioContainer');
const saveAudioButton = document.getElementById('saveButton');
const discardAudioButton = document.getElementById('discardButton');
const recordingsContainer = document.getElementById('recordings');


let chunks = []; // will be used later to record audio
let mediaRecorder = null; // will be used later to record audio
let audioBlob = null; // the blob that will hold the recorded audio
let urlArr = [];
urlPop();
console.log(urlArr);
function urlPop(){
  fetch('/url', {method : 'POST'})
  .then((object) => object.json())
  .then((object) => {
    if (object.success && object.filed) {
      for(i = 0; i < object.filed.length; i++){
          urlArr[i] = object.filed[i].Audio.url;
      }
    }
  })
  .catch((err) => console.error(err));
}
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
    alert('Your browser does not support recording!');
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
        if(time < 0){
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
    if(startCountDown){
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
      button.firstElementChild.src = 'images/play.png';
    }
  }
}

function createRecordingElement(file, i) {
  const recordingElement = document.createElement('div');
  recordingElement.classList.add('col-lg-2', 'col', 'recording', 'mt-3');
  recordingElement.setAttribute('id', 'cont' + i)
  const audio = document.createElement('audio');
  audio.src = file;
  audio.onended = (e) => {
    e.target.nextElementSibling.firstElementChild.src = 'images/play.png';
    
  };
  recordingElement.appendChild(audio);
  const playButton = document.createElement('button');
  playButton.setAttribute('id', 'aFile')
  playButton.classList.add('play-button', 'btn', 'border', 'shadow-sm', 'text-center', 'd-block', 'mx-auto');
  const playImage = document.createElement('img');
  playImage.src = '/images/play.png';
  playImage.classList.add('img-fluid');
  playButton.appendChild(playImage);

  playButton.addEventListener('click', playRecording);
  recordingElement.appendChild(playButton);
  return recordingElement;
}

function dbQuerry(){
  fetch('/saved', {method : 'POST'})
    .then((object) => object.json())
    
    .then((object) => {
      console.log(object.filed)
      if (object.success && object.filed) {
        for(i = 0; i < object.filed.length; i++){
            let recordingData = object.filed[i].adminData;
            const pr = document.createElement('p');
            const prnode = document.createTextNode("Project: " + recordingData.Project);
            pr.appendChild(prnode);
            const prelement = document.getElementById('cont' + i);
            prelement.appendChild(pr);
            const e = document.createElement('p');
            e.style.backgroundColor = "cyan";
            const node = document.createTextNode("Prompt: " + recordingData.Prompt);
            e.appendChild(node);
            const element = document.getElementById('cont' + i);
            element.appendChild(e);
            const ts = document.createElement('p');
            const tsnode = document.createTextNode("Timestamp: " + recordingData.TimeStamp);
            ts.appendChild(tsnode);
            const tselement = document.getElementById('cont' + i);
            tselement.appendChild(ts);
        }
      }
    })
  .catch((err) => console.error(err));
};
// fetch recordings
 function fetchRecordings() {
   
  fetch('/recordings')
    .then((response) => response.json())
    .then((response) => {
      if (response.success && response.files) {
        recordingsContainer.innerHTML = ''; // remove all children
        let i =0;
        response.files.forEach((file) => {
          console.log(file.substring(1, 14) /*+ " vs " + url[i].substring(9, 22)*/)
          console.log(urlArr[i].substring(8, 21));
          if(file.substring(1, 14) === urlArr[i].substring(8, 21)){
            console.log(file);
            const recordingElement = createRecordingElement(file, i);
            recordingsContainer.appendChild(recordingElement);
            i++
          }
        });
      }
    })
    
    .catch((err) => console.error(err));
    
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
      resetRecording();
      
      fetchRecordings();
      setTimeout(() => dbQuerry() , 100);
    })
    .catch((err) => {
      console.error(err);
      alert('An error occurred, please try again later');
      resetRecording();
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

fetchRecordings();
setTimeout(() => dbQuerry() , 100);


