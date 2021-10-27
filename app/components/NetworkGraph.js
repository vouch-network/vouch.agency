import Graph from 'react-graph-vis';
import { Box } from 'grommet';
import { useMemo } from 'react';

import { colors } from 'utils/theme';

const mockGraph = Array.from({ length: 20 }).map((x, i) => ({
  id: `Person ${i + 1}`,
  vouchedByIds: Array.from({ length: 2 }).map(
    // doesn't account for self rn just roll with it
    (xx, ii) => `Person ${Math.floor(Math.random() * 20)}`
  ),
}));

export default function NetworkGraph(props) {
  const graph = useMemo(() => {
    const data = {
      nodes: [],
      edges: [],
    };

    mockGraph.forEach((user) => {
      data.nodes.push({
        id: user.id,
        label: user.id,
      });

      user.vouchedByIds.forEach((id) => {
        data.edges.push({
          from: id,
          to: user.id,
        });
      });
    });

    return data;
  }, [mockGraph]);

  return (
    <Box
      {...props}
      // only render graph in browser
      suppressHydrationWarning
    >
      {process.browser && (
        <Graph
          graph={graph}
          // https://almende.github.io/vis/docs/network/#options
          options={{
            edges: {
              color: {
                color: colors['neutral-1'],
                hover: colors['accent-2'],
                highlight: colors['accent-2'],
                opacity: 0.9,
              },
              smooth: {
                // for more angular lines:
                type: 'cubicBezier',
                forceDirection: 'horizontal',
                roundness: 1,
              },
              width: 5,
            },
            nodes: {
              borderWidth: 0,
              color: colors['accent-1'],
              shape: 'box',
              // shape: 'star',
              font: {
                face: 'sans-serif',
                size: 20,
              },
            },
            manipulation: {
              enabled: false,
            },
            interaction: {
              hover: true,
            },
            physics: {
              enabled: false,
            },
          }}
        />
      )}
    </Box>
  );
}
