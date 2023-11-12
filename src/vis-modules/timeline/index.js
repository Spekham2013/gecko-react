import React from 'react';
import { groupBy } from 'utils';
import classNames from 'classnames';
import styles from './styles.module.css';
import { DownloadSVG } from 'core/ui/DownloadSVG';

const X_OFFSET = 100;
const Y_OFFSET = 50;
const X_GAP = 20;
const Y_GAP = 70;

const TimeAxis = ({ years }) => (
  <g key="axis">
    {years.map((year, i) => (
      <g key={year}>
        <text x={10} y={5 + Y_OFFSET + i * Y_GAP}>
          {year}
        </text>
        <line
          x1={25}
          y1={5 + Y_OFFSET + i * Y_GAP + 10}
          x2={25}
          y2={5 + Y_OFFSET + (i + 1) * Y_GAP - 20}
          stroke="black"
          strokeDasharray={year - years[i + 1] > 1 ? '4' : null}
        />
      </g>
    ))}
  </g>
);

const Connectors = ({ edges, nodes }) => (
  <g key="edges">
    {edges.map(edge => (
      <path d={getConnectingPath(edge, nodes)} fill="none" stroke="grey" strokeWidth={1} />
    ))}
  </g>
);

const Nodes = ({ nodes, onSelect, isHighlighted }) => (
  <g key="nodes">
    {Object.values(nodes).map(node => (
      <circle
        key={node.paper.ID}
        onClick={evt => {
          onSelect(node.paper);
          evt.stopPropagation();
        }}
        className={classNames({
          [styles['seed-node']]: node.paper.seed,
          [styles['node']]: !node.paper.seed,
          [styles['hide']]: !isHighlighted(node)
        })}
        r={node.r}
        cx={node.x}
        cy={node.y}
      >
        <title>{node.paper.title}</title>
      </circle>
    ))}
  </g>
);

export const Timeline = ({ data: { Papers, Edges }, onSelect, selected }) => {
  const papersByYear = groupBy(Object.values(Papers), 'year');
  const years = Object.keys(papersByYear)
    .sort()
    .reverse();
  const maxHeight = Y_OFFSET + Y_GAP * (years.length + 2);
  const maxWidth = 10000;

  const nodes = getNodes(Object.values(Papers));
  const edges = getConnections(selected[0], Edges, Object.values(Papers));

  const isHighlighted = node =>
    !edges.length
      ? true
      : edges
          .map(e => e.target)
          .concat(edges.map(e => e.source))
          .filter(id => node.ID == id).length;

  return (
    <div className={styles['timeline-container']}>
      <DownloadSVG id={'timeline'} />
      <svg
        id="timeline"
        width={maxWidth}
        height={maxHeight}
        onClick={() => onSelect(null)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <TimeAxis years={years} />
        <Connectors edges={edges} nodes={nodes} />
        <Nodes nodes={nodes} onSelect={onSelect} isHighlighted={isHighlighted} />
      </svg>
    </div>
  );
};

function getConnections(id, edges, papers) {
  const papersWithYear = papers.filter(p => p.year);
  return edges.filter(e => {
    // TODO this is a quadratic lookup - must fix
    const idHasYear = papersWithYear.filter(p => p.ID === id).length;

    // Exclude edges whose source or target doesn't have a year
    // TODO this should not be done here but further up the chain
    if (idHasYear) {
      if (e.source === id) {
        const targetHasYear = papersWithYear.filter(p => p.ID === e.target).length;
        return targetHasYear;
      }
      if (e.target === id) {
        const sourceHasYear = papersWithYear.filter(p => p.ID === e.source).length;
        return sourceHasYear;
      }
    }
    return false;
  });
}

function getConnectingPath(edge, nodes) {
  const startPoint = [nodes[edge.source].x, nodes[edge.source].y];
  const endPoint = [nodes[edge.target].x, nodes[edge.target].y];
  const controlPoint1 = [nodes[edge.source].x, nodes[edge.source].y + Y_GAP / 2];
  const controlPoint4 = [nodes[edge.target].x, nodes[edge.target].y + Y_GAP / 2];

  if (nodes[edge.source].y === nodes[edge.target].y) {
    return `M ${startPoint} L ${controlPoint1} L${controlPoint4} L ${endPoint}`;
  }

  const controlPoint2 = [(2 * X_OFFSET) / 3, nodes[edge.source].y + Y_GAP / 2];
  const controlPoint3 = [(2 * X_OFFSET) / 3, nodes[edge.target].y + Y_GAP / 2];
  return `
    M ${startPoint} 
    L ${controlPoint1}
    L ${controlPoint2}
    L ${controlPoint3}
    L ${controlPoint4}
    L ${endPoint}
  `;
}

function getNodes(papers) {
  let nodes = {};
  // Sort by year
  //const sortedPapers = papers.sort((a, b) => b.year - a.year);
  const papersWithYear = papers.filter(p => p.year);
  const sortedPapers = papersWithYear.sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
  let seeds = papersWithYear.filter(p => p.seed);
  //Initialise
  let [lastX, lastY, lastR, lastYear] = [X_OFFSET, Y_OFFSET - Y_GAP, 0, 3000];
  // Loop
  for (let i = 0; i < sortedPapers.length; i++) {
    let paper = sortedPapers[i];
    let sizeMetric = paper['seedsCitedBy'] + paper['seedsCited'];
    let r = paper.seed ? 10 : 10 + ((Y_GAP / 2 - 5) * (sizeMetric - 1)) / seeds.length;
    if (paper.year < lastYear) {
      lastY += Y_GAP;
      lastYear = paper.year;
      lastX = X_OFFSET;
    } else {
      lastX += lastR + X_GAP + r;
    }
    lastR = r;
    nodes[paper.ID] = {
      ID: paper.ID,
      x: lastX,
      y: lastY,
      r,
      paper
    };
  }
  return nodes;
}
