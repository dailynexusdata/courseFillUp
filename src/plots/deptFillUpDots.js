/**
 *
 * @author alex
 *
 */
import { select } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { max, extent } from 'd3-array';
import { line } from 'd3-shape';
import { format } from 'd3-format';
import { timeParse, timeFormat } from 'd3-time-format';

let playBack = 0;
let start = null;
let playing = false;
let playBackFunc = null;
let last_key = 0;
let restart = false;

const resetVals = () => {
  playBack = 0;
  start = null;
  last_key = 0;
  playing = false;
  playBackFunc = null;
  restart = false;
};

const mdy = timeParse('%m.%d.%y');
/**
 * @param {*} data - nStudentsDept.json
 *
 * @author alex
 *
 * @since 1/30/22
 */
const makePlot = (data, start_idx = 0) => {
  /*
      Container Setup:
    */

  // The class is necessary to apply styling
  const container = select('#coursefillup-deptFillUpDots').attr(
    'class',
    'coursefillup',
  );

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container
    .append('h1')
    .text('Total Number of Filled Seats for Winter Quarter 2022');

  container
    .append('p')
    .style('display', 'block')
    .attr('id', 'class-fill-up-total-text')
    .style('margin-bottom', '5px')
    .html('Total number of undergraduate courses have signed up for');
  container
    .append('div')
    .style('width', '100%')
    .style('display', 'flex')
    .style('align-items', 'center')
    .append('div')
    .attr('id', 'coursefillup-deptFillUpDots-lines')
    .style('margin-bottom', '20px');

  // container
  //   .append('p')
  //   .text('To view the complete interactive graphic, visit dailynexus.com.');

  container
    .append('div')
    .style('width', '100%')
    .style('margin', '10px')
    .style('display', 'flex')
    .style('align-items', 'center')
    .append('button')
    .attr('id', 'course-fill-up-timeline-button')
    .text('Pause')
    .style('border-radius', '20px')
    .style('padding', '3px 10px')
    .style('background-color', 'white')
    .on('click', function () {
      if (restart) {
        console.log(data);
        resetVals();
        makePlot(data);
      }
      else if (playing) {
        select(this).text('Play');
        window.cancelAnimationFrame(playBack);
        playing = false;
      }
      else {
        select(this).text('Pause');
        playBack = window.requestAnimationFrame(playBackFunc);
      }
    });

  container
    .append('p')
    .style('margin-bottom', '10px')
    .text(
      "The following plots show how filled each department was by total offered seats. Each circle represents a seat being filled in one of the department's courses.",
    );
  container
    .append('div')
    .style('width', '100%')
    .style('display', 'flex')
    .style('align-items', 'center')
    .append('div')
    .attr('id', 'coursefillup-deptFillUpDots-boxes');

  play(data, null);
};

const hours = timeFormat('%m/%d/%Y');

const updatePlot = (data, i) => {
  makeLinePlot(data, data.slice(0, i + 1));
  makeDots(i + 1, data);

  select('#class-fill-up-total-text').text(
    `Total number of undergraduate courses signed up for by ${hours(
      data[i].date,
    )}:`,
  );
};

const play = (data, timestamp = null, start_idx = 0) => {
  console.log('PLAYING', data.length, timestamp, start_idx, playing, start);
  let i;
  if (timestamp !== null) {
    if (start === null) {
      start = timestamp;
    }
    const factor = 10;

    if (!playing) {
      console.log('not playing', timestamp, start_idx);
      start = timestamp - start_idx * factor;
    }
    const progress = timestamp - start;
    i = Math.floor(progress / factor);
    console.log(start, i);

    if (i >= data.length) {
      // updatePlot(data, data.length - 1);
      window.cancelAnimationFrame(playBack);
      restart = true;
      select('#course-fill-up-timeline-button').text('Restart');
      return;
    }

    playing = true;

    updatePlot(data, i);
  }

  //   makeDots(data[20], data[20].date);
  //   makeDots(data[21], data[21].date);
  playBackFunc = (ts) => play(data, ts, i);
  playBack = window.requestAnimationFrame(playBackFunc);
};

