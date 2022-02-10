/**
 * @author alex
 * @since 2022-01-31
 */
import './styles.scss';

import { csv, json } from 'd3-fetch';
import { timeParse } from 'd3-time-format';

// import plot functions here:
// import makePLOT_NAME from "./PLOT_NAME";
import deptFillUpDots from '../plots/deptFillUpDots';
import deptFilledBar from '../plots/deptFilledBar';
import coursesPlot from '../plots/courses';

const main = async () => {
  // import data - use csv or json:
  // const data = await csv('file path or url');
  const tp = timeParse('%m-%d-%Y-%H-%M-%S');
  const tpCourses = timeParse('%m-%d-%Y %H:%M:%S');

  const nStudentsDept = (
    await json(
      'https://raw.githubusercontent.com/dailynexusdata/courseFillUp/main/dist/data/nStudentsDept.json',
    )
  ).map((d) => ({ ...d, date: tp(d.date) }));

  const deptsFilled = await json(
    'https://raw.githubusercontent.com/dailynexusdata/courseFillUp/main/dist/data/deptsFilled.json',
  );

  const coursesTs = (
    await json(
      'https://raw.githubusercontent.com/dailynexusdata/courseFillUp/main/dist/data/courses.json',
    )
  )
    .filter((v) => v.vals.length > 1)
    .map((d) => ({
      ...d,
      vals: d.vals.map((b) => ({ ...b, time: tpCourses(b.time) })),
    }));

  const resize = () => {
    // call imported plots here:
    // makePLOT_NAME(data);
    deptFillUpDots(nStudentsDept);
    deptFilledBar(deptsFilled);
    coursesPlot(coursesTs);
  };

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
};

main().catch((err) => {
  console.error(err);
});
