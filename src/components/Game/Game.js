import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import './Game.scss';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as actionCreators from '../../store/ActionCreators';
import { v4 as uuidv4 } from 'uuid';

const Game = ({
  player: { id, name },
  currentBoardId,
  history,
  socket,
  updateMySeat,
  setAlert,
  alerts,
  setError,
}) => {
  const [opponentSeat, setOpponentSeat] = useState(false);
  const [myTurn, setMyTurn] = useState(false);
  const [matrix, setMatrix] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0]);

  const establishConnection = useCallback(async () => {
    try {
      await setAlert('Welcome to the GAME!');
      await socket.emit('join_room', currentBoardId, responseCode => {
        console.log(`Ack: ${responseCode}`);
      });

      socket.on('joined', async data => {
        setAlert(
          `Player ${data.player.name} joined the game at seat no: ${data.seat}`
        );

        if (data.seat === 1) {
          await updateMySeat(1);
          await setMyTurn(true);
        } else if (data.seat === 2) {
          await setOpponentSeat(true);
          if (data.player.id === Number(id)) {
            await updateMySeat(2);
          }
        }
      });

      socket.on('win', async data => {
        setAlert(`Player: ${data.player.name} has won the game!`);
      });

      socket.on('tie', async data => {
        setAlert(`It is TIE, restart game to start new one!`);
      });

      socket.on('seat_left', async data => {
        await setAlert(`Player: ${data.player.name} has left his seat!`);
      });

      socket.on('restarted', async data => {
        await setMatrix([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        setAlert(`New Game Begining...!`);
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

  const markTile = indexOfTile => {
    socket.emit('mark_tile', currentBoardId, indexOfTile, responseCode => {
      console.log(`Ack: ${responseCode}, Tile marked`);
    });
  };

  const leaveRoom = async () => {
    await socket.emit('leave_seat', currentBoardId, responseCode => {
      console.log(`Ack: ${responseCode}, Seat left`);
    });

    await socket.emit('leave_room', currentBoardId, responseCode => {
      console.log(`Ack: ${responseCode}, Room left`);
    });

    await history.goBack();
  };

  const leaveSeat = async () => {
    await socket.emit('leave_seat', currentBoardId, responseCode => {
      console.log(`Ack: ${responseCode}, Seat left`);
    });
  };

  const restartGame = async () => {
    await socket.emit('restart', currentBoardId, responseCode => {
      console.log(`Ack: ${responseCode}, Game restarted`);
    });
  };

  return (
    <div className="main">
      <h1>GAME</h1>
      <div className="players">
        <span>Player 1: {name}</span>
        <span>Player 2: {opponentSeat ? 'Player2' : 'No opponent'}</span>
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
              onClick={e => field === 0 && myTurn && markTile(index)}
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
  updateMySeat: PropTypes.func.isRequired,
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
});

const mapDispatchToProps = dispatch => ({
  updateMySeat: seatNo => dispatch(actionCreators.updateMySeat(seatNo)),
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
