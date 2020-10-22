function moveItem(event, element, xStart, yStart) {
  element.style.transform = `translate(
    ${event.clientX - xStart}px,
    ${event.clientY - yStart}px
  )`;
}

function populateIndicies(parentSelector, childSelector) {
  const parent = document.querySelector(parentSelector);
  const children = [...parent.querySelectorAll(childSelector)];
  children.forEach((child, i) => {
    child.dataset.index = i;
  });
}

function onMouseDown(e) {
  const parent = e.currentTarget;
  const childSelectorName = parent.childSelector.replace('.', '');
  const element = e.target.closest(parent.childSelector);
  if (!element) return;

  // Clone and attach element to the cursor
  const xStart = e.clientX;
  const yStart = e.clientY;
  const xOffset = xStart - element.getBoundingClientRect().x;
  const yOffset = yStart - element.getBoundingClientRect().y;

  const elementClone = element.cloneNode();
  elementClone.classList.add(childSelectorName + '--dragging');
  elementClone.style.left = `${xStart - xOffset}px`;
  elementClone.style.top = `${yStart - yOffset}px`;
  document.body.append(elementClone);

  // Disable the original card
  element.classList.add(childSelectorName + '--disabled');

  //
  elementClone.style.cursor = 'grabbing';

  // ---------
  // Move item
  // ---------

  let dropArea = null;
  let dropAreaChecked = false;

  function onMouseMove(e) {
    moveItem(e, elementClone, xStart, yStart);

    // Throttle the checking of elements below cursor
    // Without throttle 450 times/s
    // With 40 times/s
    if (dropAreaChecked) return;
    dropAreaChecked = true;

    setTimeout(() => {
      dropAreaChecked = false;
    }, 50);

    // Check for valid drop area
    elementClone.hidden = true;
    dropArea = document.elementFromPoint(e.clientX, e.clientY);
    if (dropArea) dropArea = dropArea.closest(`${parent.parentSelector} ${parent.childSelector}`);
    elementClone.hidden = false;

    // No valid drop area found
    if (!dropArea || dropArea === element) {
      dropArea = null;
      return;
    }

    // Move the dragging item to the place of the dropArea
    const movingIndex = element.dataset.index;
    const targetIndex = dropArea.dataset.index;

    if (movingIndex < targetIndex) {
      [element.dataset.index, dropArea.dataset.index] = [
        dropArea.dataset.index,
        element.dataset.index,
      ];
      dropArea.parentElement.insertBefore(element, dropArea.nextSibling);
    } else {
      [element.dataset.index, dropArea.dataset.index] = [
        dropArea.dataset.index,
        element.dataset.index,
      ];
      dropArea.parentElement.insertBefore(element, dropArea);
    }
  }

  // ---------
  // Drop item
  // ---------

  function onMouseUp() {
    elementClone.remove();
    element.classList.remove(childSelectorName + '--disabled');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  // ----------
  // Setup item
  // ----------

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function sort2d({ parentSelector, childSelector }) {
  const container = document.querySelector(parentSelector);
  container.parentSelector = parentSelector;
  container.childSelector = childSelector;
  container.addEventListener('mousedown', onMouseDown);

  // Give each element a index number, so when we move them we know which items to swap
  populateIndicies(parentSelector, childSelector);
}

export default sort2d;
