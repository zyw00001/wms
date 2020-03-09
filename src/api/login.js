import express from 'express';

const api = express.Router();
const WEEK = 7 * 24 * 3600 * 1000;

// 登陆
api.post('/', async (req, res) => {
  res.cookie('token', '20170803040015', {httpOnly: true});
  res.cookie('username', req.body.account, {maxAge: WEEK});
  res.send({returnCode: 0});
});

//注销
api.put('/revoke/:account', async (req, res) => {
  res.cookie('token', '', {httpOnly: true, maxAge: 0});
  res.send({returnCode: 0});
});

export default api;
