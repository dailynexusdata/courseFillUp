/**
 * bar charts
 *
 * @author alex
 *
 */
import { select } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import { axisBottom } from 'd3-axis';

/**
 * @param {*} data - end of pass times n and totals
 *
 * @author alex
 *
 * @since 2/6/2022
 */
const makePlot = (data) => {
  /*
    Container Setup:
  */

  // The class is necessary to apply styling
  const container = select('#coursefillup-bars')
    .attr('class', 'coursefillup')
    .style('width', '100%');

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container
    .append('h1')
    .text(
      'Departments With the Highest Percentage of Seats Filled at the End of Each Pass Time',
    );

  const size = {
    height: 400,
    width: Math.min(350, window.innerWidth - 40),
    // width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    top: 5,
    right: 30,
    bottom: 30,
    left: 70,
  };

  const divArea = container
    .append('div')
    .style('display', 'flex')
    .style('width', '100%')
    .style('flex-direction', 'row')
    .style('justify-content', 'center')
    .style('flex-wrap', 'wrap');

  const divs = divArea
    .selectAll('div')
    .data(
      Object.entries(data)
        .map(([a, b]) => {
          const sortedB = b.sort((x, y) => y.n / y.total - x.n / x.total);
          return [a, sortedB.slice(0, 10).reverse()];
        })
        .slice(0, 2),
    )
    .join('div');

  const tileDict = {
    pass1End: 'End of Pass 1',
    pass2End: 'End of Pass 2',
    pass3End: 'End of Pass 3',
  };

  divs.append('h3').text((d) => tileDict[d[0]]);

  const svg = divs
    .selectAll('svg')
    .data((d) => [d])
    .enter()
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  /*
    Create Scales:
  */

  /*
    Start Plot:
  */
  svg.each(function (dat, i) {
    const s = select(this);

    const [dept, vals] = dat;

    const x = scaleLinear()
      .domain([0, 1])
      .range([margin.left, size.width - margin.right]);

    const y = scaleBand()
      .domain(vals.map((d) => d.dept))
      .range([size.height - margin.bottom, margin.top])
      .paddingInner(0.1);
    s.selectAll('bars')
      .data(vals)
      .enter()
      .append('rect')
      .attr('x', x(0))
      .attr('y', (d) => y(d.dept))
      .attr('width', (d) => x(d.n / d.total) - x(0))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => (d.n / d.total > (dept === 'pass1End' ? 0.7 : 0.9)
        ? '#4e79a7'
        : '#d3d3d3'));

    s.selectAll('endlabas')
      .data(vals)
      .enter()
      .filter((d) => d.n / d.total > (dept === 'pass1End' ? 0.7 : 0.9))
      .append('text')
      .attr('x', (d) => x(d.n / d.total) + 3)
      .attr('alignment-baseline', 'center')
      .attr('y', (d) => y(d.dept) + y.bandwidth() / 2 + 5)
      .text((d) => `${Math.round((d.n / d.total) * 100)}%`);

    s.selectAll('startbals')
      .data(vals)
      .enter()
      .append('text')
      .text((d) => d.dept)
      .attr('x', x(0) - 5)
      .attr('y', (d) => y(d.dept) + y.bandwidth() / 2 + 5)
      .attr('alignment-baseline', 'center')
      .attr('text-anchor', 'end');

    s.append('g')
      .style('color', '#adadad')
      .style('font-size', '12pt')
      .attr('transform', `translate(0, ${size.height - margin.bottom})`)
      .call(
        axisBottom()
          .scale(x)
          .ticks(5)
          .tickFormat((d, i) => d * 100 + (i === 5 ? '%' : '')),
      );
  });
};

export default makePlot;
