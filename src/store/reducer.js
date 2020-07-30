import * as actionTypes from './ActionTypes';

const initialState = {
  socket: {},
  player: null,
  currentBoardId: '',
  userBoards: [],
  opponent: {},
  alerts: [],
  errors: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SOCKET_UPDATE:
      return {
        ...state,
        socket: action.socket,
      };

    case actionTypes.PLAYER_UPDATE:
      return {
        ...state,
        player: action.player,
      };

    case actionTypes.OPPONENT_UPDATE:
      return {
        ...state,
        opponent: action.opponent,
      };

    case actionTypes.CURRENT_BOARD_UPDATE:
      return {
        ...state,
        currentBoardId: action.boardId,
      };

    case actionTypes.USER_BOARDS_UPDATE:
      return {
        ...state,
        userBoards: action.userBoards,
      };

    case actionTypes.SET_ALERT:
      return {
        ...state,
        alerts: [...state.alerts, action.msg],
      };

    case actionTypes.REMOVE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.id),
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        errors: [...state.errors, action.msg],
      };

    case actionTypes.REMOVE_ERROR:
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.id),
      };

    default:
      return state;
  }
};

export { reducer };
