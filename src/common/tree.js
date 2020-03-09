import {getPathValue} from '../action-reducer/helper';

// 生成节点key
const nodeKey = (row, col) => {
  return `${row}-${col}`;
};

/**
 * 功能：依据items构造SuperTree需要的tree参数
 * items：数组，每个item结构为{title, children, value}
 */
const create = (items) => {
  const root = {key: nodeKey(0, 0), children: []};
  let tree = {}, row = 1;
  const addCol = ({children, ...other}, key, parent) => {
    let col = {...other, key, parent: parent.key};
    parent.children && parent.children.push(key);
    tree[key] = col;
    if (children) {
      col.children = [];
      build(children, col);
    }
  };
  const build = (items, parent) => {
    if (items.length) {
      const rowIndex = row++;
      items.some((item, index) => {
        addCol(item, nodeKey(rowIndex, index), parent);
      });
    }
  };
  if (items.length) {
    build(items, root);
    tree[root.key] = root;
    tree.root = root.key;
    tree.row = row;
  }
  return tree;
};

const createWithInsertRoot = (items, title, value = {}) => {
  return create([{title, value, children: items}]);
};

const addChild = (tree, parent) => {
  let key;
  const children = tree[parent].children;
  if (!children || children.length === 0) {
    key = `${tree.row}-0`;
    tree[parent].children = [key];
    tree.row++;
  } else {
    const arr = children[children.length - 1].match(/(\d+)-\d+/);
    key = `${arr[1]}-${children.length}`;
    children.push(key);
  }
  return key;
};

// 增加节点
const addNode = (tree, title, value, parent) => {
  if (!tree[parent]) {
    return tree;
  } else {
    let {...newTree} = tree;
    const key = addChild(newTree, parent);
    newTree[key] = {key, parent, title, value};
    return newTree;
  }
};

// 依据key来删除节点
const delNode = ({...tree}, key) => {
  const parent = tree[key].parent;
  tree[parent].children = tree[parent].children.filter(child => child !== key);
  if (tree[parent].children.length === 0) {
    delete tree[parent].children;
  }
  delete tree[key];
  return tree;
};

// 获取根节点的key
const getRootKey = (tree) => {
  const children = getPathValue(tree, [tree.root, 'children']);
  if (!children) {
    return '';
  } else {
    return children.length > 0 ? children[0] : '';
  }
};

const toValue = (tree, key) => {
  const value = getPathValue(tree, [key, 'value']) || {};
  return Object.assign({}, value, {treeKey: key});
};

const extractChildren = (tree, key) => {
  const children = getPathValue(tree, [key, 'children']);
  return !children ? null : children.map(key => toValue(tree, key));
};

// 依据guid查找相应的key，value中必须有guid属性
const findKeyByGuid = (tree, guid) => {
  return Object.keys(tree).find(key => {
    const item = tree[key] || {};
    if (typeof item === 'object' && item.value) {
      return item.value.guid === guid;
    } else {
      return false;
    }
  })
};

// 依据value查找相应的key
const findKeyByValue = (tree, value) => {
  return Object.keys(tree).find(key => {
    const item = tree[key] || {};
    if (typeof item === 'object' && item.value) {
      return item.value === value;
    } else {
      return false;
    }
  })
};

const getGuidAndTitle = (tree, key) => {
  const item = tree[key];
  return {value: item.value.guid, title: item.title};
};

// 遍历树节点
const traverse = (tree, callback) => {
  const keys = ['root', 'row', tree.root];
  const treeKeys = Object.keys(tree);
  for (const key of treeKeys) {
    if (!keys.includes(key)) {
      callback(key, tree[key]);
    }
  }
};

const toExpandObject = (keys) => {
  return keys.reduce((result, key) => {
    result[key] = true;
    return result;
  }, {});
};

const addParentKey = (tree, keys, key) => {
  let parent = tree[key].parent;
  while (parent && parent !== tree.root && !keys.includes(parent)) {
    keys.push(parent);
    parent = tree[parent].parent;
  }
};

// 搜索，返回展开的节点key
const search = (tree, value) => {
  const expandKeys = [];
  traverse(tree, (key, {title}) => {
    if (title && title.indexOf(value) > -1) {
      addParentKey(tree, expandKeys, key);
    }
  });
  return toExpandObject(expandKeys);
};

// 依据value进行搜索，返回对象包含searchValue(keys数组)和expand对象
const search2 = (tree, values) => {
  const expandKeys = [];
  const keys = [];
  values = values.filter(value => value);
  if (values.length) {
    traverse(tree, (key, {value}) => {
      if (value && values.includes(value.guid)) {
        keys.push(key);
        addParentKey(tree, expandKeys, key);
      }
    });
  }
  return keys.length ? {expand: toExpandObject(expandKeys), searchValue: keys} : null;
};

//树转表格数据，表格列固定字段id，pid
const convertToList = (tree=[], list = [], pid) => {
  tree.map(item => {
    const id = {
      title: item.title,
      value: item.value.guid
    };
    list.push({pid, id});
    if (item.children) {
      convertToList(item.children, list, id);
    }
  });
};

//树的叶子节点转表格数据，表格列固定字段id，pid
const convertLeafToList = (tree=[], list = [], pid) => {
  tree.map(item => {
    const id = {
      title: item.title,
      value: item.value
    };
    if (!item.children || item.children.length < 1) {
      list.push({pid, id});
    }
    if (item.children) {
      convertLeafToList(item.children, list, id);
    }
  });
};

const Tree = {
  create,
  createWithInsertRoot,
  addNode,
  delNode,
  getRootKey,
  extractChildren,
  findKeyByGuid,
  findKeyByValue,
  getGuidAndTitle,
  search,
  search2,
  convertToList,
  convertLeafToList
};

export default Tree;
