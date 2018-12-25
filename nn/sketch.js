let nn;
const trainCount = 60000;
const testCount = 10000;
const trainImageWidth = 28;
const trainImageHeight = 28;
const pixelSize = 10;
const trainImageSize = trainImageWidth * trainImageHeight;
let trainLabels, trainImages, testLabels, testImages, trainIndexes;
const STATE_LOADING = 'loading';
const STATE_TRAINING = 'training';
const STATE_TESTING = 'testing';
const STATE_CUSTOM_TESTING = 'custom-testing';
let state = STATE_LOADING;

function getTrainImage(n) {
  const start = n * trainImageSize;
  const end = start + trainImageSize;
  return trainImages.slice(start, end);
}

function getTestImage(n) {
  const start = n * trainImageSize;
  const end = start + trainImageSize;
  return testImages.slice(start, end);
}

function setup() {
  loadNN();

  loadBytes('train-labels-idx1-ubyte', ({ bytes }) => {
    trainLabels = bytes.slice(8);
  });

  loadBytes('t10k-labels-idx1-ubyte', ({ bytes }) => {
    testLabels = bytes.slice(8);
  });

  loadBytes('train-images-idx3-ubyte', ({ bytes }) => {
    trainImages = Float32Array.from(bytes.slice(16), v => v / 255);
  });

  loadBytes('t10k-images-idx3-ubyte', ({ bytes }) => {
    testImages = Float32Array.from(bytes.slice(16), v => v / 255);
  });

  trainIndexes = Array.from(new Array(trainCount), (v, i) => i);

  createCanvas(trainImageWidth * pixelSize, trainImageHeight * pixelSize);
}

function drawLoading() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  text('Loading...', width / 2, height / 2);

  if (trainLabels && trainImages && testLabels && testImages) {
    goToTraining();
  }
}

let trainingI = 0;
function goToTraining() {
  trainingI = 0;
  shuffle(trainIndexes, true);
  state = STATE_TRAINING;
}
function drawTraining() {
  background(0);

  let image, label;

  for (let i = 0; i < 500; i++) {
    const ii = trainIndexes[trainingI];
    image = getTrainImage(ii);
    label = trainLabels[ii];

    const targets = [
      label === 0 ? 1 : 0,
      label === 1 ? 1 : 0,
      label === 2 ? 1 : 0,
      label === 3 ? 1 : 0,
      label === 4 ? 1 : 0,
      label === 5 ? 1 : 0,
      label === 6 ? 1 : 0,
      label === 7 ? 1 : 0,
      label === 8 ? 1 : 0,
      label === 9 ? 1 : 0,
    ];

    nn.train(image, targets);

    trainingI++;
  }

  for (let w = 0; w < trainImageWidth; w++) {
    for (let h = 0; h < trainImageHeight; h++) {
      fill(image[w + h * trainImageWidth] * 255);
      noStroke();
      rect(w * pixelSize, h * pixelSize, pixelSize, pixelSize);
    }
  }

  fill(255);
  textAlign(LEFT, TOP);
  text(`Training ${Math.round(trainingI / trainCount * 100)}%`, 20, 20);

  if (trainingI === trainCount) {
    goToTesting();
  }
}

let userImage = new Float32Array(trainImageSize);

function doubleClicked() {
  if (state === STATE_CUSTOM_TESTING) {
    userImage = new Float32Array(trainImageSize);
  } else if (state == STATE_TRAINING) {
    goToCustomTesting();
  }
}

function updateUserImage(x, y, v) {
  const i = x + y * trainImageWidth;
  if (i >= 0 && i < userImage.length) {
    userImage[i] += v;
    if (userImage[i] > 1) {
      userImage[i] = 1;
    }
  }
}

function mouseDragged() {
  if (state == STATE_CUSTOM_TESTING) {
    const x = Math.floor(mouseX / pixelSize);
    const y = Math.floor(mouseY / pixelSize);
  
    updateUserImage(x, y, 1);
    updateUserImage(x-1, y, 0.25);
    updateUserImage(x, y-1, 0.25);
    updateUserImage(x+1, y, 0.25);
    updateUserImage(x, y+1, 0.25);
  }
}

