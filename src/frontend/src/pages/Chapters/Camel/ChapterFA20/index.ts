/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import caller from '!raw-loader!./caller.mligo'
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import course from '!raw-loader!./course.md'
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import exercise from '!raw-loader!./exercise.mligo'
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import fa2_interface from '!raw-loader!./tzip-12/fa2_interface.mligo'
/* eslint import/no-webpack-loader-syntax: off */
// @ts-ignore
import solution from '!raw-loader!./solution.mligo'

export const data = { course, exercise, solution, supports: {fa2_interface, caller} }
