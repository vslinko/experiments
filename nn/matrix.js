function vectorToMatrix(vec) {
  return vec.map(v => [v]);
}

function matrixToVector(matrix) {
  return matrix.map(([v]) => v);
}

function matrixTranspose(a) {
  const b = new Array(a[0].length);

  for (let i = 0; i < a[0].length; i++) {
    b[i] = new Array(a.length);
    for (let j = 0; j < a.length; j++) {
      b[i][j] = a[j][i];
    }
  }

  return b;
}

function matrixMap(a, fn) {
  const b = new Array(a.length);

  for (let i = 0; i < a.length; i++) {
    b[i] = new Array(a[i].length);
    for (let j = 0; j < a[i].length; j++) {
      b[i][j] = fn(a[i][j]);
    }
  }

  return b;
}

function matrixMultiplyScalar(a, b) {
  const c = new Array(a.length);

  for (let i = 0; i < a.length; i++) {
    c[i] = new Array(a[i].length);
    for (let j = 0; j < a[i].length; j++) {
      c[i][j] = a[i][j] * b;
    }
  }

  return c;
}

function matrixMultiplyHadamard(a, b) {
  if (a.length !== b.length) {
    throw new Error();
  }
  if (a[0].length !== b[0].length) {
    throw new Error();
  }

  const c = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    c[i] = new Array(a[i].length);
    for (let j = 0; j < a[i].length; j++) {
      c[i][j] = a[i][j] * b[i][j];
    }
  }

  return c;
}

function matrixMultiply(a, b) {
  if (a[0].length !== b.length) {
    throw new Error();
  }

  const n = a.length;
  const m = a[0].length;
  const p = b[0].length;

  const c = new Array(n);

  for (let i = 0; i < n; i++) {
    c[i] = new Array(p);
    for (let j = 0; j < p; j++) {
      c[i][j] = 0;
      for (let k = 0; k < m; k++) {
        c[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return c;
}

function matrixSubtract(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error();
  }

  const c = new Array(a.length);

  for (let i = 0; i < a.length; i++) {
    c[i] = new Array(a[i].length);
    for (let j = 0; j < a[i].length; j++) {
      c[i][j] = a[i][j] - b[i][j];
    }
  }

  return c;
}

function matrixAdd(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error();
  }

  const c = new Array(a.length);

  for (let i = 0; i < a.length; i++) {
    c[i] = new Array(a[i].length);
    for (let j = 0; j < a[i].length; j++) {
      c[i][j] = a[i][j] + b[i][j];
    }
  }

  return c;
}
