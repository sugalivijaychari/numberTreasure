import React from 'react';
import classNames from 'classnames';
import { Container } from 'react-bootstrap';
import NavBar from './Navbar';
import { Outlet, Link, BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import WalletDetails from '../metamask/accountData';
import ErrorBoundary from '../errors/errorBoundary';
import InputNumber from '../primary/inputNumber';
import ViewData from '../primary/viewData';

class Content extends React.Component {
  render() {
    return (
      <Container
        fluid
        className={classNames('content', { 'is-open': this.props.isOpen })}
      >
        <NavBar toggle={this.props.toggle} />
        <Outlet></Outlet>
        <Routes>
          <Route exact path="/" element={<>hi</>}></Route>
          <Route
            exact
            path="/input"
            element={
              <>
                <ErrorBoundary>
                  <InputNumber />
                  
                </ErrorBoundary>
              </>
            }
          ></Route>
          <Route
            exact
            path="/connectWallet"
            element={
              <>
                <WalletDetails />
              </>
            }
          ></Route>
          <Route
            exact
            path="/view"
            element={
              <>
                <ViewData />
              </>
            }
          ></Route>
        </Routes>
      </Container>
    );
  }
}

export default Content;
