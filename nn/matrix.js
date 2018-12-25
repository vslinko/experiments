class Matrix {
  constructor(rows, cols, data = new Float32Array(rows * cols)) {
    this.rows = rows;
    this.cols = cols;
    this.data = data;
  }

  static fromVectorArray(vector) {
    return new Matrix(vector.length, 1, Float32Array.from(vector));
  }

  static transpose(matrix) {
    const newMatrix = new Matrix(matrix.cols, matrix.rows);
  
    for (let m = 0; m < newMatrix.rows; m++) {
      for (let n = 0; n < newMatrix.cols; n++) {
        newMatrix.set(m, n, matrix.get(n, m));
      }
    }
  
    return newMatrix;
  }

  static multiply(a, b) {
    if (a.cols !== b.rows) {
      throw new Error();
    }

    const n = a.rows;
    const m = a.cols;
    const p = b.cols;

    const c = new Matrix(n, p);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < p; j++) {
        let v = 0;

        for (let k = 0; k < m; k++) {
          v += a.get(i, k) * b.get(k, j);
        }

        c.set(i, j, v);
      }
    }

    return c;
  }

  set(m, n, v) {
    const i = n + m * this.cols;
    this.data[i] = v;

    return this;
  }

  get(m, n) {
    const i = n + m * this.cols;

    return this.data[i];
  }

  fillRandom() {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = Math.random() * 2 - 1;
    }

    return this;
  }

  multiplyScalar(v) {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = this.data[i] * v;
    }

    return this;
  }

  multiplyHadamard(b) {
    if (this.rows !== b.rows || this.cols !== b.cols) {
      throw new Error();
    }
  
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = this.data[i] * b.data[i];
    }
  
    return this;
  }

  subtract(b) {
    if (this.rows !== b.rows || this.cols !== b.cols) {
      throw new Error();
    }
  
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = this.data[i] - b.data[i];
    }
  
    return this;
  }

  add(b) {
    if (this.rows !== b.rows || this.cols !== b.cols) {
      throw new Error();
    }

    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = this.data[i] + b.data[i];
    }
  
    return this;
  }

  map(fn) {
    this.data = this.data.map(fn);

    return this;
  }

  copy() {
    return new Matrix(this.rows, this.cols, Float32Array.from(this.data));
  }

  toVectorArray() {
    if (this.cols > 1) {
      throw new Error();
    }

    return Array.from(this.data);
  }

  toArray() {
    const a = new Array(this.rows);

    for (let m = 0; m < this.rows; m++) {
      a[m] = new Array(this.cols);

      for (let n = 0; n < this.cols; n++) {
        a[m][n] = this.get(m, n);
      }
    }

    return a;
  }

  toJSON() {
    return {
      rows: this.rows,
      cols: this.cols,
      data: Array.from(this.data),
    };
  }

  static deserialize(data) {
    return new Matrix(
      data.rows,
      data.cols,
      Float32Array.from(data.data),
    );
  }
}
