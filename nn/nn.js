const sigmoid = {
  fn: x => 1 / (1 + Math.exp(-x)),
  dfn: y => y * (1 - y),
};

const tanh = {
  fn: x => Math.tanh(x),
  dfn: y => 1 - (y * y),
};

class Layer {
  constructor(biases, weights) {
    this.biases = biases;
    this.weights = weights;
  }

  toJSON() {
    return {
      biases: this.biases.toJSON(),
      weights: this.weights.toJSON(),
    };
  }

  static deserialize(data) {
    return new Layer(
      Matrix.deserialize(data.biases),
      Matrix.deserialize(data.weights),
    );
  }
}

class NeuralNetwork {
  constructor(inputsSize, layers = [], learningRate = 0.1) {
    this.inputsSize = inputsSize;
    this.layers = layers;
    this.learningRate = learningRate;
    this.activationFn = sigmoid;
  }

  addLayer(size) {
    const previousLayerSize = this.layers.length > 0
      ? this.layers[this.layers.length - 1].biases.rows
      : this.inputsSize;

    const biases = new Matrix(size, 1).fillRandom();
    const weights = new Matrix(size, previousLayerSize).fillRandom();

    this.layers.push(new Layer(biases, weights));
  }

  predict(inputs) {
    const log = this._predict(inputs);

    return log[log.length - 1].toVectorArray();
  }

  _predict(inputs) {
    if (inputs.length !== this.inputsSize) {
      throw new Error();
    }

    const log = new Array(this.layers.length + 1);

    let a = Matrix.fromVectorArray(inputs);
    log[0] = a;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      a = Matrix.multiply(layer.weights, a);
      a.add(layer.biases);
      a.map(this.activationFn.fn);

      log[i + 1] = a;
    }

    return log;
  }

  train(inputs, targets) {
    const log = this._predict(inputs);
    const result = log[log.length - 1];

    if (targets.length != result.rows) {
      throw new Error();
    }

    let errors = Matrix.fromVectorArray(targets);
    errors.subtract(result);

    for (let i = this.layers.length - 1; i >= 0; i--) {
      const currentLayer = this.layers[i];
      const currentLayerResult = log[i + 1];
      const previousLayerResult = log[i];

      const gradients = currentLayerResult.copy();
      gradients.map(this.activationFn.dfn);
      gradients.multiplyHadamard(errors);
      gradients.multiplyScalar(this.learningRate);

      errors = Matrix.multiply(
        Matrix.transpose(currentLayer.weights),
        errors
      );
  
      const previousLayerResultT = Matrix.transpose(previousLayerResult);
      const deltas = Matrix.multiply(gradients, previousLayerResultT);

      currentLayer.weights.add(deltas);
      currentLayer.biases.add(gradients);
    }
  }

  toJSON() {
    return {
      inputsSize: this.inputsSize,
      layers: this.layers.map(l => l.toJSON()),
      learningRate: this.learningRate,
    };
  }

  static deserialize(data) {
    const nn = new NeuralNetwork(
      data.inputsSize,
      data.layers.map(l => Layer.deserialize(l)),
      data.learningRate,
    );
    return nn;
  }
}
