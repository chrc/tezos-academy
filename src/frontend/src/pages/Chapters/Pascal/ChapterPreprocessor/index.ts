/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import course from "!raw-loader!./course.md";
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import exercise from "!raw-loader!./inventory_exercise.ligo";
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import solution from "!raw-loader!./inventory_solution.ligo";
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import support1 from "!raw-loader!./extra.ligo";

export const data = { course, exercise, solution, support1 };