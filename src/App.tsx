import React, { useState } from 'react';
import { hierarchy } from 'd3-hierarchy';
import { ParentSize } from '@vx/responsive';
import data from './data';
import IcicleHorizontal from './IcicleHorizontal';
import IcicleVertical from './IcicleVertical';
import Sunburst from './Sunburst';
import './styles.css';

// const root = hierarchy(data)
//   .sum(d => d.size);

const root = hierarchy<any>(data)
  .eachBefore(
    (d) => (d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
  )
  .sum((d) => d.size)
  .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

export default function App() {
  const [layout, setLayout] = useState<
    'IcicleVertical' | 'IcicleHorizontal' | 'Sunburst'
  >('IcicleVertical');

  return (
    <div>
      <div
        style={{
          display: 'inline-grid',
          gridGap: 8,
          gridAutoFlow: 'column',
          gridAutoColumns: 'auto',
        }}
      >
        <label>
          <input
            type="radio"
            checked={layout === 'IcicleVertical'}
            onChange={() => setLayout('IcicleVertical')}
          />
          Icicle Vertical
        </label>
        <label>
          <input
            type="radio"
            checked={layout === 'IcicleHorizontal'}
            onChange={() => setLayout('IcicleHorizontal')}
          />
          Icicle Horizontal
        </label>
        <label>
          <input
            type="radio"
            checked={layout === 'Sunburst'}
            onChange={() => setLayout('Sunburst')}
          />
          Sunburst
        </label>
      </div>

      <ParentSize>
        {(size) =>
          size.ref && layout === 'IcicleVertical' ? (
            <IcicleVertical root={root} width={size.width} height={600} />
          ) : layout === 'IcicleHorizontal' ? (
            <IcicleHorizontal root={root} width={size.width} height={600} />
          ) : layout === 'Sunburst' ? (
            <div
              style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Sunburst
                root={root}
                width={size.width * 0.5}
                height={size.width * 0.5}
              />
            </div>
          ) : null
        }
      </ParentSize>
    </div>
  );
}
