import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import './Board.scss';
import { connect } from 'react-redux';
import axios from 'axios';
import io from 'socket.io-client';
import { Communicators } from '../../Communicators';
import * as actionCreators from '../../store/ActionCreators';
import { Link, withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Board = ({
  player: { name, id },
  updateUserBoards,
  userBoards,
  updateCurrentBoard,
  socketUpdate,
  updateMySeat,
  history,
  socket,
  setError,
}) => {
  const getUserBoards = useCallback(async () => {
    try {
      Object.keys(socket).length === 0 &&
        (await socketUpdate(io(`${Communicators.APIurl}/?id=${id}`)));
      let boards = await axios.post(`${Communicators.APIurl}/boards`, {
        apikey: id,
      });
      await updateCurrentBoard('');
      await updateMySeat(0);
      await updateUserBoards(boards.data);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  useEffect(() => {
    getUserBoards();
  }, [getUserBoards]);

  const [enteredId, updateEnteredId] = useState('');

  const createBoard = async () => {
    try {
      await axios.post(`${Communicators.APIurl}/create_board`, {
        apikey: id,
      });

      let boards = await axios.post(`${Communicators.APIurl}/boards`, {
        apikey: id,
      });

      await updateUserBoards(boards.data);
    } catch (error) {
      setError(error.message);
    }
  };

  const joinRoom = async bId => {
    try {
      await updateCurrentBoard(bId);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="boards">
      <h1>User : {name}</h1>
      <button onClick={e => createBoard()}>Create board</button>
      <br />
      <input
        type="text"
        value={enteredId}
        onChange={e => updateEnteredId(e.target.value)}
        placeholder="Enter existing board ID"
      />
      <button
        onClick={e => {
          joinRoom(enteredId);
          history.push('/game');
        }}
      >
        Join room with ID
      </button>
      {!userBoards.length ? (
        <div className="alert">User did not create any board</div>
      ) : (
        <div className="user-boards">
          <h3>User Boards</h3>
          {userBoards.map(board => (
            <div key={board.id} className="board">
              <span>Id: {board.id}</span>
              <span>Players: {board.players}/2</span>
              <Link to="/game" onClick={e => joinRoom(board.id)}>
                Join room
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Board.propTypes = {
  player: PropTypes.object.isRequired,
  updateUserBoards: PropTypes.func.isRequired,
  userBoards: PropTypes.array.isRequired,
  updateCurrentBoard: PropTypes.func.isRequired,
  socketUpdate: PropTypes.func.isRequired,
  updateMySeat: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  player: state.player,
  userBoards: state.userBoards,
  socket: state.socket,
});

const mapDispatchToProps = dispatch => ({
  updateUserBoards: boards => dispatch(actionCreators.updateUserBoards(boards)),
  updateCurrentBoard: boardId =>
    dispatch(actionCreators.updateCurrentBoard(boardId)),
  socketUpdate: socket => dispatch(actionCreators.socketUpdate(socket)),
  updateMySeat: seatNo => dispatch(actionCreators.updateMySeat(seatNo)),
  setError: message => {
    const msgId = uuidv4();
    dispatch(actionCreators.setError(message, msgId));
    setTimeout(() => dispatch(actionCreators.removeError(msgId)), 5000);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Board));
