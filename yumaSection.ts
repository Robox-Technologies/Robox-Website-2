import { Root, Content, Parent } from 'mdast';
import { Plugin } from 'unified';

const plugin: Plugin<[], Root> = () => {
    return transform;
};

function transform(tree: Root): void {
    const children = tree.children;
    const newChildren: Content[] = [];
    let sectionCount = 0;
    let i = 0;

    while (i < children.length) {
        const start = children[i];

        const isHeading = start.type === 'heading';
        const isImageLike = isImageNode(start);

        // Decide end condition
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

        const section: Parent = {
            type: 'section',
            data: {
                hName: 'section',
                hProperties: {
                    className: sectionCount % 2 === 0 ? 'LTR' : 'RTL'
                }
            },
            children: slice
        };

        newChildren.push(section as Content);
        sectionCount++;

        i = endIndex; // move to next unprocessed node
    }

    tree.children = newChildren;
}

function isImageNode(node: Content): boolean {
    return (
        node.type === 'image' ||
        (node.type === 'html' && /<img\b/i.test((node as any).value || ''))
    );
}

export default plugin;
