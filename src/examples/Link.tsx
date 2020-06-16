import React from 'react';

import {
  LinkHorizontal,
  LinkVertical,
  LinkRadial,
  LinkHorizontalStep,
  LinkVerticalStep,
  LinkRadialStep,
  LinkHorizontalCurve,
  LinkVerticalCurve,
  LinkRadialCurve,
  LinkHorizontalLine,
  LinkVerticalLine,
  LinkRadialLine,
} from '@vx/shape';
import { TreeLayout, TreeOrientation, LinkType } from './Tree';
import LinkHorizontalElbow from '../shapes/link/elbow/LinkHorizontalElbow';
import LinkVerticalElbow from '../shapes/link/elbow/LinkVerticalElbow';

// TODO: Add label support - https://codesandbox.io/s/431xpyo4jx

export type LinkProps = {
  sx: number;
  sy: number;
  tx: number;
  ty: number;

  linkType?: LinkType;
  layout?: TreeLayout;
  orientation?: TreeOrientation;
  stepPercent?: number;
} & React.SVGProps<SVGPathElement>;

function Link(props: LinkProps) {
  const {
    sx,
    sy,
    tx,
    ty,
    linkType,
    layout,
    orientation,
    stepPercent,
    ...rootProps
  } = props;
  let LinkComponent: React.ComponentType<any>;

  if (layout === 'polar') {
    if (linkType === 'step') {
      LinkComponent = LinkRadialStep;
    } else if (linkType === 'curve') {
      LinkComponent = LinkRadialCurve;
    } else if (linkType === 'line') {
      LinkComponent = LinkRadialLine;
    } else if (linkType === 'elbow') {
      LinkComponent = LinkRadialStep; // TODO: Does it make sense to create LinkRadialElbow
    } else {
      LinkComponent = LinkRadial;
    }
  } else {
    if (orientation === 'vertical') {
      if (linkType === 'step') {
        LinkComponent = LinkVerticalStep;
      } else if (linkType === 'curve') {
        LinkComponent = LinkVerticalCurve;
      } else if (linkType === 'line') {
        LinkComponent = LinkVerticalLine;
      } else if (linkType === 'elbow') {
        LinkComponent = LinkVerticalElbow;
      } else {
        LinkComponent = LinkVertical;
      }
    } else {
      if (linkType === 'step') {
        LinkComponent = LinkHorizontalStep;
      } else if (linkType === 'curve') {
        LinkComponent = LinkHorizontalCurve;
      } else if (linkType === 'line') {
        LinkComponent = LinkHorizontalLine;
      } else if (linkType === 'elbow') {
        LinkComponent = LinkHorizontalElbow;
      } else {
        LinkComponent = LinkHorizontal;
      }
    }
  }

  return (
    <LinkComponent
      data={{
        source: { x: sx, y: sy },
        target: { x: tx, y: ty },
      }}
      percent={stepPercent}
      fill="none"
      {...rootProps}
    />
  );
}

export default Link;
