/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import course from "!raw-loader!./course.md";
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import exercise from "!raw-loader!./exercise.mligo";
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import solution from "!raw-loader!./solution.mligo";
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import support1 from "!raw-loader!./fungible_token.mligo";
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import support2 from "!raw-loader!./caller.mligo";

export const data = { course, exercise, solution, support1, support2 };