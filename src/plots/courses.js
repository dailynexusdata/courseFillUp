/**
 * Course histories
 *
 * @author alex
 *
 */
import { select } from 'd3-selection';
import { scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale';
import { max, min, group } from 'd3-array';
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
const makeSinglePlot = (svg, textArea, data, size, entireData) => {
  const margin = {
    top: 30,
    right: 30,
    bottom: 20,
    left: 40,
  };
  /*
      Create Scales:
    */

  const x = scaleTime()
    .domain([
      min(entireData, (d) => min(d.vals, (b) => b.time)),
      max(entireData, (d) => max(d.vals, (b) => b.time)),
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
    .data(data, (t) => t.title)
    .join('p')
    .style('font-size', '10pt')
    .style('color', (d) => colors(d.title))
    .text((d) => d.title);

  svg
    .selectAll('path')
    .data(data)
    .join('path')
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
        { date: mdy('1.3.22'), text: 'Instruction' },
      ]
      : [
        { date: mdy('11.8.21'), text: '1' },
        { date: mdy('11.16.21'), text: 'Pass 2' },
        { date: mdy('12.13.21'), text: 'Pass 3' },
        { date: mdy('1.3.22'), text: 'Instruction' },
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
    .data([0, 0.25, 0.5, 0.75, 1])
    .enter()
    .append('line')
    .attr('stroke', '#d3d3d3')
    .attr('x2', margin.left)
    .attr('x1', size.width - margin.right)
    .attr('y1', (d) => y(d))
    .attr('y2', (d) => y(d))
    .lower();
  svg
    .selectAll('.dept-fillup-yaxis-text')
    .data([0.25, 0.5, 0.75, 1])
    .enter()
    .append('text')
    .attr('font-size', '11pt')
    .attr('class', 'dept-fillup-yaxis-text')
    .text((d) => d * 100 + (d === 1 ? '% of seats filled' : '%'))
    .attr('x', margin.left - 40)
    .attr('y', (d) => y(d) - 2);
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
    .style('flex-direction', 'column');

  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  const inputGroup = sel
    .append('div')
    .style('margin-right', '10px')
    .style('display', 'flex')
    .style('width', '100%')
    .style('flex-direction', 'row')
    .style('justify-content', 'space-around')
    .style('flex-wrap', 'wrap');

  const div1 = inputGroup.append('div');

  div1.append('p').text('Select a department: ');

  div1
    .append('select')
    .on('change', (event, d) => {
      const dept = select(event.target).node().value;
      updateDept(dept);
    })
    .selectAll('option')
    .data(
      [...group(data, (d) => d.dept).keys()].sort((a, b) => (a < b ? -1 : 1)),
    )
    .enter()
    .append('option')
    .attr('value', (d) => d)
    .text((d) => d);

  const div2 = inputGroup.append('div');

  div2.append('p').text('Select a course: ');

  const getDeptData = (deptName) => data
    .filter((d) => d.dept === deptName)
    .map((d) => d.title)
    .sort((a, b) => {
      const [aNumLetter, ...a1] = a.replace(/^[^0-9]+/, '').split(' ');
      const [bNumLetter, ...b1] = b.replace(/^[^0-9]+/, '').split(' ');

      const aNum = parseInt(aNumLetter);
      const bNum = parseInt(bNumLetter);
      const aLetter = aNumLetter.match(/\w+/);
      const bLetter = bNumLetter.match(/\w+/);
      if (aNum !== bNum) {
        return aNum - bNum;
      }
      return aLetter[0] < bLetter[0] ? -1 : 1;
    });

  const updateDept = (dept, first = false) => {
    const selectedCoursesOption = div2
      .selectAll('.coursefillup-dept-options')
      .data([dept], (d) => d)
      .join('select')
      .attr('class', 'coursefillup-dept-options')
      .style('height', '100px')
      .attr('multiple', '')
      .selectAll('option')
      .data((d) => getDeptData(d))
      .enter();

    const selectedCourses = selectedCoursesOption
      .append('option')
      .attr('selected', (d) => (first
        && ['ANTH 2 - INTRO CULT ANTHRO', 'ANTH 5 - INTRO BIO ANTH'].includes(d)
        ? true
        : null));

    const getSelectedCourses = () => selectedCourses
      .filter(function () {
        return select(this).attr('selected') === 'true';
      })
      .data();

    selectedCourses
      .attr('value', (d) => d)
      .text((d) => d)
      .on('mousedown', function (e) {
        e.preventDefault();
        const val = select(this).attr('selected');
        select(this).attr('selected', val === null ? true : null);

        const selCourses = getSelectedCourses().map((title) => data.find((d) => d.title === title));
        console.log(selCourses);
        makeSinglePlot(svg, descText, selCourses, size, data);
        return false;
      });
  };

  const descDiv = sel
    .append('div')
    .style('margin-top', '5px')
    .style('display', 'flex')
    .style('width', '100%')
    .style('flex-direction', 'row')
    .style('justify-content', 'center')
    .style('flex-wrap', 'wrap');

  descDiv.append('p').text('Selected Courses:').style('margin-right', '5px');

  const descText = descDiv.append('div');

  updateDept('ANTH', true);
  makeSinglePlot(
    svg,
    descText,
    data.filter((d) => ['ANTH 2 - INTRO CULT ANTHRO', 'ANTH 5 - INTRO BIO ANTH'].includes(
      d.title,
    )),
    size,
    data,
  );
};

export default makePlot;
