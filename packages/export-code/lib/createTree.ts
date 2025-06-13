import { relative, sep } from 'node:path';

interface FileTree {
  [key: string]: FileTree | null;
}

export function createFileTree(filenames: string[]) {
  if (filenames.length === 0) {
    return '';
  }

  // 1. Find the common base path to determine the root of the tree.
  // We split all paths into components and find the common prefix.
  const pathComponents = filenames.map(p => p.split(sep));
  const commonBase = [...pathComponents[0]];

  for (let i = 1; i < pathComponents.length; i++) {
    const currentPath = pathComponents[i];
    let j = 0;
    while (j < commonBase.length && j < currentPath.length && commonBase[j] === currentPath[j]) {
      j++;
    }
    commonBase.length = j; // Trim the commonBase to the shared part
  }

  const commonPath = commonBase.join(sep);
  const rootLabel = commonBase.length > 0 ? commonBase[commonBase.length - 1] : 'root';

  // 2. Build a hierarchical tree object from the paths.
  // 'src/utils/helpers.ts' becomes { src: { utils: { 'helpers.ts': null } } }
  const tree: FileTree = {};
  for (const filepath of filenames) {
    const relativePath = relative(commonPath, filepath);
    // On Windows, relative path can use '\', normalize to '/' for splitting
    const parts = relativePath.split(sep);
    let currentNode = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!currentNode[part]) {
        // If it's the last part, it's a file, marked with null.
        // Otherwise, it's a directory, marked with an empty object.
        currentNode[part] = i === parts.length - 1 ? null : {};
      }
      // Move deeper into the tree, unless it's a file (null)
      if (currentNode[part] !== null) {
        currentNode = currentNode[part];
      }
    }
  }

  // 3. Recursively render the tree object into the final string.
  const renderTree = (node: FileTree, prefix = '') => {
    let result = '';
    const entries = Object.keys(node).sort(); // Sort for consistent order

    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      result += `${prefix}${connector}${entry}\n`;

      // If the entry is a directory (not a file marked by null), recurse
      if (node[entry] !== null) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        result += renderTree(node[entry], newPrefix);
      }
    });

    return result;
  };

  return `${rootLabel}\n${renderTree(tree)}`;
}
