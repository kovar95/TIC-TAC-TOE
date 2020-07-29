import React, { Fragment } from 'react';
import './App.scss';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Index from './components/Index/Index';
import Board from './components/Board/Board';
import Game from './components/Game/Game';
import PrivateRoute from './components/PrivateRoute';

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
        <Route exact path="/" component={Index} />
        <PrivateRoute exact path="/board" component={Board} />
        <PrivateRoute exact path="/game" component={Game} />
      </Switch>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  errors: state.errors,
});

export default connect(mapStateToProps)(App);
