const React = require('react');
const { Box, Text, Color } = require('ink');
const { useSelector, useDispatch } = require('react-redux');
const { WIDTH, HEIGHT } = require('./constants');
const clear = require('clear');
const _ = require('lodash');

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const { Fragment, useEffect, useState } = React;

function App () {
  const score = useSelector((state) => state.score);
  const lives = useSelector((state) => state.lives);

  const status = useSelector((state) => state.status);
  const paddle = useSelector((state) => state.paddle);
  const ball = useSelector((state) => state.ball);
  const activeEffects = useSelector((state) => state.activeEffects);
  const spawnedEffect = useSelector((state) => state.spawnedEffect);

  const dispatch = useDispatch();

  const [ width, setWidth ] = useState(0);
  const [ height, setHeight ] = useState(0);

  useEffect(() => {
    setWidth(process.stdout.columns);
    setHeight(process.stdout.rows);

    const onResize = () => {
      setWidth(process.stdout.columns);
      setHeight(process.stdout.rows);
    };

    const onKeyPress = (str, key) => {
      switch (key.name) {
        case 'c':
          if (key.ctrl) {
            process.exit();
          }
          break;
        case 'space':
          dispatch({ type: '@@key/SPACE' });
          break;
        case 'left':
          dispatch({ type: '@@key/LEFT' });
          break;
        case 'right':
          dispatch({ type: '@@key/RIGHT' });
          break;
      }
    };

    const i = setInterval(() => dispatch({ type: '@@game/FRAME' }), 30);
    process.stdout.on('resize', onResize);
    process.stdin.on('keypress', onKeyPress);

    return () => {
      clearInterval(i);
      process.stdout.removeListener('resize', onResize);
      process.stdin.removeListener('keypress', onKeyPress);
    };
  }, []);

  const hasRotateGame = activeEffects.find(
    (effect) => effect.id === 'rotate_game'
  );

  let map = [];

  if (status === 'waiting') {
    _.set(map, [ HEIGHT - 2, paddle.x + 2 ], '@');
  } else if (status === 'active') {
    _.set(map, [ Math.round(ball.y), Math.round(ball.x) ], '@');
  }

  for (let i = 0; i < paddle.width; i++) {
    _.set(map, [ HEIGHT - 1, paddle.x + i ], hasRotateGame ? '▄' : '▀');
  }

  const bricks = useSelector((state) => state.bricks);
  bricks.forEach((brick) => {
    for (let y = brick.y; y < brick.y + brick.height; y++) {
      for (let x = brick.x; x < brick.x + brick.width; x++) {
        if (brick.status !== 'hit') {
          _.set(
            map,
            [ y, x ],
            <Color key={`brick-${x}-${y}`} dim>
              █
            </Color>
          );
        }
      }
    }
  });

  if (spawnedEffect) {
    _.set(
      map,
      [ HEIGHT - 1, spawnedEffect.x ],
      <Color yellow>
        <Text bold>?</Text>
      </Color>
    );
  }

  const now = Date.now();

  return (
    <Box flexDirection="row" height={height - 1}>
      <Box width={WIDTH + 2} flexDirection="column">
        <Text>{Array.from(new Array(WIDTH + 2)).map(() => '█')}</Text>
        {Array.from(new Array(HEIGHT)).map((__, row) => (
          <Text key={row}>
            █{Array.from(new Array(WIDTH)).map(
              (__, cell) =>
                hasRotateGame
                  ? _.get(map, [ HEIGHT - 1 - row, WIDTH - 1 - cell ], ' ')
                  : _.get(map, [ row, cell ], ' ')
            )}█
          </Text>
        ))}
        <Text>{Array.from(new Array(WIDTH + 2)).map(() => '█')}</Text>
      </Box>
      <Box flex={1} flexDirection="column" margin={2}>
        <Text>Score: {score}</Text>
        <Text>Lives: {lives}</Text>
        <Box marginTop={1} flexDirection="column">
          {activeEffects.map((effect) => {
            const durationLeft =
              effect.duration === Infinity
                ? null
                : effect.duration - (now - effect.time);
            const percent =
              effect.duration === Infinity
                ? 18
                : Math.floor(18 * (durationLeft / effect.duration));
            const [ ...chars ] = effect.title;
            return (
              <Box flexDirection="row">
                {Array.from(new Array(18)).map((__, i) => (
                  <Color
                    bgGreen={effect.positive && i <= percent}
                    black={effect.positive && i <= percent}
                    bgRed={!effect.positive && i <= percent}
                  >
                    {chars[i] || ' '}
                  </Color>
                ))}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

module.exports = App;
