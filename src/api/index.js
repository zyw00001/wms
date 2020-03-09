import express from 'express';
import apiLogin from './login';
import apiProxy from './proxy';

const api = express.Router();
api.use('/login', apiLogin);
api.use('/proxy', apiProxy);
api.use('*', (req, res) => {res.send({returnCode: 404, returnMsg: '接口不存在'})});
export default api;
