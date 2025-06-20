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
    const isImageLike = isImageNode(start);

    // Find end of current section
    let endIndex = children.length;
    for (let j = i + 1; j < children.length; j++) {
      const next = children[j];
      if (
        (isHeading && isImageNode(next)) ||
        (isImageLike && next.type === 'heading')
      ) {
        endIndex = j;
        break;
      }
    }

    const slice = children.slice(i, endIndex);

    /** @type {Parent} */
    const section = {
      type: 'section',
      data: {
        hName: 'section',
        hProperties: {
          className: sectionCount % 2 === 0 ? 'LTR' : 'RTL'
        }
      },
      children: slice
    };

    newChildren.push(/** @type {Content} */ (section));
    sectionCount++;

    i = endIndex;
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
