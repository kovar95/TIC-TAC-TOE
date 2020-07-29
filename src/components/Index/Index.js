import React, { useState, useEffect } from 'react';
import './Index.scss';
import PropTypes from 'prop-types';
import { Communicators } from '../../Communicators';
import { connect } from 'react-redux';
import * as actionCreators from '../../store/ActionCreators';
import { withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Index = ({ updatePlayer, history, setError }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (window.sessionStorage.getItem('id')) {
      let existingPlayer = {
        name: window.sessionStorage.getItem('name'),
        id: window.sessionStorage.getItem('id'),
      };
      updatePlayer(existingPlayer);
      history.push('/board');
    }
  });

  const registerPlayer = async e => {
    try {
      let apikey = await Communicators.getAPIkey();
      let player = await Communicators.createPlayer(name, apikey);
      await updatePlayer({
        name: player.name,
        id: player.id,
      });
      await window.sessionStorage.setItem('name', player.name);
      await window.sessionStorage.setItem('id', player.id);
      await history.push('/board');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="index">
      <h1>Welcome to TIC-TAC-TOE</h1>
      <input
        type="text"
        name="name"
        value={name}
        placeholder="Enter your username"
        onChange={e => setName(e.target.value)}
      />
      <button type="submit" onClick={e => registerPlayer(e)}>
        REGISTER
      </button>
    </div>
  );
};

Index.propTypes = {
  updatePlayer: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  updatePlayer: data => dispatch(actionCreators.updatePlayer(data)),
  setError: message => {
    const msgId = uuidv4();
    dispatch(actionCreators.setError(message, msgId));
    setTimeout(() => dispatch(actionCreators.removeError(msgId)), 5000);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Index));
