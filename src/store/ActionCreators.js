import * as actionTypes from './ActionTypes';

export const socketUpdate = socket => {
  return {
    type: actionTypes.SOCKET_UPDATE,
    socket: socket,
  };
};

export const updatePlayer = playerData => {
  return {
    type: actionTypes.PLAYER_UPDATE,
    player: playerData,
  };
};

export const updateMySeat = seatNo => {
  return {
    type: actionTypes.MY_SEAT_UPDATE,
    mySeat: seatNo,
  };
};

export const setAlert = (message, id) => {
  return {
    type: actionTypes.SET_ALERT,
    msg: {
      text: message,
      id: id,
    },
  };
};

export const removeAlert = idOfAlert => {
  return {
    type: actionTypes.REMOVE_ALERT,
    id: idOfAlert,
  };
};

export const setError = (message, id) => {
  return {
    type: actionTypes.SET_ERROR,
    msg: {
      text: message,
      id: id,
    },
  };
};

export const removeError = idOfError => {
  return {
    type: actionTypes.REMOVE_ERROR,
    id: idOfError,
  };
};

export const updateOpponent = opponentData => {
  return {
    type: actionTypes.OPPONENT_UPDATE,
    opponent: opponentData,
  };
};

export const updateCurrentBoard = boardId => {
  return {
    type: actionTypes.CURRENT_BOARD_UPDATE,
    boardId: boardId,
  };
};

export const updateUserBoards = boards => {
  return {
    type: actionTypes.USER_BOARDS_UPDATE,
    userBoards: boards,
  };
};
