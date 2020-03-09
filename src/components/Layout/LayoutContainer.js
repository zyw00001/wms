import React from 'react';
import { connect } from 'react-redux';
import {Action} from '../../action-reducer/action';
import Layout from './Layout';
import {EnhanceLoading} from '../Enhance';

const action = new Action(['layout']);

const initActionCreator = () => async (dispatch) => {
  dispatch(action.create({status: 'page'}));
};

const mapStateToProps = (state) => {
  return state.layout;
};

const actionCreators = {
  onInit: initActionCreator,
};

const Container = connect(mapStateToProps, actionCreators)(EnhanceLoading(Layout));
export default Container;