const makeDots = (key, data) => {
  if (key === last_key) {
    return;
  }
  const slce = data.slice(last_key, key);

  const outer = select('#coursefillup-deptFillUpDots-boxes')
    .style('overflow-y', 'hidden')
    .style('margin-bottom', '10px');

  const size = {
    height: 390,
    width: Math.min(600, window.innerWidth - 40),
  };

  const boxSize = {
    height: 170,
    width: 200,
  };

  const margin = {
    top: 10,
    right: 80,
    bottom: 20,
    left: 10,
  };

  outer.style('width', `${size.width}px`);

  const reorder = {};

  slce.forEach((d) => {
    d.nStudents.forEach((b) => {
      const psh = { ...b, date: d.date };
      if (Object.keys(reorder).includes(b.dept)) {
        reorder[b.dept].push(psh);
      }
      else {
        reorder[b.dept] = [psh];
      }
    });
  });

  const container = outer
    .selectAll('#coursefill-up-main-box')
    .data([Object.values(reorder)])
    .join('div')
    .attr('id', 'coursefill-up-main-box')
    .style('height', `${size.height}px`)
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('justify-content', 'flex-start')
    .style('flex-wrap', 'wrap');

  const r = 0.5;

  container
    .selectAll('.coursefill-up-dept-box')
    .data((d) => d)
    .join(
      (enter) => {
        const divs = enter
          .append('div')
          .attr('class', 'coursefill-up-dept-box');

        divs
          .selectAll('h3')
          .data((d) => [d[0]])
          .join('h3')
          .text((d) => `${d.dept} ${Math.round((d.n / d.total) * 100)}%`);

        divs
          .selectAll('canvas')
          .data((d) => [d])
          .join('canvas')
          .attr('width', boxSize.width - 20)
          .attr('height', boxSize.height - 10)
          .style('margin', '0 20px 10px 0')
          .text('Your browser does not support the canvas element.')
          .each(function (d) {
            const cvs = select(this).node();
            const context = cvs.getContext('2d');

            const x = scaleLinear().range([r * 2, boxSize.width - r * 2]);
            const y = scaleLinear().range([r * 2, boxSize.height - r * 2]);

            context.strokeStyle = '#4e79a7';

            d.forEach((dat) => {
              if (dat.inc <= 0) return;
              [...new Array(dat.inc)].forEach(() => {
                context.beginPath();
                context.arc(
                  x(Math.random()),
                  y(Math.random()),
                  r,
                  0,
                  2 * Math.PI,
                );
                // context.closePath();
                // context.fill();
                context.stroke();
              });
            });
          });
      },
      (update) => {
        update
          .selectAll('h3')
          .data((d) => [d])
          .text((b) => {
            const d = b[b.length - 1];
            return `${d.dept} - ${Math.round((d.n / d.total) * 100)}% full`;
          });

        update
          .selectAll('canvas')
          .data((d) => [d])
          .each(function (d) {
            const cvs = select(this).node();
            const context = cvs.getContext('2d');

            const x = scaleLinear().range([r * 2, boxSize.width - r * 2]);
            const y = scaleLinear().range([r * 2, boxSize.height - r * 2]);

            d.forEach((dat) => {
              if (dat.inc <= 0) return;
              [...new Array(dat.inc)].forEach(() => {
                context.beginPath();
                context.arc(
                  x(Math.random()),
                  y(Math.random()),
                  r,
                  0,
                  2 * Math.PI,
                );
                context.stroke();
              });
            });
          });
      },
    );

  last_key = key;
};

const makeLinePlot = (data, topData) => {
  const container = select('#coursefillup-deptFillUpDots-lines');

  const size = {
    height: 120,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    top: 30,
    right: 80,
    bottom: 20,
    left: 10,
  };

  const svg = container
    .selectAll('svg')
    .data([topData])
    .join('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  /*
        Create Scales:
      */

  const x = scaleTime()
    .domain(extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const y = scaleLinear()
    .domain([0, max(data.map((d) => d.total))])
    .range([size.height - margin.bottom, margin.top]);

  /*
        Start Plot:
      */

  const path = line()
    .x((d) => x(d.date))
    .y((d) => y(d.total));

  svg
    .selectAll('.dept-fillup-background-lines')
    .data([data])
    .enter()
    .append('path')
    .attr('class', 'dept-fillup-background-lines')
    .attr('d', path)
    .attr('stroke-width', '2px')
    .attr('stroke', '#adadad')
    .attr('fill', 'none');

  svg
    .selectAll('.dept-fillup-top-lines')
    .data((d) => [d])
    .join('path')
    .attr('class', 'dept-fillup-top-lines')
    .attr('stroke-width', '3px')
    .attr('stroke', 'black')
    .attr('fill', 'none')
    .attr('d', path);

  svg
    .selectAll('.dept-fillup-top-dots')
    .data(() => [topData[topData.length - 1]])
    .join('circle')
    .attr('class', 'dept-fillup-top-dots')
    .attr('r', 4)
    .attr('cx', (d) => x(d.date))
    .attr('cy', (d) => y(d.total));

  const comma = format(',');

  svg
    .selectAll('.dept-fillup-top-text')
    .data(() => [topData[topData.length - 1]])
    .join('text')
    .attr('class', 'dept-fillup-top-text')
    .attr('x', (d) => x(d.date) + 5)
    .attr('y', (d) => y(d.total) + 5)
    .attr('alignment-baseline', 'hanging')
    .text((d) => comma(d.total));

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

  // const countsStay = [
  //   topData.find((d) => d.date.getTime() = labs[1].date.getTime()),
  //   topData.find((d) => d.date.getTime() > labs[2].date.getTime()),
  //   topData.find((d) => d.date.getTime() > labs[3].date.getTime()),
  // ].filter((d) => d);

  const getNearest = (i) => (best, d) => {
    const target = labs[i].date.getTime();
    const curr = target - d.date.getTime();
    if (target - best.date.getTime() > curr && curr > 0) {
      return d;
    }
    return best;
  };

  const currDate = topData[topData.length - 1].date;

  const countsStay = [
    data.reduce(getNearest(1), { date: mdy('11.1.21') }),
    data.reduce(getNearest(2), { date: mdy('11.1.21') }),
    data.reduce(getNearest(3), { date: mdy('11.1.21') }),
  ].filter((d) => d && d.date.getTime() <= currDate.getTime());

  svg
    .selectAll('.dept-fillup-top-dots-stay')
    .data(countsStay)
    .join('circle')
    .attr('class', 'dept-fillup-top-dots-stay')
    .attr('r', 4)
    .attr('cx', (d) => x(d.date))
    .attr('cy', (d) => y(d.total));

  svg
    .selectAll('.dept-fillup-top-text-stay')
    .data(countsStay)
    .join('text')
    .attr('class', 'dept-fillup-top-text-stay')
    .attr('x', (d) => x(d.date) + 5)
    .attr('y', (d, i) => y(d.total) + (i !== 2 ? 5 : -15))
    .attr('alignment-baseline', 'hanging')
    .attr('fill', '#adadad')
    .text((d) => comma(d.total))
    .lower();
};

export default makePlot;
