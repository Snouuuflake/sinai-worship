/** INFO:
Elements that require display window-index-independent styles must have classes with an # in their name; when the window is loaded, all #'s will be replaced by the appropriate window index.'
*/

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

/** main code: */
window.addEventListener("load", () => {
  window.electron
    .invokeIndex()
    .then((index) => {
      updateAllClasses(index);
      console.log(`Window index is ${index} :3`);

      // INFO: projection element event listeners
      window.electron.onDisplayText((text) => {
        const textContainer = document.createElement("div");
        textContainer.classList.add(`text-container d-${index}-text-container`);
        const textElement = document.createElement("div");
        textElement.classList.add(`text d-${index}-text`);
        textElement.innerText = text;
        textContainer.appendChild(textElement);
        document.body.appendChild(textContainer);
      })
    })
    .catch((e) => {
      console.log(`Error getting window index!\n${e.message}`);
    });
});
