const array = [];
let c = 0;
let limit;
let w;
let items = 60;
let fr = 60;
let speedOpsPerSec = fr * 1;


function setup() {
  createCanvas(400, 200);

  for (let i = 0; i < items; i++) {
    array.push(random(1, height));
  }

  w = width / array.length;
  limit = array.length;

  frameRate(fr);
}

function draw() {
  background(0);
  translate(0, height);

  strokeWeight(w / 2);

  for (let i = 0; i < items; i++) {
    if (i == c) {
      stroke(255, 0, 0);
    } else if (i == c + 1) {
      stroke(0, 0, 255);
    } else if (i >= limit) {
      stroke(0, 255, 0);
    } else {
      stroke(255);
    }

    line(i * w, 0, i * w, -array[i]);
  }

  for (let i = 0; i < (speedOpsPerSec / fr); i++) {
    if (limit == 0) {
      return;
    }

    if (array[c] >= array[c + 1]) {
      let v = array.splice(c, 1)[0];
      array.splice(c + 1, 0, v);
      c++;
    } else {
      c++;
    }

    if (c + 1 >= limit) {
      c = 0;
      limit--;
      if (limit == 1) {
        limit = 0;
        console.log(array)
        c = -2;
      }
      return;
    }
  }
}
