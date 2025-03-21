/** INFO:
Elements that require display window-index-independent styles must have classes with an # in their name; when the window is loaded, all #'s will be replaced by the appropriate window index.'
*/

/**
 * update-css event
 */
const updateCssEvent = new CustomEvent("update-css");
let currentUpdateCssEventListener = null;
function setCurrentUpdateCssEventListener(listener) {
  currentUpdateCssEventListener = listener;
  document.addEventListener("update-css", listener);
}
function removeCurrentUpdateCssEventListener() {
  document.removeEventListener("update-css", currentUpdateCssEventListener);
  currentUpdateCssEventListener = null;
}

/**
 * @param css {string}
 */
const styleTag = document.getElementById("style-tag");
//const styleObserver = new MutationObserver((mutations) => {
//  mutations.forEach((mutation) => {
//    console.log(mutation.type);
//  });
//});
//styleObserver.observe(styleTag, { attributes: true });

function updateStyleTag(css) {
const styleTag = document.getElementById("style-tag");
  styleTag.innerHTML = css;
}

/**
 * Updates classes for one element
 * @param {HTMLElement} element
 * @param {number} index Display index
 */
function updateElementClasses(element, index) {
  const templateClassArray = [...element.classList].filter((c) =>
    c.includes("#"),
  );
  if (templateClassArray.length != 0) {
    templateClassArray.forEach((c) => {
      element.classList.remove(c);
      element.classList.add(c.replace("#", index));
    });
  }
}
/**
 * changes all template classes to the appropriate window-id-numbered classes
 * @param {number} id (obtained from main process)
 */
function updateAllClasses(index) {
  const everyElement = document.getElementsByTagName("*");
  for (const element of everyElement) {
    updateElementClasses(element, index);
  }
}

function overflows(element) {
  return (
    element.clientHeight < element.scrollHeight ||
    element.clientWidth < element.scrollWidth
  );
}
function fitText(textElement, parentElement, maxSize) {
  let i = 0;
  textElement.style.fontSize = i + "px";

  for (i = 0; !overflows(parentElement) && i != maxSize; i++) {
    textElement.style.fontSize = i + "px";
    console.log(i);
  }

  if (overflows(parentElement)) {
    textElement.style.fontSize = i - 2 + "px";
    console.log(i);
  }
}

/** main code: */
window.addEventListener("load", () => {
  window.electron
    .invokeIndex()
    .then((index) => {
      updateAllClasses(index);
      console.log(`Window index is ${index} :3`);
      document.title = `Window #${index + 1}`;

      window.electron.onResCss(index, (css) => {
        //console.log(css);
        updateStyleTag(css);
      });
      window.electron.sendReqCss(index);
      window.electron.onUpdateCss(index, (css) => {
        console.log(css);
        updateStyleTag(css);
        document.dispatchEvent(updateCssEvent);
      });

      // INFO: projection element event listeners
      window.electron.onDisplayText(index, (text) => {
        function setDisplayText(text) {
          console.log(text);
          document.body.replaceChildren();
          const textContainer = document.createElement("div");
          textContainer.classList.add(`text-container`);
          textContainer.classList.add(`d-${index}-text-container`);
          const textElement = document.createElement("div");
          textElement.classList.add(`text`);
          textElement.classList.add(`d-${index}-text`);

          textElement.innerText = text;
          textContainer.appendChild(textElement);

          document.body.appendChild(textContainer);

          const maxFontSize = parseInt(getComputedStyle(textElement).fontSize);
          console.log(maxFontSize);
          fitText(textElement, textContainer, maxFontSize);
        }
        setDisplayText(text);
        console.log("!")
        removeCurrentUpdateCssEventListener();
        setCurrentUpdateCssEventListener(() => {
          console.log("!!")
          setDisplayText(text);
          console.log("update css!")
        });
      });

      //window.electron.onDisplayImage()
    })
    .catch((e) => {
      console.log(`Error post/on window index!\n${e.message}`);
    });
});
