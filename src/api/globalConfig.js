import fs from 'fs';
import path from 'path';

const pageSize = 10;
const pageSizeType = ['10', '20', '30', '40', '50'];
const description = '共有{maxRecords}条记录';
const okText = '确定';
const cancelText = '取消';

// 搜索配置
const searchConfig = {
  search: '搜索',
  more: '更多',
  reset: '重置',
  sort: '排序'
};

// 下拉搜索的最大条数
const maxSearchCount = 20;

// 从配置文件api_config.json读取配置
const config = (() => {
  try {
    const filePath = path.join(__dirname, 'api_config.json');
    return JSON.parse(fs.readFileSync(filePath,'utf-8'));
  } catch (e) {
    console.log('can not read config file');
  }
})() || {};

// node转发请求地址
const port = '5555';
const hostname = config.hostname || '10.10.10.240';
const host = `http://${hostname}:${port}`;

export {
  pageSize,
  pageSizeType,
  description,
  okText,
  cancelText,
  searchConfig,
  host,
  hostname,
  port,
  maxSearchCount,
};