function goToCustomTesting() {
  userImage = new Float32Array(trainImageSize);
  state = STATE_CUSTOM_TESTING;
}
function drawCustomTesting() {
  for (let w = 0; w < trainImageWidth; w++) {
    for (let h = 0; h < trainImageHeight; h++) {
      fill(userImage[w + h * trainImageWidth] * 255);
      noStroke();
      rect(w * pixelSize, h * pixelSize, pixelSize, pixelSize);
    }
  }

  const prediction = nn.predict(userImage);

  const { maxIndex } = prediction.reduce((acc, v, i) => {
    if (v > acc.maxValue) {
      acc.maxValue = v;
      acc.maxIndex = i;
    }
    return acc;
  }, { maxValue: -1, maxIndex: -1 });

  fill(255);
  textAlign(LEFT, TOP);
  text(maxIndex, 20, 20);
  text(prediction.map((x, i) => `${i} = ${x.toFixed(2)}`).join('\n'), 20, 40);
}

function trainUserImage(label) {
  nn.train(userImage, [
    label === 0 ? 1 : 0,
    label === 1 ? 1 : 0,
    label === 2 ? 1 : 0,
    label === 3 ? 1 : 0,
    label === 4 ? 1 : 0,
    label === 5 ? 1 : 0,
    label === 6 ? 1 : 0,
    label === 7 ? 1 : 0,
    label === 8 ? 1 : 0,
    label === 9 ? 1 : 0,
  ]);
  userImage = new Float32Array(trainImageSize);
}

let testedTotal = 0;
let testedCorrect = 0;
let testI = 0;
function goToTesting() {
  testI = 0;
  testedTotal = 0;
  testedCorrect = 0;
  state = STATE_TESTING;
}
function drawTesting() {
  let result;
  let image;
  for (let i = 0; i < 1; i++) {
    image = getTestImage(testI);
    result = nn.predict(image);
    const { maxIndex } = result.reduce((acc, v, i) => {
      if (v > acc.maxValue) {
        acc.maxValue = v;
        acc.maxIndex = i;
      }
      return acc;
    }, { maxValue: -1, maxIndex: -1 });
    if (maxIndex === testLabels[testI]) {
      testedCorrect++;
    }
    testedTotal++;
    testI++;
  }

  background(0);

  for (let w = 0; w < trainImageWidth; w++) {
    for (let h = 0; h < trainImageHeight; h++) {
      fill(image[w + h * trainImageWidth] * 255);
      noStroke();
      rect(w * pixelSize, h * pixelSize, pixelSize, pixelSize);
    }
  }

  fill(255);
  textAlign(LEFT, TOP);
  text(`Rate: ${Math.round(testedCorrect / testedTotal * 100)}% = ${testedCorrect}/${testedTotal}`, 20, 20);
  text(result.map(v => v.toFixed(2)).join(' '), 20, 40);

  if (testI === testCount) {
    goToCustomTesting();
  }
}

function draw() {
  if (state === STATE_LOADING) {
    drawLoading();
  } else if (state === STATE_TRAINING) {
    drawTraining();
  } else if (state === STATE_TESTING) {
    drawTesting();
  } else if (state === STATE_CUSTOM_TESTING) {
    drawCustomTesting();
  }
}

function saveNN() {
  localStorage.setItem('nn', JSON.stringify(nn));
}

function loadNN() {
  const item = localStorage.getItem('nn');
  if (item) {
    nn = NeuralNetwork.deserialize(JSON.parse(item));
  } else {
    nn = new NeuralNetwork(trainImageSize);
    nn.learningRate = 0.5;
    nn.addLayer(16);
    nn.addLayer(10);
  }
}

function resetNN() {
  localStorage.removeItem('nn');
  loadNN();
}
