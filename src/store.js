const { createStore } = require('redux');
const { generateBricks } = require('./bricks');
const {
  effects,
  applyEffect,
  applyEffectEnd,
  spawnEffects
} = require('./effects');
const { movePaddle } = require('./paddle');
const { calculateCollisions } = require('./ball');
const { checkGameStatus } = require('./status');
const { SPEED, WIDTH, HEIGHT, COLLISION_STEPS } = require('./constants');

const defaultState = {
  score: 0,
  lives: 3,
  status: 'waiting',
  ball: { x: 0, y: 0, vx: 0, vy: 0, speed: SPEED },
  paddle: {
    x: Math.floor(Math.random() * (WIDTH - 6)),
    width: 5,
    direction: null
  },
  bricks: generateBricks(),
  lastEffectSpawnTime: null,
  spawnedEffect: null,
  activeEffects: []
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case '@@key/LEFT':
      return {
        ...state,
        paddle: {
          ...state.paddle,
          direction: 'left'
        }
      };
    case '@@key/RIGHT':
      return {
        ...state,
        paddle: {
          ...state.paddle,
          direction: 'right'
        }
      };
    case '@@key/SPACE':
      return state.status === 'gameover'
        ? defaultState
        : state.status === 'waiting'
          ? {
              ...state,
              status: 'active',
              ball: {
                ...state.ball,
                y: HEIGHT - 2,
                x: state.paddle.x + 2,
                vy: -state.ball.speed,
                vx: 0
              }
            }
          : state;
    case '@@game/FRAME':
      let newState = state;

      newState = movePaddle(newState);

      for (let i = 0; i < COLLISION_STEPS; i++) {
        newState = calculateCollisions(newState);
      }

      newState = spawnEffects(newState);
      newState = checkGameStatus(newState);

      return newState;
    default:
      return state;
  }
};

module.exports = createStore(reducer);
