
const isFirefox = () => {
  return navigator.userAgent.indexOf('Firefox') > 0;
};

const fixed = (container, header, maxHeight) => {
  container.style.overflowY = 'auto';
  container.style.maxHeight = maxHeight;
  if (isFirefox()) {
    container.style.position = 'relative';
    header.style.top = '0';
    header.style.position = 'sticky';
    header.style.zIndex = '1';
  } else {
    header.parentNode.appendChild(header);
    container.onscroll = () => {
      header.style.transform = `translateY(${container.scrollTop}px)`;
    };
  }
};

export default fixed;
