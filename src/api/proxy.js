import express from 'express';
import http from 'http';
import {hostname, port} from './globalConfig';

const api = express.Router();

const options = (req, method='get') => {
  return {
    hostname, port, method,
    path: req.url,
    headers: req.headers,
  };
};

const proxy = (res) => (response) => {
  res.writeHead(response.statusCode, response.statusMessage, response.headers);
  response.pipe(res);
};

api.get('*', (req, res) => {
  http.request(options(req), proxy(res)).end();
});

api.post('*', (req, res) => {
  req.pipe(http.request(options(req, 'post'), proxy(res)));
});

api.put('*', (req, res) => {
  req.pipe(http.request(options(req, 'put'), proxy(res)));
});

export default api;
