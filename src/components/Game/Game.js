import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import './Game.scss';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as actionCreators from '../../store/ActionCreators';
import { v4 as uuidv4 } from 'uuid';

const Game = ({
  player: { id },
  currentBoardId,
  history,
  socket,
  setAlert,
  alerts,
  setError,
}) => {
  const [opponentSeat, setOpponentSeat] = useState(false);
  const [myTurn, setMyTurn] = useState(false);
  const [player1, setPlayer1] = useState({
    id: '',
    name: 'Player 1',
  });
  const [player2, setPlayer2] = useState({
    id: '',
    name: 'Player 2',
  });
  const [mySeat, setMySeat] = useState(0);
  const [endGame, setEndGame] = useState(false);
  const [matrix, setMatrix] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const acks = {
    400: 'Bad request, you have issued an illegal request',
    500: 'Internal server error',
    404: 'Room not found',
  };

  const establishConnection = useCallback(async () => {
    try {
      await setAlert('Welcome to the GAME!');
      await socket.emit('join_room', currentBoardId, async responseCode => {
        if (Number(responseCode) !== 200) {
          await setError(`Error code : ${responseCode}: ${acks[responseCode]}`);
          history.goBack();
        }
      });

      socket.on('joined', async data => {
        setAlert(
          `Player ${data.player.name} joined the game at seat no: ${data.seat}`
        );

        if (data.player.id === Number(id)) {
          await setMySeat(data.seat);
        }

        if (data.seat === 1) {
          await setPlayer1({
            name: data.player.name,
            id: data.player.id,
          });
          await setMyTurn(true);
        } else if (data.seat === 2) {
          await setPlayer2({
            name: data.player.name,
            id: data.player.id,
          });
          await setOpponentSeat(true);
        }
      });

      socket.on('tie', async data => {
        await setAlert(`It is TIE, restart game to start new one!`);
      });

      socket.on('win', async data => {
        await setAlert(`Player: ${data.player.name} has won the game!`);
        await setEndGame(true);
      });

      socket.on('seat_left', async data => {
        await setAlert(`Player: ${data.player.name} has left his seat!`);
        await setMyTurn(false);
        if (data.player.id === Number(id)) {
          await setMySeat(0);
        }
        switch (data.seat) {
          case 1:
            await setPlayer1({
              name: '',
              id: '',
            });
            break;
          case 2:
            await setPlayer2({
              name: '',
              id: '',
            });
            break;
          default:
            break;
        }
        await setOpponentSeat(false);
      });

      socket.on('restarted', async data => {
        await setMatrix([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        await setAlert(`New Game Begining...!`);
        await setEndGame(false);
      });

      socket.on('left', async data => {
        await setAlert(`Player: ${data.player.name} has left the room`);
      });

      socket.on('marked', async data => {
        let newArr = [];
        for (let i = 0; i < 9; i++) {
          newArr[i] = data.matrix[i];
        }

        if (data.player.id === Number(id)) {
          await setMyTurn(false);
        } else {
          await setMyTurn(true);
        }

        await setMatrix(newArr);
        await setAlert(
          `Player: ${data.player.name}, with seat no: ${data.seat} has marked the tile!`
        );
      });
    } catch (error) {
      await setError(error.message);
    }
  }, []);

  useEffect(() => {
    establishConnection();
  }, [establishConnection]);

  const markTile = async (indexOfTile, hasSeat) => {
    hasSeat !== 0 &&
      (await socket.emit(
        'mark_tile',
        currentBoardId,
        indexOfTile,
        async responseCode => {
          if (Number(responseCode) !== 200) {
            await setError(
              `Error code : ${responseCode}: ${acks[responseCode]}`
            );
          }
        }
      ));
  };

  const leaveRoom = async () => {
    mySeat !== 0 && (await leaveSeat());

    await socket.emit('leave_room', currentBoardId, async responseCode => {
      console.log(`Ack: ${responseCode}, Room left`);
      if (Number(responseCode) !== 200) {
        await setError(`Error code : ${responseCode}: ${acks[responseCode]}`);
      } else {
        await history.goBack();
      }
    });
  };

  const leaveSeat = async () => {
    await socket.emit(
      'leave_seat',
      currentBoardId,
      mySeat,
      async responseCode => {
        console.log(`Ack: ${responseCode}, Seat left`);
        if (Number(responseCode) !== 200) {
          await setError(`Error code : ${responseCode}: ${acks[responseCode]}`);
        } else {
          await restartGame();
        }
      }
    );
  };

  const restartGame = async () => {
    await socket.emit('restart', currentBoardId, async responseCode => {
      console.log(`Ack: ${responseCode}, Game restarted`);
      if (Number(responseCode) !== 200) {
        await setError(`Error code : ${responseCode}: ${acks[responseCode]}`);
      }
    });
  };

  return (
    <div className="main">
      <h1>GAME</h1>
      <div className="players">
        <span>{player1.name}</span>
        <span>{player2.name}</span>
      </div>

      <div className="game">
        {matrix.map((field, index) => {
          let val = '';
          if (field === 1) {
            val = 'X';
          }
          if (field === 2) {
            val = 'O';
          }
          return (
            <div
              className="field"
              onClick={e =>
                field === 0 && myTurn && !endGame && markTile(index, mySeat)
              }
              key={index}
            >
              {val}
            </div>
          );
        })}
      </div>
      <div className="messages">
        {alerts.map(alert => (
          <div className="message" key={alert.id}>
            {alert.text}
          </div>
        ))}
      </div>
      <div className="buttons">
        <button onClick={e => leaveRoom()}>Leave room</button>
        <button onClick={e => leaveSeat()}>Leave seat</button>
        <button onClick={e => restartGame()}>Restart</button>
      </div>
    </div>
  );
};

Game.propTypes = {
  player: PropTypes.object.isRequired,
  currentBoardId: PropTypes.string.isRequired,
  setAlert: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired,
  alerts: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  player: state.player,
  currentBoardId: state.currentBoardId,
  socket: state.socket,
  alerts: state.alerts,
  mySeat: state.mySeat,
});

const mapDispatchToProps = dispatch => ({
  setAlert: message => {
    const msgId = uuidv4();
    dispatch(actionCreators.setAlert(message, msgId));
    setTimeout(() => dispatch(actionCreators.removeAlert(msgId)), 5000);
  },
  setError: message => {
    const msgId = uuidv4();
    dispatch(actionCreators.setError(message, msgId));
    setTimeout(() => dispatch(actionCreators.removeError(msgId)), 5000);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Game));
