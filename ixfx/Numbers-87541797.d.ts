import { T as TrackedValueOpts, N as NumberTracker } from './NumberTracker-43c93cbe.js';
import { a as EasingFn } from './Easing-57384b54.js';

/**
 * Calculates the average of all numbers in an array.
 * Array items which aren't a valid number are ignored and do not factor into averaging.

 * @example
 * ```
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 *
 * // Average of a list
 * const avg = Numbers.average(1, 1.4, 0.9, 0.1);
 *
 * // Average of a variable
 * let data = [100,200];
 * Numbers.average(...data);
 * ```
 *
 * See also: [Arrays.average](Collections.Arrays.average.html) which takes an array.
 * @param data Data to average.
 * @returns Average of array
 */
declare const average: (...numbers: readonly number[]) => number;
/**
 * See [Arrays.averageWeighted](Collections.Arrays.averageWeighted.html)
 * @param weightings
 * @param numbers
 * @returns
 */
declare const averageWeighted: (weightings: (readonly number[]) | EasingFn, ...numbers: readonly number[]) => number;
/**
 * Returns the minimum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.min(10, 20, 0); // Yields 0
 * ```
 * @param data
 * @returns Minimum number
 */
declare const min: (...data: readonly number[]) => number;
/**
 * Returns the maximum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.max(10, 20, 0); // Yields 20
 * ```
 * @param data
 * @returns Maximum number
 */
declare const max: (...data: readonly number[]) => number;
/**
 * Returns the total of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.total(10, 20, 0); // Yields 30
 * ```
 * @param data
 * @returns Total
 */
declare const total: (...data: readonly number[]) => number;
/**
 * Returns true if `possibleNumber` is a number and not NaN
 * @param possibleNumber
 * @returns
 */
declare const isValid: (possibleNumber: number | unknown) => boolean;
/**
 * Alias for [Data.numberTracker](Data.numberTracker.html)
 */
declare const tracker: (id?: string, opts?: TrackedValueOpts) => NumberTracker;
/**
 * Filters an iterator of values, only yielding
 * those that are valid numbers
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 *
 * const data = [true, 10, '5', { x: 5 }];
 * for (const n of Numbers.filter(data)) {
 *  // 5
 * }
 * ```
 * @param it
 */
declare function filter(it: Iterable<unknown>): Generator<unknown, void, unknown>;

declare const Numbers_average: typeof average;
declare const Numbers_averageWeighted: typeof averageWeighted;
declare const Numbers_min: typeof min;
declare const Numbers_max: typeof max;
declare const Numbers_total: typeof total;
declare const Numbers_isValid: typeof isValid;
declare const Numbers_tracker: typeof tracker;
declare const Numbers_filter: typeof filter;
declare namespace Numbers {
  export {
    Numbers_average as average,
    Numbers_averageWeighted as averageWeighted,
    Numbers_min as min,
    Numbers_max as max,
    Numbers_total as total,
    Numbers_isValid as isValid,
    Numbers_tracker as tracker,
    Numbers_filter as filter,
  };
}

export { Numbers as N, average as a, averageWeighted as b, max as c, tracker as d, filter as f, isValid as i, min as m, total as t };
