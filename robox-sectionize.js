/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Content} Content
 * @typedef {import('mdast').Parent} Parent
 */

/** @type {import('unified').Plugin<[], Root>} */
function plugin() {
  return transform;
}

/**
 * @param {Root} tree
 */
function transform(tree) {
  const children = tree.children;
  const newChildren = [];
  let sectionCount = 0;
  let i = 0;

  while (i < children.length) {
    const start = children[i];
    const isHeading = start.type === 'heading';

    if (!isHeading || start.depth < 2) {
      // Ignore and append child
      newChildren.append(start);
      i = i+1;
      continue;
    }

    // Find end of current section
    let startDepth = start.depth;
    let endIndex = children.length-1;
    let endIsImage = false;
    for (let j = i + 1; j < children.length; j++) {
      const next = children[j];
      
      if (isImageNode(next)) {
        endIndex = j;
        endIsImage = true;
        break;
      } else if (next.type === 'heading') {
        endIndex = j-1;
        break;
      }
    }

    // Slice text and contain in div
    let sectionChildren = [];
    const textSlice = children.slice(i, endIsImage ? endIndex : endIndex+1);

    // Text div
    /** @type {Parent} */
    const textDiv = {
      type: 'div',
      data: {
        hName: 'div',
        hProperties: {
          className: 'text'
        }
      },
      children: textSlice
    };
    sectionChildren.push(textDiv);

    // Add media class to image and push
    if (endIsImage) {
      let image = children[endIndex];
      image.value = image.value.replace("<img", `<img class="media"`);
      sectionChildren.push(image);
    }

    // Alternate between LTR and RTL sections
    const direction = !endIsImage || sectionCount % 2 === 0 ? 'LTR' : 'RTL';

    /** @type {Parent} */
    const section = {
      type: 'section',
      data: {
        hName: 'section',
        hProperties: {
          className: `articleSection ${direction}${endIsImage ? " equalWidth" : ""}`
        }
      },
      children: sectionChildren
    };

    newChildren.push(/** @type {Content} */ (section));
    sectionCount++;

    i = endIndex+1;
  }

  tree.children = newChildren;
}

/**
 * @param {Content} node
 */
function isImageNode(node) {
  return (
    node.type === 'image' ||
    (node.type === 'html' && /<img\b/i.test(node.value || ''))
  );
}

export default plugin;
