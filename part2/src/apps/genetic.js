import 'babel-polyfill';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';
import { Runner } from '../game';
import GeneticModel from '../ai/models/genetic/GeneticModel';
import RandomModel from '../ai/models/random/RandomModel';

// const DINO_COUNT = 10;

let runner = null;

const rankList = [];
const geneticModel = new GeneticModel();

let firstTime = true;

function setup() {
  // Initialize the game Runner.
  runner = new Runner('.game', {
    DINO_COUNT:10,
    onReset: handleReset,
    onCrash: handleCrash,
    onRunning: handleRunning
  });
  // Set runner as a global variable if you need runtime debugging.
  window.runner = runner;
  // console.info(runner)
  // Initialize everything in the game and start the game.
  runner.init();
}


function handleReset(Dinos) {
  if (firstTime) {
    firstTime = false;
    // console.info("in here")
    // console.info(Dinos)
    Dinos.forEach((dino) => {
      // console.info("happened");
      dino.model = new RandomModel();
      dino.model.init();
    });

  }
  else {
    // Train the model before restarting.
    console.info('Training');
    const chromosomes = rankList.map((dino) => dino.model.getChromosome());
    // console.info(chromosomes)
    // Clear rankList
    rankList.splice(0);
    geneticModel.fit(chromosomes);
    Dinos.forEach((dino, i) => {
      dino.model.setChromosome(chromosomes[i]);
    });
  }
}

function handleRunning(dino, state) {
  let action = 0;
  if (!dino.jumping) {
    action = dino.model.predictSingle(convertStateToVector(state));
  }
  return action;
}

function handleCrash(dino) {
  // console.info("i was called")
  if (!rankList.includes(dino)) {
    rankList.unshift(dino);
  }
}

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

document.addEventListener('DOMContentLoaded', setup);
