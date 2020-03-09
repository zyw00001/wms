import { combineReducers } from 'redux';
import {createReducer} from '../action-reducer/reducer';

const rootReducer = combineReducers({
  layout: createReducer(['layout']),
  home: createReducer(['home']),
});

export default rootReducer;
