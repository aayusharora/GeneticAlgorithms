import 'babel-polyfill';
import * as tf from '@tensorflow/tfjs';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/constants';
import { Runner } from './game';
// import NNModel from '../ai/models/nn/NNModel';

let runner = null;
//initial setup for the game the  setup function is called when the dom gets loaded
function setup() {
  // Initialize the game Runner.
  runner = new Runner('.game', {
    T_REX_COUNT: 1,
    onReset: handleReset,
    onCrash: handleCrash,
    onRunning: handleRunning
  });
  // Set runner as a global variable if you need runtime debugging.
  window.runner = runner;
  // Initialize everything in the game and start the game.
  runner.init();
}

let firstTime = true; //variable which tells whether thethe game is being loaded for the first time i.e. not a reset



function handleReset({ tRexes }) {
  const tRex = tRexes[0]; //running this for single trex at a time
  //if the game is being started for the first time initiate the model and compile it to make it ready for training and predicting
  if (firstTime) {
    firstTime = false;
    tRex.model = tf.sequential();//creating a tensorflow sequential model
    // tRex.model.init();
    //adding the first hidden layer to the model using with 3 inputs ,
    //sigmoid activation function
    //and output of 6
    tRex.model.add(tf.layers.dense({
      inputShape:[3],
      activation:'sigmoid',
      units:6
    }))

    /* this is the second output layer with 6 inputs coming from the previous hidden layer
    activation is again sigmoid and output is given as 2 units 10 for not jump and 01 for jump*/
    tRex.model.add(tf.layers.dense({
      inputShape:[6],
      activation:'sigmoid',
      units:2
    }))

    /* compiling the model using meanSquaredError loss function and adam optimizer with a learning rate of 0.1 */
    tRex.model.compile({
      loss:'meanSquaredError',
      optimizer : tf.train.adam(0.1)
    })

    //object which will containn training data and appropriate labels
    tRex.training = {
      inputs: [],
      labels: []
    };
    
  } else {
    // Train the model before restarting.
    //log into console that model will now be trained
    console.info('Training');
    //convert the inputs and labels to tensor2d format and  then training the model
    tRex.model.fit(tf.tensor2d(tRex.training.inputs), tf.tensor2d(tRex.training.labels));
  }
}

/**
 * documentation
 * @param {object} tRex
 * @param {object} state
 * returns a promise resolved with an action
 */
function handleRunning({ tRex, state }) {
  return new Promise((resolve) => {
    if (!tRex.jumping) {
      //whenever the Trex is not jumping decide whether it needs to jump or not
      let action = 0;//variable for action 1 for jump 0 for not
      //call model.predict on the state vecotr after converting it to tensor2d object
      const prediction = tRex.model.predict(tf.tensor2d([convertStateToVector(state)]));

      //the predict function returns a tensor we get the data in a promise as result
      //and based don result decide the action
      prediction.data().then((result) => {
        // console.log(result);
        //converting prediction to action
        if (result[1] > result[0]) {
          //we want to jump
          action = 1;
          //set last jumping state to current state
          tRex.lastJumpingState = state;
        } else {
          //set running state to current state
          tRex.lastRunningState = state;
        }
        resolve(action);
      });
    } else {
      resolve(0);
    }
  });
}
/**
 * 
 * @param {object} trex 
 * handles the crash of a tRex before restarting the game
 * 
 */
function handleCrash({ tRex }) {
  let input = null;
  let label = null;
  //check if at the time of crash tRex was jumping or not
  if (tRex.jumping) {
    // Should not jump next time
    //convert state object to array
    input = convertStateToVector(tRex.lastJumpingState);
    label = [1, 0];
  } else {
    // Should jump next time
    //convert state object to array
    input = convertStateToVector(tRex.lastRunningState);
    label = [0, 1];
  }
  //push the new input to the training set
  tRex.training.inputs.push(input);
  //push the label to labels
  tRex.training.labels.push(label);
}

/**
 * 
 * @param {object} state
 * returns an array 
 * converts state to a feature scaled array
 */
function convertStateToVector(state) {
  if (state) {
    return [
      state.obstacleX / CANVAS_WIDTH,
      state.obstacleWidth / CANVAS_WIDTH,
      state.speed / 100
    ];
  }
  return [0, 0, 0];
}
//call setup on loading content
document.addEventListener('DOMContentLoaded', setup);
