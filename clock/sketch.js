function setup() {
  createCanvas(400, 400);
}

function draw() {
  const h = hour();
  const m = minute();
  const s = second();

  background(0);

  translate(width / 2, height / 2);

  noFill();
  strokeWeight(4);

  const hAngle = map(h % 12, 0, 12, -HALF_PI, PI + HALF_PI);
  const mAngle = map(m, 0, 60, -HALF_PI, PI + HALF_PI);
  const sAngle = map(s, 0, 60, -HALF_PI, PI + HALF_PI);

  stroke(255, 0, 0);
  arc(0, 0, 200, 200, -HALF_PI, hAngle);
  push();
  rotate(hAngle + HALF_PI);
  line(0, 0, 0, -50);
	pop();
  
  stroke(0, 255, 0);
  arc(0, 0, 220, 220, -HALF_PI, mAngle);
  push();
  rotate(mAngle + HALF_PI);
  line(0, 0, 0, -60);
	pop();
  
  stroke(0, 0, 255);
  arc(0, 0, 240, 240, -HALF_PI, sAngle);
  push();
  rotate(sAngle + HALF_PI);
  line(0, 0, 0, -70);
	pop();

  stroke(255);
  point(0, 0);
}
