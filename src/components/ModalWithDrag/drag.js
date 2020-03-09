
// 依据CSS3的transform属性进行移动
const dragByTransform = (dragElement, targetElement) => {
  let mouseMove = null;
  let mouseUp = null;
  let active = false;
  let offsetX = 0;
  let offsetY = 0;
  let x = 0;
  let y = 0;

  dragElement.style.cursor = 'move';

  dragElement.onmousedown = (e) => {
    mouseMove = document.onmousemove;
    mouseUp = document.onmouseup;
    x = e.clientX;
    y = e.clientY;
    active = true;

    // 如果下拉框拥有焦点，通过使其失去焦点来关闭掉下拉框
    if (document.activeElement && document.activeElement !== dragElement) {
      document.activeElement.blur();
    }

    document.onmousemove = (e) => {
      if (active) {
        const x2 = offsetX + e.clientX - x;
        const y2 = offsetY + e.clientY - y;
        targetElement.style.transform = `translate(${x2}px, ${y2}px)`;
      }
      mouseMove && mouseMove(e);
    };

    document.onmouseup = (e) => {
      if (active) {
        document.onmousemove = mouseMove;
        document.onmouseup = mouseUp;
        offsetX += e.clientX - x;
        offsetY += e.clientY - y;
        active = false;
      }
      mouseUp && mouseUp(e);
    };

    return false;
  };
};

// 获取相关CSS属性
const getCss = (o, key) => {
  return o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o)[key];
};

const getParentHeight = (ele) => {
  ele = ele.parentNode;
  while (ele && getCss(ele, 'position') === 'static') {
    ele = ele.parentNode;
  }
  return parseInt(getCss(ele || document.body, 'height'));
};

// 依据position属性进行移动
const dragByPosition = (dragElement, targetElement) => {
  let mouseMove = null;
  let mouseUp = null;
  let active = false;
  let left = 0;
  let top = 0;
  let x = 0;
  let y = 0;

  dragElement.style.cursor = 'move';

  dragElement.onmousedown = (e) => {
    const vh = getParentHeight(targetElement);
    const dh = parseInt(getCss(dragElement, 'height'));
    mouseMove = document.onmousemove;
    mouseUp = document.onmouseup;
    x = e.clientX;
    y = e.clientY;
    active = true;

    if (getCss(targetElement, 'left') !== 'auto'){
      left = parseInt(getCss(targetElement, "left"));
    }

    if (getCss(targetElement, 'top') !== 'auto'){
      top = parseInt(getCss(targetElement, 'top'));
    }

    // 如果下拉框拥有焦点，通过使其失去焦点来关闭掉下拉框
    if (document.activeElement && document.activeElement !== dragElement) {
      document.activeElement.blur();
    }

    document.onmousemove = (e) => {
      if (active) {
        const top2 = Math.max(Math.min(top + e.clientY - y, vh - dh), 0);
        targetElement.style.left = `${left + e.clientX - x}px`;
        targetElement.style.top = `${top2}px`;
      }
      mouseMove && mouseMove(e);
    };

    document.onmouseup = (e) => {
      if (active) {
        document.onmousemove = mouseMove;
        document.onmouseup = mouseUp;
        active = false;
      }
      mouseUp && mouseUp(e);
    };

    return false;
  };
};

const drag = (dragElement, targetElement) => {
  if (!dragElement || !targetElement) {
    console.error('请传入有效的HTML元素对象');
    return;
  }

  // 已经绑定过，不需要再次绑定
  if (dragElement.onmousedown) {
    return;
  }

  // 如果目标元素是非定位元素采用transform属性进行移动
  if (getCss(targetElement, 'position') === 'static') {
    dragByTransform(dragElement, targetElement);
  } else {
    dragByPosition(dragElement, targetElement);
  }
};

export default drag;
