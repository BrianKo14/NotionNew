import { useEffect, useState } from 'react';

/** Distance from the block proper where the side handle still shows. */
const MOUSE_HOVER_OFFSET = 120;

/** Element index that is currently being hovered over, while dragging. */
var currentlyHovering = -1;

/** Element index that is currently being dragged. */
var currentlyDragging = -1;



/* - CHANGING BLOCKS - */

/** Adds a new block */
export function addBlock(setBlocks, index) {
  setBlocks(prev => [...prev.slice(0, index + 1), {"type": "paragraph", "text": ""}, ...prev.slice(index + 1)]);
  window.selectedIndex = index + 1;
}

/** Deletes an existing block */
export function deleteBlock(setBlocks, index) {

  setBlocks(prev => {
    if (prev.length === 2) return prev;

    const tmp = [...prev];
    tmp.splice(index, 1);

    window.selectedIndex = index - 1;
    while (tmp[window.selectedIndex].type === "image") window.selectedIndex--;

    return tmp;
  });
}

/** Replaces current block with an image block */
export async function insertImage(setBlocks, index, image) {
  setBlocks(prev => {
    const tmp = [...prev];
    tmp.splice(index, 1, {"type": "image", "image": image})

    window.selectedIndex = index - 1;
    while (tmp[window.selectedIndex].type === "image") window.selectedIndex--;

    return tmp;
  });
}

/** Move block from 'index1' to after 'index2' */
export function moveBlock(setBlocks, index1, index2) {
  setBlocks(prev => {
    const tmp = [...prev];
    const [removed] = tmp.splice(index1, 1);
    const insertIndex = index1 < index2 ? index2 - 1 : index2;
    tmp.splice(insertIndex + 1, 0, removed);

    window.selectedIndex = index2;
    while (tmp[window.selectedIndex].type === "image") window.selectedIndex--;

    return tmp;
  });
}

export function handleDragStart(e, index, setBlocks) {
  if (window.dragClone) return;

  // Create semi-transparent version of block to be displayed while dragging
  const block = e.target.closest('.block');
  const dragImage = block.cloneNode(true);

  dragImage.removeChild(dragImage.getElementsByClassName("block-side-handle")[0]);
  dragImage.style.position = "fixed";
  dragImage.style.top = "-10000px";
  dragImage.style.left = "-10000px";
  dragImage.children[0].style.width = block.children[0].offsetWidth + "px";
  dragImage.style.opacity = 0.5;
  window.dragClone = dragImage;
  document.body.appendChild(dragImage); 

  // Pass on index of block to be moved
  currentlyDragging = index;
  window.addEventListener("mouseup", () => handleDragEnd(setBlocks));
}

export function handleDragEnd(setBlocks) {
  if (!window.dragClone) return;

  window.dragClone.remove();
  window.dragClone = null;

  window.removeEventListener("mouseup", handleDragEnd);

  if (currentlyHovering !== currentlyDragging && currentlyHovering !== -1) {
    moveBlock(setBlocks, currentlyDragging, currentlyHovering);
  }
}

/* - CONTROL - */

/**
 * Controls the placeholder of the input block.
 * For paragraphs: it shows only when empty and selected.
 * For headings: it shows always when empty.
 * 
 * TODO: headings' placeholders should stay put, but implementing this proved unnecessary complicated
 * because it requires some state management acrobatics over the current implementation of blocks.
*/
export function controlPlaceholder(selected, target, placeholder) {
  if (selected && target.value === "") {
    target.placeholder = placeholder;
  } else if (!placeholder.includes("Heading")) {
    target.placeholder = "";
  } else {
    target.placeholder = "";
  }
}

/** When the menu appears, window-wide scrolling should be disabled. */
export function toggleMenu(show, setShowMenu) {
  setShowMenu(show);

  if (show) {
    // Disable scrolling
    const x = window.scrollX, y = window.scrollY;
    window.onscroll = () => window.scrollTo(x, y);
  } else {
    // Enable scrolling
    window.onscroll = null;
  }
}

/** Handles specific keys pressed at input box */
export function handleKeyPress(e, blocks, setBlocks, index) {
  
  // Add new block on Shift + Enter
  if (e.key === "Enter" && e.shiftKey
      && e.target.selectionStart !== e.target.value.length) { 
    e.preventDefault();
    addBlock(setBlocks, index);
  }
  // Add new block on Enter if end of line is selected
  else if (e.key === "Enter" && !e.shiftKey
      && e.target.selectionStart === e.target.selectionEnd && e.target.selectionStart === e.target.value.length) {
    e.preventDefault();
    addBlock(setBlocks, index);
  }
  // Delete block on Backspace
  else if (e.key === "Backspace" && e.target.value === "" && index !== 0) {
    e.preventDefault();
    deleteBlock(setBlocks, index);
  }

  // Delete last image/callout on Backspace if cursor is at the beginning of the line
  if (e.key === "Backspace" && e.target.selectionStart == 0 && index !== 0
    && blocks[index - 1].type === "image" || blocks[index - 1].type === "callout") {
      deleteBlock(setBlocks, index - 1);
  }
}


/* - MOUSE - */

/** Decides when to show side handle */
export function controlSideHandle(el, mousePos, setIsHovering) {
  const rect = el.getBoundingClientRect();
  setIsHovering(mousePos.x > rect.left - MOUSE_HOVER_OFFSET &&
                mousePos.x < rect.left + rect.width + MOUSE_HOVER_OFFSET &&
                mousePos.y > rect.top &&
                mousePos.y < rect.top + rect.height);
}

/** Decides over to which block will the current selection be dragged to */
export function getCurrentlyHovered(el, mousePos, index) {
  const rect = el.getBoundingClientRect();
  const isCurrentlyHovering = mousePos.x > rect.left - MOUSE_HOVER_OFFSET &&
                              mousePos.x < rect.left + rect.width + MOUSE_HOVER_OFFSET &&
                              mousePos.y > rect.top + rect.height - 20 &&
                              mousePos.y < rect.top + rect.height + 20;

  currentlyHovering = isCurrentlyHovering ? index : currentlyHovering;

  if (currentlyHovering === index) {
    el.parentElement.classList.add("hover-line");
  } else {
    el.parentElement.classList.remove("hover-line");
  } 
}

/** Gets mouse position to detect hovering for the BlockSideHandle.
 * By doing this in JS instead of CSS I can easily add an artifical offset to the hover area. */
export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(event) {
      setPosition({ x: event.clientX, y: event.clientY });
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return position;
}
