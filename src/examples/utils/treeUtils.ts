import { pointRadial } from 'd3-shape';
import { TreeLayout, TreeOrientation } from '../Tree';

export function findCollapsedParent(node: any): any | null {
  if (!node.data.isExpanded) {
    return node;
  } else if (node.parent) {
    return findCollapsedParent(node.parent);
  } else {
    return null;
  }
}

export function translateCoords(
  node: { x: number; y: number },
  layout?: TreeLayout,
  orientation?: TreeOrientation
) {
  if (layout === 'polar') {
    const [radialX, radialY] = pointRadial(node.x, node.y);
    return {
      x: radialX,
      y: radialY,
    };
  } else if (orientation === 'vertical') {
    return {
      x: node.x,
      y: node.y,
    };
  } else {
    return {
      x: node.y,
      y: node.x,
    };
  }
}

export function childCountByDepth(root: any) {
  var result = [1];
  const childCount = (level: number, node: any) => {
    if (node.children && node.children.length > 0) {
      if (result.length <= level + 1) result.push(0);

      result[level + 1] += node.children.length;
      node.children.forEach((d: any) => childCount(level + 1, d));
    }
  };
  childCount(0, root);

  return result;
}
