/**
 * Course histories
 *
 * @author alex
 *
 */
import { select } from 'd3-selection';
import { scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale';
import { max, min } from 'd3-array';
import { line } from 'd3-shape';
import { schemeTableau10 } from 'd3-scale-chromatic';

import { timeParse, timeFormat } from 'd3-time-format';

const mdy = timeParse('%m.%d.%y');
/**
 * @param {*} data - courses.csv
 *
 * @author alex
 *
 * @since 2/8/22
 */
const makeSinglePlot = (svg, textArea, data, size) => {
  const margin = {
    top: 30,
    right: 80,
    bottom: 10,
    left: 50,
  };
  /*
      Create Scales:
    */

  const x = scaleTime()
    .domain([
      min(data, (d) => min(d.vals, (b) => b.time)),
      max(data, (d) => max(d.vals, (b) => b.time)),
    ])
    .range([margin.left, size.width - margin.right]);

  const y = scaleLinear().range([size.height - margin.bottom, margin.top]);

  /*
      Start Plot:
    */

  const p = line()
    .x((d) => x(d.time))
    .y((d) => y(d.n / d.total));

  const colors = scaleOrdinal()
    .domain(data.map((d) => d.title))
    .range(schemeTableau10);

  textArea
    .selectAll('p')
    .data(data)
    .enter()
    .append('p')
    .style('font-size', '10pt')
    .style('color', (d) => colors(d.title))
    .text((d) => d.title);

  svg
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('d', (d) => p(d.vals))
    .attr('fill', 'none')
    .attr('stroke-width', '2px')
    .attr('stroke', (d) => colors(d.title));

  const labs =
    window.innerWidth > 400
      ? [
        { date: mdy('11.8.21'), text: 'Pass 1' },
        { date: mdy('11.16.21'), text: 'Pass 2' },
        { date: mdy('12.13.21'), text: 'Pass 3' },
        { date: mdy('1.3.22'), text: 'Instruction Begins' },
      ]
      : [
        { date: mdy('11.8.21'), text: '1' },
        { date: mdy('11.16.21'), text: 'Pass 2' },
        { date: mdy('12.13.21'), text: 'Pass 3' },
        { date: mdy('1.3.22'), text: 'Instruction Begins' },
      ];

  svg
    .selectAll('.dept-fillup-vlines')
    .data(labs)
    .enter()
    .append('line')
    .attr('class', 'dept-fillup-vlines')
    .attr('x1', (d) => x(d.date))
    .attr('x2', (d) => x(d.date))
    .attr('y1', 0)
    .attr('y2', size.height)
    .attr('stroke', '#d3d3d3')
    .attr('stroke-width', '1.5px')
    .attr('stroke-dasharray', '3,3')
    .lower();
  svg
    .selectAll('.dept-fillup-text')
    .data(labs)
    .enter()
    .append('text')
    .attr('class', 'dept-fillup-text')
    .text((d) => d.text)
    .attr('x', (d) => x(d.date) + 2)
    .attr('y', size.height - 5)
    .attr('font-size', 12)
    .attr('font-weight', 100)
    .lower();

  svg
    .selectAll('lines')
    .data([0.25, 0.5, 0.75, 1])
    .enter()
    .append('line')
    .attr('stroke', '#d3d3d3')
    .attr('x2', margin.left)
    .attr('x1', size.width - margin.right)
    .attr('y1', (d) => y(d))
    .attr('y2', (d) => y(d));
  svg
    .selectAll('asd')
    .data([0.25, 0.5, 0.75, 1])
    .enter()
    .append('text')
    .text((d) => d * 100 + (d === 1 ? '% of seats filled' : '%'))
    .attr('x', margin.left - 25)
    .attr('y', (d) => y(d));
};

const makePlot = (data) => {
  /*
    Container Setup:
  */
  console.log(data);
  // The class is necessary to apply styling
  const container = select('#coursefillup-course-ts').attr(
    'class',
    'coursefillup',
  );

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container.append('h1').text('When Each Class Filled Up');

  const sel = container
    .append('div')
    .style('width', '100%')
    .style('display', 'flex')
    .style('justify-content', 'flex-start')
    .style('flex-direction', 'row');

  const inputGroup = sel.append('div').style('margin-right', '10px');

  inputGroup.append('p').text('Select Classes: ');

  inputGroup.append('input');

  const descText = sel.append('div');

  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  makeSinglePlot(svg, descText, data.slice(0, 3), size);
};

export default makePlot;
