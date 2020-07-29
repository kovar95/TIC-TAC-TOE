import React, { Fragment } from 'react';
import './App.scss';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Index from './components/Index/Index';
import Board from './components/Board/Board';
import Game from './components/Game/Game';

const App = ({ errors }) => {
  return (
    <Fragment>
      <div className="errors">
        {errors.map(error => (
          <div className="error" key={error.id}>
            {error.text}
          </div>
        ))}
      </div>
      <Switch>
        <Route exact path="/">
          <Index />
        </Route>

        <Route exact path="/board">
          <Board />
        </Route>

        <Route exact path="/game">
          <Game />
        </Route>
      </Switch>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  errors: state.errors,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(App);
