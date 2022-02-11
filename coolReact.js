/*** SECTION: THE LIBRARY ***/

// Helper function for assigning props
function addProps(node, props) {
  Object.keys(props).forEach((name) => {
    let fixedName = name;
    if (name == "className") fixedName = "class"; // className is a special case - as in React, we use className for specifying CSS classes of elements
    node.setAttribute(fixedName, props[name]);
  });
}

// Creating nodes from virtual elements
function createNode(element) {
  // Create text node if we passed a string
  if (typeof element === "string") {
    return document.createTextNode(element);
  }

  // Otherwise create normal node based on the type (html tag)
  const node = document.createElement(element.type);

  // Add props
  addProps(node, element.props);

  // Recursively create node's children and append them to respective parents
  element.children.map((child) => {
    const childNode = createNode(child);
    node.appendChild(childNode);
  });

  // Return the created node
  return node;
}

// Updating props of existing elements
function updateProps(node, newProps, oldProps) {
  // First we merge the new and old props into a new object
  const allProps = { ...newProps, ...oldProps };

  // We iterate through all props to find differences
  Object.keys(allProps).forEach((name) => {
    if (!newProps[name]) {
      // The prop was removed
      node.removeAttribute(name);
    } else if (!oldProps[name] || oldProps[name] != newProps[name]) {
      // The prop was updated, so we first delete it and add anew
      node.removeAttribute(name);
      addProps(node, { [name]: newProps[name] });
    }
  });
}

// This is the core function that updates the DOM - it either creates new elements or updates the existing ones
function renderCoolReact(parentNode, newElement, oldElement, index = 0) {
  // Old node doesn't exist
  if (!oldElement) {
    parentNode.appendChild(createNode(newElement));

    // New node doesn't exist
  } else if (!newElement) {
    parentNode.removeChild(parentNode.childNodes[index]);

    // New node is different from the old one so we will replace it
  } else if (
    typeof newElement !== typeof oldElement || // Tag changed to text or vice versa?
    (typeof newElement === "string" && newElement !== oldElement) || // Text is not the same?
    newElement.type !== oldElement.type // Type of tag changed?
  ) {
    parentNode.replaceChild(
      createNode(newElement),
      parentNode.childNodes[index]
    );

    // Recursively diff the children
  } else if (Array.isArray(newElement.children)) {
    // Go through each child and update
    for (
      let i = 0;
      i < newElement.children.length || i < oldElement.children.length;
      i++
    ) {
      renderCoolReact(
        parentNode.childNodes[index],
        newElement.children[i],
        oldElement.children[i],
        i
      );
    }
  }

  // Diff the props
  if (typeof newElement === "object" && typeof oldElement === "object")
    updateProps(
      parentNode.childNodes[index],
      newElement.props,
      oldElement.props
    );
}

// Creating virtual elements
// This function exists in order to achieve a syntax similar to React
function createElement(type, props, ...children) {
  return {
    type,
    props: { ...props },
    children,
  };
}

/*** SECTION: ACTUAL USE-CASE SCENARIO OF THE LIBRARY ***/

// Setting original elements
const originalElements = createElement(
  "div",
  { className: "page", style: "color:brown" },
  createElement("h1", {}, "coolReact"),
  createElement("p", {}, "This is my tiny React style library."),
  createElement("p", {}, "For example this line won't get changed."),
  createElement("p", {}, "But this one will be deleted."),
  createElement("p", {}, "And it works with props too!")
);
// Render
renderCoolReact(document.getElementById("root"), originalElements);

// Now, let's update the DOM - like in React, when we decide to update the elements, it won't replace the whole DOM, just the particular changed elements
const newElements = createElement(
  "div",
  { className: "site" },
  createElement("h1", {}, "A React style library"),
  createElement("p", {}, "This is my tiny React style library."),
  createElement("p", {}, "For example this line won't get changed."),
  createElement("p", {}, "And it works with props too!")
);
// Render with the use of setTimeout so that we can see the difference
setTimeout(
  () =>
    renderCoolReact(
      document.getElementById("root"),
      newElements,
      originalElements
    ),
  5000
);
