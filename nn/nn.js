const sigmoid = {
  fn: x => 1 / (1 + Math.exp(-x)),
  dfn: y => y * (1 - y),
};

const tanh = {
  fn: x => Math.tanh(x),
  dfn: y => 1 - (y * y),
};

class NeuralNetwork {
  constructor(inputsSize) {
    this.inputsSize = inputsSize;
    this.layers = [];
    this.learningRate = 0.1;
    this.activationFn = sigmoid;
  }

  addLayer(size) {
    const previousLayerSize = this.layers.length > 0
      ? this.layers[this.layers.length - 1].biases.length
      : this.inputsSize;

    const biases = [];
    const weights = [];

    for (let i = 0; i < size; i++) {
      biases.push([Math.random()]);
      const weightsRow = [];
      for (let j = 0; j < previousLayerSize; j++) {
        weightsRow.push(Math.random());
      }
      weights.push(weightsRow);
    }

    this.layers.push({ biases, weights });
  }

  predict(inputs) {
    const log = this._predict(inputs);

    return matrixToVector(log[log.length - 1]);
  }

  _predict(inputs) {
    if (inputs.length !== this.inputsSize) {
      throw new Error();
    }

    const log = new Array(this.layers.length + 1);

    let a = vectorToMatrix(inputs);
    log[0] = a;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      a = matrixMultiply(layer.weights, a);
      a = matrixAdd(a, layer.biases);
      a = matrixMap(a, this.activationFn.fn);

      log[i + 1] = a;
    }

    return log;
  }

  train(inputs, targets) {
    const log = this._predict(inputs);
    const result = log[log.length - 1];

    if (targets.length != result.length) {
      throw new Error();
    }

    let errors = matrixSubtract(vectorToMatrix(targets), vectorToMatrix(result));

    const newLayers = new Array(this.layers.length);

    for (let i = this.layers.length - 1; i >= 0; i--) {
      const currentLayer = this.layers[i];
      const currentLayerResult = log[i + 1];
      const previousLayerResult = log[i];

      let gradients = matrixMap(currentLayerResult, this.activationFn.dfn);
      gradients = matrixMultiplyHadamard(gradients, errors);
      gradients = matrixMultiplyScalar(gradients, this.learningRate);

      const previousLayerResultT = matrixTranspose(previousLayerResult);
      const deltas = matrixMultiply(gradients, previousLayerResultT);

      newLayers[i] = {
        weights: matrixAdd(currentLayer.weights, deltas),
        biases: matrixAdd(currentLayer.biases, gradients),
      };

      errors = matrixMultiply(
        matrixTranspose(currentLayer.weights),
        errors
      );
    }

    this.layers = newLayers;
  }

  serialize() {
    return {
      inputsSize: this.inputsSize,
      layers: this.layers,
      learningRate: this.learningRate,
    };
  }

  static deserialize(data) {
    const nn = new NeuralNetwork(0);
    nn.inputsSize = data.inputsSize;
    nn.layers = data.layers;
    nn.learningRate = data.learningRate;
    return nn;
  }
}
