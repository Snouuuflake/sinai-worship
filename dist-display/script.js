/** INFO:
    Elements that require display window-index-independent styles must have classes with an # in their name; when the window is loaded, all #'s will be replaced by the appropriate window index.'
*/

/**@type HTMLElement*/
const root = document.querySelector(":root");
// TEST:
root.style.setProperty("--default-animation-duration", 500)
const AnimationFunctions = {
  getDefaultDuartion: () => parseInt(getComputedStyle(root).getPropertyValue("--default-animation-duration")),
  /** @param  {HTMLElement} element */
  startFadeOut: (element) => {
    const animation = element.animate([{ opacity: element.style.opacity }, { opacity: 0 }], {
      duration: AnimationFunctions.getDefaultDuartion()
    })
    animation.onfinish = _e => {
      element.remove();
    }
  }
}

const ContentFunctions = {
  removeAllElementsNicely: () => [...document.body.querySelectorAll("*")].forEach(AnimationFunctions.startFadeOut),
}

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

const styleTag = document.getElementById("style-tag");

/**
 * Updates the everything-style-tag
 * @param css {string}
 */
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

function fitText(textElement, parentElement, maxSize) {
  function overflows(element) {
    return (
      element.clientHeight < element.scrollHeight ||
      element.clientWidth < element.scrollWidth
    );
  }

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
        updateStyleTag(css);
      });
      window.electron.sendReqCss(index);
      window.electron.onUpdateCss(index, (css) => {
        updateStyleTag(css);
        document.dispatchEvent(updateCssEvent);
      });

      // INFO: projection element event listeners
      window.electron.onDisplayText(index, (text) => {
        ContentFunctions.removeAllElementsNicely();
        const textContainer = document.createElement("div");
        textContainer.classList.add(`text-container`);
        textContainer.classList.add(`d-${index}-text-container`);
        document.body.appendChild(textContainer);
        // TODO: add support for more animations than this fade
        textContainer.animate([
          { opacity: 0 },
          { opacity: 1 }
        ],
          {
            duration: AnimationFunctions.getDefaultDuartion()
          }
        );
        function setDisplayText(text) {
          textContainer.replaceChildren();
          const textElement = document.createElement("div");
          textElement.classList.add(`text`);
          textElement.classList.add(`d-${index}-text`);

          textElement.innerText = text;
          textContainer.appendChild(textElement);

          const maxFontSize = parseInt(getComputedStyle(textElement).fontSize);
          console.log(maxFontSize);
          fitText(textElement, textContainer, maxFontSize);
        }
        setDisplayText(text);
        removeCurrentUpdateCssEventListener();
        setCurrentUpdateCssEventListener(() => {
          setDisplayText(text);
        });

      });

      //window.electron.onDisplayImage()
      window.electron.sendGetLiveElement(index);
    })
    .catch((e) => {
      console.log(`Error post/on window index!\n${e.message}`);
    });
});
