import { G as GetOrGenerate } from './Map-2dd95d96.js';

declare type Timestamped<V> = V & {
    readonly at: number;
};
/**
 * Options
 */
declare type TrackedValueOpts = {
    /**
     * If true, intermediate points are stored. False by default
     */
    readonly storeIntermediate?: boolean;
    /**
     * If above zero, tracker will reset after this many samples
     */
    readonly resetAfterSamples?: number;
};
declare abstract class TrackerBase<V> {
    readonly id: string;
    /**
     * @ignore
     */
    seenCount: number;
    /**
    * @ignore
    */
    protected storeIntermediate: boolean;
    /**
    * @ignore
    */
    protected resetAfterSamples: number;
    constructor(id: string, opts?: TrackedValueOpts);
    /**
     * Reset tracker
     */
    reset(): void;
    seen(...p: V[]): any;
    /**
     * @ignore
     * @param p
     */
    abstract seenImpl(p: V[]): V[];
    abstract get last(): V | undefined;
    /**
     * Returns the initial value, or undefined
     */
    abstract get initial(): V | undefined;
    /**
     * Returns the elapsed milliseconds since the initial value
     */
    abstract get elapsed(): number;
    /**
     * @ignore
     */
    onSeen(_p: V[]): void;
    /**
     * @ignore
     */
    abstract onReset(): void;
}
declare class PrimitiveTracker<V extends number | string> extends TrackerBase<V> {
    values: V[];
    timestamps: number[];
    constructor(id: string, opts: TrackedValueOpts);
    get last(): V | undefined;
    get initial(): V | undefined;
    /**
   * Returns number of recorded values (this can include the initial value)
   */
    get size(): number;
    /**
     * Returns the elapsed time, in milliseconds since the instance was created
     */
    get elapsed(): number;
    onReset(): void;
    /**
     * Tracks a value
     */
    seenImpl(p: V[]): V[];
}
/**
 * A tracked value of type `V`.
 */
declare class ObjectTracker<V> extends TrackerBase<V> {
    values: Timestamped<V>[];
    constructor(id: string, opts?: TrackedValueOpts);
    /**
     * Allows sub-classes to be notified when a reset happens
     * @ignore
     */
    onReset(): void;
    /**
     * Tracks a value
     * @ignore
     */
    seenImpl(p: V[] | Timestamped<V>[]): Timestamped<V>[];
    /**
     * Last seen value. If no values have been added, it will return the initial value
     */
    get last(): Timestamped<V>;
    /**
     * Returns the initial value
     */
    get initial(): Timestamped<V> | undefined;
    /**
     * Returns number of recorded values (includes the initial value in the count)
     */
    get size(): number;
    /**
     * Returns the elapsed time, in milliseconds since the initial value
     */
    get elapsed(): number;
}
declare class TrackedValueMap<V> {
    store: Map<string, TrackerBase<V>>;
    gog: GetOrGenerate<string, TrackerBase<V>, V>;
    constructor(creator: (key: string, start: V | undefined) => TrackerBase<V>);
    /**
     * Return number of named values being tracked
     */
    get size(): number;
    /**
     * Returns true if `id` is stored
     * @param id
     * @returns
     */
    has(id: string): boolean;
    /**
     * For a given id, note that we have seen one or more values.
     * @param id Id
     * @param values Values(s)
     * @returns Information about start to last value
     */
    seen(id: string, ...values: V[]): Promise<any>;
    /**
     * Creates or returns a TrackedValue instance for `id`.
     * @param id
     * @param values
     * @returns
     */
    protected getTrackedValue(id: string, ...values: V[]): Promise<TrackerBase<V>>;
    /**
     * Remove a tracked value by id.
     * Use {@link reset} to clear them all.
     * @param id
     */
    delete(id: string): void;
    /**
     * Remove all tracked values.
     * Use {@link delete} to remove a single value by id.
     */
    reset(): void;
    /**
     * Enumerate ids
     */
    ids(): Generator<string, void, undefined>;
    /**
     * Enumerate tracked values
     */
    tracked(): Generator<TrackerBase<V>, void, undefined>;
    /**
     * Iterates TrackedValues ordered with oldest first
     * @returns
     */
    trackedByAge(): Generator<TrackerBase<V>, void, unknown>;
    /**
     * Iterates underlying values, ordered by age (oldest first)
     * First the named values are sorted by their `elapsed` value, and then
     * we return the last value for that group.
     */
    valuesByAge(): Generator<V | undefined, void, unknown>;
    /**
     * Enumerate last received values
     *
     * @example Calculate centroid of latest-received values
     * ```js
     * const pointers = pointTracker();
     * const c = Points.centroid(...Array.from(pointers.lastPoints()));
     * ```
     */
    last(): Generator<V | undefined, void, unknown>;
    /**
     * Enumerate starting values
     */
    initialValues(): Generator<V | undefined, void, unknown>;
    /**
     * Returns a tracked value by id, or undefined if not found
     * @param id
     * @returns
     */
    get(id: string): TrackerBase<V> | undefined;
}

declare class NumberTracker extends PrimitiveTracker<number> {
    total: number;
    min: number;
    max: number;
    get avg(): number;
    /**
     * Difference between last value and initial.
     * Eg. if last value was 10 and initial value was 5, 5 is returned (10 - 5)
     * If either of those is missing, undefined is returned
     */
    difference(): number | undefined;
    /**
     * Relative difference between last value and initial.
     * Eg if last value was 10 and initial value was 5, 2 is returned (200%)
     */
    relativeDifference(): number | undefined;
    onReset(): void;
    onSeen(values: Timestamped<number>[]): void;
    getMinMaxAvg(): {
        min: number;
        max: number;
        avg: number;
    };
}
/**
 * Keeps track of the total, min, max and avg in a stream of values. By default values
 * are not stored.
 *
 * Usage:
 *
 * ```js
 * import { numberTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const t = numberTracker();
 * t.seen(10);
 *
 * t.avg / t.min/ t.max
 * t.initial; // initial value
 * t.size;    // number of seen values
 * t.elapsed; // milliseconds since intialisation
 * t.last;    // last value
 * ```
 *
 * To get `{ avg, min, max, total }`
 * ```
 * t.getMinMax()
 * ```
 *
 * Use `t.reset()` to clear everything.
 *
 * Trackers can automatically reset after a given number of samples
 * ```
 * // reset after 100 samples
 * const t = numberTracker(`something`, { resetAfterSamples: 100 });
 * ```
 *
 * To store values, use the `storeIntermediate` option:
 *
 * ```js
 * const t = numberTracker(`something`, { storeIntermediate: true });
 * ```
 *
 * Difference between last value and initial value:
 * ```js
 * t.relativeDifference();
 * ```
 *
 * Get raw data (if it is being stored):
 * ```js
 * t.values; // array of numbers
 * t.timestampes; // array of millisecond times, indexes correspond to t.values
 * ```
 * @class NumberTracker
 */
declare const numberTracker: (id?: string, opts?: TrackedValueOpts) => NumberTracker;

export { NumberTracker as N, ObjectTracker as O, PrimitiveTracker as P, TrackedValueOpts as T, Timestamped as a, TrackedValueMap as b, TrackerBase as c, numberTracker as n };
