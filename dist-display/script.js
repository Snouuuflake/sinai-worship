/** INFO:
    Elements that require display window-index-independent styles must have classes with an # in their name; when the window is loaded, all #'s will be replaced by the appropriate window index.'
*/

/** main code: */
window.addEventListener("load", () => {
  const AnimationFunctions = {
    getDefaultDuartion: () => {
      const res = parseInt(
        getComputedStyle(
          document.getElementsByClassName("global")[0],
        ).getPropertyValue("--default-animation-length"),
      );
      return res;
    },
    /** @param  {HTMLElement} element */
    startFadeIn: (element) => {
      element.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: AnimationFunctions.getDefaultDuartion(),
      });
    },
    /** @param  {HTMLElement} element */
    startFadeOut: (element) => {
      const animation = element.animate(
        [{ opacity: element.style.opacity }, { opacity: 0 }],
        {
          duration: AnimationFunctions.getDefaultDuartion(),
        },
      );
      animation.onfinish = (_e) => {
        element.remove();
      };
    },
  };

  const mainContainer = document.getElementById("main-container");

  const ContentFunctions = {
    removeAllElementsNicely: () => {
      [...mainContainer.getElementsByTagName("*")].forEach(
        AnimationFunctions.startFadeOut,
      );
    },
  };

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

  /**
   * Sets textElement.style.fontSize
   * @param {HTMLElement} textElement Element containing the text
   * @param {HTMLElement} parentElement Parent of textElement (overflow: clip requiered i think)
   * @param {number} maxSize Maximum font size in px
   */
  function fitText(textElement, parentElement, maxSize) {
    function overflows() {
      return (
        parentElement.clientHeight < parentElement.scrollHeight ||
        parentElement.clientWidth < parentElement.scrollWidth
      );
    }
    /**
     * @param {number} size
     */
    function setFontSize(size) {
      textElement.style.fontSize = size + "px";
    }

    /** @type {number}*/
    let size = maxSize;
    /** @type {number}*/
    let dsize = maxSize;
    /** @type {number}*/
    let lastOverflowSize = maxSize;

    setFontSize(size);

    // INFO: iteration limit because i fear "recursion"
    //       (also for debugging)
    let i = 0;
    /** @type {number}*/
    const MAX_ITERATIONS = 500;

    while (size >= 1) {
      dsize = Math.floor(dsize / 2) | 1;
      if (overflows()) {
        lastOverflowSize = size;
        size -= dsize;
      } else {
        if (lastOverflowSize - size < 2) {
          return;
        }
        size += dsize;
      }

      setFontSize(size);
      console.log(size, lastOverflowSize, dsize, overflows());
      if (i >= MAX_ITERATIONS) {
        console.error("fitText(): MAX_ITERATIONS reached");
        return;
      }
      i++;
    }
  }

  window.electron
    .invokeIndex()
    .then((index) => {
      updateAllClasses(index);

      console.log(`Window index is ${index} :3`);
      document.title = `Window #${index + 1}`;

      function logoHandler(logo) {
        if (logo) {
          if (!document.getElementById("logo-container")) {
            const logoContainer = document.createElement("div");
            logoContainer.id = "logo-container";
            logoContainer.classList.add(`logo`);
            AnimationFunctions.startFadeIn(logoContainer);
            document.body.appendChild(logoContainer);
          }
        } else {
          const logoContainer = document.getElementById("logo-container");
          if (logoContainer) {
            AnimationFunctions.startFadeOut(logoContainer);
          }
        }

        console.log(`Logo: ${logo}`);
      }

      window.electron.onDisplayLogo(logoHandler);

      /** INFO: this fucker only happens once
       *        should be a promise but
       */
      window.electron.onResCss(index, (css) => {
        updateStyleTag(css);
        window.electron.invokeGetLogo(logoHandler);
      });
      const cssHandler = (css) => {
        updateStyleTag(css);
        document.dispatchEvent(updateCssEvent);
      };
      window.electron.invokeReqCss(index, cssHandler);
      window.electron.onUpdateCss(index, cssHandler);

      // INFO: projection element event listeners
      window.electron.onDisplayText(index, (text) => {
        ContentFunctions.removeAllElementsNicely();
        const textContainer = document.createElement("div");
        textContainer.classList.add(`text-container`);
        textContainer.classList.add(`d-${index}-text-container`);
        mainContainer.appendChild(textContainer);
        // TODO: add support for more animations than this fade
        textContainer.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: AnimationFunctions.getDefaultDuartion(),
        });
        function setDisplayText(text) {
          textContainer.replaceChildren();
          const textElement = document.createElement("div");
          textElement.classList.add(`text`);
          textElement.classList.add(`d-${index}-text`);

          textElement.innerText = text;
          textContainer.appendChild(textElement);

          const maxFontSize = parseInt(getComputedStyle(textElement).fontSize);
          console.log("maxFontSize: ", maxFontSize);
          fitText(textElement, textContainer, maxFontSize);
        }
        setDisplayText(text);
        removeCurrentUpdateCssEventListener();
        setCurrentUpdateCssEventListener(() => {
          setDisplayText(text);
        });
      });

      window.electron.onDisplayImage(index, (path) => {
        ContentFunctions.removeAllElementsNicely();
        const imageContainer = document.createElement("div");
        imageContainer.classList.add(`image-container`);
        imageContainer.classList.add(`d-${index}-image-container`);
        mainContainer.appendChild(imageContainer);
        // TODO: add support for more animations than this fade

        const image = document.createElement("img");
        image.classList.add(`image`);
        image.classList.add(`d-${index}-image`);
        image.src = `mssf://${path}`;
        imageContainer.appendChild(image);

        AnimationFunctions.startFadeIn(imageContainer);
      });
      window.electron.onDisplayNone(index, () => {
        ContentFunctions.removeAllElementsNicely();
        console.log("none");
      });
      window.electron.sendGetLiveElement(index);
    })
    .catch((e) => {
      console.log(`Error post/on window index!\n${e.message}`);
    });
});
