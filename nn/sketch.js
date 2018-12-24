const trainingData = [
  [[1, 1], [0]],
  [[1, 0], [1]],
  [[0, 1], [1]],
  [[0, 0], [0]],
]

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

function setup() {
  loadNN();

  loadBytes('train-labels-idx1-ubyte', ({ bytes }) => {
    const prefix = 8;
    trainLabels = bytes.slice(prefix);
  });

  loadBytes('t10k-labels-idx1-ubyte', ({ bytes }) => {
    const prefix = 8;
    testLabels = bytes.slice(prefix);
  });

  loadBytes('train-images-idx3-ubyte', ({ bytes }) => {
    const prefix = 16;
    const bytesArray = Array.from(bytes).slice(prefix);
    trainImages = Array.from(new Array(trainCount), (v, i) => {
      const start = i * trainImageSize;
      const end = start + trainImageSize;
      return bytesArray.slice(start, end);
    });
  });

  loadBytes('t10k-images-idx3-ubyte', ({ bytes }) => {
    const prefix = 16;
    const bytesArray = Array.from(bytes).slice(prefix);
    testImages = Array.from(new Array(testCount), (v, i) => {
      const start = i * trainImageSize;
      const end = start + trainImageSize;
      return bytesArray.slice(start, end);
    });
  });

  trainIndexes = Array.from(new Array(trainCount), (v, i) => i);

  createCanvas(trainImageWidth * pixelSize, trainImageHeight * pixelSize);
  frameRate(120);
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
    image = trainImages[ii];
    label = trainLabels[ii];

    const inputs = image;
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

    nn.train(inputs, targets);

    trainingI++;
  }

  for (let w = 0; w < trainImageWidth; w++) {
    for (let h = 0; h < trainImageHeight; h++) {
      fill(image[w + h * trainImageWidth]);
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

let userImage = new Uint8Array(784).fill(0);

function doubleClicked() {
  if (state === STATE_CUSTOM_TESTING) {
    userImage = new Uint8Array(784).fill(0);
  } else if (state == STATE_TRAINING) {
    goToCustomTesting();
  }
}

function mouseDragged() {
  if (state == STATE_CUSTOM_TESTING) {
    const w = Math.floor(mouseX / pixelSize);
    const h = Math.floor(mouseY / pixelSize);
  
    userImage[w + h * trainImageWidth] = 255;
  }
}

function goToCustomTesting() {
  userImage = new Uint8Array(784).fill(0);
  state = STATE_CUSTOM_TESTING;
}
function drawCustomTesting() {
  for (let w = 0; w < trainImageWidth; w++) {
    for (let h = 0; h < trainImageHeight; h++) {
      fill(userImage[w + h * trainImageWidth]);
      noStroke();
      rect(w * pixelSize, h * pixelSize, pixelSize, pixelSize);
    }
  }

  const prediction = nn.predict(Array.from(userImage));
  fill(255);
  textAlign(LEFT, TOP);
  text(prediction.map((x, i) => `${i} = ${x.toFixed(2)}`).join('\n'), 20, 20);
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
    image = testImages[testI];
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
      fill(image[w + h * trainImageWidth]);
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
  localStorage.setItem('nn', JSON.stringify(nn.serialize()));
}

function loadNN() {
  const item = localStorage.getItem('nn');
  if (item) {
    nn = NeuralNetwork.deserialize(JSON.parse(item));
  } else {
    nn = new NeuralNetwork(trainImageSize);
    nn.addLayer(16);
    nn.addLayer(16);
    nn.addLayer(10);
  }
}

function resetNN() {
  localStorage.removeItem('nn');
  loadNN();
}
