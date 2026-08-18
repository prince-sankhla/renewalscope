"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@supabase/node-fetch/browser.js
  var browser_exports = {};
  __export(browser_exports, {
    Headers: () => Headers2,
    Request: () => Request,
    Response: () => Response2,
    default: () => browser_default,
    fetch: () => fetch2
  });
  var getGlobal, globalObject, fetch2, browser_default, Headers2, Request, Response2;
  var init_browser = __esm({
    "node_modules/@supabase/node-fetch/browser.js"() {
      "use strict";
      getGlobal = function() {
        if (typeof self !== "undefined") {
          return self;
        }
        if (typeof window !== "undefined") {
          return window;
        }
        if (typeof global !== "undefined") {
          return global;
        }
        throw new Error("unable to locate global object");
      };
      globalObject = getGlobal();
      fetch2 = globalObject.fetch;
      browser_default = globalObject.fetch.bind(globalObject);
      Headers2 = globalObject.Headers;
      Request = globalObject.Request;
      Response2 = globalObject.Response;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestError.js
  var require_PostgrestError = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestError.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestError = class extends Error {
        constructor(context) {
          super(context.message);
          this.name = "PostgrestError";
          this.details = context.details;
          this.hint = context.hint;
          this.code = context.code;
        }
      };
      exports.default = PostgrestError;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestBuilder.js
  var require_PostgrestBuilder = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestBuilder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var node_fetch_1 = __importDefault((init_browser(), __toCommonJS(browser_exports)));
      var PostgrestError_1 = __importDefault(require_PostgrestError());
      var PostgrestBuilder2 = class {
        constructor(builder) {
          this.shouldThrowOnError = false;
          this.method = builder.method;
          this.url = builder.url;
          this.headers = builder.headers;
          this.schema = builder.schema;
          this.body = builder.body;
          this.shouldThrowOnError = builder.shouldThrowOnError;
          this.signal = builder.signal;
          this.isMaybeSingle = builder.isMaybeSingle;
          if (builder.fetch) {
            this.fetch = builder.fetch;
          } else if (typeof fetch === "undefined") {
            this.fetch = node_fetch_1.default;
          } else {
            this.fetch = fetch;
          }
        }
        /**
         * If there's an error with the query, throwOnError will reject the promise by
         * throwing the error instead of returning it as part of a successful response.
         *
         * {@link https://github.com/supabase/supabase-js/issues/92}
         */
        throwOnError() {
          this.shouldThrowOnError = true;
          return this;
        }
        /**
         * Set an HTTP header for the request.
         */
        setHeader(name, value) {
          this.headers = Object.assign({}, this.headers);
          this.headers[name] = value;
          return this;
        }
        then(onfulfilled, onrejected) {
          if (this.schema === void 0) {
          } else if (["GET", "HEAD"].includes(this.method)) {
            this.headers["Accept-Profile"] = this.schema;
          } else {
            this.headers["Content-Profile"] = this.schema;
          }
          if (this.method !== "GET" && this.method !== "HEAD") {
            this.headers["Content-Type"] = "application/json";
          }
          const _fetch = this.fetch;
          let res = _fetch(this.url.toString(), {
            method: this.method,
            headers: this.headers,
            body: JSON.stringify(this.body),
            signal: this.signal
          }).then(async (res2) => {
            var _a, _b, _c;
            let error = null;
            let data = null;
            let count = null;
            let status = res2.status;
            let statusText = res2.statusText;
            if (res2.ok) {
              if (this.method !== "HEAD") {
                const body = await res2.text();
                if (body === "") {
                } else if (this.headers["Accept"] === "text/csv") {
                  data = body;
                } else if (this.headers["Accept"] && this.headers["Accept"].includes("application/vnd.pgrst.plan+text")) {
                  data = body;
                } else {
                  data = JSON.parse(body);
                }
              }
              const countHeader = (_a = this.headers["Prefer"]) === null || _a === void 0 ? void 0 : _a.match(/count=(exact|planned|estimated)/);
              const contentRange = (_b = res2.headers.get("content-range")) === null || _b === void 0 ? void 0 : _b.split("/");
              if (countHeader && contentRange && contentRange.length > 1) {
                count = parseInt(contentRange[1]);
              }
              if (this.isMaybeSingle && this.method === "GET" && Array.isArray(data)) {
                if (data.length > 1) {
                  error = {
                    // https://github.com/PostgREST/postgrest/blob/a867d79c42419af16c18c3fb019eba8df992626f/src/PostgREST/Error.hs#L553
                    code: "PGRST116",
                    details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                    hint: null,
                    message: "JSON object requested, multiple (or no) rows returned"
                  };
                  data = null;
                  count = null;
                  status = 406;
                  statusText = "Not Acceptable";
                } else if (data.length === 1) {
                  data = data[0];
                } else {
                  data = null;
                }
              }
            } else {
              const body = await res2.text();
              try {
                error = JSON.parse(body);
                if (Array.isArray(error) && res2.status === 404) {
                  data = [];
                  error = null;
                  status = 200;
                  statusText = "OK";
                }
              } catch (_d) {
                if (res2.status === 404 && body === "") {
                  status = 204;
                  statusText = "No Content";
                } else {
                  error = {
                    message: body
                  };
                }
              }
              if (error && this.isMaybeSingle && ((_c = error === null || error === void 0 ? void 0 : error.details) === null || _c === void 0 ? void 0 : _c.includes("0 rows"))) {
                error = null;
                status = 200;
                statusText = "OK";
              }
              if (error && this.shouldThrowOnError) {
                throw new PostgrestError_1.default(error);
              }
            }
            const postgrestResponse = {
              error,
              data,
              count,
              status,
              statusText
            };
            return postgrestResponse;
          });
          if (!this.shouldThrowOnError) {
            res = res.catch((fetchError) => {
              var _a, _b, _c;
              return {
                error: {
                  message: `${(_a = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _a !== void 0 ? _a : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
                  details: `${(_b = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _b !== void 0 ? _b : ""}`,
                  hint: "",
                  code: `${(_c = fetchError === null || fetchError === void 0 ? void 0 : fetchError.code) !== null && _c !== void 0 ? _c : ""}`
                },
                data: null,
                count: null,
                status: 0,
                statusText: ""
              };
            });
          }
          return res.then(onfulfilled, onrejected);
        }
      };
      exports.default = PostgrestBuilder2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestTransformBuilder.js
  var require_PostgrestTransformBuilder = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestTransformBuilder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestBuilder_1 = __importDefault(require_PostgrestBuilder());
      var PostgrestTransformBuilder2 = class extends PostgrestBuilder_1.default {
        /**
         * Perform a SELECT on the query result.
         *
         * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
         * return modified rows. By calling this method, modified rows are returned in
         * `data`.
         *
         * @param columns - The columns to retrieve, separated by commas
         */
        select(columns) {
          let quoted = false;
          const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
            if (/\s/.test(c) && !quoted) {
              return "";
            }
            if (c === '"') {
              quoted = !quoted;
            }
            return c;
          }).join("");
          this.url.searchParams.set("select", cleanedColumns);
          if (this.headers["Prefer"]) {
            this.headers["Prefer"] += ",";
          }
          this.headers["Prefer"] += "return=representation";
          return this;
        }
        /**
         * Order the query result by `column`.
         *
         * You can call this method multiple times to order by multiple columns.
         *
         * You can order referenced tables, but it only affects the ordering of the
         * parent table if you use `!inner` in the query.
         *
         * @param column - The column to order by
         * @param options - Named parameters
         * @param options.ascending - If `true`, the result will be in ascending order
         * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
         * `null`s appear last.
         * @param options.referencedTable - Set this to order a referenced table by
         * its columns
         * @param options.foreignTable - Deprecated, use `options.referencedTable`
         * instead
         */
        order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable } = {}) {
          const key = referencedTable ? `${referencedTable}.order` : "order";
          const existingOrder = this.url.searchParams.get(key);
          this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
          return this;
        }
        /**
         * Limit the query result by `count`.
         *
         * @param count - The maximum number of rows to return
         * @param options - Named parameters
         * @param options.referencedTable - Set this to limit rows of referenced
         * tables instead of the parent table
         * @param options.foreignTable - Deprecated, use `options.referencedTable`
         * instead
         */
        limit(count, { foreignTable, referencedTable = foreignTable } = {}) {
          const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
          this.url.searchParams.set(key, `${count}`);
          return this;
        }
        /**
         * Limit the query result by starting at an offset `from` and ending at the offset `to`.
         * Only records within this range are returned.
         * This respects the query order and if there is no order clause the range could behave unexpectedly.
         * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
         * and fourth rows of the query.
         *
         * @param from - The starting index from which to limit the result
         * @param to - The last index to which to limit the result
         * @param options - Named parameters
         * @param options.referencedTable - Set this to limit rows of referenced
         * tables instead of the parent table
         * @param options.foreignTable - Deprecated, use `options.referencedTable`
         * instead
         */
        range(from, to, { foreignTable, referencedTable = foreignTable } = {}) {
          const keyOffset = typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`;
          const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
          this.url.searchParams.set(keyOffset, `${from}`);
          this.url.searchParams.set(keyLimit, `${to - from + 1}`);
          return this;
        }
        /**
         * Set the AbortSignal for the fetch request.
         *
         * @param signal - The AbortSignal to use for the fetch request
         */
        abortSignal(signal) {
          this.signal = signal;
          return this;
        }
        /**
         * Return `data` as a single object instead of an array of objects.
         *
         * Query result must be one row (e.g. using `.limit(1)`), otherwise this
         * returns an error.
         */
        single() {
          this.headers["Accept"] = "application/vnd.pgrst.object+json";
          return this;
        }
        /**
         * Return `data` as a single object instead of an array of objects.
         *
         * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
         * this returns an error.
         */
        maybeSingle() {
          if (this.method === "GET") {
            this.headers["Accept"] = "application/json";
          } else {
            this.headers["Accept"] = "application/vnd.pgrst.object+json";
          }
          this.isMaybeSingle = true;
          return this;
        }
        /**
         * Return `data` as a string in CSV format.
         */
        csv() {
          this.headers["Accept"] = "text/csv";
          return this;
        }
        /**
         * Return `data` as an object in [GeoJSON](https://geojson.org) format.
         */
        geojson() {
          this.headers["Accept"] = "application/geo+json";
          return this;
        }
        /**
         * Return `data` as the EXPLAIN plan for the query.
         *
         * You need to enable the
         * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
         * setting before using this method.
         *
         * @param options - Named parameters
         *
         * @param options.analyze - If `true`, the query will be executed and the
         * actual run time will be returned
         *
         * @param options.verbose - If `true`, the query identifier will be returned
         * and `data` will include the output columns of the query
         *
         * @param options.settings - If `true`, include information on configuration
         * parameters that affect query planning
         *
         * @param options.buffers - If `true`, include information on buffer usage
         *
         * @param options.wal - If `true`, include information on WAL record generation
         *
         * @param options.format - The format of the output, can be `"text"` (default)
         * or `"json"`
         */
        explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = "text" } = {}) {
          var _a;
          const options = [
            analyze ? "analyze" : null,
            verbose ? "verbose" : null,
            settings ? "settings" : null,
            buffers ? "buffers" : null,
            wal ? "wal" : null
          ].filter(Boolean).join("|");
          const forMediatype = (_a = this.headers["Accept"]) !== null && _a !== void 0 ? _a : "application/json";
          this.headers["Accept"] = `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`;
          if (format === "json")
            return this;
          else
            return this;
        }
        /**
         * Rollback the query.
         *
         * `data` will still be returned, but the query is not committed.
         */
        rollback() {
          var _a;
          if (((_a = this.headers["Prefer"]) !== null && _a !== void 0 ? _a : "").trim().length > 0) {
            this.headers["Prefer"] += ",tx=rollback";
          } else {
            this.headers["Prefer"] = "tx=rollback";
          }
          return this;
        }
        /**
         * Override the type of the returned `data`.
         *
         * @typeParam NewResult - The new result type to override with
         */
        returns() {
          return this;
        }
      };
      exports.default = PostgrestTransformBuilder2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestFilterBuilder.js
  var require_PostgrestFilterBuilder = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestFilterBuilder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestTransformBuilder_1 = __importDefault(require_PostgrestTransformBuilder());
      var PostgrestFilterBuilder2 = class extends PostgrestTransformBuilder_1.default {
        /**
         * Match only rows where `column` is equal to `value`.
         *
         * To check if the value of `column` is NULL, you should use `.is()` instead.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        eq(column, value) {
          this.url.searchParams.append(column, `eq.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is not equal to `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        neq(column, value) {
          this.url.searchParams.append(column, `neq.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is greater than `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        gt(column, value) {
          this.url.searchParams.append(column, `gt.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is greater than or equal to `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        gte(column, value) {
          this.url.searchParams.append(column, `gte.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is less than `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        lt(column, value) {
          this.url.searchParams.append(column, `lt.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is less than or equal to `value`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        lte(column, value) {
          this.url.searchParams.append(column, `lte.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` matches `pattern` case-sensitively.
         *
         * @param column - The column to filter on
         * @param pattern - The pattern to match with
         */
        like(column, pattern) {
          this.url.searchParams.append(column, `like.${pattern}`);
          return this;
        }
        /**
         * Match only rows where `column` matches all of `patterns` case-sensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        likeAllOf(column, patterns) {
          this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`);
          return this;
        }
        /**
         * Match only rows where `column` matches any of `patterns` case-sensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        likeAnyOf(column, patterns) {
          this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`);
          return this;
        }
        /**
         * Match only rows where `column` matches `pattern` case-insensitively.
         *
         * @param column - The column to filter on
         * @param pattern - The pattern to match with
         */
        ilike(column, pattern) {
          this.url.searchParams.append(column, `ilike.${pattern}`);
          return this;
        }
        /**
         * Match only rows where `column` matches all of `patterns` case-insensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        ilikeAllOf(column, patterns) {
          this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`);
          return this;
        }
        /**
         * Match only rows where `column` matches any of `patterns` case-insensitively.
         *
         * @param column - The column to filter on
         * @param patterns - The patterns to match with
         */
        ilikeAnyOf(column, patterns) {
          this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`);
          return this;
        }
        /**
         * Match only rows where `column` IS `value`.
         *
         * For non-boolean columns, this is only relevant for checking if the value of
         * `column` is NULL by setting `value` to `null`.
         *
         * For boolean columns, you can also set `value` to `true` or `false` and it
         * will behave the same way as `.eq()`.
         *
         * @param column - The column to filter on
         * @param value - The value to filter with
         */
        is(column, value) {
          this.url.searchParams.append(column, `is.${value}`);
          return this;
        }
        /**
         * Match only rows where `column` is included in the `values` array.
         *
         * @param column - The column to filter on
         * @param values - The values array to filter with
         */
        in(column, values) {
          const cleanedValues = Array.from(new Set(values)).map((s) => {
            if (typeof s === "string" && new RegExp("[,()]").test(s))
              return `"${s}"`;
            else
              return `${s}`;
          }).join(",");
          this.url.searchParams.append(column, `in.(${cleanedValues})`);
          return this;
        }
        /**
         * Only relevant for jsonb, array, and range columns. Match only rows where
         * `column` contains every element appearing in `value`.
         *
         * @param column - The jsonb, array, or range column to filter on
         * @param value - The jsonb, array, or range value to filter with
         */
        contains(column, value) {
          if (typeof value === "string") {
            this.url.searchParams.append(column, `cs.${value}`);
          } else if (Array.isArray(value)) {
            this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
          } else {
            this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
          }
          return this;
        }
        /**
         * Only relevant for jsonb, array, and range columns. Match only rows where
         * every element appearing in `column` is contained by `value`.
         *
         * @param column - The jsonb, array, or range column to filter on
         * @param value - The jsonb, array, or range value to filter with
         */
        containedBy(column, value) {
          if (typeof value === "string") {
            this.url.searchParams.append(column, `cd.${value}`);
          } else if (Array.isArray(value)) {
            this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
          } else {
            this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
          }
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is greater than any element in `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeGt(column, range) {
          this.url.searchParams.append(column, `sr.${range}`);
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is either contained in `range` or greater than any element in
         * `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeGte(column, range) {
          this.url.searchParams.append(column, `nxl.${range}`);
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is less than any element in `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeLt(column, range) {
          this.url.searchParams.append(column, `sl.${range}`);
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where every element in
         * `column` is either contained in `range` or less than any element in
         * `range`.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeLte(column, range) {
          this.url.searchParams.append(column, `nxr.${range}`);
          return this;
        }
        /**
         * Only relevant for range columns. Match only rows where `column` is
         * mutually exclusive to `range` and there can be no element between the two
         * ranges.
         *
         * @param column - The range column to filter on
         * @param range - The range to filter with
         */
        rangeAdjacent(column, range) {
          this.url.searchParams.append(column, `adj.${range}`);
          return this;
        }
        /**
         * Only relevant for array and range columns. Match only rows where
         * `column` and `value` have an element in common.
         *
         * @param column - The array or range column to filter on
         * @param value - The array or range value to filter with
         */
        overlaps(column, value) {
          if (typeof value === "string") {
            this.url.searchParams.append(column, `ov.${value}`);
          } else {
            this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
          }
          return this;
        }
        /**
         * Only relevant for text and tsvector columns. Match only rows where
         * `column` matches the query string in `query`.
         *
         * @param column - The text or tsvector column to filter on
         * @param query - The query text to match with
         * @param options - Named parameters
         * @param options.config - The text search configuration to use
         * @param options.type - Change how the `query` text is interpreted
         */
        textSearch(column, query, { config, type } = {}) {
          let typePart = "";
          if (type === "plain") {
            typePart = "pl";
          } else if (type === "phrase") {
            typePart = "ph";
          } else if (type === "websearch") {
            typePart = "w";
          }
          const configPart = config === void 0 ? "" : `(${config})`;
          this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
          return this;
        }
        /**
         * Match only rows where each column in `query` keys is equal to its
         * associated value. Shorthand for multiple `.eq()`s.
         *
         * @param query - The object to filter with, with column names as keys mapped
         * to their filter values
         */
        match(query) {
          Object.entries(query).forEach(([column, value]) => {
            this.url.searchParams.append(column, `eq.${value}`);
          });
          return this;
        }
        /**
         * Match only rows which doesn't satisfy the filter.
         *
         * Unlike most filters, `opearator` and `value` are used as-is and need to
         * follow [PostgREST
         * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
         * to make sure they are properly sanitized.
         *
         * @param column - The column to filter on
         * @param operator - The operator to be negated to filter with, following
         * PostgREST syntax
         * @param value - The value to filter with, following PostgREST syntax
         */
        not(column, operator, value) {
          this.url.searchParams.append(column, `not.${operator}.${value}`);
          return this;
        }
        /**
         * Match only rows which satisfy at least one of the filters.
         *
         * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
         * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
         * to make sure it's properly sanitized.
         *
         * It's currently not possible to do an `.or()` filter across multiple tables.
         *
         * @param filters - The filters to use, following PostgREST syntax
         * @param options - Named parameters
         * @param options.referencedTable - Set this to filter on referenced tables
         * instead of the parent table
         * @param options.foreignTable - Deprecated, use `referencedTable` instead
         */
        or(filters, { foreignTable, referencedTable = foreignTable } = {}) {
          const key = referencedTable ? `${referencedTable}.or` : "or";
          this.url.searchParams.append(key, `(${filters})`);
          return this;
        }
        /**
         * Match only rows which satisfy the filter. This is an escape hatch - you
         * should use the specific filter methods wherever possible.
         *
         * Unlike most filters, `opearator` and `value` are used as-is and need to
         * follow [PostgREST
         * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
         * to make sure they are properly sanitized.
         *
         * @param column - The column to filter on
         * @param operator - The operator to filter with, following PostgREST syntax
         * @param value - The value to filter with, following PostgREST syntax
         */
        filter(column, operator, value) {
          this.url.searchParams.append(column, `${operator}.${value}`);
          return this;
        }
      };
      exports.default = PostgrestFilterBuilder2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestQueryBuilder.js
  var require_PostgrestQueryBuilder = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestQueryBuilder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestFilterBuilder_1 = __importDefault(require_PostgrestFilterBuilder());
      var PostgrestQueryBuilder2 = class {
        constructor(url, { headers = {}, schema, fetch: fetch3 }) {
          this.url = url;
          this.headers = headers;
          this.schema = schema;
          this.fetch = fetch3;
        }
        /**
         * Perform a SELECT query on the table or view.
         *
         * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
         *
         * @param options - Named parameters
         *
         * @param options.head - When set to `true`, `data` will not be returned.
         * Useful if you only need the count.
         *
         * @param options.count - Count algorithm to use to count rows in the table or view.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        select(columns, { head: head2 = false, count } = {}) {
          const method = head2 ? "HEAD" : "GET";
          let quoted = false;
          const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
            if (/\s/.test(c) && !quoted) {
              return "";
            }
            if (c === '"') {
              quoted = !quoted;
            }
            return c;
          }).join("");
          this.url.searchParams.set("select", cleanedColumns);
          if (count) {
            this.headers["Prefer"] = `count=${count}`;
          }
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
        /**
         * Perform an INSERT into the table or view.
         *
         * By default, inserted rows are not returned. To return it, chain the call
         * with `.select()`.
         *
         * @param values - The values to insert. Pass an object to insert a single row
         * or an array to insert multiple rows.
         *
         * @param options - Named parameters
         *
         * @param options.count - Count algorithm to use to count inserted rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         *
         * @param options.defaultToNull - Make missing fields default to `null`.
         * Otherwise, use the default value for the column. Only applies for bulk
         * inserts.
         */
        insert(values, { count, defaultToNull = true } = {}) {
          const method = "POST";
          const prefersHeaders = [];
          if (this.headers["Prefer"]) {
            prefersHeaders.push(this.headers["Prefer"]);
          }
          if (count) {
            prefersHeaders.push(`count=${count}`);
          }
          if (!defaultToNull) {
            prefersHeaders.push("missing=default");
          }
          this.headers["Prefer"] = prefersHeaders.join(",");
          if (Array.isArray(values)) {
            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
              const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
              this.url.searchParams.set("columns", uniqueColumns.join(","));
            }
          }
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
        /**
         * Perform an UPSERT on the table or view. Depending on the column(s) passed
         * to `onConflict`, `.upsert()` allows you to perform the equivalent of
         * `.insert()` if a row with the corresponding `onConflict` columns doesn't
         * exist, or if it does exist, perform an alternative action depending on
         * `ignoreDuplicates`.
         *
         * By default, upserted rows are not returned. To return it, chain the call
         * with `.select()`.
         *
         * @param values - The values to upsert with. Pass an object to upsert a
         * single row or an array to upsert multiple rows.
         *
         * @param options - Named parameters
         *
         * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
         * duplicate rows are determined. Two rows are duplicates if all the
         * `onConflict` columns are equal.
         *
         * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
         * `false`, duplicate rows are merged with existing rows.
         *
         * @param options.count - Count algorithm to use to count upserted rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         *
         * @param options.defaultToNull - Make missing fields default to `null`.
         * Otherwise, use the default value for the column. This only applies when
         * inserting new rows, not when merging with existing rows under
         * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
         */
        upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true } = {}) {
          const method = "POST";
          const prefersHeaders = [`resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`];
          if (onConflict !== void 0)
            this.url.searchParams.set("on_conflict", onConflict);
          if (this.headers["Prefer"]) {
            prefersHeaders.push(this.headers["Prefer"]);
          }
          if (count) {
            prefersHeaders.push(`count=${count}`);
          }
          if (!defaultToNull) {
            prefersHeaders.push("missing=default");
          }
          this.headers["Prefer"] = prefersHeaders.join(",");
          if (Array.isArray(values)) {
            const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
              const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
              this.url.searchParams.set("columns", uniqueColumns.join(","));
            }
          }
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
        /**
         * Perform an UPDATE on the table or view.
         *
         * By default, updated rows are not returned. To return it, chain the call
         * with `.select()` after filters.
         *
         * @param values - The values to update with
         *
         * @param options - Named parameters
         *
         * @param options.count - Count algorithm to use to count updated rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        update(values, { count } = {}) {
          const method = "PATCH";
          const prefersHeaders = [];
          if (this.headers["Prefer"]) {
            prefersHeaders.push(this.headers["Prefer"]);
          }
          if (count) {
            prefersHeaders.push(`count=${count}`);
          }
          this.headers["Prefer"] = prefersHeaders.join(",");
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
        /**
         * Perform a DELETE on the table or view.
         *
         * By default, deleted rows are not returned. To return it, chain the call
         * with `.select()` after filters.
         *
         * @param options - Named parameters
         *
         * @param options.count - Count algorithm to use to count deleted rows.
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        delete({ count } = {}) {
          const method = "DELETE";
          const prefersHeaders = [];
          if (count) {
            prefersHeaders.push(`count=${count}`);
          }
          if (this.headers["Prefer"]) {
            prefersHeaders.unshift(this.headers["Prefer"]);
          }
          this.headers["Prefer"] = prefersHeaders.join(",");
          return new PostgrestFilterBuilder_1.default({
            method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
      };
      exports.default = PostgrestQueryBuilder2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/version.js
  var require_version = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/version.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.version = void 0;
      exports.version = "0.0.0-automated";
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/constants.js
  var require_constants = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/constants.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DEFAULT_HEADERS = void 0;
      var version_1 = require_version();
      exports.DEFAULT_HEADERS = { "X-Client-Info": `postgrest-js/${version_1.version}` };
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/PostgrestClient.js
  var require_PostgrestClient = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/PostgrestClient.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var PostgrestQueryBuilder_1 = __importDefault(require_PostgrestQueryBuilder());
      var PostgrestFilterBuilder_1 = __importDefault(require_PostgrestFilterBuilder());
      var constants_1 = require_constants();
      var PostgrestClient2 = class _PostgrestClient {
        // TODO: Add back shouldThrowOnError once we figure out the typings
        /**
         * Creates a PostgREST client.
         *
         * @param url - URL of the PostgREST endpoint
         * @param options - Named parameters
         * @param options.headers - Custom headers
         * @param options.schema - Postgres schema to switch to
         * @param options.fetch - Custom fetch
         */
        constructor(url, { headers = {}, schema, fetch: fetch3 } = {}) {
          this.url = url;
          this.headers = Object.assign(Object.assign({}, constants_1.DEFAULT_HEADERS), headers);
          this.schemaName = schema;
          this.fetch = fetch3;
        }
        /**
         * Perform a query on a table or a view.
         *
         * @param relation - The table or view name to query
         */
        from(relation) {
          const url = new URL(`${this.url}/${relation}`);
          return new PostgrestQueryBuilder_1.default(url, {
            headers: Object.assign({}, this.headers),
            schema: this.schemaName,
            fetch: this.fetch
          });
        }
        /**
         * Select a schema to query or perform an function (rpc) call.
         *
         * The schema needs to be on the list of exposed schemas inside Supabase.
         *
         * @param schema - The schema to query
         */
        schema(schema) {
          return new _PostgrestClient(this.url, {
            headers: this.headers,
            schema,
            fetch: this.fetch
          });
        }
        /**
         * Perform a function call.
         *
         * @param fn - The function name to call
         * @param args - The arguments to pass to the function call
         * @param options - Named parameters
         * @param options.head - When set to `true`, `data` will not be returned.
         * Useful if you only need the count.
         * @param options.get - When set to `true`, the function will be called with
         * read-only access mode.
         * @param options.count - Count algorithm to use to count rows returned by the
         * function. Only applicable for [set-returning
         * functions](https://www.postgresql.org/docs/current/functions-srf.html).
         *
         * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
         * hood.
         *
         * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
         * statistics under the hood.
         *
         * `"estimated"`: Uses exact count for low numbers and planned count for high
         * numbers.
         */
        rpc(fn, args = {}, { head: head2 = false, get: get2 = false, count } = {}) {
          let method;
          const url = new URL(`${this.url}/rpc/${fn}`);
          let body;
          if (head2 || get2) {
            method = head2 ? "HEAD" : "GET";
            Object.entries(args).filter(([_, value]) => value !== void 0).map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(",")}}` : `${value}`]).forEach(([name, value]) => {
              url.searchParams.append(name, value);
            });
          } else {
            method = "POST";
            body = args;
          }
          const headers = Object.assign({}, this.headers);
          if (count) {
            headers["Prefer"] = `count=${count}`;
          }
          return new PostgrestFilterBuilder_1.default({
            method,
            url,
            headers,
            schema: this.schemaName,
            body,
            fetch: this.fetch,
            allowEmpty: false
          });
        }
      };
      exports.default = PostgrestClient2;
    }
  });

  // node_modules/@supabase/postgrest-js/dist/cjs/index.js
  var require_cjs = __commonJS({
    "node_modules/@supabase/postgrest-js/dist/cjs/index.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PostgrestBuilder = exports.PostgrestTransformBuilder = exports.PostgrestFilterBuilder = exports.PostgrestQueryBuilder = exports.PostgrestClient = void 0;
      var PostgrestClient_1 = __importDefault(require_PostgrestClient());
      exports.PostgrestClient = PostgrestClient_1.default;
      var PostgrestQueryBuilder_1 = __importDefault(require_PostgrestQueryBuilder());
      exports.PostgrestQueryBuilder = PostgrestQueryBuilder_1.default;
      var PostgrestFilterBuilder_1 = __importDefault(require_PostgrestFilterBuilder());
      exports.PostgrestFilterBuilder = PostgrestFilterBuilder_1.default;
      var PostgrestTransformBuilder_1 = __importDefault(require_PostgrestTransformBuilder());
      exports.PostgrestTransformBuilder = PostgrestTransformBuilder_1.default;
      var PostgrestBuilder_1 = __importDefault(require_PostgrestBuilder());
      exports.PostgrestBuilder = PostgrestBuilder_1.default;
      exports.default = {
        PostgrestClient: PostgrestClient_1.default,
        PostgrestQueryBuilder: PostgrestQueryBuilder_1.default,
        PostgrestFilterBuilder: PostgrestFilterBuilder_1.default,
        PostgrestTransformBuilder: PostgrestTransformBuilder_1.default,
        PostgrestBuilder: PostgrestBuilder_1.default
      };
    }
  });

  // node_modules/ws/browser.js
  var require_browser = __commonJS({
    "node_modules/ws/browser.js"(exports, module) {
      "use strict";
      module.exports = function() {
        throw new Error(
          "ws does not work in the browser. Browser clients must use the native WebSocket object"
        );
      };
    }
  });

  // src/types.ts
  var UsageRating = /* @__PURE__ */ ((UsageRating2) => {
    UsageRating2["CRITICAL"] = "CRITICAL";
    UsageRating2["REGULAR"] = "REGULAR";
    UsageRating2["OCCASIONAL"] = "OCCASIONAL";
    UsageRating2["RARELY"] = "RARELY";
    UsageRating2["NOT_USED"] = "NOT_USED";
    UsageRating2["NOT_SURE"] = "NOT_SURE";
    return UsageRating2;
  })(UsageRating || {});
  var RequirementStatus = /* @__PURE__ */ ((RequirementStatus2) => {
    RequirementStatus2["BUSINESS_CRITICAL"] = "BUSINESS_CRITICAL";
    RequirementStatus2["CLIENT_CONTRACT"] = "CLIENT_CONTRACT";
    RequirementStatus2["INTERNAL_POLICY"] = "INTERNAL_POLICY";
    RequirementStatus2["NOT_REQUIRED"] = "NOT_REQUIRED";
    RequirementStatus2["NOT_SURE"] = "NOT_SURE";
    return RequirementStatus2;
  })(RequirementStatus || {});
  var ReplacementOption = /* @__PURE__ */ ((ReplacementOption2) => {
    ReplacementOption2["ANOTHER_TOOL"] = "ANOTHER_TOOL";
    ReplacementOption2["INTERNAL_PROCESS"] = "INTERNAL_PROCESS";
    ReplacementOption2["NOT_NEEDED"] = "NOT_NEEDED";
    ReplacementOption2["NO_REPLACEMENT"] = "NO_REPLACEMENT";
    ReplacementOption2["NOT_SURE"] = "NOT_SURE";
    return ReplacementOption2;
  })(ReplacementOption || {});
  var DependencyFlag = /* @__PURE__ */ ((DependencyFlag2) => {
    DependencyFlag2["YES"] = "YES";
    DependencyFlag2["NO"] = "NO";
    DependencyFlag2["NOT_SURE"] = "NOT_SURE";
    return DependencyFlag2;
  })(DependencyFlag || {});
  var DiscountStatus = /* @__PURE__ */ ((DiscountStatus2) => {
    DiscountStatus2["PCT_KNOWN"] = "PCT_KNOWN";
    DiscountStatus2["USD_KNOWN"] = "USD_KNOWN";
    DiscountStatus2["SHOWN_IN_QUOTE"] = "SHOWN_IN_QUOTE";
    DiscountStatus2["DONT_KNOW"] = "DONT_KNOW";
    return DiscountStatus2;
  })(DiscountStatus || {});
  var BundleStructure = /* @__PURE__ */ ((BundleStructure3) => {
    BundleStructure3["BUNDLED"] = "BUNDLED";
    BundleStructure3["POOLED"] = "POOLED";
    BundleStructure3["STANDARD"] = "STANDARD";
    BundleStructure3["UNKNOWN"] = "UNKNOWN";
    return BundleStructure3;
  })(BundleStructure || {});
  var TierChangedFlag = /* @__PURE__ */ ((TierChangedFlag2) => {
    TierChangedFlag2["YES"] = "YES";
    TierChangedFlag2["NO"] = "NO";
    TierChangedFlag2["NOT_SURE"] = "NOT_SURE";
    return TierChangedFlag2;
  })(TierChangedFlag || {});

  // src/products.ts
  function tool(id, label) {
    return { id, label };
  }
  var PRODUCT_CATALOG = [
    {
      id: "project_management",
      label: "Project Management",
      category: "UNCATEGORIZED" /* UNCATEGORIZED */,
      // source does not state an explicit top-level category
      capabilities: [
        tool("rfis", "RFIs"),
        tool("submittals", "Submittals"),
        tool("schedule", "Schedule"),
        tool("punch_list", "Punch List"),
        tool("documents", "Documents"),
        tool("photos_videos", "Photos & Videos")
      ],
      mvp_supported: true,
      pricing_basis: "acv",
      guard: "Do not treat every tool as a separately priced product."
    },
    {
      id: "quality_safety",
      label: "Quality & Safety",
      category: "UNCATEGORIZED" /* UNCATEGORIZED */,
      // commercially marketed product; tools organized under PM in navigation
      capabilities: [
        tool("inspections", "Inspections"),
        tool("incidents", "Incidents"),
        tool("observations", "Observations"),
        tool("deficiency_list", "Deficiency List"),
        tool("daily_log", "Daily Log"),
        tool("forms", "Forms")
      ],
      mvp_supported: true,
      pricing_basis: "acv",
      guard: "Commercial product/category/tool hierarchy must stay separate."
    },
    {
      id: "project_financials",
      label: "Project Financials",
      category: "FINANCIAL_MANAGEMENT" /* FINANCIAL_MANAGEMENT */,
      capabilities: [
        tool("budgets", "Budgets"),
        tool("cost_management", "Cost Management"),
        tool("financial_workflows", "Financial Workflows")
      ],
      mvp_supported: true,
      pricing_basis: "acv",
      guard: "Flag ERP/accounting integrations before removal."
    },
    {
      id: "invoice_management",
      label: "Invoice Management",
      category: "FINANCIAL_MANAGEMENT" /* FINANCIAL_MANAGEMENT */,
      capabilities: [
        tool("invoice_workflows", "Invoice Workflows"),
        tool("billing", "Billing")
      ],
      mvp_supported: true,
      pricing_basis: "acv",
      guard: "Line-item spend is not automatically removal savings."
    },
    {
      id: "analytics",
      label: "Analytics",
      category: "UNCATEGORIZED" /* UNCATEGORIZED */,
      // source does not state an explicit top-level category
      capabilities: [
        tool("reporting", "Reporting"),
        tool("dashboards", "Dashboards"),
        tool("unified_data", "Unified Data")
      ],
      mvp_supported: true,
      pricing_basis: "acv",
      guard: "Do not infer operational-module dependency from analytics alone."
    },
    {
      id: "pay",
      label: "Pay",
      category: "FINANCIAL_MANAGEMENT" /* FINANCIAL_MANAGEMENT */,
      capabilities: [
        tool("subcontractor_payments", "Subcontractor Payments"),
        tool("compliance", "Compliance"),
        tool("lien_waiver_workflows", "Lien-Waiver Workflows")
      ],
      mvp_supported: true,
      pricing_basis: "unknown",
      guard: "Use UNKNOWN where counterfactual pricing is unsupported."
    },
    {
      id: "resource_tracking",
      label: "Resource Tracking",
      category: "RESOURCE_MANAGEMENT" /* RESOURCE_MANAGEMENT */,
      capabilities: [
        tool("labor_tracking", "Labor Tracking"),
        tool("productivity_tracking", "Productivity Tracking"),
        tool("resource_tracking", "Resource Tracking")
      ],
      mvp_supported: true,
      pricing_basis: "unknown",
      guard: "Do not apply ACV formula to FTE-priced products without evidence."
    },
    {
      id: "estimating",
      label: "Estimating",
      category: "PRECONSTRUCTION" /* PRECONSTRUCTION */,
      capabilities: [
        tool("estimating", "Estimating"),
        tool("takeoff", "Takeoff")
      ],
      mvp_supported: true,
      pricing_basis: "unknown",
      guard: "Validate industry/product eligibility."
    },
    {
      id: "bid_management",
      label: "Bid Management",
      category: "PRECONSTRUCTION" /* PRECONSTRUCTION */,
      capabilities: [
        tool("bid_distribution", "Bid Distribution"),
        tool("bid_collection", "Bid Collection"),
        tool("bid_coverage", "Bid Coverage")
      ],
      mvp_supported: true,
      pricing_basis: "unknown",
      guard: "Validate industry/product eligibility."
    },
    {
      id: "field_productivity",
      label: "Field Productivity",
      category: "RESOURCE_MANAGEMENT" /* RESOURCE_MANAGEMENT */,
      capabilities: [
        tool("field_productivity_tracking", "Field Productivity Tracking")
      ],
      mvp_supported: "conditional",
      pricing_basis: "fte",
      guard: "Do not calculate with ACV pricing logic unless contract evidence supports it."
    },
    {
      id: "other",
      label: "Other Procore capabilities",
      category: "UNCATEGORIZED" /* UNCATEGORIZED */,
      capabilities: [],
      mvp_supported: "conditional",
      pricing_basis: "unknown",
      guard: "If evidence is insufficient, return UNKNOWN rather than inventing."
    }
  ];
  function getProduct(id) {
    return PRODUCT_CATALOG.find((p) => p.id === id);
  }
  var DEPENDENCY_RULES = [
    {
      source_product_id: "quality_safety",
      dependent_id: "inspections",
      dependent_label: "Inspections",
      relation_type: "CAPABILITY_LICENSING" /* CAPABILITY_LICENSING */,
      user_confirmation_needed: true,
      removal_guard: "If inspections are required, do not recommend removing the commercial capability without validating impact.",
      evidence_status: "FACT / official Procore documentation"
    },
    {
      source_product_id: "quality_safety",
      dependent_id: "incidents",
      dependent_label: "Incidents",
      relation_type: "CAPABILITY_WORKFLOW" /* CAPABILITY_WORKFLOW */,
      user_confirmation_needed: true,
      removal_guard: "Check active incident workflow before removal.",
      evidence_status: "FACT / official product documentation"
    },
    {
      source_product_id: "quality_safety",
      dependent_id: "observations",
      dependent_label: "Observations",
      relation_type: "CAPABILITY_WORKFLOW" /* CAPABILITY_WORKFLOW */,
      user_confirmation_needed: true,
      removal_guard: "Check active observations workflow before removal.",
      evidence_status: "FACT / official product documentation"
    },
    {
      source_product_id: "quality_safety",
      dependent_id: "forms",
      dependent_label: "Forms",
      relation_type: "CAPABILITY_WORKFLOW" /* CAPABILITY_WORKFLOW */,
      user_confirmation_needed: true,
      removal_guard: "Check whether forms are used for Q&S-critical processes.",
      evidence_status: "FACT / official product documentation"
    },
    {
      source_product_id: "quality_safety",
      dependent_id: "daily_log",
      dependent_label: "Daily Log",
      relation_type: "CAPABILITY_WORKFLOW" /* CAPABILITY_WORKFLOW */,
      user_confirmation_needed: true,
      removal_guard: "Daily Log can remain part of PM workflows; do not assume removing Q&S removes all PM tools.",
      evidence_status: "FACT / official documentation"
    },
    {
      source_product_id: "project_financials",
      dependent_id: "accounting_erp_integration",
      dependent_label: "Accounting / ERP integration",
      relation_type: "INTEGRATION" /* INTEGRATION */,
      user_confirmation_needed: true,
      removal_guard: "Flag integration and validate replacement before removal.",
      evidence_status: "FACT / official Procore support evidence"
    },
    {
      source_product_id: "analytics",
      dependent_id: "operational_modules",
      dependent_label: "Operational modules",
      relation_type: "SOFT_DATA_CONSUMPTION" /* SOFT_DATA_CONSUMPTION */,
      user_confirmation_needed: false,
      removal_guard: "Do not infer a module dependency merely because analytics consumes data.",
      evidence_status: "FACT / official Procore support evidence"
    },
    {
      source_product_id: "*",
      dependent_id: "customer_specific_workflow",
      dependent_label: "Customer-specific workflow",
      relation_type: "BUSINESS_DEPENDENCY" /* BUSINESS_DEPENDENCY */,
      user_confirmation_needed: true,
      removal_guard: "Client contract, compliance, internal policy or required workflow blocks removal.",
      evidence_status: "Customer input"
    }
  ];
  function getDependencyRules(productId) {
    return DEPENDENCY_RULES.filter(
      (r) => r.source_product_id === productId || r.source_product_id === "*"
    );
  }
  function requirementEligibility(requirement) {
    switch (requirement) {
      case "BUSINESS_CRITICAL":
      case "CLIENT_CONTRACT":
      case "INTERNAL_POLICY":
        return "BLOCKED";
      case "NOT_REQUIRED":
        return "ELIGIBLE";
      case "NOT_SURE":
        return "UNCERTAIN";
      default:
        return "UNCERTAIN";
    }
  }
  function dependencyFlagEligibility(dependency) {
    switch (dependency) {
      case "YES":
        return "BLOCKED";
      case "NO":
        return "ELIGIBLE";
      case "NOT_SURE":
        return "UNCERTAIN";
      default:
        return "UNCERTAIN";
    }
  }
  function evaluateProductEligibility(productId, requirement, dependency) {
    const reasons = [];
    const applicableRules = getDependencyRules(productId);
    const reqElig = requirementEligibility(requirement);
    if (reqElig === "BLOCKED") {
      reasons.push(`Requirement status "${requirement}" blocks removal.`);
      return { eligibility: "BLOCKED", reasons, applicable_rules: applicableRules };
    }
    const depElig = dependencyFlagEligibility(dependency);
    if (depElig === "BLOCKED") {
      reasons.push("User-confirmed dependency blocks removal.");
      return { eligibility: "BLOCKED", reasons, applicable_rules: applicableRules };
    }
    if (reqElig === "UNCERTAIN") {
      reasons.push("Requirement status is not confirmed.");
    }
    if (depElig === "UNCERTAIN") {
      reasons.push("Dependency status is not confirmed.");
    }
    const confirmationNeeded = applicableRules.filter(
      // The '*' wildcard business-dependency rule restates what the `requirement` field
      // already captures (client contract / internal policy / business-critical); it is
      // surfaced via applicable_rules for traceability but must not double-count here.
      (r) => r.user_confirmation_needed && r.source_product_id !== "*"
    );
    if (confirmationNeeded.length > 0) {
      reasons.push(...confirmationNeeded.map((r) => r.removal_guard));
    }
    if (reqElig === "UNCERTAIN" || depElig === "UNCERTAIN" || confirmationNeeded.length > 0) {
      return { eligibility: "UNCERTAIN", reasons, applicable_rules: applicableRules };
    }
    return { eligibility: "ELIGIBLE", reasons, applicable_rules: applicableRules };
  }

  // src/validation.ts
  var VALID_CONTRACT_TERMS = /* @__PURE__ */ new Set(["annual", "multi_year", "other"]);
  var VALID_USAGE = new Set(Object.values(UsageRating));
  var VALID_REQUIREMENT = new Set(Object.values(RequirementStatus));
  var VALID_REPLACEMENT = new Set(Object.values(ReplacementOption));
  var VALID_DEPENDENCY = new Set(Object.values(DependencyFlag));
  var VALID_DISCOUNT_STATUS = new Set(Object.values(DiscountStatus));
  var VALID_BUNDLE = new Set(Object.values(BundleStructure));
  var VALID_TIER_CHANGED = new Set(Object.values(TierChangedFlag));
  var VALID_RATE_PROTECTION = /* @__PURE__ */ new Set(["active", "unclear", "none"]);
  var VALID_CONSTRUCTION_TYPE = /* @__PURE__ */ new Set(["commercial", "industrial", "civil_infrastructure", "other"]);
  var VALID_TARGET_SAVINGS = /* @__PURE__ */ new Set([5, 10, 15, 20, null]);
  function required(field, message) {
    return { field, severity: "MISSING_REQUIRED", message };
  }
  function invalid(field, message) {
    return { field, severity: "INVALID_VALUE", message };
  }
  function unknown(field, message) {
    return { field, severity: "UNKNOWN_ACCEPTABLE", message };
  }
  function preventsCalc(field, message) {
    return { field, severity: "PREVENTS_CALCULATION", message };
  }
  function validateUserInput(input) {
    const hardErrors = [];
    const softWarnings = [];
    if (typeof input !== "object" || input === null) {
      return {
        valid: false,
        can_calculate: false,
        errors: [required("root", "Input must be a non-null object")],
        warnings: []
      };
    }
    const u = input;
    if (typeof u.annual_cost_usd !== "number" || u.annual_cost_usd <= 0) {
      hardErrors.push(required("annual_cost_usd", "Must be a positive number"));
    }
    if (typeof u.acv_usd !== "number" || u.acv_usd <= 0) {
      hardErrors.push(required("acv_usd", "Must be a positive number"));
    }
    if (!Array.isArray(u.products) || u.products.length === 0) {
      hardErrors.push(required("products", "Must be a non-empty array of product IDs from the catalog"));
    } else {
      const prods = u.products;
      for (let i = 0; i < prods.length; i++) {
        if (typeof prods[i] !== "string") {
          hardErrors.push(invalid(`products[${i}]`, "Each product ID must be a string"));
        } else if (!getProduct(prods[i])) {
          hardErrors.push(invalid(`products[${i}]`, `Unknown product ID "${prods[i]}". Use a catalog ID from products.ts`));
        }
      }
    }
    if (!VALID_CONTRACT_TERMS.has(u.contract_term)) {
      hardErrors.push(invalid("contract_term", 'Must be "annual", "multi_year", or "other"'));
    }
    if (u.product_inputs !== void 0) {
      if (!Array.isArray(u.product_inputs)) {
        hardErrors.push(invalid("product_inputs", "Must be an array"));
      } else {
        const pi = u.product_inputs;
        if (pi.length === 0) {
          hardErrors.push(required("product_inputs", "Must be non-empty when provided"));
        }
        for (let i = 0; i < pi.length; i++) {
          validateProductInput(pi[i], i, hardErrors, softWarnings);
        }
      }
    } else {
      softWarnings.push(
        unknown(
          "product_inputs",
          "No per-product usage/requirement/dependency information provided. Analysis will be limited to benchmarking and commercial-structure rules; candidate generation and savings classification require product_inputs."
        )
      );
    }
    if (u.discount_status !== void 0) {
      if (!VALID_DISCOUNT_STATUS.has(u.discount_status)) {
        hardErrors.push(invalid("discount_status", `Must be one of: ${[...VALID_DISCOUNT_STATUS].join(", ")}`));
      } else {
        if (u.discount_status === "DONT_KNOW" /* DONT_KNOW */) {
          softWarnings.push(
            preventsCalc(
              "discount_status",
              "Discount is unknown. Any savings estimate that depends on the current discount surviving a reconfiguration cannot be defended."
            )
          );
        }
        if (u.discount_status === "PCT_KNOWN" /* PCT_KNOWN */) {
          if (typeof u.discount_pct !== "number" || u.discount_pct < 0 || u.discount_pct > 100) {
            hardErrors.push(invalid("discount_pct", "Must be a number between 0 and 100 when discount_status is PCT_KNOWN"));
          }
        }
        if (u.discount_status === "USD_KNOWN" /* USD_KNOWN */) {
          if (typeof u.discount_usd !== "number" || u.discount_usd < 0) {
            hardErrors.push(invalid("discount_usd", "Must be a non-negative number when discount_status is USD_KNOWN"));
          }
        }
      }
    } else {
      softWarnings.push(unknown("discount_status", "Discount status not provided. Analysis will treat discount as unknown."));
    }
    if (u.bundle_structure !== void 0) {
      if (!VALID_BUNDLE.has(u.bundle_structure)) {
        hardErrors.push(invalid("bundle_structure", `Must be one of: ${[...VALID_BUNDLE].join(", ")}`));
      } else if (u.bundle_structure === "BUNDLED" /* BUNDLED */ || u.bundle_structure === "POOLED" /* POOLED */) {
        softWarnings.push(
          preventsCalc(
            "bundle_structure",
            "Contract uses a bundled/pooled structure. Line-item removal does not automatically reduce total renewal by that amount."
          )
        );
      }
    } else {
      softWarnings.push(unknown("bundle_structure", "Bundle/pool structure not provided. Analysis will treat as unknown."));
    }
    if (u.credits_usd !== void 0) {
      if (typeof u.credits_usd !== "number" || u.credits_usd < 0) {
        hardErrors.push(invalid("credits_usd", "Must be a non-negative number"));
      }
    }
    if (u.renewal_increase_pct !== void 0) {
      if (typeof u.renewal_increase_pct !== "number" || u.renewal_increase_pct < 0) {
        hardErrors.push(invalid("renewal_increase_pct", "Must be a non-negative number"));
      }
    }
    if (u.tier_changed !== void 0 && !VALID_TIER_CHANGED.has(u.tier_changed)) {
      hardErrors.push(invalid("tier_changed", `Must be one of: ${[...VALID_TIER_CHANGED].join(", ")}`));
    }
    if (u.packaging_changed !== void 0 && !VALID_TIER_CHANGED.has(u.packaging_changed)) {
      hardErrors.push(invalid("packaging_changed", `Must be one of: ${[...VALID_TIER_CHANGED].join(", ")}`));
    }
    if (u.rate_protection_status !== void 0 && !VALID_RATE_PROTECTION.has(u.rate_protection_status)) {
      hardErrors.push(invalid("rate_protection_status", 'Must be "active", "unclear", or "none"'));
    }
    if (u.expected_next_year_acv_usd !== void 0) {
      if (typeof u.expected_next_year_acv_usd !== "number" || u.expected_next_year_acv_usd <= 0) {
        hardErrors.push(invalid("expected_next_year_acv_usd", "Must be a positive number"));
      } else if (typeof u.acv_usd === "number" && u.expected_next_year_acv_usd < u.acv_usd) {
        hardErrors.push(invalid("expected_next_year_acv_usd", "Must be greater than or equal to current ACV"));
      }
    }
    if (u.target_savings_pct !== void 0 && u.target_savings_pct !== null) {
      if (!VALID_TARGET_SAVINGS.has(u.target_savings_pct)) {
        hardErrors.push(invalid("target_savings_pct", "Must be 5, 10, 15, 20, or null"));
      }
    }
    if (u.construction_type !== void 0 && !VALID_CONSTRUCTION_TYPE.has(u.construction_type)) {
      hardErrors.push(invalid("construction_type", `Must be one of: ${[...VALID_CONSTRUCTION_TYPE].join(", ")}`));
    }
    if (u.before_annual_cost_usd !== void 0) {
      if (typeof u.before_annual_cost_usd !== "number" || u.before_annual_cost_usd <= 0) {
        hardErrors.push(invalid("before_annual_cost_usd", "Must be a positive number"));
      }
    }
    if (u.after_annual_cost_usd !== void 0) {
      if (typeof u.after_annual_cost_usd !== "number" || u.after_annual_cost_usd <= 0) {
        hardErrors.push(invalid("after_annual_cost_usd", "Must be a positive number"));
      }
    }
    if (u.prior_rate_per_1m_usd !== void 0) {
      if (typeof u.prior_rate_per_1m_usd !== "number" || u.prior_rate_per_1m_usd <= 0) {
        hardErrors.push(invalid("prior_rate_per_1m_usd", "Must be a positive number"));
      }
    }
    const preventsCalcItems = softWarnings.filter((w) => w.severity === "PREVENTS_CALCULATION");
    return {
      valid: hardErrors.length === 0,
      can_calculate: hardErrors.length === 0 && preventsCalcItems.length === 0,
      errors: hardErrors,
      warnings: softWarnings
    };
  }
  function validateProductInput(raw, index2, hardErrors, softWarnings) {
    const prefix = `product_inputs[${index2}]`;
    if (typeof raw !== "object" || raw === null) {
      hardErrors.push(invalid(prefix, "Each product input must be an object"));
      return;
    }
    const p = raw;
    if (typeof p.product_id !== "string" || p.product_id.trim() === "") {
      hardErrors.push(required(`${prefix}.product_id`, "Must be a non-empty string"));
    } else if (!getProduct(p.product_id)) {
      hardErrors.push(invalid(`${prefix}.product_id`, `Unknown product ID "${p.product_id}". Use a catalog ID from products.ts`));
    }
    if (!VALID_USAGE.has(p.usage)) {
      hardErrors.push(required(`${prefix}.usage`, `Must be one of: ${[...VALID_USAGE].join(", ")}`));
    } else if (p.usage === "NOT_SURE" /* NOT_SURE */) {
      softWarnings.push(unknown(`${prefix}.usage`, "Usage is not sure; candidate eligibility may be uncertain"));
    }
    if (!VALID_REQUIREMENT.has(p.requirement)) {
      hardErrors.push(required(`${prefix}.requirement`, `Must be one of: ${[...VALID_REQUIREMENT].join(", ")}`));
    } else if (p.requirement === "NOT_SURE" /* NOT_SURE */) {
      softWarnings.push(unknown(`${prefix}.requirement`, "Requirement status is uncertain; candidate removal cannot be confirmed safe"));
    }
    if (p.replacement === void 0) {
      softWarnings.push(unknown(`${prefix}.replacement`, "Replacement workflow not provided"));
    } else if (!VALID_REPLACEMENT.has(p.replacement)) {
      hardErrors.push(invalid(`${prefix}.replacement`, `Must be one of: ${[...VALID_REPLACEMENT].join(", ")}`));
    } else if (p.replacement === "NOT_SURE" /* NOT_SURE */) {
      softWarnings.push(unknown(`${prefix}.replacement`, "Replacement workflow is not sure"));
    } else if (p.replacement === "NO_REPLACEMENT" /* NO_REPLACEMENT */) {
      softWarnings.push(
        preventsCalc(
          `${prefix}.replacement`,
          "No replacement exists for this capability. Removal may have operational impact."
        )
      );
    }
    if (p.dependency === void 0) {
      softWarnings.push(unknown(`${prefix}.dependency`, "Dependency status not provided"));
    } else if (!VALID_DEPENDENCY.has(p.dependency)) {
      hardErrors.push(invalid(`${prefix}.dependency`, `Must be one of: ${[...VALID_DEPENDENCY].join(", ")}`));
    } else if (p.dependency === "NOT_SURE" /* NOT_SURE */) {
      softWarnings.push(
        preventsCalc(
          `${prefix}.dependency`,
          "Dependency is unconfirmed. Candidate cannot advance to counterfactual pricing until resolved."
        )
      );
    }
    if (p.annual_price_usd !== void 0) {
      if (typeof p.annual_price_usd !== "number" || p.annual_price_usd <= 0) {
        hardErrors.push(invalid(`${prefix}.annual_price_usd`, "Must be a positive number when provided"));
      }
    } else {
      softWarnings.push(unknown(`${prefix}.annual_price_usd`, "No line-item price provided; attributable spend cannot be reported"));
    }
  }
  function assertUserInput(input) {
    const result = validateUserInput(input);
    if (!result.valid) {
      throw new Error(
        `Invalid UserInput: ${result.errors.map((e) => `${e.field}: ${e.message}`).join("; ")}`
      );
    }
    return input;
  }

  // src/data/procore_public_quotes.ts
  var PUBLIC_QUOTES_DATASET_META = {
    dataset_name: "RenewalScope Public Procore Quote Evidence Dataset",
    dataset_version: "1.0",
    dataset_date: "2026-08-16",
    primary_source: "PROCORE_BRAIN_RESEARCH_MASTER_PHASE8.xlsx",
    total_records: 22,
    records_excluded_from_calculations: 7,
    usable_for_product_benchmarks: 15,
    coverage_notes: "Public procurement quotes and order forms, 2022-2026. Products: PM Pro, Q&S, Project Financials, Invoice Management, Analytics. These are PUBLIC QUOTE observations - not a proprietary Procore price list."
  };
  var PUBLIC_QUOTE_ROWS = [
    // Simi Valley USD (2022)
    {
      evidence_id: "PQ-001",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 1e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "Simi Valley USD public procurement quote (2022)",
      source_date: "2022-01-01",
      normalized_product_id: "project_management",
      quoted_product_annual_price_usd: 13782.67,
      limitation_flags: ["ESTIMATE_NOT_FINAL", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-002",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 1e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "Simi Valley USD public procurement quote (2022)",
      source_date: "2022-01-01",
      normalized_product_id: "quality_safety",
      quoted_product_annual_price_usd: 4499.09,
      limitation_flags: ["ESTIMATE_NOT_FINAL", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true
    },
    // City of Pasadena TX (2026-01-29)
    {
      evidence_id: "PQ-003",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "City of Pasadena TX public procurement quote (2026-01-29)",
      source_date: "2026-01-29",
      normalized_product_id: "project_management",
      quoted_product_annual_price_usd: 47451.74,
      limitation_flags: ["BAND_NORMALIZED", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-004",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "City of Pasadena TX public procurement quote (2026-01-29)",
      source_date: "2026-01-29",
      normalized_product_id: "quality_safety",
      quoted_product_annual_price_usd: 17824.75,
      limitation_flags: ["BAND_NORMALIZED", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-005",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "City of Pasadena TX public procurement quote (2026-01-29)",
      source_date: "2026-01-29",
      normalized_product_id: "project_financials",
      quoted_product_annual_price_usd: 22938.85,
      limitation_flags: ["BAND_NORMALIZED", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-006",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "City of Pasadena TX public procurement quote (2026-01-29)",
      source_date: "2026-01-29",
      normalized_product_id: "invoice_management",
      quoted_product_annual_price_usd: 13636.17,
      limitation_flags: ["BAND_NORMALIZED", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true
    },
    // City of Denton TX (2025-11-18) - exclude_from_calculations
    {
      evidence_id: "PQ-007",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 54e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "City of Denton TX public procurement quote (2025-11-18)",
      source_date: "2025-11-18",
      normalized_product_id: "project_management",
      quoted_product_annual_price_usd: 184266.33,
      limitation_flags: ["POOLED_CV", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true,
      exclude_from_calculations: true
    },
    {
      evidence_id: "PQ-008",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 54e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "City of Denton TX public procurement quote (2025-11-18)",
      source_date: "2025-11-18",
      normalized_product_id: "quality_safety",
      quoted_product_annual_price_usd: 91452.72,
      limitation_flags: ["POOLED_CV", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true,
      exclude_from_calculations: true
    },
    {
      evidence_id: "PQ-009",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 1e8,
      acv_band_max_usd: 15e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "City of Denton TX public procurement quote (2025-11-18)",
      source_date: "2025-11-18",
      normalized_product_id: "project_financials",
      quoted_product_annual_price_usd: 52799.78,
      limitation_flags: ["POOLED_CV", "BAND_NORMALIZED", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true,
      exclude_from_calculations: true
    },
    {
      evidence_id: "PQ-010",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 1e8,
      acv_band_max_usd: 15e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "City of Denton TX public procurement quote (2025-11-18)",
      source_date: "2025-11-18",
      normalized_product_id: "invoice_management",
      quoted_product_annual_price_usd: 27317.5,
      limitation_flags: ["POOLED_CV", "BAND_NORMALIZED", "RESELLER_QUOTE"],
      exclude_from_rate_benchmark: true,
      exclude_from_calculations: true
    },
    // Public cooperative quote (2025-08-25)
    {
      evidence_id: "PQ-011",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "Public cooperative procurement quote (2025-08-25)",
      source_date: "2025-08-25",
      normalized_product_id: "quality_safety",
      quoted_product_annual_price_usd: 46865.91,
      limitation_flags: ["BAND_NORMALIZED"],
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-012",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "Public cooperative procurement quote (2025-08-25)",
      source_date: "2025-08-25",
      normalized_product_id: "project_financials",
      limitation_flags: ["INCOMPLETE_RECORD", "BAND_NORMALIZED"],
      exclude_from_rate_benchmark: true,
      exclude_from_calculations: true
    },
    {
      evidence_id: "PQ-013",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "Public cooperative procurement quote (2025-08-25)",
      source_date: "2025-08-25",
      normalized_product_id: "invoice_management",
      quoted_product_annual_price_usd: 13636.17,
      limitation_flags: ["BAND_NORMALIZED"],
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-014",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "Public cooperative procurement quote (2025-08-25)",
      source_date: "2025-08-25",
      normalized_product_id: "analytics",
      quoted_product_annual_price_usd: 17604.7,
      limitation_flags: ["BAND_NORMALIZED"],
      exclude_from_rate_benchmark: true
    },
    // Highline Public Schools (2026)
    {
      evidence_id: "PQ-015",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 12e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "Highline Public Schools procurement quote (2026)",
      source_date: "2026-01-01",
      normalized_product_id: "project_management",
      quoted_product_annual_price_usd: 99303.13,
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-016",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 12e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "Highline Public Schools procurement quote (2026)",
      source_date: "2026-01-01",
      normalized_product_id: "project_financials",
      quoted_product_annual_price_usd: 49963.92,
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-017",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 12e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "Highline Public Schools procurement quote (2026)",
      source_date: "2026-01-01",
      normalized_product_id: "invoice_management",
      quoted_product_annual_price_usd: 22592.4,
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-018",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 12e7,
      source_type: "PUBLIC_QUOTE",
      source_description: "Highline Public Schools procurement quote (2026)",
      source_date: "2026-01-01",
      normalized_product_id: "analytics",
      quoted_product_annual_price_usd: 22974,
      exclude_from_rate_benchmark: true
    },
    // Nassau County
    {
      evidence_id: "PQ-019",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "Nassau County public max-price quote",
      source_date: "2025-01-01",
      normalized_product_id: "project_management",
      quoted_product_annual_price_usd: 55606.38,
      limitation_flags: ["MAX_PRICE_QUOTE", "BAND_NORMALIZED"],
      exclude_from_rate_benchmark: true
    },
    {
      evidence_id: "PQ-020",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_band_min_usd: 5e7,
      acv_band_max_usd: 75e6,
      source_type: "PUBLIC_QUOTE",
      source_description: "Nassau County public max-price quote",
      source_date: "2025-01-01",
      normalized_product_id: "project_financials",
      quoted_product_annual_price_usd: 26881.07,
      limitation_flags: ["MAX_PRICE_QUOTE", "BAND_NORMALIZED"],
      exclude_from_rate_benchmark: true
    },
    // Port Canaveral (2026-02-26) - exclude_from_calculations
    {
      evidence_id: "PQ-021",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 2e8,
      source_type: "PUBLIC_QUOTE",
      source_description: "Port Canaveral public procurement quote (2026-02-26)",
      source_date: "2026-02-26",
      quoted_product_annual_price_usd: 318223.7,
      limitation_flags: ["POOLED_CV", "PROJECT_SPECIFIC_LICENSE"],
      exclude_from_rate_benchmark: true,
      exclude_from_calculations: true,
      note: "Procore platform total NTE; pooled 3yr $200M CV. No individual product breakdown."
    },
    {
      evidence_id: "PQ-022",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 2e8,
      source_type: "PUBLIC_QUOTE",
      source_description: "Port Canaveral public procurement quote (2026-02-26)",
      source_date: "2026-02-26",
      limitation_flags: ["POOLED_CV"],
      exclude_from_rate_benchmark: true,
      exclude_from_calculations: true,
      note: "Route price differential: direct $27,672 cheaper than reseller. Commercial structure evidence only."
    }
  ];

  // src/evidence.ts
  var EVIDENCE_ROWS = [
    {
      evidence_id: "REDDIT-001",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "unknown",
      rate_per_1m: 1e3,
      renewal_increase_pct: 10.4,
      prev_rate_per_1m: 500,
      products: ["Project Management Pro", "Quality & Safety"],
      note: "Typical renewal 2\u20135%; this renewal 10.4%. No total ACV or annual invoice. Rate doubled despite downgrade.",
      source_url: "https://www.reddit.com/r/Construction/comments/199uliq/procore_renewal_costs_escalating/"
    },
    {
      evidence_id: "REDDIT-002",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "unknown",
      renewal_increase_pct: 150,
      note: "Single case: 150% price jump after five years; described as non-negotiable. Do not generalize.",
      source_url: "https://www.reddit.com/r/Construction/comments/199uliq/procore_renewal_costs_escalating/"
    },
    {
      evidence_id: "REDDIT-003",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "unknown",
      annual_cost_usd: 3e4,
      note: "Range $30k\u2013$60k; cannot derive ACV or savings.",
      source_url: "https://www.reddit.com/r/Construction/comments/199uliq/procore_renewal_costs_escalating/"
    },
    {
      evidence_id: "REDDIT-004",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 2e8,
      annual_cost_usd: 385e3,
      rate_per_1m: 1925,
      contract_term: "multi_year",
      note: "Pass-through cost-recovery strategy; not evidence of a Procore discount.",
      source_url: "https://www.reddit.com/r/ConstructionManagers/comments/1j1188g/procore_renewal/"
    },
    {
      evidence_id: "REDDIT-005",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 15e6,
      rate_per_1m: 1e3,
      note: "$1k/$1M used for pass-through allocation, not necessarily the actual Procore invoice rate.",
      source_url: "https://www.reddit.com/r/ConstructionManagers/comments/1j1188g/procore_renewal/"
    },
    {
      evidence_id: "REDDIT-006",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "unknown",
      products: ["Submittals", "RFIs", "Change Orders", "Inspections"],
      note: "Fit/demand evidence only; does not establish commercial removability of a module.",
      source_url: "https://www.reddit.com/r/Construction/comments/ack53j/anyone_know_what_they_pay_for_procore/"
    },
    {
      evidence_id: "REDDIT-007",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "project",
      acv_usd: 15e6,
      annual_cost_usd: 2e4,
      rate_per_1m: 1333.33,
      note: 'Source says "$15M job", not company ACV. Project-level observation; do not use as company-ACV benchmark.',
      source_url: "https://www.reddit.com/r/Construction/comments/ack53j/anyone_know_what_they_pay_for_procore/"
    },
    {
      evidence_id: "REDDIT-008",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 4e6,
      annual_cost_usd: 6e3,
      rate_per_1m: 1500,
      products: ["Project Management", "Financial Management"],
      contract_term: "annual",
      note: "Annual cost from $500/month PM quote only; Financial is excluded (range estimate).",
      source_url: "https://www.reddit.com/r/Construction/comments/1iqb442/construction_software_pricing_comparison_based_on/"
    },
    {
      evidence_id: "REDDIT-009",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "unknown",
      contract_term: "annual",
      note: "Process observation only; does not establish pricing algorithm.",
      source_url: "https://www.reddit.com/r/Construction/comments/10gh7ej"
    },
    {
      evidence_id: "REDDIT-010",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "unknown",
      contract_term: "multi_year",
      note: "Pain/alternative evidence; not a pricing benchmark.",
      source_url: "https://www.reddit.com/r/ConstructionManagers/comments/1j1188g/procore_renewal/"
    },
    {
      evidence_id: "WEB-011",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 4e8,
      annual_cost_usd: 324e3,
      rate_per_1m: 810,
      contract_term: "multi_year",
      note: "Annualized from $27k/month. Distinct from REDDIT-004; do not infer identical product bundles.",
      source_url: "https://www.reddit.com/r/Construction/comments/1iqb442/construction_software_pricing_comparison_based_on/"
    },
    {
      evidence_id: "WEB-014",
      confidence: "BENCHMARK" /* BENCHMARK */,
      acvType: "project",
      acv_usd: 59e6,
      annual_cost_usd: 8e4,
      rate_per_1m: 1355.93,
      products: ["Project Management"],
      note: "Secondary source; Financial module explicitly excluded. Not independently verified primary post.",
      source_url: "https://downtobid.com/blog/how-much-is-procore-software"
    },
    {
      evidence_id: "WEB-015",
      confidence: "BENCHMARK" /* BENCHMARK */,
      acvType: "company",
      acv_usd: 55e6,
      annual_cost_usd: 55e3,
      rate_per_1m: 1e3,
      note: "Secondary source; do not count as new independent customer.",
      source_url: "https://www.getonecrew.com/post/procore-reviews"
    },
    {
      evidence_id: "WEB-016",
      confidence: "VERIFIED_PUBLIC_DOCUMENT" /* VERIFIED_PUBLIC_DOCUMENT */,
      acvType: "project",
      acv_usd: 85e6,
      annual_cost_usd: 85e3,
      rate_per_1m: 1e3,
      contract_term: "annual",
      products: ["Procore CMIS"],
      note: "Project-specific license; year-1 estimate. Not a standard commercial customer contract.",
      source_url: "https://mccmeetings.blob.core.usgovcloudapi.net/escondidca-pubu/MEET-Packet-1c066802b58043ba9504a911b624394f.pdf"
    },
    {
      evidence_id: "WEB-017",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "project",
      acv_usd: 4e6,
      annual_cost_usd: 7500,
      rate_per_1m: 1875,
      products: ["Project Management Pro"],
      note: 'Older 2021 observation; source says "project revenue" not explicit ACV.',
      source_url: "https://www.reddit.com/r/Construction/comments/lvpcvg"
    },
    {
      evidence_id: "WEB-018",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 1e7,
      annual_cost_usd: 1e4,
      rate_per_1m: 1e3,
      products: ["PM Starter"],
      note: "$10k/year for PM Starter at $10\u201315M revenue; full-package ~$35k retained in notes only.",
      source_url: "https://www.reddit.com/r/Construction/comments/oghlhi/any_of_you_specialty_subs_use_procore_if_so_how/"
    },
    {
      evidence_id: "WEB-019",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 2e7,
      annual_cost_usd: 4e4,
      rate_per_1m: 2e3,
      note: "Source says >$20M; $20M is a conservative normalization, not an exact rate.",
      source_url: "https://www.reddit.com/r/ConstructionManagers/comments/1bvtinw/procore_capabilities/"
    },
    {
      evidence_id: "WEB-021",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "company",
      acv_usd: 25e6,
      note: "No quote; demand/negotiation evidence only.",
      source_url: "https://www.reddit.com/r/Construction/comments/1nr3j7q/procore_for_small_commercial_gc/"
    },
    {
      evidence_id: "WEB-022",
      confidence: "OBSERVATION" /* OBSERVATION */,
      acvType: "unknown",
      products: ["Analytics", "BIM", "PM"],
      note: "Qualitative renewal pain signal; does not prove removability or savings.",
      source_url: "https://cafe.cfma.org/discussion/procore-renewals-requiring-wip-financial-statements-1"
    }
  ];
  var ALL_EVIDENCE_ROWS = [...EVIDENCE_ROWS, ...PUBLIC_QUOTE_ROWS];
  function getProductQuoteRows() {
    return PUBLIC_QUOTE_ROWS.filter(
      (r) => r.exclude_from_calculations !== true && r.quoted_product_annual_price_usd !== void 0
    );
  }

  // src/benchmark.ts
  function calcEffectiveRate(annual_cost_usd, acv_usd, credits_usd) {
    if (acv_usd <= 0) throw new Error("acv_usd must be positive");
    const netCost = annual_cost_usd - (credits_usd ?? 0);
    return netCost / acv_usd * 1e6;
  }
  function findComparableRows(user_acv, acvType, rows = ALL_EVIDENCE_ROWS) {
    const acvLow = user_acv * 0.1;
    const acvHigh = user_acv * 10;
    return rows.filter((r) => {
      if (r.confidence === "DUPLICATE" /* DUPLICATE */) return false;
      if (r.rate_per_1m === void 0) return false;
      if (r.acvType === "project" && acvType === "company") return false;
      if (r.acvType === "company" && acvType === "project") return false;
      if (r.acv_usd !== void 0 && (r.acv_usd < acvLow || r.acv_usd > acvHigh)) return false;
      return true;
    });
  }
  function percentile(sorted, p) {
    if (sorted.length === 0) return 0;
    const idx = p / 100 * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }
  function calcRateStats(rows) {
    const rates = rows.map((r) => r.rate_per_1m).filter((v) => v !== void 0).sort((a, b) => a - b);
    if (rates.length === 0) {
      return { min: 0, max: 0, p25: 0, p50: 0, p75: 0, mean: 0, count: 0 };
    }
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    return {
      min: rates[0],
      max: rates[rates.length - 1],
      p25: percentile(rates, 25),
      p50: percentile(rates, 50),
      p75: percentile(rates, 75),
      mean,
      count: rates.length
    };
  }
  function ratePosition(rate, stats) {
    if (rate < stats.p25) return "below_p25";
    if (rate < stats.p50) return "p25_to_p50";
    if (rate < stats.p75) return "p50_to_p75";
    return "above_p75";
  }
  function buildBenchmarkResult(user_acv, user_annual_cost, acvType = "company", credits_usd) {
    const comparables = findComparableRows(user_acv, acvType);
    if (comparables.length === 0) return null;
    const user_rate = calcEffectiveRate(user_annual_cost, user_acv, credits_usd);
    const stats = calcRateStats(comparables);
    const position = ratePosition(user_rate, stats);
    return {
      user_rate,
      stats,
      position,
      comparable_evidence_ids: comparables.map((r) => r.evidence_id),
      min_evidence_count_met: comparables.length >= 3
    };
  }
  function findProductQuoteRows(normalized_product_id, user_acv_usd, rows) {
    const pool = rows ?? PUBLIC_QUOTE_ROWS;
    const candidates = pool.filter(
      (r) => r.normalized_product_id === normalized_product_id && r.quoted_product_annual_price_usd !== void 0 && r.exclude_from_calculations !== true
    );
    const results = [];
    for (const row of candidates) {
      let repAcv;
      if (row.acv_usd !== void 0) {
        repAcv = row.acv_usd;
      } else if (row.acv_band_min_usd !== void 0 && row.acv_band_max_usd !== void 0) {
        repAcv = (row.acv_band_min_usd + row.acv_band_max_usd) / 2;
      }
      if (repAcv === void 0) continue;
      const ratio = repAcv / user_acv_usd;
      let comparability;
      let comparability_reason;
      if (ratio >= 0.5 && ratio <= 2) {
        comparability = "HIGH";
        comparability_reason = `Representative ACV $${repAcv.toLocaleString()} is within 0.5x-2x of user ACV $${user_acv_usd.toLocaleString()}`;
      } else if (ratio >= 0.2 && ratio <= 5) {
        comparability = "MEDIUM";
        comparability_reason = `Representative ACV $${repAcv.toLocaleString()} is within 0.2x-5x of user ACV $${user_acv_usd.toLocaleString()}`;
      } else {
        comparability = "LOW";
        comparability_reason = `Representative ACV $${repAcv.toLocaleString()} is outside 0.2x-5x of user ACV $${user_acv_usd.toLocaleString()}`;
      }
      results.push({ row, comparability, comparability_reason });
    }
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return results.sort((a, b) => order[a.comparability] - order[b.comparability]);
  }

  // src/rules.ts
  function ruleCommercialStructures(input) {
    if (input.contract_term === "multi_year") {
      return {
        result_type: "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */,
        confidence: "FACT" /* FACT */,
        recommendation_text: "Ask Procore whether a pooled-volume or renewal-rate-protection clause is available within your multi-year agreement.",
        comparable_evidence: [],
        explanation: "Procore SEC filings confirm that multi-year and pooled-volume structures exist as official commercial options. Whether your specific account qualifies is unconfirmed; request a written confirmation from your Procore rep."
      };
    }
    return {
      result_type: "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */,
      confidence: "FACT" /* FACT */,
      recommendation_text: "Ask Procore whether converting to a multi-year pooled agreement would provide a renewal rate cap.",
      comparable_evidence: [],
      explanation: "Procore offers multi-year and pooled-volume structures (per SEC filings). Your current annual contract may be eligible to convert; eligibility and any price change are unconfirmed without a quote."
    };
  }
  function ruleAcvGrowth(input) {
    if (input.expected_next_year_acv_usd === void 0 || input.expected_next_year_acv_usd <= input.acv_usd * 1.15) {
      return null;
    }
    return {
      result_type: "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */,
      confidence: "FACT" /* FACT */,
      recommendation_text: "Your expected ACV growth exceeds 15%. Ask Procore whether your renewal can pre-price the additional volume at today's rate before the increase is applied.",
      comparable_evidence: [],
      explanation: "Procore pricing is generally based on contracted ACV. A significant ACV increase can materially raise the renewal cost. Asking to pre-price the incremental volume is a documented commercial structure option; eligibility is account-specific."
    };
  }
  function ruleRateProtection(input) {
    const noProtection = input.contract_term === "annual" || input.rate_protection_status === "unclear" || input.rate_protection_status === "none";
    if (!noProtection) return null;
    return {
      result_type: "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */,
      confidence: "FACT" /* FACT */,
      recommendation_text: "Ask Procore whether a renewal rate-protection clause can be added to limit future annual increases.",
      comparable_evidence: ["REDDIT-001"],
      explanation: "Customer evidence (REDDIT-001) shows renewal increases of 10%+ are possible. Rate-protection language is a documented commercial structure; whether it is available for your account is unconfirmed without a quote."
    };
  }
  function ruleBenchmarkHighRate(benchmark) {
    if (!benchmark.min_evidence_count_met) return null;
    if (benchmark.position !== "above_p75") return null;
    return {
      result_type: "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */,
      confidence: "BENCHMARK" /* BENCHMARK */,
      recommendation_text: `Your effective rate of $${benchmark.user_rate.toFixed(0)}/1M ACV sits above the 75th percentile of comparable public observations (range $${benchmark.stats.min.toFixed(0)}\u2013$${benchmark.stats.max.toFixed(0)}/1M, n=${benchmark.stats.count}). Ask Procore for a rate comparison relative to current market conditions.`,
      comparable_evidence: benchmark.comparable_evidence_ids,
      explanation: "This is a directional benchmark from public customer observations, not an official Procore price list. Do not cite this as a guaranteed saving. Use it to frame a negotiation question."
    };
  }
  function ruleLegacyRateWarning(benchmark) {
    if (!benchmark.min_evidence_count_met) return null;
    if (benchmark.position !== "below_p25") return null;
    return {
      result_type: "WARNING" /* WARNING */,
      confidence: "BENCHMARK" /* BENCHMARK */,
      recommendation_text: `Your effective rate of $${benchmark.user_rate.toFixed(0)}/1M ACV appears favorable relative to comparable public observations (p25=$${benchmark.stats.p25.toFixed(0)}/1M, n=${benchmark.stats.count}). Confirm the commercial impact in writing before restructuring the contract; changing a legacy configuration can expose you to current-market pricing.`,
      comparable_evidence: benchmark.comparable_evidence_ids,
      explanation: "Do not recommend restructuring solely because a benchmark suggests a lower current-market rate. This observation is directional; it is not proof that your rate is negotiable downward."
    };
  }
  function ruleRenewalIncrease(input) {
    if (input.renewal_increase_pct === void 0) return null;
    if (input.renewal_increase_pct > 14) {
      return {
        result_type: "WARNING" /* WARNING */,
        confidence: "OBSERVATION" /* OBSERVATION */,
        recommendation_text: `Your reported renewal increase of ${input.renewal_increase_pct}% exceeds the highest increase reported in the evidence dataset (14%). Ask Procore for a written justification and request renewal-rate protection.`,
        comparable_evidence: ["REDDIT-001"],
        explanation: "REDDIT-001 reports a rep saying the highest renewal seen was 14%. Your figure exceeds this. This is OBSERVATION-level evidence from a single customer interaction, not an official Procore cap."
      };
    }
    if (input.renewal_increase_pct > 5) {
      return {
        result_type: "WARNING" /* WARNING */,
        confidence: "OBSERVATION" /* OBSERVATION */,
        recommendation_text: `Your renewal increase of ${input.renewal_increase_pct}% is above the typical 2\u20135% range reported in customer evidence. Ask Procore for a written justification and request renewal-rate protection language.`,
        comparable_evidence: ["REDDIT-001"],
        explanation: "REDDIT-001 reports a customer saying typical increases are 2\u20135%. This is OBSERVATION-level evidence, not an official Procore policy."
      };
    }
    return null;
  }
  function ruleDiscountUnknown(input) {
    if (input.discount_status !== "DONT_KNOW" /* DONT_KNOW */) return null;
    return {
      result_type: "WARNING" /* WARNING */,
      confidence: "FACT" /* FACT */,
      recommendation_text: "Your current discount status is unknown. Before requesting any configuration change, confirm in writing whether your existing discount applies to the proposed configuration.",
      comparable_evidence: [],
      explanation: "Procore discounts are account- and configuration-specific. A discount on the current contract does not automatically transfer to a reconfigured renewal. Any savings estimate that depends on a discount surviving the change would be unreliable."
    };
  }
  function ruleBundleOrPoolGuard(input) {
    if (input.bundle_structure !== "BUNDLED" /* BUNDLED */ && input.bundle_structure !== "POOLED" /* POOLED */) {
      return null;
    }
    const structureLabel = input.bundle_structure === "BUNDLED" /* BUNDLED */ ? "bundled" : "pooled-volume";
    return {
      result_type: "WARNING" /* WARNING */,
      confidence: "FACT" /* FACT */,
      recommendation_text: `Your contract appears to use a ${structureLabel} commercial structure. Request a written quote for the proposed configuration before assuming a line-item removal will reduce your renewal by that line-item amount.`,
      comparable_evidence: [],
      explanation: "In a bundled or pooled contract, the renewal price reflects the overall structure, not the sum of independent line items. Removing a product may not reduce total cost by the attributable line-item amount. A comparable written quote is required before any savings can be claimed."
    };
  }
  function ruleRequirementGuard(input) {
    if (!input.product_inputs || input.product_inputs.length === 0) return null;
    const required2 = input.product_inputs.filter(
      (p) => p.requirement === "BUSINESS_CRITICAL" /* BUSINESS_CRITICAL */ || p.requirement === "CLIENT_CONTRACT" /* CLIENT_CONTRACT */ || p.requirement === "INTERNAL_POLICY" /* INTERNAL_POLICY */
    );
    if (required2.length === 0) return null;
    const labels = required2.map((p) => p.product_id).join(", ");
    return {
      result_type: "WARNING" /* WARNING */,
      confidence: "FACT" /* FACT */,
      recommendation_text: `The following products are marked as required: ${labels}. These have been excluded from optimization candidates. Do not recommend removal.`,
      comparable_evidence: [],
      explanation: "A product required by client contract, internal policy, or business-critical workflow must not be treated as a removal candidate. Verify the requirement in writing before reconsidering."
    };
  }
  function ruleDependencyUnknown(input) {
    if (!input.product_inputs || input.product_inputs.length === 0) return null;
    const uncertain = input.product_inputs.filter(
      (p) => p.dependency === "NOT_SURE" /* NOT_SURE */
    );
    if (uncertain.length === 0) return null;
    const labels = uncertain.map((p) => p.product_id).join(", ");
    return {
      result_type: "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */,
      confidence: "UNKNOWN" /* UNKNOWN */,
      recommendation_text: `Dependency status is unconfirmed for: ${labels}. Resolve whether a technical or workflow dependency exists before treating these as removal candidates.`,
      comparable_evidence: [],
      explanation: "The engine cannot assume removability when a dependency is unknown. Confirm the dependency status before advancing these products to counterfactual pricing."
    };
  }
  function ruleVerifiedSaving(input) {
    if (input.before_annual_cost_usd === void 0 || input.after_annual_cost_usd === void 0) {
      return null;
    }
    const saving = input.before_annual_cost_usd - input.after_annual_cost_usd;
    if (saving <= 0) {
      return {
        result_type: "WARNING" /* WARNING */,
        confidence: "FACT" /* FACT */,
        recommendation_text: "The after-restructuring cost equals or exceeds the current cost. No saving is achieved by this change.",
        comparable_evidence: [],
        explanation: "before_annual_cost_usd minus after_annual_cost_usd is not positive."
      };
    }
    return {
      result_type: "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */,
      confidence: "FACT" /* FACT */,
      recommendation_text: `The two quotes you provided show a verified annual saving of $${saving.toLocaleString()}.`,
      comparable_evidence: [],
      explanation: "Saving is calculated as the difference between the two user-supplied quotes. This is a VERIFIED_BEFORE_AFTER result only if both quotes are official written Procore proposals for comparable configurations.",
      dollar_saving: saving
    };
  }

  // src/candidates.ts
  function generateCandidates(input) {
    if (!input.product_inputs || input.product_inputs.length === 0) {
      return { candidates: [], blocked: [], skipped_product_ids: [] };
    }
    const candidates = [];
    const blocked = [];
    const skipped = [];
    for (const p of input.product_inputs) {
      if (p.usage === "CRITICAL" /* CRITICAL */ || p.usage === "REGULAR" /* REGULAR */) {
        skipped.push(p.product_id);
        continue;
      }
      const elig = evaluateProductEligibility(p.product_id, p.requirement, p.dependency);
      const base = {
        product_id: p.product_id,
        usage: p.usage,
        requirement: p.requirement,
        replacement: p.replacement,
        dependency: p.dependency,
        annual_price_usd: p.annual_price_usd
      };
      if (elig.eligibility === "BLOCKED") {
        blocked.push({ ...base, blocked_reason: elig.reasons.join("; ") });
      } else if (elig.eligibility === "UNCERTAIN") {
        candidates.push({ ...base, blocked_reason: elig.reasons.join("; ") });
      } else {
        candidates.push(base);
      }
    }
    return { candidates, blocked, skipped_product_ids: skipped };
  }

  // src/counterfactual.ts
  function evaluateCandidates(input, generation) {
    const target_prices = [];
    const global_assumptions = [];
    if (input.discount_status === "DONT_KNOW" /* DONT_KNOW */ || input.discount_status === void 0) {
      global_assumptions.push(
        "Discount status unknown: any savings estimate depending on the current discount surviving a reconfiguration cannot be defended."
      );
    }
    if (input.bundle_structure === "BUNDLED" /* BUNDLED */ || input.bundle_structure === "POOLED" /* POOLED */) {
      const label = input.bundle_structure === "BUNDLED" /* BUNDLED */ ? "bundled" : "pooled-volume";
      global_assumptions.push(
        `Contract uses a ${label} structure: line-item removal does not automatically reduce total renewal by the attributable line-item amount.`
      );
    }
    if (generation.candidates.length === 0) {
      return {
        overall_result: "NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */,
        counterfactual_results: [],
        target_prices: [],
        global_assumptions
      };
    }
    const hasBefore = typeof input.before_annual_cost_usd === "number" && input.before_annual_cost_usd > 0;
    const hasAfter = typeof input.after_annual_cost_usd === "number" && input.after_annual_cost_usd > 0;
    if (hasBefore && hasAfter) {
      const saving = input.before_annual_cost_usd - input.after_annual_cost_usd;
      const candidate = generation.candidates[0];
      const result = {
        result_class: saving > 0 ? "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ : "WARNING" /* WARNING */,
        candidate,
        dollar_saving: saving > 0 ? saving : void 0,
        assumptions: [
          ...global_assumptions,
          "Saving is the arithmetic difference between the two user-supplied quotes.",
          "VERIFIED_BEFORE_AFTER only when both quotes are official written Procore proposals for comparable configurations."
        ],
        evidence_ids: [],
        confidence: "FACT" /* FACT */,
        explanation: saving > 0 ? `The two user-supplied quotes differ by $${saving.toLocaleString()}/year. This is a verified quote-to-quote difference. Whether this difference is attributable to a specific product removal cannot be determined from the quote amounts alone \u2014 request a written quote confirming which configuration changed.` : "The after-restructuring cost equals or exceeds the current cost. No saving is achieved by this change."
      };
      return {
        overall_result: result.result_class,
        counterfactual_results: [result],
        target_prices: [],
        global_assumptions
      };
    }
    const counterfactual_results = [];
    let bestResult = "NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */;
    for (const candidate of generation.candidates) {
      const result = evaluateSingleCandidate(candidate, input, global_assumptions);
      counterfactual_results.push(result);
      if (input.target_savings_pct != null && result.result_class !== "NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */) {
        target_prices.push(calcTargetPrice(input, candidate, input.target_savings_pct));
      }
      if (resultPriority(result.result_class) > resultPriority(bestResult)) {
        bestResult = result.result_class;
      }
    }
    return {
      overall_result: bestResult,
      counterfactual_results,
      target_prices,
      global_assumptions
    };
  }
  function evaluateSingleCandidate(candidate, input, globalAssumptions) {
    const assumptions = [...globalAssumptions];
    const spendNote = candidate.annual_price_usd ? ` Your current attributable spend is $${candidate.annual_price_usd.toLocaleString()}/year.` : "";
    const pqMatches = findProductQuoteRows(candidate.product_id, input.acv_usd).filter((m) => m.comparability === "HIGH" || m.comparability === "MEDIUM");
    const pqIds = pqMatches.map((m) => m.row.evidence_id);
    const pqNote = pqIds.length > 0 ? ` Comparable public quote observations exist for ${candidate.product_id} (${pqIds.length} observation${pqIds.length > 1 ? "s" : ""}, see evidence trail). Directional context only \u2014 not a savings guarantee.` : "";
    if (candidate.blocked_reason) {
      return {
        result_class: "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */,
        candidate,
        assumptions,
        evidence_ids: pqIds,
        confidence: "UNKNOWN" /* UNKNOWN */,
        explanation: `${candidate.product_id} may be an optimization candidate, but removal cannot be confirmed safe.${spendNote} Confirmation needed: ${candidate.blocked_reason} Request a comparable quote before treating this as a dollar saving.` + pqNote
      };
    }
    const preventsCalc2 = input.discount_status === "DONT_KNOW" /* DONT_KNOW */ || input.discount_status === void 0 || input.bundle_structure === "BUNDLED" /* BUNDLED */ || input.bundle_structure === "POOLED" /* POOLED */;
    if (preventsCalc2) {
      return {
        result_class: "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */,
        candidate,
        assumptions,
        evidence_ids: pqIds,
        confidence: "UNKNOWN" /* UNKNOWN */,
        explanation: `${candidate.product_id} is reported as not actively used and no known requirement prevents a configuration change.${spendNote} However, commercial structure or discount uncertainty prevents a defensible savings calculation. Request a comparable written quote before treating this as a dollar saving.` + pqNote
      };
    }
    return {
      result_class: "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */,
      candidate,
      assumptions,
      evidence_ids: pqIds,
      confidence: "UNKNOWN" /* UNKNOWN */,
      explanation: `${candidate.product_id} is reported as not actively used and no known requirement prevents a configuration change.${spendNote} However, available evidence is insufficient to defensibly determine the resulting renewal price. Request a comparable quote before treating this as a dollar saving.` + pqNote
    };
  }
  function calcTargetPrice(input, candidate, targetPct) {
    const maxAcceptable = Math.round(input.annual_cost_usd * (1 - targetPct / 100) * 100) / 100;
    return {
      product_id: candidate.product_id,
      current_spend: input.annual_cost_usd,
      target_savings_pct: targetPct,
      max_acceptable_price: maxAcceptable
    };
  }
  function resultPriority(r) {
    switch (r) {
      case "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */:
        return 5;
      case "WARNING" /* WARNING */:
        return 4;
      case "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */:
        return 3;
      case "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */:
        return 2;
      case "NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */:
        return 1;
      default:
        return 0;
    }
  }

  // src/negotiation.ts
  function fmt(n) {
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  function buildWhatToAsk(candidate, input) {
    const base = `Request a written quote from Procore for your current configuration with ${candidate.product_id} removed, holding all other contract terms constant.`;
    if (input.contract_term === "annual") {
      return base + " Also ask whether converting to a multi-year agreement would provide better pricing.";
    }
    return base;
  }
  function buildConfigRequested(candidate, input) {
    const others = input.products.filter((p) => p !== candidate.product_id);
    const otherStr = others.length > 0 ? others.join(", ") : "remaining products";
    return `Current configuration minus ${candidate.product_id}; retaining ${otherStr}.`;
  }
  function buildUnknowns(candidate, input) {
    const unknowns = [
      "The resulting renewal price for the proposed configuration is not known until Procore provides a written quote.",
      "Whether your current discount rate will be preserved in the reconfigured contract."
    ];
    if (candidate.blocked_reason) {
      unknowns.push(`Dependency/requirement confirmation still needed: ${candidate.blocked_reason}`);
    }
    if (input.bundle_structure === "BUNDLED" /* BUNDLED */ || input.bundle_structure === "POOLED" /* POOLED */) {
      unknowns.push(
        "The commercial impact of removing a line item from a bundled/pooled contract structure is not known without a comparable written quote."
      );
    }
    return unknowns;
  }
  function buildConfirmInWriting(candidate, input) {
    const items = [
      "A written Procore quote for the proposed configuration.",
      "Confirmation that the quoted price is comparable (same ACV, same term, same other products).",
      "Whether your current discount and rate protection apply to the reconfigured contract."
    ];
    if (input.bundle_structure === "BUNDLED" /* BUNDLED */ || input.bundle_structure === "POOLED" /* POOLED */) {
      items.push(
        `The commercial impact of removing ${candidate.product_id} from your current bundled/pooled pricing structure.`
      );
    }
    if (candidate.blocked_reason?.includes("ERP") || candidate.product_id === "project_financials") {
      items.push(
        "That removing Project Financials will not break your active ERP/accounting integration."
      );
    }
    return items;
  }
  function buildRisks(candidate, input) {
    const risks = [
      "If your current contract has a favorable legacy rate, reconfiguration may expose you to current-market pricing.",
      "Removing a product without a written comparable quote means the actual savings cannot be verified in advance."
    ];
    if (input.discount_status === "DONT_KNOW" /* DONT_KNOW */) {
      risks.push(
        "Your current discount is unknown. It may not survive a reconfiguration, making the net saving smaller than expected."
      );
    }
    if (candidate.blocked_reason) {
      risks.push(
        `Unresolved eligibility: ${candidate.blocked_reason} If this dependency exists, removal could disrupt active workflows.`
      );
    }
    return risks;
  }
  function buildNegotiationOutput(input, summary) {
    if (summary.overall_result === "NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */) return null;
    if (summary.counterfactual_results.length === 0) return null;
    const cfResult = summary.counterfactual_results[0];
    const candidate = cfResult.candidate;
    const targetPriceEntry = summary.target_prices.find(
      (tp) => tp.product_id === candidate.product_id
    );
    const why = cfResult.result_class === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ ? `The two user-supplied quotes differ by $${fmt(cfResult.dollar_saving)} per year. This is a verified quote-to-quote difference. This amount cannot automatically be attributed to the removal of a specific product without a written quote confirming the configuration change.` : `${candidate.product_id} has been identified as a potential optimization candidate. A comparable written quote is required to determine whether a defensible saving exists.`;
    return {
      what_to_ask: buildWhatToAsk(candidate, input),
      why,
      configuration_requested: buildConfigRequested(candidate, input),
      target_price: targetPriceEntry?.max_acceptable_price,
      max_acceptable_price: targetPriceEntry ? targetPriceEntry.max_acceptable_price : void 0,
      evidence_ids: cfResult.evidence_ids,
      unknowns: buildUnknowns(candidate, input),
      confirm_in_writing: buildConfirmInWriting(candidate, input),
      risks: buildRisks(candidate, input)
    };
  }

  // src/report.ts
  function headline(verdict) {
    switch (verdict) {
      case "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */:
        return "Verified savings identified";
      case "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */:
        return "Potential savings identified";
      case "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */:
        return "Optimization opportunity identified \u2014 savings not yet quantifiable";
      case "NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */:
        return "No defensible savings identified";
      default:
        return "Analysis complete";
    }
  }
  function primaryConfidenceLevel(summary) {
    const first = summary.counterfactual_results[0];
    return first?.confidence ?? "UNKNOWN";
  }
  function primaryOpportunity(summary) {
    const first = summary.counterfactual_results[0];
    if (!first) return void 0;
    return first.explanation;
  }
  function keyWarnings(summary) {
    return summary.global_assumptions.slice();
  }
  function whatToConfirm(summary) {
    const items = [];
    for (const r of summary.counterfactual_results) {
      if (r.result_class === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */) {
        items.push(
          `Request a written Procore quote for configuration without ${r.candidate.product_id} to determine the renewal impact.`
        );
      }
    }
    if (items.length === 0) {
      items.push("Cross-check any estimate against your actual Procore renewal quote before making decisions.");
    }
    return items;
  }
  function buildFreeResult(input, summary, benchmark) {
    const verdict = summary.overall_result;
    let effective_rate;
    let benchmark_position;
    if (benchmark?.min_evidence_count_met) {
      effective_rate = benchmark.user_rate;
      benchmark_position = benchmark.position;
    }
    const first = summary.counterfactual_results[0];
    const savings_amount = verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ && first?.dollar_saving != null ? first.dollar_saving : void 0;
    const userProducts = input.product_inputs?.map((p) => p.product_id) ?? input.products ?? [];
    const pqCount = getProductQuoteRows().filter((r) => userProducts.includes(r.normalized_product_id ?? "")).length;
    const benchmark_evidence_note = pqCount > 0 ? `${pqCount} public quote observation${pqCount > 1 ? "s" : ""} available for your product mix. Directional context only \u2014 not an official Procore price list.` : void 0;
    return {
      verdict,
      current_spend: input.annual_cost_usd,
      effective_rate,
      benchmark_position,
      main_opportunity: primaryOpportunity(summary),
      savings_amount,
      savings_range: void 0,
      // SAVINGS_IDENTIFIED range not yet produced from evidence
      confidence: primaryConfidenceLevel(summary),
      explanation: headline(verdict),
      warnings: keyWarnings(summary),
      what_to_confirm: whatToConfirm(summary),
      benchmark_evidence_note
    };
  }
  function buildPaidReport(input, generation, summary, benchmark, negotiation) {
    const current_configuration = input.product_inputs ?? [];
    const candidate_configurations = generation.candidates.length > 0 ? [generation.candidates] : [];
    const evidence_trail = [
      ...new Set(summary.counterfactual_results.flatMap((r) => r.evidence_ids))
    ];
    if (benchmark?.comparable_evidence_ids) {
      for (const id of benchmark.comparable_evidence_ids) {
        if (!evidence_trail.includes(id)) evidence_trail.push(id);
      }
    }
    const assumptions = [
      ...summary.global_assumptions,
      ...summary.counterfactual_results.flatMap((r) => r.assumptions)
    ];
    if (input.credits_usd != null && input.credits_usd > 0) {
      assumptions.push(
        `Credits of $${input.credits_usd.toLocaleString()} applied \u2014 effective rate reflects net annual spend after credits.`
      );
    }
    const seen = /* @__PURE__ */ new Set();
    const uniqueAssumptions = assumptions.filter((a) => {
      if (seen.has(a)) return false;
      seen.add(a);
      return true;
    });
    const dependency_findings = [
      ...generation.blocked.map(
        (b) => `${b.product_id} blocked: ${b.blocked_reason}`
      ),
      ...generation.candidates.filter((c) => c.blocked_reason).map((c) => `${c.product_id} uncertain: ${c.blocked_reason}`)
    ];
    const legacy_rate_warnings = [];
    if (benchmark?.min_evidence_count_met && benchmark.position === "below_p25") {
      legacy_rate_warnings.push(
        `Your effective rate of $${benchmark.user_rate.toFixed(0)}/1M ACV appears favorable relative to comparable public observations. Confirm the commercial impact in writing before restructuring the contract.`
      );
    }
    const commercial_risks = [
      "Savings estimates are not verified unless explicitly marked VERIFIED_BEFORE_AFTER.",
      "Customer-specific pricing can differ from any benchmark or estimate shown.",
      "Discount and rate-protection terms may not survive a reconfiguration."
    ];
    if (input.bundle_structure === "BUNDLED" || input.bundle_structure === "POOLED") {
      commercial_risks.push(
        "Bundled/pooled contract: removing a product may not reduce total renewal by the line-item amount."
      );
    }
    if (input.tier_changed === "YES") {
      commercial_risks.push(
        "Pricing tier changed since last year \u2014 renewal pricing may reflect new tier structure."
      );
    }
    if (input.packaging_changed === "YES") {
      commercial_risks.push(
        "Packaging structure changed since last year \u2014 bundle lock-in risk may apply to current configuration."
      );
    }
    const suggested_questions = [
      `Request a written quote for your current configuration with any candidate products removed.`,
      "Ask Procore to hold all other terms constant in the alternative quote.",
      "Ask whether your current discount and rate protection apply to the proposed configuration."
    ];
    if (input.contract_term === "annual") {
      suggested_questions.push(
        "Ask whether a multi-year pooled agreement would provide a renewal rate cap."
      );
    }
    if (input.rate_protection_status === "active") {
      suggested_questions.push(
        "Invoke your rate protection clause if the renewal increase exceeds the contractual cap."
      );
    }
    if (input.expected_next_year_acv_usd != null && input.expected_next_year_acv_usd > input.acv_usd * 1.15) {
      suggested_questions.push(
        `Expected ACV growth exceeds 15%. Ask whether your renewal can pre-price the additional volume at today's rate.`
      );
    }
    if (input.target_savings_pct != null && summary.target_prices.length > 0) {
      const tp = summary.target_prices[0];
      suggested_questions.push(
        `Target negotiation maximum: $${tp.max_acceptable_price.toLocaleString()} (${tp.target_savings_pct}% below current spend). Label this as your walk-away price, not an expected Procore quote.`
      );
    }
    const renewal_strategy = summary.overall_result === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ ? "You have a verified savings opportunity. Present both quotes to Procore and negotiate the lower-cost configuration." : summary.overall_result === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */ ? "Request a written comparable quote for the candidate configuration. Do not negotiate on the basis of the current line-item price alone." : "No configuration change with a defensible saving was identified. Focus on renewal rate protection and multi-year structure options.";
    const audit_trail = [
      `Analysis date: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}`,
      `Input: annual_cost_usd=${input.annual_cost_usd}, acv_usd=${input.acv_usd}, contract_term=${input.contract_term}`,
      `Candidates evaluated: ${generation.candidates.length}`,
      `Blocked products: ${generation.blocked.length}`,
      `Overall result: ${summary.overall_result}`,
      ...summary.counterfactual_results.map(
        (r) => `  ${r.candidate.product_id}: ${r.result_class}` + (r.dollar_saving != null ? ` ($${r.dollar_saving.toLocaleString()})` : "")
      )
    ];
    function acvContext(r) {
      if (r.acv_usd) return `$${(r.acv_usd / 1e6).toFixed(0)}M ACV`;
      if (r.acv_band_min_usd && r.acv_band_max_usd) {
        return `$${(r.acv_band_min_usd / 1e6).toFixed(0)}M\u2013$${(r.acv_band_max_usd / 1e6).toFixed(0)}M ACV band`;
      }
      return "ACV not disclosed";
    }
    const qeRecords = PUBLIC_QUOTE_ROWS.map((r) => ({
      evidence_id: r.evidence_id,
      source_description: r.source_description ?? "",
      product_reported: r.products?.[0] ?? r.normalized_product_id ?? "Platform total",
      normalized_product_id: r.normalized_product_id,
      acv_context: acvContext(r),
      quoted_annual_price_usd: r.quoted_product_annual_price_usd ?? null,
      term: r.contract_term ?? "Quote",
      limitation_flags: r.limitation_flags ?? [],
      what_it_supports: r.quoted_product_annual_price_usd ? `Observed public quote price for ${r.normalized_product_id ?? "this product"} at ${acvContext(r)}` : "Non-calculational context evidence",
      what_it_does_not_support: "Universal module price or guaranteed removal saving for any customer",
      exclude_from_calculations: r.exclude_from_calculations === true
    }));
    const usable = qeRecords.filter((r) => !r.exclude_from_calculations && r.quoted_annual_price_usd !== null).length;
    const productsCovered = [...new Set(
      PUBLIC_QUOTE_ROWS.filter((r) => r.normalized_product_id && !r.exclude_from_calculations).map((r) => r.normalized_product_id)
    )];
    const quote_evidence_summary = {
      dataset_name: PUBLIC_QUOTES_DATASET_META.dataset_name,
      total_records: PUBLIC_QUOTES_DATASET_META.total_records,
      usable_records: usable,
      excluded_records: PUBLIC_QUOTES_DATASET_META.total_records - usable,
      products_covered: productsCovered,
      records: qeRecords
    };
    return {
      current_configuration,
      candidate_configurations,
      counterfactual_results: summary.counterfactual_results,
      benchmark: benchmark ?? void 0,
      evidence_trail,
      assumptions: uniqueAssumptions,
      confidence_rationale: `Overall confidence: ${primaryConfidenceLevel(summary)}. Financial claims are deterministic from user inputs and explicit assumptions. No LLM-generated numbers are used in calculations.`,
      dependency_findings,
      legacy_rate_warnings,
      commercial_risks,
      negotiation: negotiation ?? void 0,
      suggested_questions,
      renewal_strategy,
      audit_trail,
      quote_evidence_summary
    };
  }

  // src/engine.ts
  var RESULT_PRIORITY = {
    ["VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */]: 5,
    ["WARNING" /* WARNING */]: 4,
    ["SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */]: 3,
    ["OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */]: 2,
    ["NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */]: 1
  };
  function sortByPriority(results) {
    return [...results].sort((a, b) => RESULT_PRIORITY[b.result_type] - RESULT_PRIORITY[a.result_type]);
  }
  function runEngine(raw) {
    const input = assertUserInput(raw);
    const validation = validateUserInput(raw);
    const ruleResults = [];
    const warnings = [];
    const commercial = ruleCommercialStructures(input);
    if (commercial) ruleResults.push(commercial);
    const acvGrowth = ruleAcvGrowth(input);
    if (acvGrowth) ruleResults.push(acvGrowth);
    const rateProtection = ruleRateProtection(input);
    if (rateProtection) ruleResults.push(rateProtection);
    const discountWarn = ruleDiscountUnknown(input);
    if (discountWarn) ruleResults.push(discountWarn);
    const bundleWarn = ruleBundleOrPoolGuard(input);
    if (bundleWarn) ruleResults.push(bundleWarn);
    const benchmark = buildBenchmarkResult(input.acv_usd, input.annual_cost_usd, "company", input.credits_usd);
    if (benchmark) {
      const highRate = ruleBenchmarkHighRate(benchmark);
      if (highRate) ruleResults.push(highRate);
      const legacyWarn = ruleLegacyRateWarning(benchmark);
      if (legacyWarn) ruleResults.push(legacyWarn);
    } else {
      warnings.push("No comparable evidence rows found for the provided ACV; benchmark skipped.");
    }
    const renewalResult = ruleRenewalIncrease(input);
    if (renewalResult) ruleResults.push(renewalResult);
    const savingResult = ruleVerifiedSaving(input);
    if (savingResult) ruleResults.push(savingResult);
    const reqGuard = ruleRequirementGuard(input);
    if (reqGuard) ruleResults.push(reqGuard);
    const depGuard = ruleDependencyUnknown(input);
    if (depGuard) ruleResults.push(depGuard);
    let candidateResult = null;
    let cfSummary = null;
    let negotiation = null;
    if (input.product_inputs && input.product_inputs.length > 0) {
      candidateResult = generateCandidates(input);
      cfSummary = evaluateCandidates(input, candidateResult);
      negotiation = buildNegotiationOutput(input, cfSummary);
      ruleResults.push({
        result_type: cfSummary.overall_result,
        confidence: "UNKNOWN" /* UNKNOWN */,
        recommendation_text: cfSummary.counterfactual_results[0]?.explanation ?? "No defensible savings identified based on the provided inputs.",
        comparable_evidence: cfSummary.counterfactual_results[0]?.evidence_ids ?? [],
        explanation: cfSummary.global_assumptions.join(" "),
        dollar_saving: cfSummary.counterfactual_results[0]?.dollar_saving,
        assumptions: cfSummary.global_assumptions
      });
    } else {
      const hasBefore = typeof input.before_annual_cost_usd === "number" && input.before_annual_cost_usd > 0;
      const hasAfter = typeof input.after_annual_cost_usd === "number" && input.after_annual_cost_usd > 0;
      const verifiedSaving = hasBefore && hasAfter ? input.before_annual_cost_usd - input.after_annual_cost_usd : null;
      const fallbackOverall = verifiedSaving != null && verifiedSaving > 0 ? "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ : "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */;
      const fallbackCR = verifiedSaving != null && verifiedSaving > 0 ? [{
        result_class: "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */,
        candidate: {
          product_id: "__quote_pair__",
          usage: "NOT_SURE",
          requirement: "NOT_SURE",
          replacement: "NOT_SURE",
          dependency: "NOT_SURE"
        },
        dollar_saving: verifiedSaving,
        assumptions: [
          "Saving is the arithmetic difference between the two user-supplied quotes.",
          "VERIFIED only when both quotes are official written Procore proposals for comparable configurations."
        ],
        evidence_ids: [],
        confidence: "FACT" /* FACT */,
        explanation: `The two quotes provided show a verified annual saving of $${verifiedSaving.toLocaleString()}.`
      }] : [];
      ruleResults.push({
        result_type: "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */,
        confidence: "UNKNOWN" /* UNKNOWN */,
        recommendation_text: "Ask Procore for a written quote with your proposed configuration change, then compare that quote against your current contract.",
        comparable_evidence: [],
        explanation: "No per-product usage/requirement/dependency information was provided. Analysis is limited to benchmarking and commercial-structure rules."
      });
      cfSummary = {
        overall_result: fallbackOverall,
        counterfactual_results: fallbackCR,
        target_prices: [],
        global_assumptions: validation.warnings.filter((w) => w.severity === "PREVENTS_CALCULATION").map((w) => w.message)
      };
      candidateResult = { candidates: [], blocked: [], skipped_product_ids: [] };
    }
    for (const w of validation.warnings) {
      if (w.severity === "PREVENTS_CALCULATION") {
        warnings.push(w.message);
      }
    }
    let seenVerified = false;
    const deduped = ruleResults.filter((r) => {
      if (r.result_type === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */) {
        if (seenVerified) return false;
        seenVerified = true;
      }
      return true;
    });
    const sorted = sortByPriority(deduped);
    const freeResult = buildFreeResult(input, cfSummary, benchmark);
    const paidReport = buildPaidReport(input, candidateResult, cfSummary, benchmark, negotiation);
    return {
      results: sorted,
      benchmark,
      warnings,
      assumptions: cfSummary.global_assumptions,
      candidates: candidateResult,
      counterfactual: cfSummary,
      negotiation,
      free_result: freeResult,
      paid_report: paidReport
    };
  }

  // node_modules/@supabase/functions-js/dist/module/helper.js
  var resolveFetch = (customFetch) => {
    let _fetch;
    if (customFetch) {
      _fetch = customFetch;
    } else if (typeof fetch === "undefined") {
      _fetch = (...args) => Promise.resolve().then(() => (init_browser(), browser_exports)).then(({ default: fetch3 }) => fetch3(...args));
    } else {
      _fetch = fetch;
    }
    return (...args) => _fetch(...args);
  };

  // node_modules/@supabase/functions-js/dist/module/types.js
  var FunctionsError = class extends Error {
    constructor(message, name = "FunctionsError", context) {
      super(message);
      this.name = name;
      this.context = context;
    }
  };
  var FunctionsFetchError = class extends FunctionsError {
    constructor(context) {
      super("Failed to send a request to the Edge Function", "FunctionsFetchError", context);
    }
  };
  var FunctionsRelayError = class extends FunctionsError {
    constructor(context) {
      super("Relay Error invoking the Edge Function", "FunctionsRelayError", context);
    }
  };
  var FunctionsHttpError = class extends FunctionsError {
    constructor(context) {
      super("Edge Function returned a non-2xx status code", "FunctionsHttpError", context);
    }
  };
  var FunctionRegion;
  (function(FunctionRegion2) {
    FunctionRegion2["Any"] = "any";
    FunctionRegion2["ApNortheast1"] = "ap-northeast-1";
    FunctionRegion2["ApNortheast2"] = "ap-northeast-2";
    FunctionRegion2["ApSouth1"] = "ap-south-1";
    FunctionRegion2["ApSoutheast1"] = "ap-southeast-1";
    FunctionRegion2["ApSoutheast2"] = "ap-southeast-2";
    FunctionRegion2["CaCentral1"] = "ca-central-1";
    FunctionRegion2["EuCentral1"] = "eu-central-1";
    FunctionRegion2["EuWest1"] = "eu-west-1";
    FunctionRegion2["EuWest2"] = "eu-west-2";
    FunctionRegion2["EuWest3"] = "eu-west-3";
    FunctionRegion2["SaEast1"] = "sa-east-1";
    FunctionRegion2["UsEast1"] = "us-east-1";
    FunctionRegion2["UsWest1"] = "us-west-1";
    FunctionRegion2["UsWest2"] = "us-west-2";
  })(FunctionRegion || (FunctionRegion = {}));

  // node_modules/@supabase/functions-js/dist/module/FunctionsClient.js
  var __awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var FunctionsClient = class {
    constructor(url, { headers = {}, customFetch, region = FunctionRegion.Any } = {}) {
      this.url = url;
      this.headers = headers;
      this.region = region;
      this.fetch = resolveFetch(customFetch);
    }
    /**
     * Updates the authorization header
     * @param token - the new jwt token sent in the authorisation header
     */
    setAuth(token) {
      this.headers.Authorization = `Bearer ${token}`;
    }
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     */
    invoke(functionName, options = {}) {
      var _a;
      return __awaiter(this, void 0, void 0, function* () {
        try {
          const { headers, method, body: functionArgs } = options;
          let _headers = {};
          let { region } = options;
          if (!region) {
            region = this.region;
          }
          if (region && region !== "any") {
            _headers["x-region"] = region;
          }
          let body;
          if (functionArgs && (headers && !Object.prototype.hasOwnProperty.call(headers, "Content-Type") || !headers)) {
            if (typeof Blob !== "undefined" && functionArgs instanceof Blob || functionArgs instanceof ArrayBuffer) {
              _headers["Content-Type"] = "application/octet-stream";
              body = functionArgs;
            } else if (typeof functionArgs === "string") {
              _headers["Content-Type"] = "text/plain";
              body = functionArgs;
            } else if (typeof FormData !== "undefined" && functionArgs instanceof FormData) {
              body = functionArgs;
            } else {
              _headers["Content-Type"] = "application/json";
              body = JSON.stringify(functionArgs);
            }
          }
          const response = yield this.fetch(`${this.url}/${functionName}`, {
            method: method || "POST",
            // headers priority is (high to low):
            // 1. invoke-level headers
            // 2. client-level headers
            // 3. default Content-Type header
            headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
            body
          }).catch((fetchError) => {
            throw new FunctionsFetchError(fetchError);
          });
          const isRelayError = response.headers.get("x-relay-error");
          if (isRelayError && isRelayError === "true") {
            throw new FunctionsRelayError(response);
          }
          if (!response.ok) {
            throw new FunctionsHttpError(response);
          }
          let responseType = ((_a = response.headers.get("Content-Type")) !== null && _a !== void 0 ? _a : "text/plain").split(";")[0].trim();
          let data;
          if (responseType === "application/json") {
            data = yield response.json();
          } else if (responseType === "application/octet-stream") {
            data = yield response.blob();
          } else if (responseType === "text/event-stream") {
            data = response;
          } else if (responseType === "multipart/form-data") {
            data = yield response.formData();
          } else {
            data = yield response.text();
          }
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      });
    }
  };

  // node_modules/@supabase/postgrest-js/dist/esm/wrapper.mjs
  var import_cjs = __toESM(require_cjs(), 1);
  var {
    PostgrestClient,
    PostgrestQueryBuilder,
    PostgrestFilterBuilder,
    PostgrestTransformBuilder,
    PostgrestBuilder
  } = import_cjs.default;

  // node_modules/@supabase/realtime-js/dist/module/lib/version.js
  var version = "2.10.2";

  // node_modules/@supabase/realtime-js/dist/module/lib/constants.js
  var DEFAULT_HEADERS = { "X-Client-Info": `realtime-js/${version}` };
  var VSN = "1.0.0";
  var DEFAULT_TIMEOUT = 1e4;
  var WS_CLOSE_NORMAL = 1e3;
  var SOCKET_STATES;
  (function(SOCKET_STATES2) {
    SOCKET_STATES2[SOCKET_STATES2["connecting"] = 0] = "connecting";
    SOCKET_STATES2[SOCKET_STATES2["open"] = 1] = "open";
    SOCKET_STATES2[SOCKET_STATES2["closing"] = 2] = "closing";
    SOCKET_STATES2[SOCKET_STATES2["closed"] = 3] = "closed";
  })(SOCKET_STATES || (SOCKET_STATES = {}));
  var CHANNEL_STATES;
  (function(CHANNEL_STATES2) {
    CHANNEL_STATES2["closed"] = "closed";
    CHANNEL_STATES2["errored"] = "errored";
    CHANNEL_STATES2["joined"] = "joined";
    CHANNEL_STATES2["joining"] = "joining";
    CHANNEL_STATES2["leaving"] = "leaving";
  })(CHANNEL_STATES || (CHANNEL_STATES = {}));
  var CHANNEL_EVENTS;
  (function(CHANNEL_EVENTS2) {
    CHANNEL_EVENTS2["close"] = "phx_close";
    CHANNEL_EVENTS2["error"] = "phx_error";
    CHANNEL_EVENTS2["join"] = "phx_join";
    CHANNEL_EVENTS2["reply"] = "phx_reply";
    CHANNEL_EVENTS2["leave"] = "phx_leave";
    CHANNEL_EVENTS2["access_token"] = "access_token";
  })(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
  var TRANSPORTS;
  (function(TRANSPORTS2) {
    TRANSPORTS2["websocket"] = "websocket";
  })(TRANSPORTS || (TRANSPORTS = {}));
  var CONNECTION_STATE;
  (function(CONNECTION_STATE2) {
    CONNECTION_STATE2["Connecting"] = "connecting";
    CONNECTION_STATE2["Open"] = "open";
    CONNECTION_STATE2["Closing"] = "closing";
    CONNECTION_STATE2["Closed"] = "closed";
  })(CONNECTION_STATE || (CONNECTION_STATE = {}));

  // node_modules/@supabase/realtime-js/dist/module/lib/serializer.js
  var Serializer = class {
    constructor() {
      this.HEADER_LENGTH = 1;
    }
    decode(rawPayload, callback) {
      if (rawPayload.constructor === ArrayBuffer) {
        return callback(this._binaryDecode(rawPayload));
      }
      if (typeof rawPayload === "string") {
        return callback(JSON.parse(rawPayload));
      }
      return callback({});
    }
    _binaryDecode(buffer) {
      const view = new DataView(buffer);
      const decoder = new TextDecoder();
      return this._decodeBroadcast(buffer, view, decoder);
    }
    _decodeBroadcast(buffer, view, decoder) {
      const topicSize = view.getUint8(1);
      const eventSize = view.getUint8(2);
      let offset = this.HEADER_LENGTH + 2;
      const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
      offset = offset + topicSize;
      const event = decoder.decode(buffer.slice(offset, offset + eventSize));
      offset = offset + eventSize;
      const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
      return { ref: null, topic, event, payload: data };
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/timer.js
  var Timer = class {
    constructor(callback, timerCalc) {
      this.callback = callback;
      this.timerCalc = timerCalc;
      this.timer = void 0;
      this.tries = 0;
      this.callback = callback;
      this.timerCalc = timerCalc;
    }
    reset() {
      this.tries = 0;
      clearTimeout(this.timer);
    }
    // Cancels any previous scheduleTimeout and schedules callback
    scheduleTimeout() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.tries = this.tries + 1;
        this.callback();
      }, this.timerCalc(this.tries + 1));
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/transformers.js
  var PostgresTypes;
  (function(PostgresTypes2) {
    PostgresTypes2["abstime"] = "abstime";
    PostgresTypes2["bool"] = "bool";
    PostgresTypes2["date"] = "date";
    PostgresTypes2["daterange"] = "daterange";
    PostgresTypes2["float4"] = "float4";
    PostgresTypes2["float8"] = "float8";
    PostgresTypes2["int2"] = "int2";
    PostgresTypes2["int4"] = "int4";
    PostgresTypes2["int4range"] = "int4range";
    PostgresTypes2["int8"] = "int8";
    PostgresTypes2["int8range"] = "int8range";
    PostgresTypes2["json"] = "json";
    PostgresTypes2["jsonb"] = "jsonb";
    PostgresTypes2["money"] = "money";
    PostgresTypes2["numeric"] = "numeric";
    PostgresTypes2["oid"] = "oid";
    PostgresTypes2["reltime"] = "reltime";
    PostgresTypes2["text"] = "text";
    PostgresTypes2["time"] = "time";
    PostgresTypes2["timestamp"] = "timestamp";
    PostgresTypes2["timestamptz"] = "timestamptz";
    PostgresTypes2["timetz"] = "timetz";
    PostgresTypes2["tsrange"] = "tsrange";
    PostgresTypes2["tstzrange"] = "tstzrange";
  })(PostgresTypes || (PostgresTypes = {}));
  var convertChangeData = (columns, record, options = {}) => {
    var _a;
    const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
    return Object.keys(record).reduce((acc, rec_key) => {
      acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
      return acc;
    }, {});
  };
  var convertColumn = (columnName, columns, record, skipTypes) => {
    const column = columns.find((x) => x.name === columnName);
    const colType = column === null || column === void 0 ? void 0 : column.type;
    const value = record[columnName];
    if (colType && !skipTypes.includes(colType)) {
      return convertCell(colType, value);
    }
    return noop(value);
  };
  var convertCell = (type, value) => {
    if (type.charAt(0) === "_") {
      const dataType = type.slice(1, type.length);
      return toArray(value, dataType);
    }
    switch (type) {
      case PostgresTypes.bool:
        return toBoolean(value);
      case PostgresTypes.float4:
      case PostgresTypes.float8:
      case PostgresTypes.int2:
      case PostgresTypes.int4:
      case PostgresTypes.int8:
      case PostgresTypes.numeric:
      case PostgresTypes.oid:
        return toNumber(value);
      case PostgresTypes.json:
      case PostgresTypes.jsonb:
        return toJson(value);
      case PostgresTypes.timestamp:
        return toTimestampString(value);
      // Format to be consistent with PostgREST
      case PostgresTypes.abstime:
      // To allow users to cast it based on Timezone
      case PostgresTypes.date:
      // To allow users to cast it based on Timezone
      case PostgresTypes.daterange:
      case PostgresTypes.int4range:
      case PostgresTypes.int8range:
      case PostgresTypes.money:
      case PostgresTypes.reltime:
      // To allow users to cast it based on Timezone
      case PostgresTypes.text:
      case PostgresTypes.time:
      // To allow users to cast it based on Timezone
      case PostgresTypes.timestamptz:
      // To allow users to cast it based on Timezone
      case PostgresTypes.timetz:
      // To allow users to cast it based on Timezone
      case PostgresTypes.tsrange:
      case PostgresTypes.tstzrange:
        return noop(value);
      default:
        return noop(value);
    }
  };
  var noop = (value) => {
    return value;
  };
  var toBoolean = (value) => {
    switch (value) {
      case "t":
        return true;
      case "f":
        return false;
      default:
        return value;
    }
  };
  var toNumber = (value) => {
    if (typeof value === "string") {
      const parsedValue = parseFloat(value);
      if (!Number.isNaN(parsedValue)) {
        return parsedValue;
      }
    }
    return value;
  };
  var toJson = (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.log(`JSON parse error: ${error}`);
        return value;
      }
    }
    return value;
  };
  var toArray = (value, type) => {
    if (typeof value !== "string") {
      return value;
    }
    const lastIdx = value.length - 1;
    const closeBrace = value[lastIdx];
    const openBrace = value[0];
    if (openBrace === "{" && closeBrace === "}") {
      let arr;
      const valTrim = value.slice(1, lastIdx);
      try {
        arr = JSON.parse("[" + valTrim + "]");
      } catch (_) {
        arr = valTrim ? valTrim.split(",") : [];
      }
      return arr.map((val) => convertCell(type, val));
    }
    return value;
  };
  var toTimestampString = (value) => {
    if (typeof value === "string") {
      return value.replace(" ", "T");
    }
    return value;
  };
  var httpEndpointURL = (socketUrl) => {
    let url = socketUrl;
    url = url.replace(/^ws/i, "http");
    url = url.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, "");
    return url.replace(/\/+$/, "");
  };

  // node_modules/@supabase/realtime-js/dist/module/lib/push.js
  var Push = class {
    /**
     * Initializes the Push
     *
     * @param channel The Channel
     * @param event The event, for example `"phx_join"`
     * @param payload The payload, for example `{user_id: 123}`
     * @param timeout The push timeout in milliseconds
     */
    constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
      this.channel = channel;
      this.event = event;
      this.payload = payload;
      this.timeout = timeout;
      this.sent = false;
      this.timeoutTimer = void 0;
      this.ref = "";
      this.receivedResp = null;
      this.recHooks = [];
      this.refEvent = null;
    }
    resend(timeout) {
      this.timeout = timeout;
      this._cancelRefEvent();
      this.ref = "";
      this.refEvent = null;
      this.receivedResp = null;
      this.sent = false;
      this.send();
    }
    send() {
      if (this._hasReceived("timeout")) {
        return;
      }
      this.startTimeout();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref,
        join_ref: this.channel._joinRef()
      });
    }
    updatePayload(payload) {
      this.payload = Object.assign(Object.assign({}, this.payload), payload);
    }
    receive(status, callback) {
      var _a;
      if (this._hasReceived(status)) {
        callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
      }
      this.recHooks.push({ status, callback });
      return this;
    }
    startTimeout() {
      if (this.timeoutTimer) {
        return;
      }
      this.ref = this.channel.socket._makeRef();
      this.refEvent = this.channel._replyEventName(this.ref);
      const callback = (payload) => {
        this._cancelRefEvent();
        this._cancelTimeout();
        this.receivedResp = payload;
        this._matchReceive(payload);
      };
      this.channel._on(this.refEvent, {}, callback);
      this.timeoutTimer = setTimeout(() => {
        this.trigger("timeout", {});
      }, this.timeout);
    }
    trigger(status, response) {
      if (this.refEvent)
        this.channel._trigger(this.refEvent, { status, response });
    }
    destroy() {
      this._cancelRefEvent();
      this._cancelTimeout();
    }
    _cancelRefEvent() {
      if (!this.refEvent) {
        return;
      }
      this.channel._off(this.refEvent, {});
    }
    _cancelTimeout() {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = void 0;
    }
    _matchReceive({ status, response }) {
      this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response));
    }
    _hasReceived(status) {
      return this.receivedResp && this.receivedResp.status === status;
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/RealtimePresence.js
  var REALTIME_PRESENCE_LISTEN_EVENTS;
  (function(REALTIME_PRESENCE_LISTEN_EVENTS2) {
    REALTIME_PRESENCE_LISTEN_EVENTS2["SYNC"] = "sync";
    REALTIME_PRESENCE_LISTEN_EVENTS2["JOIN"] = "join";
    REALTIME_PRESENCE_LISTEN_EVENTS2["LEAVE"] = "leave";
  })(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
  var RealtimePresence = class _RealtimePresence {
    /**
     * Initializes the Presence.
     *
     * @param channel - The RealtimeChannel
     * @param opts - The options,
     *        for example `{events: {state: 'state', diff: 'diff'}}`
     */
    constructor(channel, opts) {
      this.channel = channel;
      this.state = {};
      this.pendingDiffs = [];
      this.joinRef = null;
      this.caller = {
        onJoin: () => {
        },
        onLeave: () => {
        },
        onSync: () => {
        }
      };
      const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
        state: "presence_state",
        diff: "presence_diff"
      };
      this.channel._on(events.state, {}, (newState) => {
        const { onJoin, onLeave, onSync } = this.caller;
        this.joinRef = this.channel._joinRef();
        this.state = _RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
        this.pendingDiffs.forEach((diff) => {
          this.state = _RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
        });
        this.pendingDiffs = [];
        onSync();
      });
      this.channel._on(events.diff, {}, (diff) => {
        const { onJoin, onLeave, onSync } = this.caller;
        if (this.inPendingSyncState()) {
          this.pendingDiffs.push(diff);
        } else {
          this.state = _RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
          onSync();
        }
      });
      this.onJoin((key, currentPresences, newPresences) => {
        this.channel._trigger("presence", {
          event: "join",
          key,
          currentPresences,
          newPresences
        });
      });
      this.onLeave((key, currentPresences, leftPresences) => {
        this.channel._trigger("presence", {
          event: "leave",
          key,
          currentPresences,
          leftPresences
        });
      });
      this.onSync(() => {
        this.channel._trigger("presence", { event: "sync" });
      });
    }
    /**
     * Used to sync the list of presences on the server with the
     * client's state.
     *
     * An optional `onJoin` and `onLeave` callback can be provided to
     * react to changes in the client's local presences across
     * disconnects and reconnects with the server.
     *
     * @internal
     */
    static syncState(currentState, newState, onJoin, onLeave) {
      const state2 = this.cloneDeep(currentState);
      const transformedState = this.transformState(newState);
      const joins = {};
      const leaves = {};
      this.map(state2, (key, presences) => {
        if (!transformedState[key]) {
          leaves[key] = presences;
        }
      });
      this.map(transformedState, (key, newPresences) => {
        const currentPresences = state2[key];
        if (currentPresences) {
          const newPresenceRefs = newPresences.map((m) => m.presence_ref);
          const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
          const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
          const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
          if (joinedPresences.length > 0) {
            joins[key] = joinedPresences;
          }
          if (leftPresences.length > 0) {
            leaves[key] = leftPresences;
          }
        } else {
          joins[key] = newPresences;
        }
      });
      return this.syncDiff(state2, { joins, leaves }, onJoin, onLeave);
    }
    /**
     * Used to sync a diff of presence join and leave events from the
     * server, as they happen.
     *
     * Like `syncState`, `syncDiff` accepts optional `onJoin` and
     * `onLeave` callbacks to react to a user joining or leaving from a
     * device.
     *
     * @internal
     */
    static syncDiff(state2, diff, onJoin, onLeave) {
      const { joins, leaves } = {
        joins: this.transformState(diff.joins),
        leaves: this.transformState(diff.leaves)
      };
      if (!onJoin) {
        onJoin = () => {
        };
      }
      if (!onLeave) {
        onLeave = () => {
        };
      }
      this.map(joins, (key, newPresences) => {
        var _a;
        const currentPresences = (_a = state2[key]) !== null && _a !== void 0 ? _a : [];
        state2[key] = this.cloneDeep(newPresences);
        if (currentPresences.length > 0) {
          const joinedPresenceRefs = state2[key].map((m) => m.presence_ref);
          const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
          state2[key].unshift(...curPresences);
        }
        onJoin(key, currentPresences, newPresences);
      });
      this.map(leaves, (key, leftPresences) => {
        let currentPresences = state2[key];
        if (!currentPresences)
          return;
        const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
        currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
        state2[key] = currentPresences;
        onLeave(key, currentPresences, leftPresences);
        if (currentPresences.length === 0)
          delete state2[key];
      });
      return state2;
    }
    /** @internal */
    static map(obj, func) {
      return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
    }
    /**
     * Remove 'metas' key
     * Change 'phx_ref' to 'presence_ref'
     * Remove 'phx_ref' and 'phx_ref_prev'
     *
     * @example
     * // returns {
     *  abc123: [
     *    { presence_ref: '2', user_id: 1 },
     *    { presence_ref: '3', user_id: 2 }
     *  ]
     * }
     * RealtimePresence.transformState({
     *  abc123: {
     *    metas: [
     *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
     *      { phx_ref: '3', user_id: 2 }
     *    ]
     *  }
     * })
     *
     * @internal
     */
    static transformState(state2) {
      state2 = this.cloneDeep(state2);
      return Object.getOwnPropertyNames(state2).reduce((newState, key) => {
        const presences = state2[key];
        if ("metas" in presences) {
          newState[key] = presences.metas.map((presence) => {
            presence["presence_ref"] = presence["phx_ref"];
            delete presence["phx_ref"];
            delete presence["phx_ref_prev"];
            return presence;
          });
        } else {
          newState[key] = presences;
        }
        return newState;
      }, {});
    }
    /** @internal */
    static cloneDeep(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
    /** @internal */
    onJoin(callback) {
      this.caller.onJoin = callback;
    }
    /** @internal */
    onLeave(callback) {
      this.caller.onLeave = callback;
    }
    /** @internal */
    onSync(callback) {
      this.caller.onSync = callback;
    }
    /** @internal */
    inPendingSyncState() {
      return !this.joinRef || this.joinRef !== this.channel._joinRef();
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/RealtimeChannel.js
  var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
  (function(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2) {
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["ALL"] = "*";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["INSERT"] = "INSERT";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["UPDATE"] = "UPDATE";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["DELETE"] = "DELETE";
  })(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
  var REALTIME_LISTEN_TYPES;
  (function(REALTIME_LISTEN_TYPES2) {
    REALTIME_LISTEN_TYPES2["BROADCAST"] = "broadcast";
    REALTIME_LISTEN_TYPES2["PRESENCE"] = "presence";
    REALTIME_LISTEN_TYPES2["POSTGRES_CHANGES"] = "postgres_changes";
  })(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
  var REALTIME_SUBSCRIBE_STATES;
  (function(REALTIME_SUBSCRIBE_STATES2) {
    REALTIME_SUBSCRIBE_STATES2["SUBSCRIBED"] = "SUBSCRIBED";
    REALTIME_SUBSCRIBE_STATES2["TIMED_OUT"] = "TIMED_OUT";
    REALTIME_SUBSCRIBE_STATES2["CLOSED"] = "CLOSED";
    REALTIME_SUBSCRIBE_STATES2["CHANNEL_ERROR"] = "CHANNEL_ERROR";
  })(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
  var RealtimeChannel = class _RealtimeChannel {
    constructor(topic, params = { config: {} }, socket) {
      this.topic = topic;
      this.params = params;
      this.socket = socket;
      this.bindings = {};
      this.state = CHANNEL_STATES.closed;
      this.joinedOnce = false;
      this.pushBuffer = [];
      this.subTopic = topic.replace(/^realtime:/i, "");
      this.params.config = Object.assign({
        broadcast: { ack: false, self: false },
        presence: { key: "" },
        private: false
      }, params.config);
      this.timeout = this.socket.timeout;
      this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
      this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
      this.joinPush.receive("ok", () => {
        this.state = CHANNEL_STATES.joined;
        this.rejoinTimer.reset();
        this.pushBuffer.forEach((pushEvent) => pushEvent.send());
        this.pushBuffer = [];
      });
      this._onClose(() => {
        this.rejoinTimer.reset();
        this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`);
        this.state = CHANNEL_STATES.closed;
        this.socket._remove(this);
      });
      this._onError((reason) => {
        if (this._isLeaving() || this._isClosed()) {
          return;
        }
        this.socket.log("channel", `error ${this.topic}`, reason);
        this.state = CHANNEL_STATES.errored;
        this.rejoinTimer.scheduleTimeout();
      });
      this.joinPush.receive("timeout", () => {
        if (!this._isJoining()) {
          return;
        }
        this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout);
        this.state = CHANNEL_STATES.errored;
        this.rejoinTimer.scheduleTimeout();
      });
      this._on(CHANNEL_EVENTS.reply, {}, (payload, ref) => {
        this._trigger(this._replyEventName(ref), payload);
      });
      this.presence = new RealtimePresence(this);
      this.broadcastEndpointURL = httpEndpointURL(this.socket.endPoint) + "/api/broadcast";
    }
    /** Subscribe registers your client with the server */
    subscribe(callback, timeout = this.timeout) {
      var _a, _b;
      if (!this.socket.isConnected()) {
        this.socket.connect();
      }
      if (this.joinedOnce) {
        throw `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance`;
      } else {
        const { config: { broadcast, presence, private: isPrivate } } = this.params;
        this._onError((e) => callback && callback("CHANNEL_ERROR", e));
        this._onClose(() => callback && callback("CLOSED"));
        const accessTokenPayload = {};
        const config = {
          broadcast,
          presence,
          postgres_changes: (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [],
          private: isPrivate
        };
        if (this.socket.accessToken) {
          accessTokenPayload.access_token = this.socket.accessToken;
        }
        this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
        this.joinedOnce = true;
        this._rejoin(timeout);
        this.joinPush.receive("ok", ({ postgres_changes: serverPostgresFilters }) => {
          var _a2;
          this.socket.accessToken && this.socket.setAuth(this.socket.accessToken);
          if (serverPostgresFilters === void 0) {
            callback && callback("SUBSCRIBED");
            return;
          } else {
            const clientPostgresBindings = this.bindings.postgres_changes;
            const bindingsLen = (_a2 = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a2 !== void 0 ? _a2 : 0;
            const newPostgresBindings = [];
            for (let i = 0; i < bindingsLen; i++) {
              const clientPostgresBinding = clientPostgresBindings[i];
              const { filter: { event, schema, table, filter } } = clientPostgresBinding;
              const serverPostgresFilter = serverPostgresFilters && serverPostgresFilters[i];
              if (serverPostgresFilter && serverPostgresFilter.event === event && serverPostgresFilter.schema === schema && serverPostgresFilter.table === table && serverPostgresFilter.filter === filter) {
                newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
              } else {
                this.unsubscribe();
                callback && callback("CHANNEL_ERROR", new Error("mismatch between server and client bindings for postgres changes"));
                return;
              }
            }
            this.bindings.postgres_changes = newPostgresBindings;
            callback && callback("SUBSCRIBED");
            return;
          }
        }).receive("error", (error) => {
          callback && callback("CHANNEL_ERROR", new Error(JSON.stringify(Object.values(error).join(", ") || "error")));
          return;
        }).receive("timeout", () => {
          callback && callback("TIMED_OUT");
          return;
        });
      }
      return this;
    }
    presenceState() {
      return this.presence.state;
    }
    async track(payload, opts = {}) {
      return await this.send({
        type: "presence",
        event: "track",
        payload
      }, opts.timeout || this.timeout);
    }
    async untrack(opts = {}) {
      return await this.send({
        type: "presence",
        event: "untrack"
      }, opts);
    }
    on(type, filter, callback) {
      return this._on(type, filter, callback);
    }
    /**
     * Sends a message into the channel.
     *
     * @param args Arguments to send to channel
     * @param args.type The type of event to send
     * @param args.event The name of the event being sent
     * @param args.payload Payload to be sent
     * @param opts Options to be used during the send process
     */
    async send(args, opts = {}) {
      var _a, _b;
      if (!this._canPush() && args.type === "broadcast") {
        const { event, payload: endpoint_payload } = args;
        const options = {
          method: "POST",
          headers: {
            Authorization: this.socket.accessToken ? `Bearer ${this.socket.accessToken}` : "",
            apikey: this.socket.apiKey ? this.socket.apiKey : "",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              { topic: this.subTopic, event, payload: endpoint_payload }
            ]
          })
        };
        try {
          const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
          await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
          return response.ok ? "ok" : "error";
        } catch (error) {
          if (error.name === "AbortError") {
            return "timed out";
          } else {
            return "error";
          }
        }
      } else {
        return new Promise((resolve) => {
          var _a2, _b2, _c;
          const push = this._push(args.type, args, opts.timeout || this.timeout);
          if (args.type === "broadcast" && !((_c = (_b2 = (_a2 = this.params) === null || _a2 === void 0 ? void 0 : _a2.config) === null || _b2 === void 0 ? void 0 : _b2.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
            resolve("ok");
          }
          push.receive("ok", () => resolve("ok"));
          push.receive("error", () => resolve("error"));
          push.receive("timeout", () => resolve("timed out"));
        });
      }
    }
    updateJoinPayload(payload) {
      this.joinPush.updatePayload(payload);
    }
    /**
     * Leaves the channel.
     *
     * Unsubscribes from server events, and instructs channel to terminate on server.
     * Triggers onClose() hooks.
     *
     * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
     * channel.unsubscribe().receive("ok", () => alert("left!") )
     */
    unsubscribe(timeout = this.timeout) {
      this.state = CHANNEL_STATES.leaving;
      const onClose = () => {
        this.socket.log("channel", `leave ${this.topic}`);
        this._trigger(CHANNEL_EVENTS.close, "leave", this._joinRef());
      };
      this.rejoinTimer.reset();
      this.joinPush.destroy();
      return new Promise((resolve) => {
        const leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
        leavePush.receive("ok", () => {
          onClose();
          resolve("ok");
        }).receive("timeout", () => {
          onClose();
          resolve("timed out");
        }).receive("error", () => {
          resolve("error");
        });
        leavePush.send();
        if (!this._canPush()) {
          leavePush.trigger("ok", {});
        }
      });
    }
    /** @internal */
    async _fetchWithTimeout(url, options, timeout) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
      clearTimeout(id);
      return response;
    }
    /** @internal */
    _push(event, payload, timeout = this.timeout) {
      if (!this.joinedOnce) {
        throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
      }
      let pushEvent = new Push(this, event, payload, timeout);
      if (this._canPush()) {
        pushEvent.send();
      } else {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
      }
      return pushEvent;
    }
    /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling before dispatching to the channel callbacks.
     * Must return the payload, modified or unmodified.
     *
     * @internal
     */
    _onMessage(_event, payload, _ref) {
      return payload;
    }
    /** @internal */
    _isMember(topic) {
      return this.topic === topic;
    }
    /** @internal */
    _joinRef() {
      return this.joinPush.ref;
    }
    /** @internal */
    _trigger(type, payload, ref) {
      var _a, _b;
      const typeLower = type.toLocaleLowerCase();
      const { close, error, leave, join } = CHANNEL_EVENTS;
      const events = [close, error, leave, join];
      if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
        return;
      }
      let handledPayload = this._onMessage(typeLower, payload, ref);
      if (payload && !handledPayload) {
        throw "channel onMessage callbacks must return the payload, modified or unmodified";
      }
      if (["insert", "update", "delete"].includes(typeLower)) {
        (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
          var _a2, _b2, _c;
          return ((_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event) === "*" || ((_c = (_b2 = bind.filter) === null || _b2 === void 0 ? void 0 : _b2.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
        }).map((bind) => bind.callback(handledPayload, ref));
      } else {
        (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
          var _a2, _b2, _c, _d, _e, _f;
          if (["broadcast", "presence", "postgres_changes"].includes(typeLower)) {
            if ("id" in bind) {
              const bindId = bind.id;
              const bindEvent = (_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event;
              return bindId && ((_b2 = payload.ids) === null || _b2 === void 0 ? void 0 : _b2.includes(bindId)) && (bindEvent === "*" || (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase()));
            } else {
              const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
              return bindEvent === "*" || bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase());
            }
          } else {
            return bind.type.toLocaleLowerCase() === typeLower;
          }
        }).map((bind) => {
          if (typeof handledPayload === "object" && "ids" in handledPayload) {
            const postgresChanges = handledPayload.data;
            const { schema, table, commit_timestamp, type: type2, errors } = postgresChanges;
            const enrichedPayload = {
              schema,
              table,
              commit_timestamp,
              eventType: type2,
              new: {},
              old: {},
              errors
            };
            handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
          }
          bind.callback(handledPayload, ref);
        });
      }
    }
    /** @internal */
    _isClosed() {
      return this.state === CHANNEL_STATES.closed;
    }
    /** @internal */
    _isJoined() {
      return this.state === CHANNEL_STATES.joined;
    }
    /** @internal */
    _isJoining() {
      return this.state === CHANNEL_STATES.joining;
    }
    /** @internal */
    _isLeaving() {
      return this.state === CHANNEL_STATES.leaving;
    }
    /** @internal */
    _replyEventName(ref) {
      return `chan_reply_${ref}`;
    }
    /** @internal */
    _on(type, filter, callback) {
      const typeLower = type.toLocaleLowerCase();
      const binding = {
        type: typeLower,
        filter,
        callback
      };
      if (this.bindings[typeLower]) {
        this.bindings[typeLower].push(binding);
      } else {
        this.bindings[typeLower] = [binding];
      }
      return this;
    }
    /** @internal */
    _off(type, filter) {
      const typeLower = type.toLocaleLowerCase();
      this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
        var _a;
        return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower && _RealtimeChannel.isEqual(bind.filter, filter));
      });
      return this;
    }
    /** @internal */
    static isEqual(obj1, obj2) {
      if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
      }
      for (const k in obj1) {
        if (obj1[k] !== obj2[k]) {
          return false;
        }
      }
      return true;
    }
    /** @internal */
    _rejoinUntilConnected() {
      this.rejoinTimer.scheduleTimeout();
      if (this.socket.isConnected()) {
        this._rejoin();
      }
    }
    /**
     * Registers a callback that will be executed when the channel closes.
     *
     * @internal
     */
    _onClose(callback) {
      this._on(CHANNEL_EVENTS.close, {}, callback);
    }
    /**
     * Registers a callback that will be executed when the channel encounteres an error.
     *
     * @internal
     */
    _onError(callback) {
      this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
    }
    /**
     * Returns `true` if the socket is connected and the channel has been joined.
     *
     * @internal
     */
    _canPush() {
      return this.socket.isConnected() && this._isJoined();
    }
    /** @internal */
    _rejoin(timeout = this.timeout) {
      if (this._isLeaving()) {
        return;
      }
      this.socket._leaveOpenTopic(this.topic);
      this.state = CHANNEL_STATES.joining;
      this.joinPush.resend(timeout);
    }
    /** @internal */
    _getPayloadRecords(payload) {
      const records = {
        new: {},
        old: {}
      };
      if (payload.type === "INSERT" || payload.type === "UPDATE") {
        records.new = convertChangeData(payload.columns, payload.record);
      }
      if (payload.type === "UPDATE" || payload.type === "DELETE") {
        records.old = convertChangeData(payload.columns, payload.old_record);
      }
      return records;
    }
  };

  // node_modules/@supabase/realtime-js/dist/module/RealtimeClient.js
  var noop2 = () => {
  };
  var NATIVE_WEBSOCKET_AVAILABLE = typeof WebSocket !== "undefined";
  var RealtimeClient = class {
    /**
     * Initializes the Socket.
     *
     * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
     * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
     * @param options.transport The Websocket Transport, for example WebSocket.
     * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
     * @param options.params The optional params to pass when connecting.
     * @param options.headers The optional headers to pass when connecting.
     * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
     * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
     * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
     * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
     * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
     */
    constructor(endPoint, options) {
      var _a;
      this.accessToken = null;
      this.apiKey = null;
      this.channels = [];
      this.endPoint = "";
      this.httpEndpoint = "";
      this.headers = DEFAULT_HEADERS;
      this.params = {};
      this.timeout = DEFAULT_TIMEOUT;
      this.heartbeatIntervalMs = 3e4;
      this.heartbeatTimer = void 0;
      this.pendingHeartbeatRef = null;
      this.ref = 0;
      this.logger = noop2;
      this.conn = null;
      this.sendBuffer = [];
      this.serializer = new Serializer();
      this.stateChangeCallbacks = {
        open: [],
        close: [],
        error: [],
        message: []
      };
      this._resolveFetch = (customFetch) => {
        let _fetch;
        if (customFetch) {
          _fetch = customFetch;
        } else if (typeof fetch === "undefined") {
          _fetch = (...args) => Promise.resolve().then(() => (init_browser(), browser_exports)).then(({ default: fetch3 }) => fetch3(...args));
        } else {
          _fetch = fetch;
        }
        return (...args) => _fetch(...args);
      };
      this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
      this.httpEndpoint = httpEndpointURL(endPoint);
      if (options === null || options === void 0 ? void 0 : options.transport) {
        this.transport = options.transport;
      } else {
        this.transport = null;
      }
      if (options === null || options === void 0 ? void 0 : options.params)
        this.params = options.params;
      if (options === null || options === void 0 ? void 0 : options.headers)
        this.headers = Object.assign(Object.assign({}, this.headers), options.headers);
      if (options === null || options === void 0 ? void 0 : options.timeout)
        this.timeout = options.timeout;
      if (options === null || options === void 0 ? void 0 : options.logger)
        this.logger = options.logger;
      if (options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs)
        this.heartbeatIntervalMs = options.heartbeatIntervalMs;
      const accessToken = (_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey;
      if (accessToken) {
        this.accessToken = accessToken;
        this.apiKey = accessToken;
      }
      this.reconnectAfterMs = (options === null || options === void 0 ? void 0 : options.reconnectAfterMs) ? options.reconnectAfterMs : (tries) => {
        return [1e3, 2e3, 5e3, 1e4][tries - 1] || 1e4;
      };
      this.encode = (options === null || options === void 0 ? void 0 : options.encode) ? options.encode : (payload, callback) => {
        return callback(JSON.stringify(payload));
      };
      this.decode = (options === null || options === void 0 ? void 0 : options.decode) ? options.decode : this.serializer.decode.bind(this.serializer);
      this.reconnectTimer = new Timer(async () => {
        this.disconnect();
        this.connect();
      }, this.reconnectAfterMs);
      this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
    }
    /**
     * Connects the socket, unless already connected.
     */
    connect() {
      if (this.conn) {
        return;
      }
      if (this.transport) {
        this.conn = new this.transport(this._endPointURL(), void 0, {
          headers: this.headers
        });
        return;
      }
      if (NATIVE_WEBSOCKET_AVAILABLE) {
        this.conn = new WebSocket(this._endPointURL());
        this.setupConnection();
        return;
      }
      this.conn = new WSWebSocketDummy(this._endPointURL(), void 0, {
        close: () => {
          this.conn = null;
        }
      });
      Promise.resolve().then(() => __toESM(require_browser())).then(({ default: WS }) => {
        this.conn = new WS(this._endPointURL(), void 0, {
          headers: this.headers
        });
        this.setupConnection();
      });
    }
    /**
     * Disconnects the socket.
     *
     * @param code A numeric status code to send on disconnect.
     * @param reason A custom reason for the disconnect.
     */
    disconnect(code, reason) {
      if (this.conn) {
        this.conn.onclose = function() {
        };
        if (code) {
          this.conn.close(code, reason !== null && reason !== void 0 ? reason : "");
        } else {
          this.conn.close();
        }
        this.conn = null;
        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
        this.reconnectTimer.reset();
      }
    }
    /**
     * Returns all created channels
     */
    getChannels() {
      return this.channels;
    }
    /**
     * Unsubscribes and removes a single channel
     * @param channel A RealtimeChannel instance
     */
    async removeChannel(channel) {
      const status = await channel.unsubscribe();
      if (this.channels.length === 0) {
        this.disconnect();
      }
      return status;
    }
    /**
     * Unsubscribes and removes all channels
     */
    async removeAllChannels() {
      const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()));
      this.disconnect();
      return values_1;
    }
    /**
     * Logs the message.
     *
     * For customized logging, `this.logger` can be overridden.
     */
    log(kind, msg, data) {
      this.logger(kind, msg, data);
    }
    /**
     * Returns the current state of the socket.
     */
    connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return CONNECTION_STATE.Connecting;
        case SOCKET_STATES.open:
          return CONNECTION_STATE.Open;
        case SOCKET_STATES.closing:
          return CONNECTION_STATE.Closing;
        default:
          return CONNECTION_STATE.Closed;
      }
    }
    /**
     * Returns `true` is the connection is open.
     */
    isConnected() {
      return this.connectionState() === CONNECTION_STATE.Open;
    }
    channel(topic, params = { config: {} }) {
      const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
      this.channels.push(chan);
      return chan;
    }
    /**
     * Push out a message if the socket is connected.
     *
     * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
     */
    push(data) {
      const { topic, event, payload, ref } = data;
      const callback = () => {
        this.encode(data, (result) => {
          var _a;
          (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
        });
      };
      this.log("push", `${topic} ${event} (${ref})`, payload);
      if (this.isConnected()) {
        callback();
      } else {
        this.sendBuffer.push(callback);
      }
    }
    /**
     * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
     *
     * @param token A JWT string.
     */
    setAuth(token) {
      this.accessToken = token;
      this.channels.forEach((channel) => {
        token && channel.updateJoinPayload({ access_token: token });
        if (channel.joinedOnce && channel._isJoined()) {
          channel._push(CHANNEL_EVENTS.access_token, { access_token: token });
        }
      });
    }
    /**
     * Return the next message ref, accounting for overflows
     *
     * @internal
     */
    _makeRef() {
      let newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }
      return this.ref.toString();
    }
    /**
     * Unsubscribe from channels with the specified topic.
     *
     * @internal
     */
    _leaveOpenTopic(topic) {
      let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
      if (dupChannel) {
        this.log("transport", `leaving duplicate topic "${topic}"`);
        dupChannel.unsubscribe();
      }
    }
    /**
     * Removes a subscription from the socket.
     *
     * @param channel An open subscription.
     *
     * @internal
     */
    _remove(channel) {
      this.channels = this.channels.filter((c) => c._joinRef() !== channel._joinRef());
    }
    /**
     * Sets up connection handlers.
     *
     * @internal
     */
    setupConnection() {
      if (this.conn) {
        this.conn.binaryType = "arraybuffer";
        this.conn.onopen = () => this._onConnOpen();
        this.conn.onerror = (error) => this._onConnError(error);
        this.conn.onmessage = (event) => this._onConnMessage(event);
        this.conn.onclose = (event) => this._onConnClose(event);
      }
    }
    /**
     * Returns the URL of the websocket.
     *
     * @internal
     */
    _endPointURL() {
      return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: VSN }));
    }
    /** @internal */
    _onConnMessage(rawMessage) {
      this.decode(rawMessage.data, (msg) => {
        let { topic, event, payload, ref } = msg;
        if (ref && ref === this.pendingHeartbeatRef || event === (payload === null || payload === void 0 ? void 0 : payload.type)) {
          this.pendingHeartbeatRef = null;
        }
        this.log("receive", `${payload.status || ""} ${topic} ${event} ${ref && "(" + ref + ")" || ""}`, payload);
        this.channels.filter((channel) => channel._isMember(topic)).forEach((channel) => channel._trigger(event, payload, ref));
        this.stateChangeCallbacks.message.forEach((callback) => callback(msg));
      });
    }
    /** @internal */
    _onConnOpen() {
      this.log("transport", `connected to ${this._endPointURL()}`);
      this._flushSendBuffer();
      this.reconnectTimer.reset();
      this.heartbeatTimer && clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => this._sendHeartbeat(), this.heartbeatIntervalMs);
      this.stateChangeCallbacks.open.forEach((callback) => callback());
    }
    /** @internal */
    _onConnClose(event) {
      this.log("transport", "close", event);
      this._triggerChanError();
      this.heartbeatTimer && clearInterval(this.heartbeatTimer);
      this.reconnectTimer.scheduleTimeout();
      this.stateChangeCallbacks.close.forEach((callback) => callback(event));
    }
    /** @internal */
    _onConnError(error) {
      this.log("transport", error.message);
      this._triggerChanError();
      this.stateChangeCallbacks.error.forEach((callback) => callback(error));
    }
    /** @internal */
    _triggerChanError() {
      this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
    }
    /** @internal */
    _appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }
      const prefix = url.match(/\?/) ? "&" : "?";
      const query = new URLSearchParams(params);
      return `${url}${prefix}${query}`;
    }
    /** @internal */
    _flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach((callback) => callback());
        this.sendBuffer = [];
      }
    }
    /** @internal */
    _sendHeartbeat() {
      var _a;
      if (!this.isConnected()) {
        return;
      }
      if (this.pendingHeartbeatRef) {
        this.pendingHeartbeatRef = null;
        this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
        (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, "hearbeat timeout");
        return;
      }
      this.pendingHeartbeatRef = this._makeRef();
      this.push({
        topic: "phoenix",
        event: "heartbeat",
        payload: {},
        ref: this.pendingHeartbeatRef
      });
      this.setAuth(this.accessToken);
    }
  };
  var WSWebSocketDummy = class {
    constructor(address, _protocols, options) {
      this.binaryType = "arraybuffer";
      this.onclose = () => {
      };
      this.onerror = () => {
      };
      this.onmessage = () => {
      };
      this.onopen = () => {
      };
      this.readyState = SOCKET_STATES.connecting;
      this.send = () => {
      };
      this.url = null;
      this.url = address;
      this.close = options.close;
    }
  };

  // node_modules/@supabase/storage-js/dist/module/lib/errors.js
  var StorageError = class extends Error {
    constructor(message) {
      super(message);
      this.__isStorageError = true;
      this.name = "StorageError";
    }
  };
  function isStorageError(error) {
    return typeof error === "object" && error !== null && "__isStorageError" in error;
  }
  var StorageApiError = class extends StorageError {
    constructor(message, status) {
      super(message);
      this.name = "StorageApiError";
      this.status = status;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        status: this.status
      };
    }
  };
  var StorageUnknownError = class extends StorageError {
    constructor(message, originalError) {
      super(message);
      this.name = "StorageUnknownError";
      this.originalError = originalError;
    }
  };

  // node_modules/@supabase/storage-js/dist/module/lib/helpers.js
  var __awaiter2 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var resolveFetch2 = (customFetch) => {
    let _fetch;
    if (customFetch) {
      _fetch = customFetch;
    } else if (typeof fetch === "undefined") {
      _fetch = (...args) => Promise.resolve().then(() => (init_browser(), browser_exports)).then(({ default: fetch3 }) => fetch3(...args));
    } else {
      _fetch = fetch;
    }
    return (...args) => _fetch(...args);
  };
  var resolveResponse = () => __awaiter2(void 0, void 0, void 0, function* () {
    if (typeof Response === "undefined") {
      return (yield Promise.resolve().then(() => (init_browser(), browser_exports))).Response;
    }
    return Response;
  });
  var recursiveToCamel = (item) => {
    if (Array.isArray(item)) {
      return item.map((el) => recursiveToCamel(el));
    } else if (typeof item === "function" || item !== Object(item)) {
      return item;
    }
    const result = {};
    Object.entries(item).forEach(([key, value]) => {
      const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ""));
      result[newKey] = recursiveToCamel(value);
    });
    return result;
  };

  // node_modules/@supabase/storage-js/dist/module/lib/fetch.js
  var __awaiter3 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
  var handleError = (error, reject, options) => __awaiter3(void 0, void 0, void 0, function* () {
    const Res = yield resolveResponse();
    if (error instanceof Res && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
      error.json().then((err) => {
        reject(new StorageApiError(_getErrorMessage(err), error.status || 500));
      }).catch((err) => {
        reject(new StorageUnknownError(_getErrorMessage(err), err));
      });
    } else {
      reject(new StorageUnknownError(_getErrorMessage(error), error));
    }
  });
  var _getRequestParams = (method, options, parameters, body) => {
    const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
    if (method === "GET") {
      return params;
    }
    params.headers = Object.assign({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
    if (body) {
      params.body = JSON.stringify(body);
    }
    return Object.assign(Object.assign({}, params), parameters);
  };
  function _handleRequest(fetcher, method, url, options, parameters, body) {
    return __awaiter3(this, void 0, void 0, function* () {
      return new Promise((resolve, reject) => {
        fetcher(url, _getRequestParams(method, options, parameters, body)).then((result) => {
          if (!result.ok)
            throw result;
          if (options === null || options === void 0 ? void 0 : options.noResolveJson)
            return result;
          return result.json();
        }).then((data) => resolve(data)).catch((error) => handleError(error, reject, options));
      });
    });
  }
  function get(fetcher, url, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "GET", url, options, parameters);
    });
  }
  function post(fetcher, url, body, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "POST", url, options, parameters, body);
    });
  }
  function put(fetcher, url, body, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "PUT", url, options, parameters, body);
    });
  }
  function head(fetcher, url, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "HEAD", url, Object.assign(Object.assign({}, options), { noResolveJson: true }), parameters);
    });
  }
  function remove(fetcher, url, body, options, parameters) {
    return __awaiter3(this, void 0, void 0, function* () {
      return _handleRequest(fetcher, "DELETE", url, options, parameters, body);
    });
  }

  // node_modules/@supabase/storage-js/dist/module/packages/StorageFileApi.js
  var __awaiter4 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var DEFAULT_SEARCH_OPTIONS = {
    limit: 100,
    offset: 0,
    sortBy: {
      column: "name",
      order: "asc"
    }
  };
  var DEFAULT_FILE_OPTIONS = {
    cacheControl: "3600",
    contentType: "text/plain;charset=UTF-8",
    upsert: false
  };
  var StorageFileApi = class {
    constructor(url, headers = {}, bucketId, fetch3) {
      this.url = url;
      this.headers = headers;
      this.bucketId = bucketId;
      this.fetch = resolveFetch2(fetch3);
    }
    /**
     * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
     *
     * @param method HTTP method.
     * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
     * @param fileBody The body of the file to be stored in the bucket.
     */
    uploadOrUpdate(method, path, fileBody, fileOptions) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          let body;
          const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
          let headers = Object.assign(Object.assign({}, this.headers), method === "POST" && { "x-upsert": String(options.upsert) });
          const metadata = options.metadata;
          if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
            body = new FormData();
            body.append("cacheControl", options.cacheControl);
            body.append("", fileBody);
            if (metadata) {
              body.append("metadata", this.encodeMetadata(metadata));
            }
          } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
            body = fileBody;
            body.append("cacheControl", options.cacheControl);
            if (metadata) {
              body.append("metadata", this.encodeMetadata(metadata));
            }
          } else {
            body = fileBody;
            headers["cache-control"] = `max-age=${options.cacheControl}`;
            headers["content-type"] = options.contentType;
            if (metadata) {
              headers["x-metadata"] = this.toBase64(this.encodeMetadata(metadata));
            }
          }
          if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) {
            headers = Object.assign(Object.assign({}, headers), fileOptions.headers);
          }
          const cleanPath = this._removeEmptyFolders(path);
          const _path = this._getFinalPath(cleanPath);
          const res = yield this.fetch(`${this.url}/object/${_path}`, Object.assign({ method, body, headers }, (options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {}));
          const data = yield res.json();
          if (res.ok) {
            return {
              data: { path: cleanPath, id: data.Id, fullPath: data.Key },
              error: null
            };
          } else {
            const error = data;
            return { data: null, error };
          }
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Uploads a file to an existing bucket.
     *
     * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
     * @param fileBody The body of the file to be stored in the bucket.
     */
    upload(path, fileBody, fileOptions) {
      return __awaiter4(this, void 0, void 0, function* () {
        return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
      });
    }
    /**
     * Upload a file with a token generated from `createSignedUploadUrl`.
     * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
     * @param token The token generated from `createSignedUploadUrl`
     * @param fileBody The body of the file to be stored in the bucket.
     */
    uploadToSignedUrl(path, token, fileBody, fileOptions) {
      return __awaiter4(this, void 0, void 0, function* () {
        const cleanPath = this._removeEmptyFolders(path);
        const _path = this._getFinalPath(cleanPath);
        const url = new URL(this.url + `/object/upload/sign/${_path}`);
        url.searchParams.set("token", token);
        try {
          let body;
          const options = Object.assign({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
          const headers = Object.assign(Object.assign({}, this.headers), { "x-upsert": String(options.upsert) });
          if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
            body = new FormData();
            body.append("cacheControl", options.cacheControl);
            body.append("", fileBody);
          } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
            body = fileBody;
            body.append("cacheControl", options.cacheControl);
          } else {
            body = fileBody;
            headers["cache-control"] = `max-age=${options.cacheControl}`;
            headers["content-type"] = options.contentType;
          }
          const res = yield this.fetch(url.toString(), {
            method: "PUT",
            body,
            headers
          });
          const data = yield res.json();
          if (res.ok) {
            return {
              data: { path: cleanPath, fullPath: data.Key },
              error: null
            };
          } else {
            const error = data;
            return { data: null, error };
          }
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Creates a signed upload URL.
     * Signed upload URLs can be used to upload files to the bucket without further authentication.
     * They are valid for 2 hours.
     * @param path The file path, including the current file name. For example `folder/image.png`.
     * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
     */
    createSignedUploadUrl(path, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          let _path = this._getFinalPath(path);
          const headers = Object.assign({}, this.headers);
          if (options === null || options === void 0 ? void 0 : options.upsert) {
            headers["x-upsert"] = "true";
          }
          const data = yield post(this.fetch, `${this.url}/object/upload/sign/${_path}`, {}, { headers });
          const url = new URL(this.url + data.url);
          const token = url.searchParams.get("token");
          if (!token) {
            throw new StorageError("No token returned by API");
          }
          return { data: { signedUrl: url.toString(), path, token }, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Replaces an existing file at the specified path with a new one.
     *
     * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
     * @param fileBody The body of the file to be stored in the bucket.
     */
    update(path, fileBody, fileOptions) {
      return __awaiter4(this, void 0, void 0, function* () {
        return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
      });
    }
    /**
     * Moves an existing file to a new path in the same bucket.
     *
     * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
     * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
     * @param options The destination options.
     */
    move(fromPath, toPath, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/object/move`, {
            bucketId: this.bucketId,
            sourceKey: fromPath,
            destinationKey: toPath,
            destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
          }, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Copies an existing file to a new path in the same bucket.
     *
     * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
     * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
     * @param options The destination options.
     */
    copy(fromPath, toPath, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/object/copy`, {
            bucketId: this.bucketId,
            sourceKey: fromPath,
            destinationKey: toPath,
            destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
          }, { headers: this.headers });
          return { data: { path: data.Key }, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
     *
     * @param path The file path, including the current file name. For example `folder/image.png`.
     * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
     * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
     * @param options.transform Transform the asset before serving it to the client.
     */
    createSignedUrl(path, expiresIn, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          let _path = this._getFinalPath(path);
          let data = yield post(this.fetch, `${this.url}/object/sign/${_path}`, Object.assign({ expiresIn }, (options === null || options === void 0 ? void 0 : options.transform) ? { transform: options.transform } : {}), { headers: this.headers });
          const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
          const signedUrl = encodeURI(`${this.url}${data.signedURL}${downloadQueryParam}`);
          data = { signedUrl };
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
     *
     * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
     * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
     * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
     */
    createSignedUrls(paths, expiresIn, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn, paths }, { headers: this.headers });
          const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
          return {
            data: data.map((datum) => Object.assign(Object.assign({}, datum), { signedUrl: datum.signedURL ? encodeURI(`${this.url}${datum.signedURL}${downloadQueryParam}`) : null })),
            error: null
          };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
     *
     * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
     * @param options.transform Transform the asset before serving it to the client.
     */
    download(path, options) {
      return __awaiter4(this, void 0, void 0, function* () {
        const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined";
        const renderPath = wantsTransformation ? "render/image/authenticated" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        const queryString = transformationQuery ? `?${transformationQuery}` : "";
        try {
          const _path = this._getFinalPath(path);
          const res = yield get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
            headers: this.headers,
            noResolveJson: true
          });
          const data = yield res.blob();
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Retrieves the details of an existing file.
     * @param path
     */
    info(path) {
      return __awaiter4(this, void 0, void 0, function* () {
        const _path = this._getFinalPath(path);
        try {
          const data = yield get(this.fetch, `${this.url}/object/info/${_path}`, {
            headers: this.headers
          });
          return { data: recursiveToCamel(data), error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Checks the existence of a file.
     * @param path
     */
    exists(path) {
      return __awaiter4(this, void 0, void 0, function* () {
        const _path = this._getFinalPath(path);
        try {
          yield head(this.fetch, `${this.url}/object/${_path}`, {
            headers: this.headers
          });
          return { data: true, error: null };
        } catch (error) {
          if (isStorageError(error) && error instanceof StorageUnknownError) {
            const originalError = error.originalError;
            if ([400, 404].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) {
              return { data: false, error };
            }
          }
          throw error;
        }
      });
    }
    /**
     * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
     * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
     *
     * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
     * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
     * @param options.transform Transform the asset before serving it to the client.
     */
    getPublicUrl(path, options) {
      const _path = this._getFinalPath(path);
      const _queryString = [];
      const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `download=${options.download === true ? "" : options.download}` : "";
      if (downloadQueryParam !== "") {
        _queryString.push(downloadQueryParam);
      }
      const wantsTransformation = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined";
      const renderPath = wantsTransformation ? "render/image" : "object";
      const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
      if (transformationQuery !== "") {
        _queryString.push(transformationQuery);
      }
      let queryString = _queryString.join("&");
      if (queryString !== "") {
        queryString = `?${queryString}`;
      }
      return {
        data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) }
      };
    }
    /**
     * Deletes files within the same bucket
     *
     * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
     */
    remove(paths) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const data = yield remove(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Get file metadata
     * @param id the file id to retrieve metadata
     */
    // async getMetadata(
    //   id: string
    // ): Promise<
    //   | {
    //       data: Metadata
    //       error: null
    //     }
    //   | {
    //       data: null
    //       error: StorageError
    //     }
    // > {
    //   try {
    //     const data = await get(this.fetch, `${this.url}/metadata/${id}`, { headers: this.headers })
    //     return { data, error: null }
    //   } catch (error) {
    //     if (isStorageError(error)) {
    //       return { data: null, error }
    //     }
    //     throw error
    //   }
    // }
    /**
     * Update file metadata
     * @param id the file id to update metadata
     * @param meta the new file metadata
     */
    // async updateMetadata(
    //   id: string,
    //   meta: Metadata
    // ): Promise<
    //   | {
    //       data: Metadata
    //       error: null
    //     }
    //   | {
    //       data: null
    //       error: StorageError
    //     }
    // > {
    //   try {
    //     const data = await post(
    //       this.fetch,
    //       `${this.url}/metadata/${id}`,
    //       { ...meta },
    //       { headers: this.headers }
    //     )
    //     return { data, error: null }
    //   } catch (error) {
    //     if (isStorageError(error)) {
    //       return { data: null, error }
    //     }
    //     throw error
    //   }
    // }
    /**
     * Lists all the files within a bucket.
     * @param path The folder path.
     */
    list(path, options, parameters) {
      return __awaiter4(this, void 0, void 0, function* () {
        try {
          const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || "" });
          const data = yield post(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    encodeMetadata(metadata) {
      return JSON.stringify(metadata);
    }
    toBase64(data) {
      if (typeof Buffer !== "undefined") {
        return Buffer.from(data).toString("base64");
      }
      return btoa(data);
    }
    _getFinalPath(path) {
      return `${this.bucketId}/${path}`;
    }
    _removeEmptyFolders(path) {
      return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
    }
    transformOptsToQueryString(transform) {
      const params = [];
      if (transform.width) {
        params.push(`width=${transform.width}`);
      }
      if (transform.height) {
        params.push(`height=${transform.height}`);
      }
      if (transform.resize) {
        params.push(`resize=${transform.resize}`);
      }
      if (transform.format) {
        params.push(`format=${transform.format}`);
      }
      if (transform.quality) {
        params.push(`quality=${transform.quality}`);
      }
      return params.join("&");
    }
  };

  // node_modules/@supabase/storage-js/dist/module/lib/version.js
  var version2 = "2.7.0";

  // node_modules/@supabase/storage-js/dist/module/lib/constants.js
  var DEFAULT_HEADERS2 = { "X-Client-Info": `storage-js/${version2}` };

  // node_modules/@supabase/storage-js/dist/module/packages/StorageBucketApi.js
  var __awaiter5 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var StorageBucketApi = class {
    constructor(url, headers = {}, fetch3) {
      this.url = url;
      this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS2), headers);
      this.fetch = resolveFetch2(fetch3);
    }
    /**
     * Retrieves the details of all Storage buckets within an existing project.
     */
    listBuckets() {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield get(this.fetch, `${this.url}/bucket`, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Retrieves the details of an existing Storage bucket.
     *
     * @param id The unique identifier of the bucket you would like to retrieve.
     */
    getBucket(id) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield get(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Creates a new Storage bucket
     *
     * @param id A unique identifier for the bucket you are creating.
     * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
     * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
     * The global file size limit takes precedence over this value.
     * The default value is null, which doesn't set a per bucket file size limit.
     * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
     * The default value is null, which allows files with all mime types to be uploaded.
     * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
     * @returns newly created bucket id
     */
    createBucket(id, options = {
      public: false
    }) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/bucket`, {
            id,
            name: id,
            public: options.public,
            file_size_limit: options.fileSizeLimit,
            allowed_mime_types: options.allowedMimeTypes
          }, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Updates a Storage bucket
     *
     * @param id A unique identifier for the bucket you are updating.
     * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
     * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
     * The global file size limit takes precedence over this value.
     * The default value is null, which doesn't set a per bucket file size limit.
     * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
     * The default value is null, which allows files with all mime types to be uploaded.
     * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
     */
    updateBucket(id, options) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield put(this.fetch, `${this.url}/bucket/${id}`, {
            id,
            name: id,
            public: options.public,
            file_size_limit: options.fileSizeLimit,
            allowed_mime_types: options.allowedMimeTypes
          }, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Removes all objects inside a single bucket.
     *
     * @param id The unique identifier of the bucket you would like to empty.
     */
    emptyBucket(id) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield post(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
     * You must first `empty()` the bucket.
     *
     * @param id The unique identifier of the bucket you would like to delete.
     */
    deleteBucket(id) {
      return __awaiter5(this, void 0, void 0, function* () {
        try {
          const data = yield remove(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
          return { data, error: null };
        } catch (error) {
          if (isStorageError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
  };

  // node_modules/@supabase/storage-js/dist/module/StorageClient.js
  var StorageClient = class extends StorageBucketApi {
    constructor(url, headers = {}, fetch3) {
      super(url, headers, fetch3);
    }
    /**
     * Perform file operation in a bucket.
     *
     * @param id The bucket id to operate on.
     */
    from(id) {
      return new StorageFileApi(this.url, this.headers, id, this.fetch);
    }
  };

  // node_modules/@supabase/supabase-js/dist/module/lib/version.js
  var version3 = "2.45.4";

  // node_modules/@supabase/supabase-js/dist/module/lib/constants.js
  var JS_ENV = "";
  if (typeof Deno !== "undefined") {
    JS_ENV = "deno";
  } else if (typeof document !== "undefined") {
    JS_ENV = "web";
  } else if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    JS_ENV = "react-native";
  } else {
    JS_ENV = "node";
  }
  var DEFAULT_HEADERS3 = { "X-Client-Info": `supabase-js-${JS_ENV}/${version3}` };
  var DEFAULT_GLOBAL_OPTIONS = {
    headers: DEFAULT_HEADERS3
  };
  var DEFAULT_DB_OPTIONS = {
    schema: "public"
  };
  var DEFAULT_AUTH_OPTIONS = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "implicit"
  };
  var DEFAULT_REALTIME_OPTIONS = {};

  // node_modules/@supabase/supabase-js/dist/module/lib/fetch.js
  init_browser();
  var __awaiter6 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var resolveFetch3 = (customFetch) => {
    let _fetch;
    if (customFetch) {
      _fetch = customFetch;
    } else if (typeof fetch === "undefined") {
      _fetch = browser_default;
    } else {
      _fetch = fetch;
    }
    return (...args) => _fetch(...args);
  };
  var resolveHeadersConstructor = () => {
    if (typeof Headers === "undefined") {
      return Headers2;
    }
    return Headers;
  };
  var fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
    const fetch3 = resolveFetch3(customFetch);
    const HeadersConstructor = resolveHeadersConstructor();
    return (input, init) => __awaiter6(void 0, void 0, void 0, function* () {
      var _a;
      const accessToken = (_a = yield getAccessToken()) !== null && _a !== void 0 ? _a : supabaseKey;
      let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
      if (!headers.has("apikey")) {
        headers.set("apikey", supabaseKey);
      }
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return fetch3(input, Object.assign(Object.assign({}, init), { headers }));
    });
  };

  // node_modules/@supabase/supabase-js/dist/module/lib/helpers.js
  var __awaiter7 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  function stripTrailingSlash(url) {
    return url.replace(/\/$/, "");
  }
  function applySettingDefaults(options, defaults) {
    const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
    const { db: DEFAULT_DB_OPTIONS2, auth: DEFAULT_AUTH_OPTIONS2, realtime: DEFAULT_REALTIME_OPTIONS2, global: DEFAULT_GLOBAL_OPTIONS2 } = defaults;
    const result = {
      db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS2), dbOptions),
      auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS2), authOptions),
      realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS2), realtimeOptions),
      global: Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS2), globalOptions),
      accessToken: () => __awaiter7(this, void 0, void 0, function* () {
        return "";
      })
    };
    if (options.accessToken) {
      result.accessToken = options.accessToken;
    } else {
      delete result.accessToken;
    }
    return result;
  }

  // node_modules/@supabase/auth-js/dist/module/lib/version.js
  var version4 = "2.65.0";

  // node_modules/@supabase/auth-js/dist/module/lib/constants.js
  var GOTRUE_URL = "http://localhost:9999";
  var STORAGE_KEY = "supabase.auth.token";
  var DEFAULT_HEADERS4 = { "X-Client-Info": `gotrue-js/${version4}` };
  var EXPIRY_MARGIN = 10;
  var API_VERSION_HEADER_NAME = "X-Supabase-Api-Version";
  var API_VERSIONS = {
    "2024-01-01": {
      timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
      name: "2024-01-01"
    }
  };

  // node_modules/@supabase/auth-js/dist/module/lib/helpers.js
  function expiresAt(expiresIn) {
    const timeNow = Math.round(Date.now() / 1e3);
    return timeNow + expiresIn;
  }
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  var isBrowser = () => typeof document !== "undefined";
  var localStorageWriteTests = {
    tested: false,
    writable: false
  };
  var supportsLocalStorage = () => {
    if (!isBrowser()) {
      return false;
    }
    try {
      if (typeof globalThis.localStorage !== "object") {
        return false;
      }
    } catch (e) {
      return false;
    }
    if (localStorageWriteTests.tested) {
      return localStorageWriteTests.writable;
    }
    const randomKey = `lswt-${Math.random()}${Math.random()}`;
    try {
      globalThis.localStorage.setItem(randomKey, randomKey);
      globalThis.localStorage.removeItem(randomKey);
      localStorageWriteTests.tested = true;
      localStorageWriteTests.writable = true;
    } catch (e) {
      localStorageWriteTests.tested = true;
      localStorageWriteTests.writable = false;
    }
    return localStorageWriteTests.writable;
  };
  function parseParametersFromURL(href) {
    const result = {};
    const url = new URL(href);
    if (url.hash && url.hash[0] === "#") {
      try {
        const hashSearchParams = new URLSearchParams(url.hash.substring(1));
        hashSearchParams.forEach((value, key) => {
          result[key] = value;
        });
      } catch (e) {
      }
    }
    url.searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  var resolveFetch4 = (customFetch) => {
    let _fetch;
    if (customFetch) {
      _fetch = customFetch;
    } else if (typeof fetch === "undefined") {
      _fetch = (...args) => Promise.resolve().then(() => (init_browser(), browser_exports)).then(({ default: fetch3 }) => fetch3(...args));
    } else {
      _fetch = fetch;
    }
    return (...args) => _fetch(...args);
  };
  var looksLikeFetchResponse = (maybeResponse) => {
    return typeof maybeResponse === "object" && maybeResponse !== null && "status" in maybeResponse && "ok" in maybeResponse && "json" in maybeResponse && typeof maybeResponse.json === "function";
  };
  var setItemAsync = async (storage, key, data) => {
    await storage.setItem(key, JSON.stringify(data));
  };
  var getItemAsync = async (storage, key) => {
    const value = await storage.getItem(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (_a) {
      return value;
    }
  };
  var removeItemAsync = async (storage, key) => {
    await storage.removeItem(key);
  };
  function decodeBase64URL(value) {
    const key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let base64 = "";
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;
    value = value.replace("-", "+").replace("_", "/");
    while (i < value.length) {
      enc1 = key.indexOf(value.charAt(i++));
      enc2 = key.indexOf(value.charAt(i++));
      enc3 = key.indexOf(value.charAt(i++));
      enc4 = key.indexOf(value.charAt(i++));
      chr1 = enc1 << 2 | enc2 >> 4;
      chr2 = (enc2 & 15) << 4 | enc3 >> 2;
      chr3 = (enc3 & 3) << 6 | enc4;
      base64 = base64 + String.fromCharCode(chr1);
      if (enc3 != 64 && chr2 != 0) {
        base64 = base64 + String.fromCharCode(chr2);
      }
      if (enc4 != 64 && chr3 != 0) {
        base64 = base64 + String.fromCharCode(chr3);
      }
    }
    return base64;
  }
  var Deferred = class _Deferred {
    constructor() {
      ;
      this.promise = new _Deferred.promiseConstructor((res, rej) => {
        ;
        this.resolve = res;
        this.reject = rej;
      });
    }
  };
  Deferred.promiseConstructor = Promise;
  function decodeJWTPayload(token) {
    const base64UrlRegex = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}=?$|[a-z0-9_-]{2}(==)?$)$/i;
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("JWT is not valid: not a JWT structure");
    }
    if (!base64UrlRegex.test(parts[1])) {
      throw new Error("JWT is not valid: payload is not in base64url format");
    }
    const base64Url = parts[1];
    return JSON.parse(decodeBase64URL(base64Url));
  }
  async function sleep(time) {
    return await new Promise((accept) => {
      setTimeout(() => accept(null), time);
    });
  }
  function retryable(fn, isRetryable) {
    const promise = new Promise((accept, reject) => {
      ;
      (async () => {
        for (let attempt = 0; attempt < Infinity; attempt++) {
          try {
            const result = await fn(attempt);
            if (!isRetryable(attempt, null, result)) {
              accept(result);
              return;
            }
          } catch (e) {
            if (!isRetryable(attempt, e)) {
              reject(e);
              return;
            }
          }
        }
      })();
    });
    return promise;
  }
  function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
  }
  function generatePKCEVerifier() {
    const verifierLength = 56;
    const array = new Uint32Array(verifierLength);
    if (typeof crypto === "undefined") {
      const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
      const charSetLen = charSet.length;
      let verifier = "";
      for (let i = 0; i < verifierLength; i++) {
        verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
      }
      return verifier;
    }
    crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join("");
  }
  async function sha256(randomString) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(randomString);
    const hash = await crypto.subtle.digest("SHA-256", encodedData);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map((c) => String.fromCharCode(c)).join("");
  }
  function base64urlencode(str) {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  async function generatePKCEChallenge(verifier) {
    const hasCryptoSupport = typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined" && typeof TextEncoder !== "undefined";
    if (!hasCryptoSupport) {
      console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.");
      return verifier;
    }
    const hashed = await sha256(verifier);
    return base64urlencode(hashed);
  }
  async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
    const codeVerifier = generatePKCEVerifier();
    let storedCodeVerifier = codeVerifier;
    if (isPasswordRecovery) {
      storedCodeVerifier += "/PASSWORD_RECOVERY";
    }
    await setItemAsync(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
    const codeChallenge = await generatePKCEChallenge(codeVerifier);
    const codeChallengeMethod = codeVerifier === codeChallenge ? "plain" : "s256";
    return [codeChallenge, codeChallengeMethod];
  }
  var API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
  function parseResponseAPIVersion(response) {
    const apiVersion = response.headers.get(API_VERSION_HEADER_NAME);
    if (!apiVersion) {
      return null;
    }
    if (!apiVersion.match(API_VERSION_REGEX)) {
      return null;
    }
    try {
      const date = /* @__PURE__ */ new Date(`${apiVersion}T00:00:00.0Z`);
      return date;
    } catch (e) {
      return null;
    }
  }

  // node_modules/@supabase/auth-js/dist/module/lib/errors.js
  var AuthError = class extends Error {
    constructor(message, status, code) {
      super(message);
      this.__isAuthError = true;
      this.name = "AuthError";
      this.status = status;
      this.code = code;
    }
  };
  function isAuthError(error) {
    return typeof error === "object" && error !== null && "__isAuthError" in error;
  }
  var AuthApiError = class extends AuthError {
    constructor(message, status, code) {
      super(message, status, code);
      this.name = "AuthApiError";
      this.status = status;
      this.code = code;
    }
  };
  function isAuthApiError(error) {
    return isAuthError(error) && error.name === "AuthApiError";
  }
  var AuthUnknownError = class extends AuthError {
    constructor(message, originalError) {
      super(message);
      this.name = "AuthUnknownError";
      this.originalError = originalError;
    }
  };
  var CustomAuthError = class extends AuthError {
    constructor(message, name, status, code) {
      super(message, status, code);
      this.name = name;
      this.status = status;
    }
  };
  var AuthSessionMissingError = class extends CustomAuthError {
    constructor() {
      super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
    }
  };
  function isAuthSessionMissingError(error) {
    return isAuthError(error) && error.name === "AuthSessionMissingError";
  }
  var AuthInvalidTokenResponseError = class extends CustomAuthError {
    constructor() {
      super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
    }
  };
  var AuthInvalidCredentialsError = class extends CustomAuthError {
    constructor(message) {
      super(message, "AuthInvalidCredentialsError", 400, void 0);
    }
  };
  var AuthImplicitGrantRedirectError = class extends CustomAuthError {
    constructor(message, details = null) {
      super(message, "AuthImplicitGrantRedirectError", 500, void 0);
      this.details = null;
      this.details = details;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        status: this.status,
        details: this.details
      };
    }
  };
  var AuthPKCEGrantCodeExchangeError = class extends CustomAuthError {
    constructor(message, details = null) {
      super(message, "AuthPKCEGrantCodeExchangeError", 500, void 0);
      this.details = null;
      this.details = details;
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        status: this.status,
        details: this.details
      };
    }
  };
  var AuthRetryableFetchError = class extends CustomAuthError {
    constructor(message, status) {
      super(message, "AuthRetryableFetchError", status, void 0);
    }
  };
  function isAuthRetryableFetchError(error) {
    return isAuthError(error) && error.name === "AuthRetryableFetchError";
  }
  var AuthWeakPasswordError = class extends CustomAuthError {
    constructor(message, status, reasons) {
      super(message, "AuthWeakPasswordError", status, "weak_password");
      this.reasons = reasons;
    }
  };

  // node_modules/@supabase/auth-js/dist/module/lib/fetch.js
  var __rest = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var _getErrorMessage2 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
  var NETWORK_ERROR_CODES = [502, 503, 504];
  async function handleError2(error) {
    var _a;
    if (!looksLikeFetchResponse(error)) {
      throw new AuthRetryableFetchError(_getErrorMessage2(error), 0);
    }
    if (NETWORK_ERROR_CODES.includes(error.status)) {
      throw new AuthRetryableFetchError(_getErrorMessage2(error), error.status);
    }
    let data;
    try {
      data = await error.json();
    } catch (e) {
      throw new AuthUnknownError(_getErrorMessage2(e), e);
    }
    let errorCode = void 0;
    const responseAPIVersion = parseResponseAPIVersion(error);
    if (responseAPIVersion && responseAPIVersion.getTime() >= API_VERSIONS["2024-01-01"].timestamp && typeof data === "object" && data && typeof data.code === "string") {
      errorCode = data.code;
    } else if (typeof data === "object" && data && typeof data.error_code === "string") {
      errorCode = data.error_code;
    }
    if (!errorCode) {
      if (typeof data === "object" && data && typeof data.weak_password === "object" && data.weak_password && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
        throw new AuthWeakPasswordError(_getErrorMessage2(data), error.status, data.weak_password.reasons);
      }
    } else if (errorCode === "weak_password") {
      throw new AuthWeakPasswordError(_getErrorMessage2(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
    } else if (errorCode === "session_not_found") {
      throw new AuthSessionMissingError();
    }
    throw new AuthApiError(_getErrorMessage2(data), error.status || 500, errorCode);
  }
  var _getRequestParams2 = (method, options, parameters, body) => {
    const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
    if (method === "GET") {
      return params;
    }
    params.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, options === null || options === void 0 ? void 0 : options.headers);
    params.body = JSON.stringify(body);
    return Object.assign(Object.assign({}, params), parameters);
  };
  async function _request(fetcher, method, url, options) {
    var _a;
    const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
    if (!headers[API_VERSION_HEADER_NAME]) {
      headers[API_VERSION_HEADER_NAME] = API_VERSIONS["2024-01-01"].name;
    }
    if (options === null || options === void 0 ? void 0 : options.jwt) {
      headers["Authorization"] = `Bearer ${options.jwt}`;
    }
    const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
    if (options === null || options === void 0 ? void 0 : options.redirectTo) {
      qs["redirect_to"] = options.redirectTo;
    }
    const queryString = Object.keys(qs).length ? "?" + new URLSearchParams(qs).toString() : "";
    const data = await _handleRequest2(fetcher, method, url + queryString, {
      headers,
      noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson
    }, {}, options === null || options === void 0 ? void 0 : options.body);
    return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
  }
  async function _handleRequest2(fetcher, method, url, options, parameters, body) {
    const requestParams = _getRequestParams2(method, options, parameters, body);
    let result;
    try {
      result = await fetcher(url, Object.assign({}, requestParams));
    } catch (e) {
      console.error(e);
      throw new AuthRetryableFetchError(_getErrorMessage2(e), 0);
    }
    if (!result.ok) {
      await handleError2(result);
    }
    if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
      return result;
    }
    try {
      return await result.json();
    } catch (e) {
      await handleError2(e);
    }
  }
  function _sessionResponse(data) {
    var _a;
    let session = null;
    if (hasSession(data)) {
      session = Object.assign({}, data);
      if (!data.expires_at) {
        session.expires_at = expiresAt(data.expires_in);
      }
    }
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return { data: { session, user }, error: null };
  }
  function _sessionResponsePassword(data) {
    const response = _sessionResponse(data);
    if (!response.error && data.weak_password && typeof data.weak_password === "object" && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.message && typeof data.weak_password.message === "string" && data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)) {
      response.data.weak_password = data.weak_password;
    }
    return response;
  }
  function _userResponse(data) {
    var _a;
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return { data: { user }, error: null };
  }
  function _ssoResponse(data) {
    return { data, error: null };
  }
  function _generateLinkResponse(data) {
    const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
    const properties = {
      action_link,
      email_otp,
      hashed_token,
      redirect_to,
      verification_type
    };
    const user = Object.assign({}, rest);
    return {
      data: {
        properties,
        user
      },
      error: null
    };
  }
  function _noResolveJsonResponse(data) {
    return data;
  }
  function hasSession(data) {
    return data.access_token && data.refresh_token && data.expires_in;
  }

  // node_modules/@supabase/auth-js/dist/module/GoTrueAdminApi.js
  var __rest2 = function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  var GoTrueAdminApi = class {
    constructor({ url = "", headers = {}, fetch: fetch3 }) {
      this.url = url;
      this.headers = headers;
      this.fetch = resolveFetch4(fetch3);
      this.mfa = {
        listFactors: this._listFactors.bind(this),
        deleteFactor: this._deleteFactor.bind(this)
      };
    }
    /**
     * Removes a logged-in session.
     * @param jwt A valid, logged-in JWT.
     * @param scope The logout sope.
     */
    async signOut(jwt, scope = "global") {
      try {
        await _request(this.fetch, "POST", `${this.url}/logout?scope=${scope}`, {
          headers: this.headers,
          jwt,
          noResolveJson: true
        });
        return { data: null, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Sends an invite link to an email address.
     * @param email The email address of the user.
     * @param options Additional options to be included when inviting.
     */
    async inviteUserByEmail(email, options = {}) {
      try {
        return await _request(this.fetch, "POST", `${this.url}/invite`, {
          body: { email, data: options.data },
          headers: this.headers,
          redirectTo: options.redirectTo,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Generates email links and OTPs to be sent via a custom email provider.
     * @param email The user's email.
     * @param options.password User password. For signup only.
     * @param options.data Optional user metadata. For signup only.
     * @param options.redirectTo The redirect url which should be appended to the generated link
     */
    async generateLink(params) {
      try {
        const { options } = params, rest = __rest2(params, ["options"]);
        const body = Object.assign(Object.assign({}, rest), options);
        if ("newEmail" in rest) {
          body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
          delete body["newEmail"];
        }
        return await _request(this.fetch, "POST", `${this.url}/admin/generate_link`, {
          body,
          headers: this.headers,
          xform: _generateLinkResponse,
          redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo
        });
      } catch (error) {
        if (isAuthError(error)) {
          return {
            data: {
              properties: null,
              user: null
            },
            error
          };
        }
        throw error;
      }
    }
    // User Admin API
    /**
     * Creates a new user.
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async createUser(attributes) {
      try {
        return await _request(this.fetch, "POST", `${this.url}/admin/users`, {
          body: attributes,
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Get a list of users.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
     */
    async listUsers(params) {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const pagination = { nextPage: null, lastPage: 0, total: 0 };
        const response = await _request(this.fetch, "GET", `${this.url}/admin/users`, {
          headers: this.headers,
          noResolveJson: true,
          query: {
            page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
            per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
          },
          xform: _noResolveJsonResponse
        });
        if (response.error)
          throw response.error;
        const users = await response.json();
        const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
        const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
        if (links.length > 0) {
          links.forEach((link) => {
            const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
            const rel = JSON.parse(link.split(";")[1].split("=")[1]);
            pagination[`${rel}Page`] = page;
          });
          pagination.total = parseInt(total);
        }
        return { data: Object.assign(Object.assign({}, users), pagination), error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { users: [] }, error };
        }
        throw error;
      }
    }
    /**
     * Get user by id.
     *
     * @param uid The user's unique identifier
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async getUserById(uid) {
      try {
        return await _request(this.fetch, "GET", `${this.url}/admin/users/${uid}`, {
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Updates the user data.
     *
     * @param attributes The data you want to update.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async updateUserById(uid, attributes) {
      try {
        return await _request(this.fetch, "PUT", `${this.url}/admin/users/${uid}`, {
          body: attributes,
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Delete a user. Requires a `service_role` key.
     *
     * @param id The user id you want to remove.
     * @param shouldSoftDelete If true, then the user will be soft-deleted (setting `deleted_at` to the current timestamp and disabling their account while preserving their data) from the auth schema.
     * Defaults to false for backward compatibility.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */
    async deleteUser(id, shouldSoftDelete = false) {
      try {
        return await _request(this.fetch, "DELETE", `${this.url}/admin/users/${id}`, {
          headers: this.headers,
          body: {
            should_soft_delete: shouldSoftDelete
          },
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    async _listFactors(params) {
      try {
        const { data, error } = await _request(this.fetch, "GET", `${this.url}/admin/users/${params.userId}/factors`, {
          headers: this.headers,
          xform: (factors) => {
            return { data: { factors }, error: null };
          }
        });
        return { data, error };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    async _deleteFactor(params) {
      try {
        const data = await _request(this.fetch, "DELETE", `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
          headers: this.headers
        });
        return { data, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
  };

  // node_modules/@supabase/auth-js/dist/module/lib/local-storage.js
  var localStorageAdapter = {
    getItem: (key) => {
      if (!supportsLocalStorage()) {
        return null;
      }
      return globalThis.localStorage.getItem(key);
    },
    setItem: (key, value) => {
      if (!supportsLocalStorage()) {
        return;
      }
      globalThis.localStorage.setItem(key, value);
    },
    removeItem: (key) => {
      if (!supportsLocalStorage()) {
        return;
      }
      globalThis.localStorage.removeItem(key);
    }
  };
  function memoryLocalStorageAdapter(store = {}) {
    return {
      getItem: (key) => {
        return store[key] || null;
      },
      setItem: (key, value) => {
        store[key] = value;
      },
      removeItem: (key) => {
        delete store[key];
      }
    };
  }

  // node_modules/@supabase/auth-js/dist/module/lib/polyfills.js
  function polyfillGlobalThis() {
    if (typeof globalThis === "object")
      return;
    try {
      Object.defineProperty(Object.prototype, "__magic__", {
        get: function() {
          return this;
        },
        configurable: true
      });
      __magic__.globalThis = __magic__;
      delete Object.prototype.__magic__;
    } catch (e) {
      if (typeof self !== "undefined") {
        self.globalThis = self;
      }
    }
  }

  // node_modules/@supabase/auth-js/dist/module/lib/locks.js
  var internals = {
    /**
     * @experimental
     */
    debug: !!(globalThis && supportsLocalStorage() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
  };
  var LockAcquireTimeoutError = class extends Error {
    constructor(message) {
      super(message);
      this.isAcquireTimeout = true;
    }
  };
  var NavigatorLockAcquireTimeoutError = class extends LockAcquireTimeoutError {
  };
  async function navigatorLock(name, acquireTimeout, fn) {
    if (internals.debug) {
      console.log("@supabase/gotrue-js: navigatorLock: acquire lock", name, acquireTimeout);
    }
    const abortController = new globalThis.AbortController();
    if (acquireTimeout > 0) {
      setTimeout(() => {
        abortController.abort();
        if (internals.debug) {
          console.log("@supabase/gotrue-js: navigatorLock acquire timed out", name);
        }
      }, acquireTimeout);
    }
    return await globalThis.navigator.locks.request(name, acquireTimeout === 0 ? {
      mode: "exclusive",
      ifAvailable: true
    } : {
      mode: "exclusive",
      signal: abortController.signal
    }, async (lock) => {
      if (lock) {
        if (internals.debug) {
          console.log("@supabase/gotrue-js: navigatorLock: acquired", name, lock.name);
        }
        try {
          return await fn();
        } finally {
          if (internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock: released", name, lock.name);
          }
        }
      } else {
        if (acquireTimeout === 0) {
          if (internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock: not immediately available", name);
          }
          throw new NavigatorLockAcquireTimeoutError(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
        } else {
          if (internals.debug) {
            try {
              const result = await globalThis.navigator.locks.query();
              console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(result, null, "  "));
            } catch (e) {
              console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", e);
            }
          }
          console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request");
          return await fn();
        }
      }
    });
  }

  // node_modules/@supabase/auth-js/dist/module/GoTrueClient.js
  polyfillGlobalThis();
  var DEFAULT_OPTIONS = {
    url: GOTRUE_URL,
    storageKey: STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    headers: DEFAULT_HEADERS4,
    flowType: "implicit",
    debug: false,
    hasCustomAuthorizationHeader: false
  };
  var AUTO_REFRESH_TICK_DURATION = 30 * 1e3;
  var AUTO_REFRESH_TICK_THRESHOLD = 3;
  async function lockNoOp(name, acquireTimeout, fn) {
    return await fn();
  }
  var GoTrueClient = class _GoTrueClient {
    /**
     * Create a new client for use in the browser.
     */
    constructor(options) {
      var _a, _b;
      this.memoryStorage = null;
      this.stateChangeEmitters = /* @__PURE__ */ new Map();
      this.autoRefreshTicker = null;
      this.visibilityChangedCallback = null;
      this.refreshingDeferred = null;
      this.initializePromise = null;
      this.detectSessionInUrl = true;
      this.hasCustomAuthorizationHeader = false;
      this.suppressGetSessionWarning = false;
      this.lockAcquired = false;
      this.pendingInLock = [];
      this.broadcastChannel = null;
      this.logger = console.log;
      this.instanceID = _GoTrueClient.nextInstanceID;
      _GoTrueClient.nextInstanceID += 1;
      if (this.instanceID > 0 && isBrowser()) {
        console.warn("Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.");
      }
      const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
      this.logDebugMessages = !!settings.debug;
      if (typeof settings.debug === "function") {
        this.logger = settings.debug;
      }
      this.persistSession = settings.persistSession;
      this.storageKey = settings.storageKey;
      this.autoRefreshToken = settings.autoRefreshToken;
      this.admin = new GoTrueAdminApi({
        url: settings.url,
        headers: settings.headers,
        fetch: settings.fetch
      });
      this.url = settings.url;
      this.headers = settings.headers;
      this.fetch = resolveFetch4(settings.fetch);
      this.lock = settings.lock || lockNoOp;
      this.detectSessionInUrl = settings.detectSessionInUrl;
      this.flowType = settings.flowType;
      this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
      if (settings.lock) {
        this.lock = settings.lock;
      } else if (isBrowser() && ((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _a === void 0 ? void 0 : _a.locks)) {
        this.lock = navigatorLock;
      } else {
        this.lock = lockNoOp;
      }
      this.mfa = {
        verify: this._verify.bind(this),
        enroll: this._enroll.bind(this),
        unenroll: this._unenroll.bind(this),
        challenge: this._challenge.bind(this),
        listFactors: this._listFactors.bind(this),
        challengeAndVerify: this._challengeAndVerify.bind(this),
        getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this)
      };
      if (this.persistSession) {
        if (settings.storage) {
          this.storage = settings.storage;
        } else {
          if (supportsLocalStorage()) {
            this.storage = localStorageAdapter;
          } else {
            this.memoryStorage = {};
            this.storage = memoryLocalStorageAdapter(this.memoryStorage);
          }
        }
      } else {
        this.memoryStorage = {};
        this.storage = memoryLocalStorageAdapter(this.memoryStorage);
      }
      if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
        try {
          this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
        } catch (e) {
          console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", e);
        }
        (_b = this.broadcastChannel) === null || _b === void 0 ? void 0 : _b.addEventListener("message", async (event) => {
          this._debug("received broadcast notification from other tab or client", event);
          await this._notifyAllSubscribers(event.data.event, event.data.session, false);
        });
      }
      this.initialize();
    }
    _debug(...args) {
      if (this.logDebugMessages) {
        this.logger(`GoTrueClient@${this.instanceID} (${version4}) ${(/* @__PURE__ */ new Date()).toISOString()}`, ...args);
      }
      return this;
    }
    /**
     * Initializes the client session either from the url or from storage.
     * This method is automatically called when instantiating the client, but should also be called
     * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
     */
    async initialize() {
      if (this.initializePromise) {
        return await this.initializePromise;
      }
      this.initializePromise = (async () => {
        return await this._acquireLock(-1, async () => {
          return await this._initialize();
        });
      })();
      return await this.initializePromise;
    }
    /**
     * IMPORTANT:
     * 1. Never throw in this method, as it is called from the constructor
     * 2. Never return a session from this method as it would be cached over
     *    the whole lifetime of the client
     */
    async _initialize() {
      try {
        const isPKCEFlow = isBrowser() ? await this._isPKCEFlow() : false;
        this._debug("#_initialize()", "begin", "is PKCE flow", isPKCEFlow);
        if (isPKCEFlow || this.detectSessionInUrl && this._isImplicitGrantFlow()) {
          const { data, error } = await this._getSessionFromURL(isPKCEFlow);
          if (error) {
            this._debug("#_initialize()", "error detecting session from URL", error);
            if ((error === null || error === void 0 ? void 0 : error.message) === "Identity is already linked" || (error === null || error === void 0 ? void 0 : error.message) === "Identity is already linked to another user") {
              return { error };
            }
            await this._removeSession();
            return { error };
          }
          const { session, redirectType } = data;
          this._debug("#_initialize()", "detected session in URL", session, "redirect type", redirectType);
          await this._saveSession(session);
          setTimeout(async () => {
            if (redirectType === "recovery") {
              await this._notifyAllSubscribers("PASSWORD_RECOVERY", session);
            } else {
              await this._notifyAllSubscribers("SIGNED_IN", session);
            }
          }, 0);
          return { error: null };
        }
        await this._recoverAndRefresh();
        return { error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { error };
        }
        return {
          error: new AuthUnknownError("Unexpected error during initialization", error)
        };
      } finally {
        await this._handleVisibilityChange();
        this._debug("#_initialize()", "end");
      }
    }
    /**
     * Creates a new anonymous user.
     *
     * @returns A session where the is_anonymous claim in the access token JWT set to true
     */
    async signInAnonymously(credentials) {
      var _a, _b, _c;
      try {
        const res = await _request(this.fetch, "POST", `${this.url}/signup`, {
          headers: this.headers,
          body: {
            data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
            gotrue_meta_security: { captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken }
          },
          xform: _sessionResponse
        });
        const { data, error } = res;
        if (error || !data) {
          return { data: { user: null, session: null }, error };
        }
        const session = data.session;
        const user = data.user;
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return { data: { user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Creates a new user.
     *
     * Be aware that if a user account exists in the system you may get back an
     * error message that attempts to hide this information from the user.
     * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
     *
     * @returns A logged-in session if the server has "autoconfirm" ON
     * @returns A user if the server has "autoconfirm" OFF
     */
    async signUp(credentials) {
      var _a, _b, _c;
      try {
        let res;
        if ("email" in credentials) {
          const { email, password, options } = credentials;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce") {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          res = await _request(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
            body: {
              email,
              password,
              data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod
            },
            xform: _sessionResponse
          });
        } else if ("phone" in credentials) {
          const { phone, password, options } = credentials;
          res = await _request(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            body: {
              phone,
              password,
              data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
              channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : "sms",
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponse
          });
        } else {
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
        }
        const { data, error } = res;
        if (error || !data) {
          return { data: { user: null, session: null }, error };
        }
        const session = data.session;
        const user = data.user;
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return { data: { user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Log in an existing user with an email and password or phone and password.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or that the
     * email/phone and password combination is wrong or that the account can only
     * be accessed via social login.
     */
    async signInWithPassword(credentials) {
      try {
        let res;
        if ("email" in credentials) {
          const { email, password, options } = credentials;
          res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
            headers: this.headers,
            body: {
              email,
              password,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponsePassword
          });
        } else if ("phone" in credentials) {
          const { phone, password, options } = credentials;
          res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
            headers: this.headers,
            body: {
              phone,
              password,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponsePassword
          });
        } else {
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
        }
        const { data, error } = res;
        if (error) {
          return { data: { user: null, session: null }, error };
        } else if (!data || !data.session || !data.user) {
          return { data: { user: null, session: null }, error: new AuthInvalidTokenResponseError() };
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return {
          data: Object.assign({ user: data.user, session: data.session }, data.weak_password ? { weakPassword: data.weak_password } : null),
          error
        };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Log in an existing user via a third-party provider.
     * This method supports the PKCE flow.
     */
    async signInWithOAuth(credentials) {
      var _a, _b, _c, _d;
      return await this._handleProviderSignIn(credentials.provider, {
        redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
        scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
        queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
        skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect
      });
    }
    /**
     * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
     */
    async exchangeCodeForSession(authCode) {
      await this.initializePromise;
      return this._acquireLock(-1, async () => {
        return this._exchangeCodeForSession(authCode);
      });
    }
    async _exchangeCodeForSession(authCode) {
      const storageItem = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : "").split("/");
      try {
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
          headers: this.headers,
          body: {
            auth_code: authCode,
            code_verifier: codeVerifier
          },
          xform: _sessionResponse
        });
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        if (error) {
          throw error;
        }
        if (!data || !data.session || !data.user) {
          return {
            data: { user: null, session: null, redirectType: null },
            error: new AuthInvalidTokenResponseError()
          };
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return { data: Object.assign(Object.assign({}, data), { redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null }), error };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null, redirectType: null }, error };
        }
        throw error;
      }
    }
    /**
     * Allows signing in with an OIDC ID token. The authentication provider used
     * should be enabled and configured.
     */
    async signInWithIdToken(credentials) {
      try {
        const { options, provider, token, access_token, nonce } = credentials;
        const res = await _request(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
          headers: this.headers,
          body: {
            provider,
            id_token: token,
            access_token,
            nonce,
            gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
          },
          xform: _sessionResponse
        });
        const { data, error } = res;
        if (error) {
          return { data: { user: null, session: null }, error };
        } else if (!data || !data.session || !data.user) {
          return {
            data: { user: null, session: null },
            error: new AuthInvalidTokenResponseError()
          };
        }
        if (data.session) {
          await this._saveSession(data.session);
          await this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return { data, error };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Log in a user using magiclink or a one-time password (OTP).
     *
     * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
     * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
     * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or, that the account
     * can only be accessed via social login.
     *
     * Do note that you will need to configure a Whatsapp sender on Twilio
     * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
     * channel is not supported on other providers
     * at this time.
     * This method supports PKCE when an email is passed.
     */
    async signInWithOtp(credentials) {
      var _a, _b, _c, _d, _e;
      try {
        if ("email" in credentials) {
          const { email, options } = credentials;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce") {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          const { error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
            headers: this.headers,
            body: {
              email,
              data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
              create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod
            },
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
          });
          return { data: { user: null, session: null }, error };
        }
        if ("phone" in credentials) {
          const { phone, options } = credentials;
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/otp`, {
            headers: this.headers,
            body: {
              phone,
              data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
              create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
              channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : "sms"
            }
          });
          return { data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id }, error };
        }
        throw new AuthInvalidCredentialsError("You must provide either an email or phone number.");
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
     */
    async verifyOtp(params) {
      var _a, _b;
      try {
        let redirectTo = void 0;
        let captchaToken = void 0;
        if ("options" in params) {
          redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
          captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
        }
        const { data, error } = await _request(this.fetch, "POST", `${this.url}/verify`, {
          headers: this.headers,
          body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: captchaToken } }),
          redirectTo,
          xform: _sessionResponse
        });
        if (error) {
          throw error;
        }
        if (!data) {
          throw new Error("An error occurred on token verification.");
        }
        const session = data.session;
        const user = data.user;
        if (session === null || session === void 0 ? void 0 : session.access_token) {
          await this._saveSession(session);
          await this._notifyAllSubscribers(params.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", session);
        }
        return { data: { user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Attempts a single-sign on using an enterprise Identity Provider. A
     * successful SSO attempt will redirect the current page to the identity
     * provider authorization page. The redirect URL is implementation and SSO
     * protocol specific.
     *
     * You can use it by providing a SSO domain. Typically you can extract this
     * domain by asking users for their email address. If this domain is
     * registered on the Auth instance the redirect will use that organization's
     * currently active SSO Identity Provider for the login.
     *
     * If you have built an organization-specific login page, you can use the
     * organization's SSO Identity Provider UUID directly instead.
     */
    async signInWithSSO(params) {
      var _a, _b, _c;
      try {
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === "pkce") {
          ;
          [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
        }
        return await _request(this.fetch, "POST", `${this.url}/sso`, {
          body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in params ? { provider_id: params.providerId } : null), "domain" in params ? { domain: params.domain } : null), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : void 0 }), ((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken) ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } } : null), { skip_http_redirect: true, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
          headers: this.headers,
          xform: _ssoResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Sends a reauthentication OTP to the user's email or phone number.
     * Requires the user to be signed-in.
     */
    async reauthenticate() {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._reauthenticate();
      });
    }
    async _reauthenticate() {
      try {
        return await this._useSession(async (result) => {
          const { data: { session }, error: sessionError } = result;
          if (sessionError)
            throw sessionError;
          if (!session)
            throw new AuthSessionMissingError();
          const { error } = await _request(this.fetch, "GET", `${this.url}/reauthenticate`, {
            headers: this.headers,
            jwt: session.access_token
          });
          return { data: { user: null, session: null }, error };
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
     */
    async resend(credentials) {
      try {
        const endpoint = `${this.url}/resend`;
        if ("email" in credentials) {
          const { email, type, options } = credentials;
          const { error } = await _request(this.fetch, "POST", endpoint, {
            headers: this.headers,
            body: {
              email,
              type,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
          });
          return { data: { user: null, session: null }, error };
        } else if ("phone" in credentials) {
          const { phone, type, options } = credentials;
          const { data, error } = await _request(this.fetch, "POST", endpoint, {
            headers: this.headers,
            body: {
              phone,
              type,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            }
          });
          return { data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id }, error };
        }
        throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a type");
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Returns the session, refreshing it if necessary.
     *
     * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
     *
     * **IMPORTANT:** This method loads values directly from the storage attached
     * to the client. If that storage is based on request cookies for example,
     * the values in it may not be authentic and therefore it's strongly advised
     * against using this method and its results in such circumstances. A warning
     * will be emitted if this is detected. Use {@link #getUser()} instead.
     */
    async getSession() {
      await this.initializePromise;
      const result = await this._acquireLock(-1, async () => {
        return this._useSession(async (result2) => {
          return result2;
        });
      });
      return result;
    }
    /**
     * Acquires a global lock based on the storage key.
     */
    async _acquireLock(acquireTimeout, fn) {
      this._debug("#_acquireLock", "begin", acquireTimeout);
      try {
        if (this.lockAcquired) {
          const last = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve();
          const result = (async () => {
            await last;
            return await fn();
          })();
          this.pendingInLock.push((async () => {
            try {
              await result;
            } catch (e) {
            }
          })());
          return result;
        }
        return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
          this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
          try {
            this.lockAcquired = true;
            const result = fn();
            this.pendingInLock.push((async () => {
              try {
                await result;
              } catch (e) {
              }
            })());
            await result;
            while (this.pendingInLock.length) {
              const waitOn = [...this.pendingInLock];
              await Promise.all(waitOn);
              this.pendingInLock.splice(0, waitOn.length);
            }
            return await result;
          } finally {
            this._debug("#_acquireLock", "lock released for storage key", this.storageKey);
            this.lockAcquired = false;
          }
        });
      } finally {
        this._debug("#_acquireLock", "end");
      }
    }
    /**
     * Use instead of {@link #getSession} inside the library. It is
     * semantically usually what you want, as getting a session involves some
     * processing afterwards that requires only one client operating on the
     * session at once across multiple tabs or processes.
     */
    async _useSession(fn) {
      this._debug("#_useSession", "begin");
      try {
        const result = await this.__loadSession();
        return await fn(result);
      } finally {
        this._debug("#_useSession", "end");
      }
    }
    /**
     * NEVER USE DIRECTLY!
     *
     * Always use {@link #_useSession}.
     */
    async __loadSession() {
      this._debug("#__loadSession()", "begin");
      if (!this.lockAcquired) {
        this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
      }
      try {
        let currentSession = null;
        const maybeSession = await getItemAsync(this.storage, this.storageKey);
        this._debug("#getSession()", "session from storage", maybeSession);
        if (maybeSession !== null) {
          if (this._isValidSession(maybeSession)) {
            currentSession = maybeSession;
          } else {
            this._debug("#getSession()", "session from storage is not valid");
            await this._removeSession();
          }
        }
        if (!currentSession) {
          return { data: { session: null }, error: null };
        }
        const hasExpired = currentSession.expires_at ? currentSession.expires_at <= Date.now() / 1e3 : false;
        this._debug("#__loadSession()", `session has${hasExpired ? "" : " not"} expired`, "expires_at", currentSession.expires_at);
        if (!hasExpired) {
          if (this.storage.isServer) {
            let suppressWarning = this.suppressGetSessionWarning;
            const proxySession = new Proxy(currentSession, {
              get: (target, prop, receiver) => {
                if (!suppressWarning && prop === "user") {
                  console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and many not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.");
                  suppressWarning = true;
                  this.suppressGetSessionWarning = true;
                }
                return Reflect.get(target, prop, receiver);
              }
            });
            currentSession = proxySession;
          }
          return { data: { session: currentSession }, error: null };
        }
        const { session, error } = await this._callRefreshToken(currentSession.refresh_token);
        if (error) {
          return { data: { session: null }, error };
        }
        return { data: { session }, error: null };
      } finally {
        this._debug("#__loadSession()", "end");
      }
    }
    /**
     * Gets the current user details if there is an existing session. This method
     * performs a network request to the Supabase Auth server, so the returned
     * value is authentic and can be used to base authorization rules on.
     *
     * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
     */
    async getUser(jwt) {
      if (jwt) {
        return await this._getUser(jwt);
      }
      await this.initializePromise;
      const result = await this._acquireLock(-1, async () => {
        return await this._getUser();
      });
      return result;
    }
    async _getUser(jwt) {
      try {
        if (jwt) {
          return await _request(this.fetch, "GET", `${this.url}/user`, {
            headers: this.headers,
            jwt,
            xform: _userResponse
          });
        }
        return await this._useSession(async (result) => {
          var _a, _b, _c;
          const { data, error } = result;
          if (error) {
            throw error;
          }
          if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) {
            return { data: { user: null }, error: new AuthSessionMissingError() };
          }
          return await _request(this.fetch, "GET", `${this.url}/user`, {
            headers: this.headers,
            jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : void 0,
            xform: _userResponse
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          if (isAuthSessionMissingError(error)) {
            await this._removeSession();
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            await this._notifyAllSubscribers("SIGNED_OUT", null);
          }
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Updates user data for a logged in user.
     */
    async updateUser(attributes, options = {}) {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._updateUser(attributes, options);
      });
    }
    async _updateUser(attributes, options = {}) {
      try {
        return await this._useSession(async (result) => {
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            throw sessionError;
          }
          if (!sessionData.session) {
            throw new AuthSessionMissingError();
          }
          const session = sessionData.session;
          let codeChallenge = null;
          let codeChallengeMethod = null;
          if (this.flowType === "pkce" && attributes.email != null) {
            ;
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
          }
          const { data, error: userError } = await _request(this.fetch, "PUT", `${this.url}/user`, {
            headers: this.headers,
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
            body: Object.assign(Object.assign({}, attributes), { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
            jwt: session.access_token,
            xform: _userResponse
          });
          if (userError)
            throw userError;
          session.user = data.user;
          await this._saveSession(session);
          await this._notifyAllSubscribers("USER_UPDATED", session);
          return { data: { user: session.user }, error: null };
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Decodes a JWT (without performing any validation).
     */
    _decodeJWT(jwt) {
      return decodeJWTPayload(jwt);
    }
    /**
     * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
     * If the refresh token or access token in the current session is invalid, an error will be thrown.
     * @param currentSession The current session that minimally contains an access token and refresh token.
     */
    async setSession(currentSession) {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._setSession(currentSession);
      });
    }
    async _setSession(currentSession) {
      try {
        if (!currentSession.access_token || !currentSession.refresh_token) {
          throw new AuthSessionMissingError();
        }
        const timeNow = Date.now() / 1e3;
        let expiresAt2 = timeNow;
        let hasExpired = true;
        let session = null;
        const payload = decodeJWTPayload(currentSession.access_token);
        if (payload.exp) {
          expiresAt2 = payload.exp;
          hasExpired = expiresAt2 <= timeNow;
        }
        if (hasExpired) {
          const { session: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
          if (error) {
            return { data: { user: null, session: null }, error };
          }
          if (!refreshedSession) {
            return { data: { user: null, session: null }, error: null };
          }
          session = refreshedSession;
        } else {
          const { data, error } = await this._getUser(currentSession.access_token);
          if (error) {
            throw error;
          }
          session = {
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token,
            user: data.user,
            token_type: "bearer",
            expires_in: expiresAt2 - timeNow,
            expires_at: expiresAt2
          };
          await this._saveSession(session);
          await this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return { data: { user: session.user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { session: null, user: null }, error };
        }
        throw error;
      }
    }
    /**
     * Returns a new session, regardless of expiry status.
     * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
     * If the current session's refresh token is invalid, an error will be thrown.
     * @param currentSession The current session. If passed in, it must contain a refresh token.
     */
    async refreshSession(currentSession) {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._refreshSession(currentSession);
      });
    }
    async _refreshSession(currentSession) {
      try {
        return await this._useSession(async (result) => {
          var _a;
          if (!currentSession) {
            const { data, error: error2 } = result;
            if (error2) {
              throw error2;
            }
            currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : void 0;
          }
          if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
            throw new AuthSessionMissingError();
          }
          const { session, error } = await this._callRefreshToken(currentSession.refresh_token);
          if (error) {
            return { data: { user: null, session: null }, error };
          }
          if (!session) {
            return { data: { user: null, session: null }, error: null };
          }
          return { data: { user: session.user, session }, error: null };
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    }
    /**
     * Gets the session data from a URL string
     */
    async _getSessionFromURL(isPKCEFlow) {
      try {
        if (!isBrowser())
          throw new AuthImplicitGrantRedirectError("No browser detected.");
        if (this.flowType === "implicit" && !this._isImplicitGrantFlow()) {
          throw new AuthImplicitGrantRedirectError("Not a valid implicit grant flow url.");
        } else if (this.flowType == "pkce" && !isPKCEFlow) {
          throw new AuthPKCEGrantCodeExchangeError("Not a valid PKCE flow url.");
        }
        const params = parseParametersFromURL(window.location.href);
        if (isPKCEFlow) {
          if (!params.code)
            throw new AuthPKCEGrantCodeExchangeError("No code detected.");
          const { data: data2, error: error2 } = await this._exchangeCodeForSession(params.code);
          if (error2)
            throw error2;
          const url = new URL(window.location.href);
          url.searchParams.delete("code");
          window.history.replaceState(window.history.state, "", url.toString());
          return { data: { session: data2.session, redirectType: null }, error: null };
        }
        if (params.error || params.error_description || params.error_code) {
          throw new AuthImplicitGrantRedirectError(params.error_description || "Error in URL with unspecified error_description", {
            error: params.error || "unspecified_error",
            code: params.error_code || "unspecified_code"
          });
        }
        const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type } = params;
        if (!access_token || !expires_in || !refresh_token || !token_type) {
          throw new AuthImplicitGrantRedirectError("No session defined in URL");
        }
        const timeNow = Math.round(Date.now() / 1e3);
        const expiresIn = parseInt(expires_in);
        let expiresAt2 = timeNow + expiresIn;
        if (expires_at) {
          expiresAt2 = parseInt(expires_at);
        }
        const actuallyExpiresIn = expiresAt2 - timeNow;
        if (actuallyExpiresIn * 1e3 <= AUTO_REFRESH_TICK_DURATION) {
          console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
        }
        const issuedAt = expiresAt2 - expiresIn;
        if (timeNow - issuedAt >= 120) {
          console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", issuedAt, expiresAt2, timeNow);
        } else if (timeNow - issuedAt < 0) {
          console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", issuedAt, expiresAt2, timeNow);
        }
        const { data, error } = await this._getUser(access_token);
        if (error)
          throw error;
        const session = {
          provider_token,
          provider_refresh_token,
          access_token,
          expires_in: expiresIn,
          expires_at: expiresAt2,
          refresh_token,
          token_type,
          user: data.user
        };
        window.location.hash = "";
        this._debug("#_getSessionFromURL()", "clearing window.location.hash");
        return { data: { session, redirectType: params.type }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { session: null, redirectType: null }, error };
        }
        throw error;
      }
    }
    /**
     * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
     */
    _isImplicitGrantFlow() {
      const params = parseParametersFromURL(window.location.href);
      return !!(isBrowser() && (params.access_token || params.error_description));
    }
    /**
     * Checks if the current URL and backing storage contain parameters given by a PKCE flow
     */
    async _isPKCEFlow() {
      const params = parseParametersFromURL(window.location.href);
      const currentStorageContent = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
      return !!(params.code && currentStorageContent);
    }
    /**
     * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
     *
     * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
     * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
     *
     * If using `others` scope, no `SIGNED_OUT` event is fired!
     */
    async signOut(options = { scope: "global" }) {
      await this.initializePromise;
      return await this._acquireLock(-1, async () => {
        return await this._signOut(options);
      });
    }
    async _signOut({ scope } = { scope: "global" }) {
      return await this._useSession(async (result) => {
        var _a;
        const { data, error: sessionError } = result;
        if (sessionError) {
          return { error: sessionError };
        }
        const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
        if (accessToken) {
          const { error } = await this.admin.signOut(accessToken, scope);
          if (error) {
            if (!(isAuthApiError(error) && (error.status === 404 || error.status === 401 || error.status === 403))) {
              return { error };
            }
          }
        }
        if (scope !== "others") {
          await this._removeSession();
          await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
          await this._notifyAllSubscribers("SIGNED_OUT", null);
        }
        return { error: null };
      });
    }
    /**
     * Receive a notification every time an auth event happens.
     * @param callback A callback function to be invoked when an auth event happens.
     */
    onAuthStateChange(callback) {
      const id = uuid();
      const subscription = {
        id,
        callback,
        unsubscribe: () => {
          this._debug("#unsubscribe()", "state change callback with id removed", id);
          this.stateChangeEmitters.delete(id);
        }
      };
      this._debug("#onAuthStateChange()", "registered callback with id", id);
      this.stateChangeEmitters.set(id, subscription);
      (async () => {
        await this.initializePromise;
        await this._acquireLock(-1, async () => {
          this._emitInitialSession(id);
        });
      })();
      return { data: { subscription } };
    }
    async _emitInitialSession(id) {
      return await this._useSession(async (result) => {
        var _a, _b;
        try {
          const { data: { session }, error } = result;
          if (error)
            throw error;
          await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback("INITIAL_SESSION", session));
          this._debug("INITIAL_SESSION", "callback id", id, "session", session);
        } catch (err) {
          await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback("INITIAL_SESSION", null));
          this._debug("INITIAL_SESSION", "callback id", id, "error", err);
          console.error(err);
        }
      });
    }
    /**
     * Sends a password reset request to an email address. This method supports the PKCE flow.
     *
     * @param email The email address of the user.
     * @param options.redirectTo The URL to send the user to after they click the password reset link.
     * @param options.captchaToken Verification token received when the user completes the captcha on the site.
     */
    async resetPasswordForEmail(email, options = {}) {
      let codeChallenge = null;
      let codeChallengeMethod = null;
      if (this.flowType === "pkce") {
        ;
        [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(
          this.storage,
          this.storageKey,
          true
          // isPasswordRecovery
        );
      }
      try {
        return await _request(this.fetch, "POST", `${this.url}/recover`, {
          body: {
            email,
            code_challenge: codeChallenge,
            code_challenge_method: codeChallengeMethod,
            gotrue_meta_security: { captcha_token: options.captchaToken }
          },
          headers: this.headers,
          redirectTo: options.redirectTo
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Gets all the identities linked to a user.
     */
    async getUserIdentities() {
      var _a;
      try {
        const { data, error } = await this.getUser();
        if (error)
          throw error;
        return { data: { identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : [] }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Links an oauth identity to an existing user.
     * This method supports the PKCE flow.
     */
    async linkIdentity(credentials) {
      var _a;
      try {
        const { data, error } = await this._useSession(async (result) => {
          var _a2, _b, _c, _d, _e;
          const { data: data2, error: error2 } = result;
          if (error2)
            throw error2;
          const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
            redirectTo: (_a2 = credentials.options) === null || _a2 === void 0 ? void 0 : _a2.redirectTo,
            scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
            queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
            skipBrowserRedirect: true
          });
          return await _request(this.fetch, "GET", url, {
            headers: this.headers,
            jwt: (_e = (_d = data2.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : void 0
          });
        });
        if (error)
          throw error;
        if (isBrowser() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) {
          window.location.assign(data === null || data === void 0 ? void 0 : data.url);
        }
        return { data: { provider: credentials.provider, url: data === null || data === void 0 ? void 0 : data.url }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { provider: credentials.provider, url: null }, error };
        }
        throw error;
      }
    }
    /**
     * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
     */
    async unlinkIdentity(identity) {
      try {
        return await this._useSession(async (result) => {
          var _a, _b;
          const { data, error } = result;
          if (error) {
            throw error;
          }
          return await _request(this.fetch, "DELETE", `${this.url}/user/identities/${identity.identity_id}`, {
            headers: this.headers,
            jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : void 0
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * Generates a new JWT.
     * @param refreshToken A valid refresh token that was returned on login.
     */
    async _refreshAccessToken(refreshToken) {
      const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
      this._debug(debugName, "begin");
      try {
        const startedAt = Date.now();
        return await retryable(async (attempt) => {
          if (attempt > 0) {
            await sleep(200 * Math.pow(2, attempt - 1));
          }
          this._debug(debugName, "refreshing attempt", attempt);
          return await _request(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
            body: { refresh_token: refreshToken },
            headers: this.headers,
            xform: _sessionResponse
          });
        }, (attempt, error) => {
          const nextBackOffInterval = 200 * Math.pow(2, attempt);
          return error && isAuthRetryableFetchError(error) && // retryable only if the request can be sent before the backoff overflows the tick duration
          Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION;
        });
      } catch (error) {
        this._debug(debugName, "error", error);
        if (isAuthError(error)) {
          return { data: { session: null, user: null }, error };
        }
        throw error;
      } finally {
        this._debug(debugName, "end");
      }
    }
    _isValidSession(maybeSession) {
      const isValidSession = typeof maybeSession === "object" && maybeSession !== null && "access_token" in maybeSession && "refresh_token" in maybeSession && "expires_at" in maybeSession;
      return isValidSession;
    }
    async _handleProviderSignIn(provider, options) {
      const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
        redirectTo: options.redirectTo,
        scopes: options.scopes,
        queryParams: options.queryParams
      });
      this._debug("#_handleProviderSignIn()", "provider", provider, "options", options, "url", url);
      if (isBrowser() && !options.skipBrowserRedirect) {
        window.location.assign(url);
      }
      return { data: { provider, url }, error: null };
    }
    /**
     * Recovers the session from LocalStorage and refreshes
     * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
     */
    async _recoverAndRefresh() {
      var _a;
      const debugName = "#_recoverAndRefresh()";
      this._debug(debugName, "begin");
      try {
        const currentSession = await getItemAsync(this.storage, this.storageKey);
        this._debug(debugName, "session from storage", currentSession);
        if (!this._isValidSession(currentSession)) {
          this._debug(debugName, "session is not valid");
          if (currentSession !== null) {
            await this._removeSession();
          }
          return;
        }
        const timeNow = Math.round(Date.now() / 1e3);
        const expiresWithMargin = ((_a = currentSession.expires_at) !== null && _a !== void 0 ? _a : Infinity) < timeNow + EXPIRY_MARGIN;
        this._debug(debugName, `session has${expiresWithMargin ? "" : " not"} expired with margin of ${EXPIRY_MARGIN}s`);
        if (expiresWithMargin) {
          if (this.autoRefreshToken && currentSession.refresh_token) {
            const { error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) {
              console.error(error);
              if (!isAuthRetryableFetchError(error)) {
                this._debug(debugName, "refresh failed with a non-retryable error, removing the session", error);
                await this._removeSession();
              }
            }
          }
        } else {
          await this._notifyAllSubscribers("SIGNED_IN", currentSession);
        }
      } catch (err) {
        this._debug(debugName, "error", err);
        console.error(err);
        return;
      } finally {
        this._debug(debugName, "end");
      }
    }
    async _callRefreshToken(refreshToken) {
      var _a, _b;
      if (!refreshToken) {
        throw new AuthSessionMissingError();
      }
      if (this.refreshingDeferred) {
        return this.refreshingDeferred.promise;
      }
      const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
      this._debug(debugName, "begin");
      try {
        this.refreshingDeferred = new Deferred();
        const { data, error } = await this._refreshAccessToken(refreshToken);
        if (error)
          throw error;
        if (!data.session)
          throw new AuthSessionMissingError();
        await this._saveSession(data.session);
        await this._notifyAllSubscribers("TOKEN_REFRESHED", data.session);
        const result = { session: data.session, error: null };
        this.refreshingDeferred.resolve(result);
        return result;
      } catch (error) {
        this._debug(debugName, "error", error);
        if (isAuthError(error)) {
          const result = { session: null, error };
          if (!isAuthRetryableFetchError(error)) {
            await this._removeSession();
            await this._notifyAllSubscribers("SIGNED_OUT", null);
          }
          (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
          return result;
        }
        (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
        throw error;
      } finally {
        this.refreshingDeferred = null;
        this._debug(debugName, "end");
      }
    }
    async _notifyAllSubscribers(event, session, broadcast = true) {
      const debugName = `#_notifyAllSubscribers(${event})`;
      this._debug(debugName, "begin", session, `broadcast = ${broadcast}`);
      try {
        if (this.broadcastChannel && broadcast) {
          this.broadcastChannel.postMessage({ event, session });
        }
        const errors = [];
        const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
          try {
            await x.callback(event, session);
          } catch (e) {
            errors.push(e);
          }
        });
        await Promise.all(promises);
        if (errors.length > 0) {
          for (let i = 0; i < errors.length; i += 1) {
            console.error(errors[i]);
          }
          throw errors[0];
        }
      } finally {
        this._debug(debugName, "end");
      }
    }
    /**
     * set currentSession and currentUser
     * process to _startAutoRefreshToken if possible
     */
    async _saveSession(session) {
      this._debug("#_saveSession()", session);
      this.suppressGetSessionWarning = true;
      await setItemAsync(this.storage, this.storageKey, session);
    }
    async _removeSession() {
      this._debug("#_removeSession()");
      await removeItemAsync(this.storage, this.storageKey);
    }
    /**
     * Removes any registered visibilitychange callback.
     *
     * {@see #startAutoRefresh}
     * {@see #stopAutoRefresh}
     */
    _removeVisibilityChangedCallback() {
      this._debug("#_removeVisibilityChangedCallback()");
      const callback = this.visibilityChangedCallback;
      this.visibilityChangedCallback = null;
      try {
        if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
          window.removeEventListener("visibilitychange", callback);
        }
      } catch (e) {
        console.error("removing visibilitychange callback failed", e);
      }
    }
    /**
     * This is the private implementation of {@link #startAutoRefresh}. Use this
     * within the library.
     */
    async _startAutoRefresh() {
      await this._stopAutoRefresh();
      this._debug("#_startAutoRefresh()");
      const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION);
      this.autoRefreshTicker = ticker;
      if (ticker && typeof ticker === "object" && typeof ticker.unref === "function") {
        ticker.unref();
      } else if (typeof Deno !== "undefined" && typeof Deno.unrefTimer === "function") {
        Deno.unrefTimer(ticker);
      }
      setTimeout(async () => {
        await this.initializePromise;
        await this._autoRefreshTokenTick();
      }, 0);
    }
    /**
     * This is the private implementation of {@link #stopAutoRefresh}. Use this
     * within the library.
     */
    async _stopAutoRefresh() {
      this._debug("#_stopAutoRefresh()");
      const ticker = this.autoRefreshTicker;
      this.autoRefreshTicker = null;
      if (ticker) {
        clearInterval(ticker);
      }
    }
    /**
     * Starts an auto-refresh process in the background. The session is checked
     * every few seconds. Close to the time of expiration a process is started to
     * refresh the session. If refreshing fails it will be retried for as long as
     * necessary.
     *
     * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
     * to call this function, it will be called for you.
     *
     * On browsers the refresh process works only when the tab/window is in the
     * foreground to conserve resources as well as prevent race conditions and
     * flooding auth with requests. If you call this method any managed
     * visibility change callback will be removed and you must manage visibility
     * changes on your own.
     *
     * On non-browser platforms the refresh process works *continuously* in the
     * background, which may not be desirable. You should hook into your
     * platform's foreground indication mechanism and call these methods
     * appropriately to conserve resources.
     *
     * {@see #stopAutoRefresh}
     */
    async startAutoRefresh() {
      this._removeVisibilityChangedCallback();
      await this._startAutoRefresh();
    }
    /**
     * Stops an active auto refresh process running in the background (if any).
     *
     * If you call this method any managed visibility change callback will be
     * removed and you must manage visibility changes on your own.
     *
     * See {@link #startAutoRefresh} for more details.
     */
    async stopAutoRefresh() {
      this._removeVisibilityChangedCallback();
      await this._stopAutoRefresh();
    }
    /**
     * Runs the auto refresh token tick.
     */
    async _autoRefreshTokenTick() {
      this._debug("#_autoRefreshTokenTick()", "begin");
      try {
        await this._acquireLock(0, async () => {
          try {
            const now = Date.now();
            try {
              return await this._useSession(async (result) => {
                const { data: { session } } = result;
                if (!session || !session.refresh_token || !session.expires_at) {
                  this._debug("#_autoRefreshTokenTick()", "no session");
                  return;
                }
                const expiresInTicks = Math.floor((session.expires_at * 1e3 - now) / AUTO_REFRESH_TICK_DURATION);
                this._debug("#_autoRefreshTokenTick()", `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
                if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
                  await this._callRefreshToken(session.refresh_token);
                }
              });
            } catch (e) {
              console.error("Auto refresh tick failed with error. This is likely a transient error.", e);
            }
          } finally {
            this._debug("#_autoRefreshTokenTick()", "end");
          }
        });
      } catch (e) {
        if (e.isAcquireTimeout || e instanceof LockAcquireTimeoutError) {
          this._debug("auto refresh token tick lock not available");
        } else {
          throw e;
        }
      }
    }
    /**
     * Registers callbacks on the browser / platform, which in-turn run
     * algorithms when the browser window/tab are in foreground. On non-browser
     * platforms it assumes always foreground.
     */
    async _handleVisibilityChange() {
      this._debug("#_handleVisibilityChange()");
      if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
        if (this.autoRefreshToken) {
          this.startAutoRefresh();
        }
        return false;
      }
      try {
        this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false);
        window === null || window === void 0 ? void 0 : window.addEventListener("visibilitychange", this.visibilityChangedCallback);
        await this._onVisibilityChanged(true);
      } catch (error) {
        console.error("_handleVisibilityChange", error);
      }
    }
    /**
     * Callback registered with `window.addEventListener('visibilitychange')`.
     */
    async _onVisibilityChanged(calledFromInitialize) {
      const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
      this._debug(methodName, "visibilityState", document.visibilityState);
      if (document.visibilityState === "visible") {
        if (this.autoRefreshToken) {
          this._startAutoRefresh();
        }
        if (!calledFromInitialize) {
          await this.initializePromise;
          await this._acquireLock(-1, async () => {
            if (document.visibilityState !== "visible") {
              this._debug(methodName, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
              return;
            }
            await this._recoverAndRefresh();
          });
        }
      } else if (document.visibilityState === "hidden") {
        if (this.autoRefreshToken) {
          this._stopAutoRefresh();
        }
      }
    }
    /**
     * Generates the relevant login URL for a third-party provider.
     * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
     * @param options.scopes A space-separated list of scopes granted to the OAuth application.
     * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
     */
    async _getUrlForProvider(url, provider, options) {
      const urlParams = [`provider=${encodeURIComponent(provider)}`];
      if (options === null || options === void 0 ? void 0 : options.redirectTo) {
        urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
      }
      if (options === null || options === void 0 ? void 0 : options.scopes) {
        urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
      }
      if (this.flowType === "pkce") {
        const [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
        const flowParams = new URLSearchParams({
          code_challenge: `${encodeURIComponent(codeChallenge)}`,
          code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`
        });
        urlParams.push(flowParams.toString());
      }
      if (options === null || options === void 0 ? void 0 : options.queryParams) {
        const query = new URLSearchParams(options.queryParams);
        urlParams.push(query.toString());
      }
      if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
        urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
      }
      return `${url}?${urlParams.join("&")}`;
    }
    async _unenroll(params) {
      try {
        return await this._useSession(async (result) => {
          var _a;
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            return { data: null, error: sessionError };
          }
          return await _request(this.fetch, "DELETE", `${this.url}/factors/${params.factorId}`, {
            headers: this.headers,
            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
          });
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * {@see GoTrueMFAApi#enroll}
     */
    async _enroll(params) {
      try {
        return await this._useSession(async (result) => {
          var _a, _b;
          const { data: sessionData, error: sessionError } = result;
          if (sessionError) {
            return { data: null, error: sessionError };
          }
          const body = Object.assign({ friendly_name: params.friendlyName, factor_type: params.factorType }, params.factorType === "phone" ? { phone: params.phone } : { issuer: params.issuer });
          const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors`, {
            body,
            headers: this.headers,
            jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
          });
          if (error) {
            return { data: null, error };
          }
          if (params.factorType === "phone") {
            delete data.totp;
          }
          if (params.factorType === "totp" && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
            data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
          }
          return { data, error: null };
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    }
    /**
     * {@see GoTrueMFAApi#verify}
     */
    async _verify(params) {
      return this._acquireLock(-1, async () => {
        try {
          return await this._useSession(async (result) => {
            var _a;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return { data: null, error: sessionError };
            }
            const { data, error } = await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/verify`, {
              body: { code: params.code, challenge_id: params.challengeId },
              headers: this.headers,
              jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
            });
            if (error) {
              return { data: null, error };
            }
            await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + data.expires_in }, data));
            await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", data);
            return { data, error };
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * {@see GoTrueMFAApi#challenge}
     */
    async _challenge(params) {
      return this._acquireLock(-1, async () => {
        try {
          return await this._useSession(async (result) => {
            var _a;
            const { data: sessionData, error: sessionError } = result;
            if (sessionError) {
              return { data: null, error: sessionError };
            }
            return await _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/challenge`, {
              body: { channel: params.channel },
              headers: this.headers,
              jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
            });
          });
        } catch (error) {
          if (isAuthError(error)) {
            return { data: null, error };
          }
          throw error;
        }
      });
    }
    /**
     * {@see GoTrueMFAApi#challengeAndVerify}
     */
    async _challengeAndVerify(params) {
      const { data: challengeData, error: challengeError } = await this._challenge({
        factorId: params.factorId
      });
      if (challengeError) {
        return { data: null, error: challengeError };
      }
      return await this._verify({
        factorId: params.factorId,
        challengeId: challengeData.id,
        code: params.code
      });
    }
    /**
     * {@see GoTrueMFAApi#listFactors}
     */
    async _listFactors() {
      const { data: { user }, error: userError } = await this.getUser();
      if (userError) {
        return { data: null, error: userError };
      }
      const factors = (user === null || user === void 0 ? void 0 : user.factors) || [];
      const totp = factors.filter((factor) => factor.factor_type === "totp" && factor.status === "verified");
      const phone = factors.filter((factor) => factor.factor_type === "phone" && factor.status === "verified");
      return {
        data: {
          all: factors,
          totp,
          phone
        },
        error: null
      };
    }
    /**
     * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
     */
    async _getAuthenticatorAssuranceLevel() {
      return this._acquireLock(-1, async () => {
        return await this._useSession(async (result) => {
          var _a, _b;
          const { data: { session }, error: sessionError } = result;
          if (sessionError) {
            return { data: null, error: sessionError };
          }
          if (!session) {
            return {
              data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
              error: null
            };
          }
          const payload = this._decodeJWT(session.access_token);
          let currentLevel = null;
          if (payload.aal) {
            currentLevel = payload.aal;
          }
          let nextLevel = currentLevel;
          const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === "verified")) !== null && _b !== void 0 ? _b : [];
          if (verifiedFactors.length > 0) {
            nextLevel = "aal2";
          }
          const currentAuthenticationMethods = payload.amr || [];
          return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
        });
      });
    }
  };
  GoTrueClient.nextInstanceID = 0;

  // node_modules/@supabase/auth-js/dist/module/AuthClient.js
  var AuthClient = GoTrueClient;
  var AuthClient_default = AuthClient;

  // node_modules/@supabase/supabase-js/dist/module/lib/SupabaseAuthClient.js
  var SupabaseAuthClient = class extends AuthClient_default {
    constructor(options) {
      super(options);
    }
  };

  // node_modules/@supabase/supabase-js/dist/module/SupabaseClient.js
  var __awaiter8 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var SupabaseClient = class {
    /**
     * Create a new client for use in the browser.
     * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
     * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
     * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
     * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
     * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
     * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
     * @param options.realtime Options passed along to realtime-js constructor.
     * @param options.global.fetch A custom fetch implementation.
     * @param options.global.headers Any additional headers to send with each network request.
     */
    constructor(supabaseUrl, supabaseKey, options) {
      var _a, _b, _c;
      this.supabaseUrl = supabaseUrl;
      this.supabaseKey = supabaseKey;
      if (!supabaseUrl)
        throw new Error("supabaseUrl is required.");
      if (!supabaseKey)
        throw new Error("supabaseKey is required.");
      const _supabaseUrl = stripTrailingSlash(supabaseUrl);
      this.realtimeUrl = `${_supabaseUrl}/realtime/v1`.replace(/^http/i, "ws");
      this.authUrl = `${_supabaseUrl}/auth/v1`;
      this.storageUrl = `${_supabaseUrl}/storage/v1`;
      this.functionsUrl = `${_supabaseUrl}/functions/v1`;
      const defaultStorageKey = `sb-${new URL(this.authUrl).hostname.split(".")[0]}-auth-token`;
      const DEFAULTS = {
        db: DEFAULT_DB_OPTIONS,
        realtime: DEFAULT_REALTIME_OPTIONS,
        auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
        global: DEFAULT_GLOBAL_OPTIONS
      };
      const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
      this.storageKey = (_a = settings.auth.storageKey) !== null && _a !== void 0 ? _a : "";
      this.headers = (_b = settings.global.headers) !== null && _b !== void 0 ? _b : {};
      if (!settings.accessToken) {
        this.auth = this._initSupabaseAuthClient((_c = settings.auth) !== null && _c !== void 0 ? _c : {}, this.headers, settings.global.fetch);
      } else {
        this.accessToken = settings.accessToken;
        this.auth = new Proxy({}, {
          get: (_, prop) => {
            throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
          }
        });
      }
      this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
      this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers }, settings.realtime));
      this.rest = new PostgrestClient(`${_supabaseUrl}/rest/v1`, {
        headers: this.headers,
        schema: settings.db.schema,
        fetch: this.fetch
      });
      if (!settings.accessToken) {
        this._listenForAuthEvents();
      }
    }
    /**
     * Supabase Functions allows you to deploy and invoke edge functions.
     */
    get functions() {
      return new FunctionsClient(this.functionsUrl, {
        headers: this.headers,
        customFetch: this.fetch
      });
    }
    /**
     * Supabase Storage allows you to manage user-generated content, such as photos or videos.
     */
    get storage() {
      return new StorageClient(this.storageUrl, this.headers, this.fetch);
    }
    /**
     * Perform a query on a table or a view.
     *
     * @param relation - The table or view name to query
     */
    from(relation) {
      return this.rest.from(relation);
    }
    // NOTE: signatures must be kept in sync with PostgrestClient.schema
    /**
     * Select a schema to query or perform an function (rpc) call.
     *
     * The schema needs to be on the list of exposed schemas inside Supabase.
     *
     * @param schema - The schema to query
     */
    schema(schema) {
      return this.rest.schema(schema);
    }
    // NOTE: signatures must be kept in sync with PostgrestClient.rpc
    /**
     * Perform a function call.
     *
     * @param fn - The function name to call
     * @param args - The arguments to pass to the function call
     * @param options - Named parameters
     * @param options.head - When set to `true`, `data` will not be returned.
     * Useful if you only need the count.
     * @param options.get - When set to `true`, the function will be called with
     * read-only access mode.
     * @param options.count - Count algorithm to use to count rows returned by the
     * function. Only applicable for [set-returning
     * functions](https://www.postgresql.org/docs/current/functions-srf.html).
     *
     * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
     * hood.
     *
     * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
     * statistics under the hood.
     *
     * `"estimated"`: Uses exact count for low numbers and planned count for high
     * numbers.
     */
    rpc(fn, args = {}, options = {}) {
      return this.rest.rpc(fn, args, options);
    }
    /**
     * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
     *
     * @param {string} name - The name of the Realtime channel.
     * @param {Object} opts - The options to pass to the Realtime channel.
     *
     */
    channel(name, opts = { config: {} }) {
      return this.realtime.channel(name, opts);
    }
    /**
     * Returns all Realtime channels.
     */
    getChannels() {
      return this.realtime.getChannels();
    }
    /**
     * Unsubscribes and removes Realtime channel from Realtime client.
     *
     * @param {RealtimeChannel} channel - The name of the Realtime channel.
     *
     */
    removeChannel(channel) {
      return this.realtime.removeChannel(channel);
    }
    /**
     * Unsubscribes and removes all Realtime channels from Realtime client.
     */
    removeAllChannels() {
      return this.realtime.removeAllChannels();
    }
    _getAccessToken() {
      var _a, _b;
      return __awaiter8(this, void 0, void 0, function* () {
        if (this.accessToken) {
          return yield this.accessToken();
        }
        const { data } = yield this.auth.getSession();
        return (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : null;
      });
    }
    _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, storageKey, flowType, lock, debug }, headers, fetch3) {
      var _a;
      const authHeaders = {
        Authorization: `Bearer ${this.supabaseKey}`,
        apikey: `${this.supabaseKey}`
      };
      return new SupabaseAuthClient({
        url: this.authUrl,
        headers: Object.assign(Object.assign({}, authHeaders), headers),
        storageKey,
        autoRefreshToken,
        persistSession,
        detectSessionInUrl,
        storage,
        flowType,
        lock,
        debug,
        fetch: fetch3,
        // auth checks if there is a custom authorizaiton header using this flag
        // so it knows whether to return an error when getUser is called with no session
        hasCustomAuthorizationHeader: (_a = "Authorization" in this.headers) !== null && _a !== void 0 ? _a : false
      });
    }
    _initRealtimeClient(options) {
      return new RealtimeClient(this.realtimeUrl, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
    }
    _listenForAuthEvents() {
      let data = this.auth.onAuthStateChange((event, session) => {
        this._handleTokenChanged(event, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
      });
      return data;
    }
    _handleTokenChanged(event, source, token) {
      if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && this.changedAccessToken !== token) {
        this.realtime.setAuth(token !== null && token !== void 0 ? token : null);
        this.changedAccessToken = token;
      } else if (event === "SIGNED_OUT") {
        this.realtime.setAuth(this.supabaseKey);
        if (source == "STORAGE")
          this.auth.signOut();
        this.changedAccessToken = void 0;
      }
    }
  };

  // node_modules/@supabase/supabase-js/dist/module/index.js
  var createClient = (supabaseUrl, supabaseKey, options) => {
    return new SupabaseClient(supabaseUrl, supabaseKey, options);
  };

  // src/auth.ts
  var SUPABASE_URL = "https://qzunabrdemvyruvaozer.supabase.co";
  var PRODUCTION_AUTH_REDIRECT_URL = "https://renewalscope.princesankhala670.workers.dev";
  function getAuthRedirectUrl() {
    if (typeof window !== "undefined") {
      const { hostname, origin } = window.location;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return origin;
      }
    }
    return PRODUCTION_AUTH_REDIRECT_URL;
  }
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dW5hYnJkZW12eXJ1dmFvemVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NDU3MDgsImV4cCI6MjEwMjUyMTcwOH0.cE3JVKZt0Y0EO5nS1SdEimVljdudfzKhS2mHhoH0wng";
  var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  async function getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("getCurrentUser error:", error);
        return null;
      }
      return user;
    } catch (err) {
      console.error("getCurrentUser exception:", err);
      return null;
    }
  }
  async function signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl()
        }
      });
      if (error) {
        console.error("signUp error:", error);
        return { user: null, error };
      }
      return { user: data.user, error: null };
    } catch (err) {
      console.error("signUp exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Network error: Failed to connect to authentication server";
      return {
        user: null,
        error: {
          message: errorMessage,
          name: "NetworkError",
          status: 0
        }
      };
    }
  }
  async function signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        console.error("signIn error:", error);
        return { user: null, error };
      }
      return { user: data.user, error: null };
    } catch (err) {
      console.error("signIn exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Network error: Failed to connect to authentication server";
      return {
        user: null,
        error: {
          message: errorMessage,
          name: "NetworkError",
          status: 0
        }
      };
    }
  }
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("signOut error:", error);
      }
      return { error };
    } catch (err) {
      console.error("signOut exception:", err);
      return {
        error: {
          message: err instanceof Error ? err.message : "Sign out failed",
          name: "SignOutError",
          status: 0
        }
      };
    }
  }
  async function resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl()
      });
      if (error) {
        console.error("resetPassword error:", error);
      }
      return { error };
    } catch (err) {
      console.error("resetPassword exception:", err);
      return {
        error: {
          message: err instanceof Error ? err.message : "Password reset failed",
          name: "PasswordResetError",
          status: 0
        }
      };
    }
  }
  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthRedirectUrl()
        }
      });
      if (error) {
        console.error("signInWithGoogle error:", error);
        return { error };
      }
      return { error: null };
    } catch (err) {
      console.error("signInWithGoogle exception:", err);
      return {
        error: {
          message: err instanceof Error ? err.message : "Google sign-in failed",
          name: "GoogleSignInError",
          status: 0
        }
      };
    }
  }
  function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // src/entitlements.ts
  async function checkEntitlement(userId, userEmail) {
    return {
      hasProAccess: true,
      reason: "Beta access granted"
    };
  }

  // src/ui.ts
  var authState = {
    user: null,
    loading: true,
    authenticated: false
  };
  var hasProAccess = false;
  var PRODUCT_DESCRIPTIONS = {
    project_management: "RFIs, submittals, scheduling, punch lists, documents",
    quality_safety: "Inspections, incidents, observations, forms, daily log",
    project_financials: "Budgets, cost management, financial workflows",
    invoice_management: "Invoice workflows and billing",
    analytics: "Reporting, dashboards, unified data",
    pay: "Subcontractor payments, compliance, lien waivers",
    resource_tracking: "Labor, productivity, resource tracking",
    estimating: "Estimating and takeoff workflows",
    bid_management: "Bid distribution, collection, coverage"
  };
  function makeInitialState() {
    return {
      step: 1,
      annual_cost_usd: null,
      acv_usd: null,
      contract_term: "annual",
      selected_products: [],
      product_inputs: [],
      discount_status: null,
      discount_pct: null,
      discount_usd: null,
      bundle_structure: null,
      credits_usd: null,
      rate_protection_status: null,
      renewal_increase_pct: null,
      tier_changed: null,
      packaging_changed: null,
      expected_next_year_acv_usd: null,
      construction_type: null,
      target_savings_pct: null,
      before_annual_cost_usd: null,
      after_annual_cost_usd: null
    };
  }
  var state = makeInitialState();
  var lastInput = null;
  var lastOutput = null;
  var USAGE_LABELS = {
    CRITICAL: "Used daily",
    REGULAR: "Used weekly",
    OCCASIONAL: "Used occasionally",
    RARELY: "Used rarely",
    NOT_USED: "Not used",
    NOT_SURE: "Not sure"
  };
  var REQUIREMENT_LABELS = {
    BUSINESS_CRITICAL: "Business critical",
    CLIENT_CONTRACT: "Client/contract requirement",
    INTERNAL_POLICY: "Internal policy",
    NOT_REQUIRED: "Not required",
    NOT_SURE: "Not sure"
  };
  var DEPENDENCY_LABELS = {
    YES: "Dependency confirmed",
    NO: "No known dependency",
    NOT_SURE: "Dependency unknown"
  };
  function $(id) {
    return document.getElementById(id);
  }
  function fmtUSD(n) {
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  function fmtRate(n) {
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  function setHidden(id, hidden) {
    const el = $(id);
    if (el) el.hidden = hidden;
  }
  function showError(containerId, msg) {
    const el = $(containerId);
    if (el) el.innerHTML = `<div class="error-msg">${msg}</div>`;
  }
  function clearError(containerId) {
    const el = $(containerId);
    if (el) el.innerHTML = "";
  }
  function updateProgress() {
    const fill = $("progress-fill");
    const text = $("progress-text");
    if (fill) fill.style.width = `${state.step / 5 * 100}%`;
    if (text) text.textContent = `Step ${state.step} of 5`;
  }
  function goToStep(n) {
    for (let i = 1; i <= 5; i++) setHidden(`step-${i}`, i !== n);
    state.step = n;
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function validateStep1() {
    const cost = $("annual_cost_usd")?.value;
    const acv = $("acv_usd")?.value;
    if (!cost || parseFloat(cost) <= 0) return "Please enter a valid annual spend greater than 0.";
    if (!acv || parseFloat(acv) <= 0) return "Please enter a valid ACV greater than 0.";
    return null;
  }
  function saveStep1() {
    state.annual_cost_usd = parseFloat($("annual_cost_usd").value);
    state.acv_usd = parseFloat($("acv_usd").value);
    const term = $("contract_term").value;
    state.contract_term = term || "annual";
  }
  function renderProductCards() {
    const container = $("product-cards");
    if (!container) return;
    const products = PRODUCT_CATALOG.filter((p) => p.mvp_supported === true);
    container.innerHTML = products.map((p) => {
      const desc = PRODUCT_DESCRIPTIONS[p.id] ?? "";
      const sel = state.selected_products.includes(p.id);
      return `<div class="product-card${sel ? " selected" : ""}" data-product-id="${p.id}" role="checkbox" aria-checked="${sel}" tabindex="0"><div class="pc-label">${p.label}</div><div class="pc-desc">${desc}</div></div>`;
    }).join("");
    container.querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", () => toggleProduct(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggleProduct(card);
        }
      });
    });
  }
  function toggleProduct(card) {
    const id = card.dataset["productId"] ?? "";
    if (!id) return;
    if (state.selected_products.includes(id)) {
      state.selected_products = state.selected_products.filter((p) => p !== id);
      card.classList.remove("selected");
      card.setAttribute("aria-checked", "false");
    } else {
      state.selected_products.push(id);
      card.classList.add("selected");
      card.setAttribute("aria-checked", "true");
    }
  }
  function validateStep2() {
    if (state.selected_products.length === 0) return "Please select at least one product.";
    return null;
  }
  function renderProductDetails() {
    const container = $("product-details");
    if (!container) return;
    container.innerHTML = state.selected_products.map((pid) => {
      const prod = PRODUCT_CATALOG.find((p) => p.id === pid);
      const label = prod?.label ?? pid;
      const ex = state.product_inputs.find((pi) => pi.product_id === pid);
      const u = ex?.usage ?? "";
      const r = ex?.requirement ?? "";
      const rep = ex?.replacement ?? "";
      const d = ex?.dependency ?? "";
      const price = ex?.annual_price_usd ?? "";
      const opt = (val, label2, cur) => `<option value="${val}"${cur === val ? " selected" : ""}>${label2}</option>`;
      return `<div class="product-detail-block" data-product-id="${pid}"><div class="pd-heading">${label}</div><div class="pd-grid"><div class="field"><label>Usage</label><select class="pd-usage"><option value="">Select\u2026</option>` + opt("CRITICAL" /* CRITICAL */, "Used daily", u) + opt("REGULAR" /* REGULAR */, "Used weekly", u) + opt("OCCASIONAL" /* OCCASIONAL */, "Used occasionally", u) + opt("RARELY" /* RARELY */, "Used rarely", u) + opt("NOT_USED" /* NOT_USED */, "Not used", u) + opt("NOT_SURE" /* NOT_SURE */, "Not sure", u) + `</select></div><div class="field"><label>Business Requirement</label><select class="pd-requirement"><option value="">Select\u2026</option>` + opt("BUSINESS_CRITICAL" /* BUSINESS_CRITICAL */, "Business critical", r) + opt("CLIENT_CONTRACT" /* CLIENT_CONTRACT */, "Client contract requirement", r) + opt("INTERNAL_POLICY" /* INTERNAL_POLICY */, "Internal policy requirement", r) + opt("NOT_REQUIRED" /* NOT_REQUIRED */, "Not required", r) + opt("NOT_SURE" /* NOT_SURE */, "Not sure", r) + `</select></div><div class="field"><label>Replacement Option</label><select class="pd-replacement"><option value="">Select\u2026</option>` + opt("ANOTHER_TOOL" /* ANOTHER_TOOL */, "Another tool available", rep) + opt("INTERNAL_PROCESS" /* INTERNAL_PROCESS */, "Internal process", rep) + opt("NOT_NEEDED" /* NOT_NEEDED */, "Not needed if removed", rep) + opt("NO_REPLACEMENT" /* NO_REPLACEMENT */, "No replacement exists", rep) + opt("NOT_SURE" /* NOT_SURE */, "Not sure", rep) + `</select></div><div class="field"><label>Has Dependencies</label><select class="pd-dependency"><option value="">Select\u2026</option>` + opt("YES" /* YES */, "Yes, has dependencies", d) + opt("NO" /* NO */, "No dependencies", d) + opt("NOT_SURE" /* NOT_SURE */, "Not sure", d) + `</select></div></div><div class="field" style="max-width:240px;margin-top:8px;"><label>Line-item annual price (USD)<span class="hint">Optional</span></label><input type="number" class="pd-price" placeholder="24000" min="0" value="${price}" /></div></div>`;
    }).join("");
  }
  function validateStep3() {
    const blocks = document.querySelectorAll(".product-detail-block");
    for (const block of blocks) {
      const pid = block.dataset["productId"] ?? "";
      const prod = PRODUCT_CATALOG.find((p) => p.id === pid);
      const label = prod?.label ?? pid;
      if (!block.querySelector(".pd-usage")?.value) return `Please select usage for ${label}.`;
      if (!block.querySelector(".pd-requirement")?.value) return `Please select a requirement for ${label}.`;
      if (!block.querySelector(".pd-replacement")?.value) return `Please select a replacement option for ${label}.`;
      if (!block.querySelector(".pd-dependency")?.value) return `Please select dependency status for ${label}.`;
    }
    return null;
  }
  function saveStep3() {
    const inputs = [];
    document.querySelectorAll(".product-detail-block").forEach((block) => {
      const pid = block.dataset["productId"];
      if (!pid) return;
      const usage = block.querySelector(".pd-usage").value;
      const requirement = block.querySelector(".pd-requirement").value;
      const replacement = block.querySelector(".pd-replacement").value;
      const dependency = block.querySelector(".pd-dependency").value;
      const priceVal = block.querySelector(".pd-price")?.value;
      const input = { product_id: pid, usage, requirement, replacement, dependency };
      if (priceVal && parseFloat(priceVal) > 0) input.annual_price_usd = parseFloat(priceVal);
      inputs.push(input);
    });
    state.product_inputs = inputs;
  }
  function updateDiscountFields() {
    const ds = $("discount_status")?.value ?? "";
    const pf = $("discount-pct-field");
    const uf = $("discount-usd-field");
    if (pf) pf.hidden = ds !== "PCT_KNOWN" /* PCT_KNOWN */;
    if (uf) uf.hidden = ds !== "USD_KNOWN" /* USD_KNOWN */;
  }
  function saveStep4() {
    const ds = $("discount_status")?.value ?? "";
    state.discount_status = ds ? ds : null;
    const dpct = $("discount_pct")?.value ?? "";
    state.discount_pct = dpct ? parseFloat(dpct) : null;
    const dusd = $("discount_usd")?.value ?? "";
    state.discount_usd = dusd ? parseFloat(dusd) : null;
    const bs = $("bundle_structure")?.value ?? "";
    state.bundle_structure = bs ? bs : null;
    const credits = $("credits_usd")?.value ?? "";
    state.credits_usd = credits ? parseFloat(credits) : null;
    const rp = $("rate_protection_status")?.value ?? "";
    state.rate_protection_status = rp ? rp : null;
    const ri = $("renewal_increase_pct")?.value ?? "";
    state.renewal_increase_pct = ri ? parseFloat(ri) : null;
    const tc = $("tier_changed")?.value ?? "";
    state.tier_changed = tc ? tc : null;
    const pc = $("packaging_changed")?.value ?? "";
    state.packaging_changed = pc ? pc : null;
    const eny = $("expected_next_year_acv_usd")?.value ?? "";
    state.expected_next_year_acv_usd = eny ? parseFloat(eny) : null;
    const ct = $("construction_type")?.value ?? "";
    state.construction_type = ct ? ct : null;
    const tsp = $("target_savings_pct")?.value ?? "";
    state.target_savings_pct = tsp ? parseInt(tsp, 10) : null;
    const bef = $("before_annual_cost_usd")?.value ?? "";
    state.before_annual_cost_usd = bef ? parseFloat(bef) : null;
    const aft = $("after_annual_cost_usd")?.value ?? "";
    state.after_annual_cost_usd = aft ? parseFloat(aft) : null;
  }
  function renderReview() {
    const container = $("review-summary");
    if (!container) return;
    const termLabel = state.contract_term === "annual" ? "Annual" : state.contract_term === "multi_year" ? "Multi-year" : "Other";
    const productLabels = state.selected_products.map((id) => PRODUCT_CATALOG.find((p) => p.id === id)?.label ?? id).join(", ") || "\u2014";
    const rows = [
      ["Annual Spend", state.annual_cost_usd != null ? fmtUSD(state.annual_cost_usd) : "\u2014"],
      ["ACV", state.acv_usd != null ? fmtUSD(state.acv_usd) : "\u2014"],
      ["Contract Term", termLabel],
      ["Products", productLabels]
    ];
    if (state.discount_status) rows.push(["Discount Status", state.discount_status.replace(/_/g, " ")]);
    if (state.discount_pct != null) rows.push(["Discount %", `${state.discount_pct}%`]);
    if (state.discount_usd != null) rows.push(["Discount USD", fmtUSD(state.discount_usd)]);
    if (state.bundle_structure) rows.push(["Bundle", state.bundle_structure]);
    if (state.credits_usd != null) rows.push(["Credits", fmtUSD(state.credits_usd)]);
    if (state.rate_protection_status) rows.push(["Rate Protection", state.rate_protection_status]);
    if (state.renewal_increase_pct != null) rows.push(["Renewal Increase", `${state.renewal_increase_pct}%`]);
    if (state.tier_changed) rows.push(["Tier Changed", state.tier_changed.replace(/_/g, " ")]);
    if (state.packaging_changed) rows.push(["Packaging Changed", state.packaging_changed.replace(/_/g, " ")]);
    if (state.expected_next_year_acv_usd != null) rows.push(["Expected Next-Year ACV", fmtUSD(state.expected_next_year_acv_usd)]);
    if (state.construction_type) rows.push(["Construction Type", state.construction_type.replace(/_/g, " ")]);
    if (state.target_savings_pct != null) rows.push(["Savings Target", `${state.target_savings_pct}%`]);
    if (state.before_annual_cost_usd != null) rows.push(["Before Quote", fmtUSD(state.before_annual_cost_usd)]);
    if (state.after_annual_cost_usd != null) rows.push(["After Quote", fmtUSD(state.after_annual_cost_usd)]);
    container.innerHTML = `<table class="review-table"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>` + rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("") + `</tbody></table>`;
  }
  function runLoadingAnimation() {
    return new Promise((resolve) => {
      let i = 0;
      function tick() {
        const li = $(`ls-${i}`);
        if (li) {
          li.classList.add("done");
          const check = li.querySelector(".check");
          if (check) check.textContent = "\u2713";
        }
        i++;
        if (i < 5) {
          setTimeout(tick, 300);
        } else {
          setTimeout(resolve, 200);
        }
      }
      setTimeout(tick, 300);
    });
  }
  function buildEngineInput() {
    const input = {
      annual_cost_usd: state.annual_cost_usd,
      acv_usd: state.acv_usd,
      contract_term: state.contract_term === "other" ? "annual" : state.contract_term,
      products: state.selected_products,
      product_inputs: state.product_inputs
    };
    if (state.discount_status) input["discount_status"] = state.discount_status;
    if (state.discount_pct != null) input["discount_pct"] = state.discount_pct;
    if (state.discount_usd != null) input["discount_usd"] = state.discount_usd;
    if (state.bundle_structure) input["bundle_structure"] = state.bundle_structure;
    if (state.credits_usd != null) input["credits_usd"] = state.credits_usd;
    if (state.rate_protection_status) input["rate_protection_status"] = state.rate_protection_status;
    if (state.renewal_increase_pct != null) input["renewal_increase_pct"] = state.renewal_increase_pct;
    if (state.tier_changed) input["tier_changed"] = state.tier_changed;
    if (state.packaging_changed) input["packaging_changed"] = state.packaging_changed;
    if (state.expected_next_year_acv_usd != null) input["expected_next_year_acv_usd"] = state.expected_next_year_acv_usd;
    if (state.construction_type) input["construction_type"] = state.construction_type;
    if (state.target_savings_pct != null) input["target_savings_pct"] = state.target_savings_pct;
    if (state.before_annual_cost_usd != null) input["before_annual_cost_usd"] = state.before_annual_cost_usd;
    if (state.after_annual_cost_usd != null) input["after_annual_cost_usd"] = state.after_annual_cost_usd;
    return input;
  }
  function verdictLabel(v) {
    switch (v) {
      case "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */:
        return "Verified Savings";
      case "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */:
        return "Savings Identified";
      case "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */:
        return "Opportunity Identified";
      case "NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */:
        return "No Defensible Savings";
      default:
        return String(v).replace(/_/g, " ");
    }
  }
  function renderExecutiveSummary(output) {
    const container = $("results-executive-summary");
    if (!container) return;
    const fr = output.free_result;
    const isVerified = fr.verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */;
    const showSavings = isVerified && fr.savings_amount != null && fr.savings_amount > 0;
    const candidateCount = output.candidates?.candidates.length ?? 0;
    const blockedCount = output.candidates?.blocked.length ?? 0;
    const stat = (label, value, cls = "") => `<div class="exec-stat"><div class="exec-stat-label">${label}</div><div class="exec-stat-value${cls ? " " + cls : ""}">${value}</div></div>`;
    let statsHtml = stat("Current Annual Spend", fmtUSD(fr.current_spend));
    if (showSavings) statsHtml += stat("Verified Savings", fmtUSD(fr.savings_amount), "green");
    statsHtml += stat("Optimization Candidates", String(candidateCount));
    statsHtml += stat("Blocked Products", String(blockedCount));
    statsHtml += stat("Verdict", verdictLabel(fr.verdict));
    let noticesHtml = "";
    const topWarnings = output.warnings.slice(0, 2);
    if (topWarnings.length > 0)
      noticesHtml += `<div class="alert warning" style="margin-top:16px;"><strong>Notices:</strong><br>` + topWarnings.map((w) => `\u2022 ${w}`).join("<br>") + `</div>`;
    const topAssumptions = output.assumptions.slice(0, 2);
    if (topAssumptions.length > 0)
      noticesHtml += `<div class="alert info" style="margin-top:12px;"><strong>Commercial Assumptions:</strong><br>` + topAssumptions.map((a) => `\u2022 ${a}`).join("<br>") + `</div>`;
    container.innerHTML = `<div class="card"><div class="card-title">Executive Summary</div><div class="exec-summary-grid">${statsHtml}</div>${noticesHtml}</div>`;
  }
  function renderProductAudit(output) {
    const container = $("results-product-audit");
    if (!container) return;
    const productInputs = lastInput?.["product_inputs"] ?? [];
    if (productInputs.length === 0) {
      container.innerHTML = "";
      return;
    }
    const rows = productInputs.map((pi) => {
      const prod = PRODUCT_CATALOG.find((p) => p.id === pi.product_id);
      const candInfo = getCandidateStatus(pi.product_id, output);
      return {
        name: prod?.label ?? pi.product_id,
        usage: USAGE_LABELS[pi.usage] ?? pi.usage,
        req: REQUIREMENT_LABELS[pi.requirement] ?? pi.requirement,
        dep: DEPENDENCY_LABELS[pi.dependency] ?? pi.dependency,
        spend: pi.annual_price_usd != null ? fmtUSD(pi.annual_price_usd) + "/yr" : "\u2014",
        candStatus: candInfo.status,
        why: candInfo.why,
        savStatus: getSavingsStatus(pi.product_id, output)
      };
    });
    const tableRows = rows.map(
      (r) => `<tr><td><strong>${r.name}</strong></td><td>${r.usage}</td><td>${r.req}</td><td>${r.dep}</td><td>${r.spend}</td><td>${r.candStatus}</td><td>${r.savStatus || "\u2014"}</td><td>${r.why || "\u2014"}</td></tr>`
    ).join("");
    const cards = rows.map(
      (r) => `<div class="audit-card"><div class="audit-card-title">${r.name}</div><div class="audit-card-row"><span class="audit-card-label">Usage</span><span>${r.usage}</span></div><div class="audit-card-row"><span class="audit-card-label">Requirement</span><span>${r.req}</span></div><div class="audit-card-row"><span class="audit-card-label">Dependency</span><span>${r.dep}</span></div><div class="audit-card-row"><span class="audit-card-label">Spend</span><span>${r.spend}</span></div><div class="audit-card-row"><span class="audit-card-label">Status</span><span>${r.candStatus}</span></div>` + (r.savStatus ? `<div class="audit-card-row"><span class="audit-card-label">Savings</span><span>${r.savStatus}</span></div>` : "") + (r.why ? `<div class="audit-card-row"><span class="audit-card-label">Note</span><span>${r.why}</span></div>` : "") + `</div>`
    ).join("");
    container.innerHTML = `<div class="card"><div class="card-title">Product Audit</div><div style="overflow-x:auto;"><table class="audit-table"><thead><tr><th>Product</th><th>Usage</th><th>Requirement</th><th>Dependency</th><th>Line-item Spend</th><th>Candidate Status</th><th>Savings Status</th><th>Note</th></tr></thead><tbody>${tableRows}</tbody></table></div><div id="audit-cards-mobile">${cards}</div></div>`;
  }
  function renderCounterfactualSection(output) {
    const container = $("results-counterfactual");
    if (!container) return;
    const cfResults = output.counterfactual?.counterfactual_results ?? [];
    if (cfResults.length === 0) {
      container.innerHTML = "";
      return;
    }
    const cards = cfResults.map((cf) => {
      const prod = PRODUCT_CATALOG.find((p) => p.id === cf.candidate.product_id);
      const name = prod?.label ?? cf.candidate.product_id;
      const rc = cf.result_class;
      const isCommOpp = rc === "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */ && (cf.dollar_saving == null || cf.dollar_saving === 0);
      const displayClass = rc;
      const badgeLabel = isCommOpp ? "COMMERCIAL OPPORTUNITY" : rc === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ ? "VERIFIED BEFORE/AFTER" : rc === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */ ? "OPPORTUNITY \u2014 NOT QUANTIFIABLE" : rc.replace(/_/g, " ");
      const badgeCls = rc === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ || rc === "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */ && !isCommOpp ? "VERIFIED_BEFORE_AFTER" : rc === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */ ? "OPPORTUNITY_NOT_QUANTIFIABLE" : "NO_DEFENSIBLE_SAVINGS_IDENTIFIED";
      let extraHtml = "";
      if (rc === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ && cf.dollar_saving != null && cf.dollar_saving > 0)
        extraHtml = `<div class="cf-saving">Verified quote-to-quote difference: ${fmtUSD(cf.dollar_saving)}/year</div>`;
      else if (rc === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */)
        extraHtml = `<div class="cf-opportunity">Savings not yet quantifiable</div>`;
      return `<div class="cf-result-card ${displayClass}"><div class="cf-card-header"><span class="cf-product-name">${name}</span><span class="result-badge ${badgeCls}">${badgeLabel}</span></div><div class="cf-explanation">${cf.explanation}</div>${extraHtml}</div>`;
    }).join("");
    container.innerHTML = `<div class="card"><div class="card-title">Counterfactual Analysis</div>${cards}</div>`;
  }
  function evidenceSourceType(id) {
    if (id.startsWith("REDDIT-")) return "Customer observation (Reddit)";
    if (id.startsWith("WEB-")) return "Web/secondary source";
    if (id.startsWith("PQ-")) return "Public procurement quote";
    return "Public observation";
  }
  function renderEvidenceSection(output) {
    const container = $("results-evidence");
    if (!container) return;
    const trailIds = output.paid_report.evidence_trail ?? [];
    const benchIds = output.benchmark?.comparable_evidence_ids ?? [];
    const allIds = [.../* @__PURE__ */ new Set([...trailIds, ...benchIds])];
    if (allIds.length === 0) {
      container.innerHTML = "";
      return;
    }
    const items = allIds.map(
      (id) => `<div class="evidence-item"><details><summary>${id} \u2014 ${evidenceSourceType(id)}</summary><div class="ev-meta"><div class="ev-meta-row"><span class="ev-meta-label">Source type:</span> ${evidenceSourceType(id)}</div><div class="ev-meta-row"><span class="ev-meta-label">Supports:</span> Benchmark context and effective rate comparison</div><div class="ev-meta-row"><span class="ev-meta-label">Does not support:</span> Exact post-removal renewal pricing</div></div></details></div>`
    ).join("");
    container.innerHTML = `<div class="card"><div class="card-title">Evidence Trail</div><p class="section-note">Evidence IDs referenced in this analysis. Expand each to see source context.</p>${items}</div>`;
  }
  function generatePDF(output, input) {
    const jspdfLib = window.jspdf;
    if (!jspdfLib) {
      alert("PDF library not loaded. Please refresh the page and try again.");
      return;
    }
    const doc = new jspdfLib.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const pageH = 297;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;
    const maxY = pageH - 35;
    const forest = [18, 59, 42];
    const green = [31, 138, 91];
    const mint = [234, 247, 240];
    const charcoal = [27, 31, 30];
    const muted = [107, 114, 128];
    const amber = [217, 119, 6];
    const red = [220, 38, 38];
    const dateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0].replace(/-/g, "");
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const reportId = `RS-${dateStr}-${randomHex}`;
    let pageNum = 0;
    function addPage() {
      doc.addPage();
      pageNum++;
      addPageHeader();
      y = 32;
    }
    function checkPage(needed = 15) {
      if (y + needed > maxY) {
        addPage();
      }
    }
    function addWatermark() {
      doc.setTextColor(31, 138, 91);
      doc.setFontSize(60);
      doc.setFont("helvetica", "bold");
      const txt = "RenewalScope";
      const txtW = doc.getTextWidth(txt);
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.03 }));
      doc.text(txt, (pageW - txtW) / 2, pageH / 2, { angle: -45 });
      doc.restoreGraphicsState();
    }
    function addPageHeader() {
      if (pageNum === 0) return;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...forest);
      doc.text("RenewalScope", margin, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...muted);
      doc.text("Procore Renewal Analysis", margin + 45, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(reportId, pageW - margin, 15, { align: "right" });
      doc.setDrawColor(...green);
      doc.setLineWidth(0.5);
      doc.line(margin, 18, pageW - margin, 18);
      addWatermark();
    }
    function addPageFooter(current, total) {
      const footerY = pageH - 20;
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 5, pageW - margin, footerY - 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...forest);
      doc.text("RenewalScope", margin, footerY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text("Evidence-backed renewal intelligence.", margin, footerY + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      if (current > 0) {
        doc.text(`Page ${current} of ${total}`, pageW - margin, footerY, { align: "right" });
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...muted);
      doc.text("Independent analysis \xB7 Not affiliated with Procore Technologies, Inc.", pageW / 2, footerY + 4, { align: "center" });
    }
    function h1(text) {
      checkPage(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...forest);
      doc.text(text, margin, y);
      y += 12;
    }
    function h2(text) {
      checkPage(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...green);
      doc.text(text, margin, y);
      y += 10;
    }
    function h3(text) {
      checkPage(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...charcoal);
      doc.text(text, margin, y);
      y += 8;
    }
    function body(text, color = charcoal) {
      checkPage(10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentW);
      lines.forEach((line) => {
        checkPage(6);
        doc.text(line, margin, y);
        y += 5;
      });
    }
    function badge(text, color) {
      const colors = {
        green: { bg: [209, 250, 229], text: [6, 95, 70] },
        amber: { bg: [254, 243, 199], text: [146, 64, 14] },
        gray: { bg: [243, 244, 246], text: [75, 85, 99] },
        red: { bg: [254, 226, 226], text: [153, 27, 27] }
      };
      const c = colors[color];
      doc.setFillColor(...c.bg);
      doc.setDrawColor(...c.bg);
      const w = doc.getTextWidth(text) + 6;
      doc.roundedRect(margin, y - 4, w, 6, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...c.text);
      doc.text(text, margin + 3, y);
      y += 6;
    }
    function divider() {
      checkPage(8);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
    }
    function metricCard(label, value, color = "default") {
      const cardW = 85;
      const cardH = 28;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, cardW, cardH, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(label.toUpperCase(), margin + 6, y + 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      if (color === "green") {
        doc.setTextColor(...green);
      } else {
        doc.setTextColor(...charcoal);
      }
      doc.text(value, margin + 6, y + 20);
      return { w: cardW, h: cardH };
    }
    pageNum = 0;
    doc.setFillColor(...forest);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.text("RenewalScope", pageW / 2, 35, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(234, 247, 240);
    doc.text("Evidence-backed renewal intelligence.", pageW / 2, 45, { align: "center" });
    doc.setFillColor(31, 138, 91);
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    const points = [[pageW * 0.6, 70], [pageW, 70], [pageW, 120], [pageW * 0.7, 120]];
    doc.triangle(points[0][0], points[0][1], points[1][0], points[1][1], points[2][0], points[2][1], "F");
    doc.restoreGraphicsState();
    y = 95;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...forest);
    doc.text("Procore Renewal Analysis", pageW / 2, y, { align: "center" });
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...muted);
    doc.text("Evidence-based commercial review & negotiation guidance", pageW / 2, y, { align: "center" });
    y += 35;
    const metaX = 45;
    doc.setFillColor(248, 250, 249);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(metaX, y, 120, 65, 3, 3, "FD");
    const metaY = y + 12;
    const rowH = 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    let my = metaY;
    doc.text("PREPARED FOR:", metaX + 10, my);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    doc.text("Customer", metaX + 10, my + 5);
    my += rowH + 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("REPORT ID:", metaX + 10, my);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    doc.text(reportId, metaX + 10, my + 5);
    my += rowH + 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("GENERATED:", metaX + 10, my);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    const dateFormatted = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    doc.text(dateFormatted, metaX + 10, my + 5);
    my += rowH + 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("ANALYSIS TYPE:", metaX + 10, my);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    doc.text("Renewal Optimization", metaX + 10, my + 5);
    my += rowH + 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("CONTRACT TERM:", metaX + 10, my);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...charcoal);
    const term = String(input["contract_term"] ?? "Annual");
    doc.text(term.charAt(0).toUpperCase() + term.slice(1), metaX + 10, my + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text("Independent analysis \xB7 Not affiliated with Procore Technologies, Inc.", pageW / 2, pageH - 15, { align: "center" });
    addPageFooter(0, 1);
    addPage();
    h1("Executive Summary");
    y += 5;
    const fr = output.free_result;
    if (fr.verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */) {
      badge("VERIFIED SAVINGS IDENTIFIED", "green");
    } else if (fr.verdict === "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */) {
      badge("SAVINGS IDENTIFIED", "green");
    } else if (fr.verdict === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */) {
      badge("OPPORTUNITY IDENTIFIED \u2014 SAVINGS NOT QUANTIFIABLE", "amber");
    } else {
      badge("NO DEFENSIBLE SAVINGS IDENTIFIED", "gray");
    }
    y += 8;
    const startY = y;
    metricCard("CURRENT ANNUAL SPEND", fmtUSD(fr.current_spend));
    if (fr.verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ && fr.savings_amount != null && fr.savings_amount > 0) {
      const card = metricCard("VERIFIED SAVINGS", fmtUSD(fr.savings_amount) + " / year", "green");
      y = startY;
      metricCard("CURRENT ANNUAL SPEND", fmtUSD(fr.current_spend));
      doc.text("", margin + 90, y);
      y = startY;
      const origMargin = margin;
      doc.internal.pageSize.width;
      doc.text("", 0, 0);
      const saveY = y;
      const saveMargin = margin;
      const offsetX = 95;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(margin + offsetX, y, 85, 28, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text("VERIFIED SAVINGS", margin + offsetX + 6, y + 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...green);
      doc.text(fmtUSD(fr.savings_amount) + " / year", margin + offsetX + 6, y + 20);
      y = saveY + 32;
    } else {
      y += 32;
    }
    const row2Y = y;
    const candCount = output.candidates?.candidates.length ?? 0;
    metricCard("OPTIMIZATION CANDIDATES", String(candCount));
    const blockedCount = output.candidates?.blocked.length ?? 0;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin + 95, row2Y, 85, 28, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text("BLOCKED PRODUCTS", margin + 95 + 6, row2Y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...charcoal);
    doc.text(String(blockedCount), margin + 95 + 6, row2Y + 20);
    y = row2Y + 35;
    body(fr.explanation);
    y += 5;
    divider();
    checkPage(60);
    h2("Commercial Baseline");
    y += 3;
    const kv = (label, value) => {
      checkPage(8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...muted);
      doc.text(label + ":", margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...charcoal);
      doc.text(value, margin + 55, y);
      y += 7;
    };
    kv("Annual Spend", fmtUSD(fr.current_spend));
    kv("ACV", fmtUSD(Number(input["acv_usd"] ?? 0)));
    kv("Contract Term", String(input["contract_term"] ?? "Annual"));
    if (input["renewal_increase_pct"]) {
      kv("Renewal Increase", input["renewal_increase_pct"] + "%");
    }
    if (input["discount_pct"]) {
      kv("Discount", input["discount_pct"] + "%");
    }
    if (input["bundle_structure"]) {
      kv("Bundle Structure", String(input["bundle_structure"]).replace(/_/g, " "));
    }
    if (fr.effective_rate != null) {
      kv("Effective Rate", fmtRate(fr.effective_rate) + " per $1M ACV");
    }
    if (fr.benchmark_position) {
      kv("Benchmark Position", fr.benchmark_position.replace(/_/g, " ").toUpperCase());
    }
    y += 5;
    divider();
    const bm = output.benchmark;
    if (bm?.min_evidence_count_met) {
      h2("Benchmark Context");
      y += 3;
      body("Directional benchmark from public observations; not an official Procore price list.", muted);
      y += 5;
      kv("Your Rate", fmtRate(bm.user_rate) + " per $1M ACV");
      kv("25th Percentile", fmtRate(bm.stats.p25));
      kv("Median (50th)", fmtRate(bm.stats.p50));
      kv("75th Percentile", fmtRate(bm.stats.p75));
      kv("Observed Range", fmtRate(bm.stats.min) + " - " + fmtRate(bm.stats.max));
      kv("Evidence Count", String(bm.stats.count));
      y += 5;
      divider();
    }
    const productInputs = input["product_inputs"] ?? [];
    if (productInputs.length > 0) {
      checkPage(40);
      h2("Product Audit");
      y += 5;
      productInputs.forEach((pi) => {
        checkPage(25);
        const prod = PRODUCT_CATALOG.find((p) => p.id === pi.product_id);
        const name = prod?.label ?? pi.product_id;
        const cs = getCandidateStatus(pi.product_id, output);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(...forest);
        doc.text(name, margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...muted);
        const details = [
          `Usage: ${USAGE_LABELS[pi.usage] ?? pi.usage}`,
          `Requirement: ${REQUIREMENT_LABELS[pi.requirement] ?? pi.requirement}`,
          `Dependency: ${DEPENDENCY_LABELS[pi.dependency] ?? pi.dependency}`
        ];
        if (pi.annual_price_usd != null) {
          details.push(`Annual Spend: ${fmtUSD(pi.annual_price_usd)}`);
        }
        details.push(`Status: ${cs.status}`);
        const sav = getSavingsStatus(pi.product_id, output);
        if (sav) {
          details.push(`Savings: ${sav}`);
        }
        details.forEach((d) => {
          doc.text("  \u2022 " + d, margin + 2, y);
          y += 5;
        });
        y += 3;
      });
      divider();
    }
    const cfResults = output.counterfactual?.counterfactual_results ?? [];
    if (cfResults.length > 0) {
      checkPage(30);
      h2("Counterfactual Analysis");
      y += 3;
      body("Testing alternative configurations against available evidence.", muted);
      y += 8;
      cfResults.forEach((cf) => {
        checkPage(35);
        const prod = PRODUCT_CATALOG.find((p) => p.id === cf.candidate.product_id);
        const name = prod?.label ?? cf.candidate.product_id;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...green);
        doc.text(name, margin, y);
        y += 7;
        if (cf.result_class === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */) {
          badge("VERIFIED QUOTE-TO-QUOTE DIFFERENCE", "green");
          y += 2;
        } else if (cf.result_class === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */) {
          badge("SAVINGS NOT YET QUANTIFIABLE", "amber");
          y += 2;
        }
        body(cf.explanation);
        y += 3;
        if (cf.result_class === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ && cf.dollar_saving != null && cf.dollar_saving > 0) {
          doc.setFillColor(...mint);
          doc.setDrawColor(...green);
          doc.roundedRect(margin, y, contentW, 12, 2, 2, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...green);
          doc.text("Verified quote-to-quote difference: " + fmtUSD(cf.dollar_saving) + "/year", margin + 6, y + 8);
          y += 15;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(...muted);
          body("Attribution to a specific product is not established from quote amounts alone.", muted);
        }
        y += 5;
      });
      divider();
    }
    const trailIds = output.paid_report.evidence_trail ?? [];
    const benchIds = output.benchmark?.comparable_evidence_ids ?? [];
    const allEvidence = [.../* @__PURE__ */ new Set([...trailIds, ...benchIds])];
    if (allEvidence.length > 0) {
      checkPage(30);
      h2("Evidence Trail");
      y += 3;
      body("Evidence sources referenced in this analysis.", muted);
      y += 8;
      allEvidence.forEach((evidenceId) => {
        checkPage(18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...charcoal);
        doc.text(evidenceId, margin, y);
        y += 6;
        const sourceType = evidenceId.startsWith("REDDIT-") ? "Customer observation (Reddit)" : evidenceId.startsWith("WEB-") ? "Web/secondary source" : evidenceId.startsWith("PQ-") ? "Public procurement quote" : "Public observation";
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...muted);
        doc.text("  Source: " + sourceType, margin + 2, y);
        y += 5;
        doc.text("  Supports: Benchmark context and effective rate comparison", margin + 2, y);
        y += 5;
        doc.text("  Does not support: Exact post-removal renewal pricing", margin + 2, y);
        y += 8;
      });
      divider();
    }
    const qes = output.paid_report.quote_evidence_summary;
    if (qes && qes.records.length > 0) {
      checkPage(40);
      h2("Public Quote Evidence Summary");
      y += 3;
      body(
        `${qes.usable_records} usable public quote observations from public procurement records. ${qes.excluded_records} excluded (pooled structure, incomplete, or commercial-structure-only records). These are PUBLIC QUOTE OBSERVATIONS \u2014 not an official Procore price list. No individual record establishes a universal module price or guaranteed removal saving.`,
        muted
      );
      y += 8;
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(217, 119, 6);
      doc.roundedRect(margin, y, contentW, 9, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(146, 64, 14);
      doc.text("CONTEXTUAL EVIDENCE ONLY \u2014 No savings are guaranteed from these observations", margin + 4, y + 5.5);
      y += 15;
      const usableRecords = qes.records.filter((r) => !r.exclude_from_calculations && r.quoted_annual_price_usd !== null);
      const excludedRecords = qes.records.filter((r) => r.exclude_from_calculations);
      if (usableRecords.length > 0) {
        h3("Usable Observations");
        y += 2;
        usableRecords.forEach((rec) => {
          checkPage(38);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(...charcoal);
          doc.text(`${rec.evidence_id}  \xB7  ${rec.normalized_product_id ?? rec.product_reported}`, margin, y);
          y += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...muted);
          doc.text(`Source: ${rec.source_description}`, margin + 2, y);
          y += 5;
          const priceStr = rec.quoted_annual_price_usd !== null ? `$${rec.quoted_annual_price_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/year` : "Price not disclosed";
          doc.text(`Observed price: ${priceStr}   ACV context: ${rec.acv_context}   Term: ${rec.term}`, margin + 2, y);
          y += 5;
          if (rec.limitation_flags.length > 0) {
            doc.setTextColor(...amber);
            doc.text(`Flags: ${rec.limitation_flags.join(", ")}`, margin + 2, y);
            doc.setTextColor(...muted);
            y += 5;
          }
          const supLines = doc.splitTextToSize(`Supports: ${rec.what_it_supports}`, contentW - 8);
          supLines.forEach((line) => {
            checkPage(5);
            doc.text(line, margin + 2, y);
            y += 4.5;
          });
          const noSupLines = doc.splitTextToSize(`Does not support: ${rec.what_it_does_not_support}`, contentW - 8);
          doc.setTextColor(220, 38, 38);
          noSupLines.forEach((line) => {
            checkPage(5);
            doc.text(line, margin + 2, y);
            y += 4.5;
          });
          doc.setTextColor(...muted);
          y += 5;
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.2);
          doc.line(margin + 2, y, pageW - margin - 2, y);
          y += 5;
        });
      }
      if (excludedRecords.length > 0) {
        checkPage(20);
        h3("Excluded Records (not used in calculations)");
        y += 2;
        excludedRecords.forEach((rec) => {
          checkPage(14);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(...muted);
          doc.text(`${rec.evidence_id}  \xB7  ${rec.normalized_product_id ?? rec.product_reported ?? "Platform"}`, margin, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.text(`${rec.source_description}   Flags: ${rec.limitation_flags.join(", ")}`, margin + 2, y);
          y += 7;
        });
      }
      divider();
    }
    if (output.assumptions.length > 0 || output.warnings.length > 0) {
      checkPage(40);
      h2("Commercial Assumptions & Notices");
      y += 5;
      if (output.assumptions.length > 0) {
        h3("Assumptions");
        y += 3;
        output.assumptions.forEach((assumption) => {
          checkPage(8);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...charcoal);
          const lines = doc.splitTextToSize("  \u2022 " + assumption, contentW - 4);
          lines.forEach((line) => {
            checkPage(6);
            doc.text(line, margin + 2, y);
            y += 5;
          });
        });
        y += 5;
      }
      if (output.warnings.length > 0) {
        h3("Notices");
        y += 3;
        output.warnings.forEach((warning) => {
          checkPage(8);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...amber);
          const lines = doc.splitTextToSize("  \u26A0 " + warning, contentW - 4);
          lines.forEach((line) => {
            checkPage(6);
            doc.text(line, margin + 2, y);
            y += 5;
          });
        });
        y += 5;
      }
      divider();
    }
    const neg = output.negotiation;
    if (neg) {
      checkPage(50);
      h2("Negotiation Plan");
      y += 5;
      h3("What to Ask");
      y += 2;
      body(neg.what_to_ask);
      y += 5;
      h3("Why");
      y += 2;
      body(neg.why);
      y += 5;
      h3("Configuration Requested");
      y += 2;
      body(neg.configuration_requested);
      y += 5;
      if (neg.target_price != null) {
        checkPage(18);
        h3("Negotiation Target");
        y += 2;
        doc.setFillColor(...mint);
        doc.setDrawColor(...green);
        doc.roundedRect(margin, y, 80, 22, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...muted);
        doc.text("TARGET PRICE", margin + 6, y + 7);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...green);
        doc.text(fmtUSD(neg.target_price), margin + 6, y + 16);
        y += 25;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(...muted);
        body("Negotiation target \u2014 not a predicted Procore quote.", muted);
        y += 3;
      }
      if (neg.max_acceptable_price != null) {
        checkPage(18);
        h3("Maximum Acceptable Price");
        y += 2;
        doc.setFillColor(254, 226, 226);
        doc.setDrawColor(...red);
        doc.roundedRect(margin, y, 80, 22, 2, 2, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...muted);
        doc.text("WALK-AWAY PRICE", margin + 6, y + 7);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...red);
        doc.text(fmtUSD(neg.max_acceptable_price), margin + 6, y + 16);
        y += 25;
      }
      if (neg.confirm_in_writing.length > 0) {
        h3("Confirm in Writing");
        y += 3;
        neg.confirm_in_writing.forEach((item) => {
          checkPage(8);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...charcoal);
          const lines = doc.splitTextToSize("  \u2713 " + item, contentW - 4);
          lines.forEach((line) => {
            checkPage(6);
            doc.text(line, margin + 2, y);
            y += 5;
          });
        });
        y += 3;
      }
      divider();
    }
    checkPage(50);
    h2("Final Decision Framework");
    y += 5;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin, y, contentW, 8, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(6, 95, 70);
    doc.text("WHAT WE KNOW", margin + 4, y + 5.5);
    y += 11;
    let knownText = "";
    if (fr.verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ && fr.savings_amount) {
      knownText = `We have a verified $${fr.savings_amount.toLocaleString()}/year quote-to-quote difference.`;
    } else if (fr.verdict === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */) {
      knownText = "An optimization candidate was identified, but savings cannot be quantified without additional evidence.";
    } else {
      knownText = "No products survived requirement and dependency checks as optimization candidates.";
    }
    body(knownText);
    y += 8;
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(margin, y, contentW, 8, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text("WHAT WE DON'T KNOW", margin + 4, y + 5.5);
    y += 11;
    let unknownText = "";
    if (fr.verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */) {
      unknownText = "Whether this difference is specifically attributable to removing any individual product without configuration-mapped quotes.";
    } else if (fr.verdict === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */) {
      unknownText = "The resulting Procore renewal price for the proposed configuration.";
    } else {
      unknownText = "Whether future configuration changes could produce eligible candidates.";
    }
    body(unknownText);
    y += 8;
    doc.setFillColor(234, 247, 240);
    doc.setDrawColor(31, 138, 91);
    doc.roundedRect(margin, y, contentW, 8, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...forest);
    doc.text("NEXT ACTION", margin + 4, y + 5.5);
    y += 11;
    const nextAction = fr.what_to_confirm[0] ?? "Cross-check findings against your actual Procore renewal quote.";
    body(nextAction);
    y += 8;
    divider();
    checkPage(40);
    h2("Disclaimer");
    y += 5;
    const disclaimers = [
      "Independent analysis. Not affiliated with Procore Technologies, Inc.",
      "No savings are guaranteed. All financial calculations are deterministic and evidence-based.",
      "Benchmark figures are directional context from public observations, not official Procore pricing.",
      "Always cross-check findings against your actual Procore renewal quote before making decisions.",
      "This analysis does not constitute legal, financial, or procurement advice. Consult appropriate professionals for specific guidance."
    ];
    disclaimers.forEach((disclaimer) => {
      checkPage(10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...muted);
      const lines = doc.splitTextToSize("\u2022 " + disclaimer, contentW - 2);
      lines.forEach((line) => {
        checkPage(6);
        doc.text(line, margin, y);
        y += 5;
      });
      y += 2;
    });
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addPageFooter(i - 1, totalPages - 1);
    }
    const saveDateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    doc.save(`RenewalScope_Procore_Renewal_Analysis_${saveDateStr}.pdf`);
  }
  function renderStatusHero(output) {
    const container = $("results-status-hero");
    if (!container) return;
    const verdict = output.free_result.verdict;
    const savings = output.free_result.savings_amount;
    const showSavings = savings != null && savings > 0 && (verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ || verdict === "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */);
    let heroClass = "";
    let badgeClass = "none";
    let badgeText = "Analysis Complete";
    let titleText = "Analysis Complete";
    if (verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */) {
      heroClass = "verified";
      badgeClass = "verified";
      badgeText = "Verified Savings";
      titleText = "Verified Savings Identified";
    } else if (verdict === "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */) {
      heroClass = "verified";
      badgeClass = "verified";
      badgeText = "Savings Identified";
      titleText = "Potential Savings Identified";
    } else if (verdict === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */) {
      heroClass = "uncertain";
      badgeClass = "uncertain";
      badgeText = "Opportunity Identified";
      titleText = "Optimization Opportunity";
    } else if (verdict === "NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */) {
      heroClass = "none";
      badgeClass = "none";
      badgeText = "No Defensible Savings";
      titleText = "No Defensible Savings Identified";
    }
    const savingsLabel = verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ ? "Verified Annual Savings" : "Identified Savings";
    const savingsHTML = showSavings ? `<div class="spend-item"><div class="spend-label">${savingsLabel}</div><div class="spend-value savings">${fmtUSD(savings)}</div></div>` : "";
    container.innerHTML = `<div class="status-hero ${heroClass}"><div class="status-badge ${badgeClass}">${badgeText}</div><div class="status-title">${titleText}</div><div class="status-subtitle">${output.free_result.explanation}</div><div class="spend-display"><div class="spend-item"><div class="spend-label">Current Annual Spend</div><div class="spend-value">${fmtUSD(output.free_result.current_spend)}</div></div>` + savingsHTML + `</div></div>`;
  }
  function getCandidateStatus(productId, output) {
    const cands = output.candidates;
    if (!cands) return { status: "Not evaluated", why: "" };
    if (cands.skipped_product_ids.includes(productId))
      return { status: "Not a candidate (actively used)", why: "Product is actively used" };
    const blocked = cands.blocked.find((c) => c.product_id === productId);
    if (blocked) return { status: "Blocked", why: blocked.blocked_reason ?? "Blocked by requirement or dependency" };
    const candidate = cands.candidates.find((c) => c.product_id === productId);
    if (candidate) {
      if (candidate.blocked_reason) return { status: "Uncertain", why: candidate.blocked_reason };
      return { status: "Eligible candidate", why: "" };
    }
    return { status: "Not evaluated", why: "" };
  }
  function getSavingsStatus(productId, output) {
    if (!output.counterfactual) return "";
    const cf = output.counterfactual.counterfactual_results.find((r) => r.candidate.product_id === productId);
    if (!cf) return "";
    if (cf.result_class === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ && cf.dollar_saving != null && cf.dollar_saving > 0)
      return `Verified quote-to-quote difference: ${fmtUSD(cf.dollar_saving)}/year`;
    if (cf.result_class === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */)
      return "Savings not yet quantifiable";
    return "";
  }
  function renderBenchmark(output) {
    const container = $("results-benchmark");
    if (!container) return;
    const bm = output.benchmark;
    if (!bm || !bm.min_evidence_count_met) {
      container.innerHTML = "";
      return;
    }
    const range = bm.stats.max - bm.stats.min;
    const offset = bm.user_rate - bm.stats.min;
    const pct = range > 0 ? Math.min(100, Math.max(0, offset / range * 100)) : 50;
    const posMap = {
      below_p25: "Your rate appears favorable relative to comparable public observations. Confirm any commercial impact in writing before restructuring.",
      p25_to_p50: "Your rate falls in the lower half of comparable observations.",
      p50_to_p75: "Your rate is near or above the median of comparable observations.",
      above_p75: "Your rate is in the upper range of comparable observations."
    };
    const posText = posMap[bm.position] ?? "";
    container.innerHTML = `<div class="card"><div class="card-title">Commercial Context</div><div class="benchmark-card"><div class="benchmark-header">Your Effective Rate</div><div class="rate-display"><span class="rate-value">${fmtRate(bm.user_rate)}</span><span class="rate-label">per $1M ACV</span></div><div class="benchmark-position">${posText}</div><div class="bar-track" style="position:relative;overflow:visible;"><div class="bar-fill" style="width:${pct}%"></div><div class="bar-marker" style="left:${pct}%"></div></div><div class="bar-stats"><span>p25: <strong>${fmtRate(bm.stats.p25)}</strong></span><span>median: <strong>${fmtRate(bm.stats.p50)}</strong></span><span>p75: <strong>${fmtRate(bm.stats.p75)}</strong></span></div><div style="font-size:0.8125rem;color:var(--text-muted);margin-top:12px;"><strong>Evidence:</strong> ${bm.comparable_evidence_ids.join(", ")}</div></div></div>`;
  }
  function renderResultsList(output) {
    const container = $("results-list");
    if (!container) return;
    if (output.results.length === 0) {
      container.innerHTML = `<div class="alert info">No specific findings to report based on the information provided.</div>`;
      return;
    }
    container.innerHTML = output.results.map((r) => {
      const isCommercialOpp = r.result_type === "SAVINGS_IDENTIFIED" /* SAVINGS_IDENTIFIED */ && (r.dollar_saving == null || r.dollar_saving === 0);
      const displayType = isCommercialOpp ? "COMMERCIAL_OPPORTUNITY" : r.result_type;
      const badgeLabel = isCommercialOpp ? "COMMERCIAL OPPORTUNITY" : r.result_type.replace(/_/g, " ");
      const canShowSaving = r.result_type === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ && r.dollar_saving != null && r.dollar_saving > 0;
      const savingHTML = canShowSaving ? `<div class="result-saving">Verified annual saving: ${fmtUSD(r.dollar_saving)}</div>` : "";
      const evidenceHTML = r.comparable_evidence.length > 0 ? `<div class="result-evidence">Evidence: ` + r.comparable_evidence.map((id) => `<span class="ev-id">${id}</span>`).join("") + `</div>` : "";
      return `<div class="result-item ${displayType}"><div class="result-header"><span class="result-badge ${displayType}">${badgeLabel}</span><span class="conf-badge">${r.confidence}</span></div><div class="result-text">${r.recommendation_text}</div>` + (r.explanation ? `<div class="result-explanation">${r.explanation}</div>` : "") + savingHTML + evidenceHTML + `</div>`;
    }).join("");
  }
  function renderWarningsAndAssumptions(output) {
    const container = $("results-warnings");
    if (!container) return;
    let html = "";
    if (output.warnings.length > 0)
      html += `<div class="alert warning"><strong>Notices:</strong><br>` + output.warnings.map((w) => `\u2022 ${w}`).join("<br>") + `</div>`;
    if (output.assumptions.length > 0)
      html += `<div class="alert info"><strong>Assumptions:</strong><br>` + output.assumptions.map((a) => `\u2022 ${a}`).join("<br>") + `</div>`;
    container.innerHTML = html;
  }
  function renderNegotiation(output) {
    const container = $("results-negotiation");
    if (!container) return;
    const neg = output.negotiation;
    if (!neg) {
      container.innerHTML = "";
      return;
    }
    const priceBox = (label, value) => `<div class="price-box"><div class="price-box-label">${label}</div><div class="price-box-value">${fmtUSD(value)}</div><div class="price-box-note">Not a predicted Procore quote</div></div>`;
    const listSection = (label, items) => items.length === 0 ? "" : `<div class="neg-section"><div class="neg-label">${label}</div><ul class="neg-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;
    let html = `<div class="negotiation-card"><div class="negotiation-title">Negotiation Plan</div><div class="neg-section"><div class="neg-label">What to Ask</div><div class="neg-content">${neg.what_to_ask}</div></div><div class="neg-section"><div class="neg-label">Why</div><div class="neg-content">${neg.why}</div></div><div class="neg-section"><div class="neg-label">Configuration Requested</div><div class="neg-content">${neg.configuration_requested}</div></div>`;
    if (neg.target_price != null)
      html += `<div class="neg-section"><div class="neg-label">Target Price</div>${priceBox("Target", neg.target_price)}</div>`;
    if (neg.max_acceptable_price != null)
      html += `<div class="neg-section"><div class="neg-label">Max Acceptable Price</div>${priceBox("Walk-away price", neg.max_acceptable_price)}</div>`;
    html += listSection("Unknowns", neg.unknowns);
    html += listSection("Risks", neg.risks);
    html += listSection("Confirm in Writing", neg.confirm_in_writing);
    html += `</div>`;
    container.innerHTML = html;
  }
  function renderWhatToConfirm(output) {
    const container = $("results-confirm");
    if (!container) return;
    const items = output.free_result.what_to_confirm;
    if (!items || items.length === 0) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = `<div class="card"><div class="card-title">What to Confirm</div><ul class="neg-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul></div>`;
  }
  function renderKnownUnknown(output) {
    const el = $("results-known-unknown");
    if (!el) return;
    const verdict = output.free_result.verdict;
    const savings = output.free_result.savings_amount;
    let known = "";
    let unknown2 = "";
    let needed = "";
    if (verdict === "VERIFIED_BEFORE_AFTER" /* VERIFIED_BEFORE_AFTER */ && savings) {
      known = `The two user-supplied quotes differ by $${savings.toLocaleString()}/year.`;
      unknown2 = "Whether this difference is specifically attributable to removing any individual product.";
      needed = "A written quote confirming the exact configuration change between the two quotes.";
    } else if (verdict === "OPPORTUNITY_NOT_QUANTIFIABLE" /* OPPORTUNITY_NOT_QUANTIFIABLE */) {
      const cand = output.candidates?.candidates[0];
      known = cand ? `${PRODUCT_CATALOG.find((p) => p.id === cand.product_id)?.label ?? cand.product_id} appears eligible for optimization review.` : "An optimization candidate was identified.";
      unknown2 = "The resulting Procore renewal price for the proposed configuration.";
      needed = "A comparable written Procore quote for the proposed configuration.";
    } else if (verdict === "NO_DEFENSIBLE_SAVINGS_IDENTIFIED" /* NO_DEFENSIBLE_SAVINGS_IDENTIFIED */) {
      known = "No products survived the requirement and dependency checks as optimization candidates.";
      unknown2 = "Whether future configuration changes could produce eligible candidates.";
      needed = "Updated product usage and requirement information.";
    }
    if (!known) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML = `<div class="card">
    <div class="card-title">Evidence Boundaries</div>
    <div class="known-unknown-grid">
      <div class="ku-item known"><div class="ku-label">What we know</div><div class="ku-text">${known}</div></div>
      <div class="ku-item unknown"><div class="ku-label">What we don't know</div><div class="ku-text">${unknown2}</div></div>
      <div class="ku-item needed"><div class="ku-label">Next evidence needed</div><div class="ku-text">${needed}</div></div>
    </div>
  </div>`;
  }
  function renderResults(output) {
    renderFreeResult(output);
  }
  function renderFreeResult(output) {
    renderExecutiveSummary(output);
    renderStatusHero(output);
    renderBenchmark(output);
    renderResultsList(output);
    renderKnownUnknown(output);
    renderProPreview();
  }
  function renderProReport(output) {
    renderProductAudit(output);
    renderCounterfactualSection(output);
    renderEvidenceSection(output);
    renderWarningsAndAssumptions(output);
    renderNegotiation(output);
    renderWhatToConfirm(output);
  }
  function renderProPreview() {
    const container = $("pro-preview-section");
    if (!container) return;
    container.innerHTML = `
    <div style="margin-top:48px;padding:48px 32px;background:linear-gradient(135deg, #f8faf9 0%, #ffffff 100%);border:2px solid #d4af37;border-radius:16px;box-shadow:0 4px 12px rgba(212,175,55,0.15);">
      <div style="text-align:center;margin-bottom:40px;">
        <div style="display:inline-flex;align-items:center;gap:12px;margin-bottom:16px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#d4af37" stroke="#b8941f" stroke-width="1.5"/>
          </svg>
          <h2 style="font-size:2rem;font-weight:800;color:#123B2A;margin:0;letter-spacing:-0.5px;">
            Professional Report
          </h2>
        </div>
        <div style="display:inline-block;padding:6px 16px;background:linear-gradient(135deg, #d4af37 0%, #b8941f 100%);color:#fff;border-radius:20px;font-size:0.75rem;font-weight:700;letter-spacing:0.5px;margin-bottom:16px;">
          PREMIUM RENEWAL INTELLIGENCE
        </div>
        <p style="font-size:1.0625rem;color:#4b5563;line-height:1.6;max-width:600px;margin:0 auto;">
          Unlock the complete analysis with detailed evidence, negotiation strategy, and professional PDF report.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-bottom:40px;">
        <div style="background:#fff;padding:28px;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:all 0.2s;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg, #d4af37 0%, #b8941f 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 style="font-size:1.125rem;font-weight:700;color:#123B2A;margin-bottom:10px;">Detailed Product Audit</h3>
          <p style="font-size:0.9375rem;color:#6b7280;line-height:1.6;margin:0;">See which products are eligible, blocked, or uncertain with full dependency analysis.</p>
        </div>

        <div style="background:#fff;padding:28px;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:all 0.2s;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg, #d4af37 0%, #b8941f 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 style="font-size:1.125rem;font-weight:700;color:#123B2A;margin-bottom:10px;">Counterfactual Analysis</h3>
          <p style="font-size:0.9375rem;color:#6b7280;line-height:1.6;margin:0;">Understand exactly what each configuration change could mean financially.</p>
        </div>

        <div style="background:#fff;padding:28px;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:all 0.2s;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg, #d4af37 0%, #b8941f 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 style="font-size:1.125rem;font-weight:700;color:#123B2A;margin-bottom:10px;">Evidence Trail</h3>
          <p style="font-size:0.9375rem;color:#6b7280;line-height:1.6;margin:0;">Review the public quote evidence and sources behind every recommendation.</p>
        </div>

        <div style="background:#fff;padding:28px;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:all 0.2s;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg, #d4af37 0%, #b8941f 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C10.4607 21 9.01171 20.5983 7.76923 19.8942L3 21L4.10577 16.2308C3.40169 14.9883 3 13.5393 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 style="font-size:1.125rem;font-weight:700;color:#123B2A;margin-bottom:10px;">Negotiation Strategy</h3>
          <p style="font-size:0.9375rem;color:#6b7280;line-height:1.6;margin:0;">Get a structured renewal negotiation plan with target prices and key questions.</p>
        </div>

        <div style="background:#fff;padding:28px;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:all 0.2s;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg, #d4af37 0%, #b8941f 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 21H17C18.1046 21 19 20.1046 19 19V9.41421C19 9.149 18.8946 8.89464 18.7071 8.70711L13.2929 3.29289C13.1054 3.10536 12.851 3 12.5858 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21Z" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 3V8C12 8.55228 12.4477 9 13 9H18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 style="font-size:1.125rem;font-weight:700;color:#123B2A;margin-bottom:10px;">Professional PDF</h3>
          <p style="font-size:0.9375rem;color:#6b7280;line-height:1.6;margin:0;">Download the complete negotiation-ready report with RenewalScope branding.</p>
        </div>

        <div style="background:#fff;padding:28px;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:all 0.2s;">
          <div style="width:48px;height:48px;background:linear-gradient(135deg, #d4af37 0%, #b8941f 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 style="font-size:1.125rem;font-weight:700;color:#123B2A;margin-bottom:10px;">Commercial Risks</h3>
          <p style="font-size:0.9375rem;color:#6b7280;line-height:1.6;margin:0;">Understand the assumptions, limitations, and what to confirm before acting.</p>
        </div>
      </div>

      <div style="text-align:center;">
        <button id="btn-view-pro-report" style="padding:18px 48px;background:linear-gradient(135deg, #1F8A5B 0%, #166d47 100%);color:#fff;border:2px solid #d4af37;border-radius:12px;font-size:1.125rem;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:inherit;box-shadow:0 4px 12px rgba(31,138,91,0.3);">
          <span style="display:inline-flex;align-items:center;gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15V3M12 15L8 11M12 15L16 11M2 17L2.621 19.485C2.72915 19.9177 3.11127 20.2388 3.55578 20.2721C8.84782 20.7006 14.1522 20.7006 19.4442 20.2721C19.8887 20.2388 20.2708 19.9177 20.379 19.485L21 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Unlock Professional Report
          </span>
        </button>
      </div>
    </div>
  `;
    $("btn-view-pro-report")?.addEventListener("click", handleViewProReport);
  }
  async function runAnalysis() {
    setHidden("wizard", true);
    setHidden("loading", false);
    setHidden("results-container", true);
    for (let i = 0; i < 5; i++) {
      const li = $(`ls-${i}`);
      if (li) {
        li.classList.remove("done");
        const check = li.querySelector(".check");
        if (check) check.textContent = "";
      }
    }
    try {
      await runLoadingAnimation();
      const raw = buildEngineInput();
      lastInput = raw;
      const output = runEngine(raw);
      lastOutput = output;
      setHidden("loading", true);
      setHidden("results-container", false);
      renderResults(output);
    } catch (err) {
      setHidden("loading", true);
      setHidden("wizard", false);
      goToStep(5);
      const msg = err instanceof Error ? err.message : String(err);
      showError("step-5-error", `Analysis failed: ${msg}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function updateNavbar() {
    const btnSignin = $("btn-signin");
    const btnSignout = $("btn-signout");
    const navUserEmail = $("nav-user-email");
    if (authState.authenticated && authState.user) {
      if (btnSignin) btnSignin.style.display = "none";
      if (btnSignout) btnSignout.style.display = "inline-block";
      if (navUserEmail) {
        const email = authState.user.email || "";
        const truncated = email.length > 25 ? email.substring(0, 22) + "..." : email;
        navUserEmail.textContent = truncated;
        navUserEmail.style.display = "inline";
      }
    } else {
      if (btnSignin) btnSignin.style.display = "inline-block";
      if (btnSignout) btnSignout.style.display = "none";
      if (navUserEmail) navUserEmail.style.display = "none";
    }
  }
  function showAuthModal() {
    const modal = $("auth-modal");
    if (modal) modal.hidden = false;
  }
  function hideAuthModal() {
    const modal = $("auth-modal");
    if (modal) modal.hidden = true;
    const signinEmail = $("signin-email");
    const signinPassword = $("signin-password");
    const signupEmail = $("signup-email");
    const signupPassword = $("signup-password");
    const signupPasswordConfirm = $("signup-password-confirm");
    if (signinEmail) signinEmail.value = "";
    if (signinPassword) signinPassword.value = "";
    if (signupEmail) signupEmail.value = "";
    if (signupPassword) signupPassword.value = "";
    if (signupPasswordConfirm) signupPasswordConfirm.value = "";
    ["signin-error", "signup-error", "signup-success", "forgot-error", "forgot-success"].forEach((id) => {
      const el = $(id);
      if (el) el.hidden = true;
    });
  }
  function switchAuthTab(tab) {
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
    const tabButton = document.querySelector(`[data-tab="${tab}"]`);
    if (tabButton) tabButton.classList.add("active");
    document.querySelectorAll(".auth-form").forEach((f) => f.classList.remove("active"));
    const form = $(`${tab}-form`);
    if (form) form.classList.add("active");
  }
  async function handleSignIn(email, password) {
    const btn = $("signin-btn");
    const errorEl = $("signin-error");
    if (btn) btn.disabled = true;
    if (errorEl) errorEl.hidden = true;
    const { user, error } = await signIn(email, password);
    if (error) {
      if (errorEl) {
        errorEl.textContent = error.message || "Sign in failed. Please check your credentials.";
        errorEl.hidden = false;
      }
      if (btn) btn.disabled = false;
      return;
    }
    if (user) {
      authState = { user, authenticated: true, loading: false };
      const entitlement = await checkEntitlement(user.id, user.email || void 0);
      hasProAccess = entitlement.hasProAccess;
      updateNavbar();
      hideAuthModal();
      if (hasProAccess && lastOutput) {
        renderProReport(lastOutput);
        const previewSection = $("pro-preview-section");
        const proSection = $("pro-report-section");
        if (previewSection) previewSection.hidden = true;
        if (proSection) proSection.hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    if (btn) btn.disabled = false;
  }
  async function handleSignUp(email, password, passwordConfirm) {
    const btn = $("signup-btn");
    const errorEl = $("signup-error");
    const successEl = $("signup-success");
    if (btn) btn.disabled = true;
    if (errorEl) errorEl.hidden = true;
    if (successEl) successEl.hidden = true;
    if (password !== passwordConfirm) {
      if (errorEl) {
        errorEl.textContent = "Passwords do not match.";
        errorEl.hidden = false;
      }
      if (btn) btn.disabled = false;
      return;
    }
    if (password.length < 6) {
      if (errorEl) {
        errorEl.textContent = "Password must be at least 6 characters.";
        errorEl.hidden = false;
      }
      if (btn) btn.disabled = false;
      return;
    }
    const { user, error } = await signUp(email, password);
    if (error) {
      if (errorEl) {
        errorEl.textContent = error.message || "Sign up failed. Please try again.";
        errorEl.hidden = false;
      }
      if (btn) btn.disabled = false;
      return;
    }
    if (user) {
      if (successEl) {
        successEl.textContent = "Account created! Please check your email to confirm your account, then sign in.";
        successEl.hidden = false;
      }
      const emailInput = $("signup-email");
      const passwordInput = $("signup-password");
      const confirmInput = $("signup-password-confirm");
      if (emailInput) emailInput.value = "";
      if (passwordInput) passwordInput.value = "";
      if (confirmInput) confirmInput.value = "";
    }
    if (btn) btn.disabled = false;
  }
  async function handleForgotPassword(email) {
    const btn = $("forgot-btn");
    const errorEl = $("forgot-error");
    const successEl = $("forgot-success");
    if (btn) btn.disabled = true;
    if (errorEl) errorEl.hidden = true;
    if (successEl) successEl.hidden = true;
    const { error } = await resetPassword(email);
    if (error) {
      if (errorEl) {
        errorEl.textContent = error.message || "Failed to send reset email. Please try again.";
        errorEl.hidden = false;
      }
      if (btn) btn.disabled = false;
      return;
    }
    if (successEl) {
      successEl.textContent = "Password reset email sent! Check your inbox.";
      successEl.hidden = false;
    }
    if (btn) btn.disabled = false;
  }
  async function handleSignOut() {
    await signOut();
    authState = { user: null, authenticated: false, loading: false };
    hasProAccess = false;
    updateNavbar();
    const proSection = $("pro-report-section");
    const previewSection = $("pro-preview-section");
    if (proSection) proSection.hidden = true;
    if (previewSection) previewSection.hidden = false;
  }
  async function handleGoogleSignIn() {
    if (lastInput && lastOutput) {
      sessionStorage.setItem("rs_last_input", JSON.stringify(lastInput));
      sessionStorage.setItem("rs_last_output", JSON.stringify(lastOutput));
    }
    const { error } = await signInWithGoogle();
    if (error) {
      const errorEl = $("signin-error");
      if (errorEl) {
        errorEl.textContent = error.message || "Google sign-in failed. Please try again.";
        errorEl.hidden = false;
      }
    }
  }
  function requireAuth() {
    if (!authState.authenticated) {
      showAuthModal();
      return false;
    }
    return true;
  }
  async function handleViewProReport() {
    if (lastInput && lastOutput) {
      sessionStorage.setItem("rs_last_input", JSON.stringify(lastInput));
      sessionStorage.setItem("rs_last_output", JSON.stringify(lastOutput));
      sessionStorage.setItem("rs_intended_action", "professional_report");
    }
    if (!requireAuth()) {
      return;
    }
    if (lastOutput) {
      renderProReport(lastOutput);
    }
    const previewSection = $("pro-preview-section");
    const proSection = $("pro-report-section");
    if (previewSection) previewSection.hidden = true;
    if (proSection) proSection.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.addEventListener("DOMContentLoaded", () => {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const privateViewIds = ["auth-modal", "wizard", "loading", "results-container"];
    const syncRobotsForVisibleView = () => {
      const privateViewIsVisible = privateViewIds.some((id) => !$(id)?.hidden);
      robotsMeta?.setAttribute("content", privateViewIsVisible ? "noindex, nofollow" : "index, follow");
    };
    const privateViewObserver = new MutationObserver(syncRobotsForVisibleView);
    privateViewIds.forEach((id) => {
      const view = $(id);
      if (view) privateViewObserver.observe(view, { attributes: true, attributeFilter: ["hidden"] });
    });
    syncRobotsForVisibleView();
    const hamburger = $("hamburger");
    const mobileMenu = $("mobile-menu");
    hamburger?.addEventListener("click", () => {
      if (mobileMenu) {
        mobileMenu.hidden = !mobileMenu.hidden;
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && mobileMenu) {
        mobileMenu.hidden = true;
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu && !mobileMenu.hidden) {
        mobileMenu.hidden = true;
      }
    });
    document.querySelectorAll(".mobile-nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileMenu) mobileMenu.hidden = true;
      });
    });
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (href && href !== "#") {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            if (mobileMenu) mobileMenu.hidden = true;
          }
        }
      });
    });
    document.querySelectorAll(".faq-q").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.parentElement;
        const answer = item?.querySelector(".faq-a");
        const isOpen = btn.classList.contains("open");
        document.querySelectorAll(".faq-q").forEach((b) => b.classList.remove("open"));
        document.querySelectorAll(".faq-a").forEach((a) => a.classList.remove("open"));
        if (!isOpen && answer) {
          btn.classList.add("open");
          answer.classList.add("open");
        }
      });
    });
    (async () => {
      const user = await getCurrentUser();
      authState = {
        user,
        authenticated: !!user,
        loading: false
      };
      if (user) {
        const entitlement = await checkEntitlement(user.id, user.email || void 0);
        hasProAccess = entitlement.hasProAccess;
      }
      updateNavbar();
      const savedInput = sessionStorage.getItem("rs_last_input");
      const savedOutput = sessionStorage.getItem("rs_last_output");
      const intendedAction = sessionStorage.getItem("rs_intended_action");
      if (savedInput && savedOutput && intendedAction === "professional_report") {
        try {
          lastInput = JSON.parse(savedInput);
          lastOutput = JSON.parse(savedOutput);
          sessionStorage.removeItem("rs_last_input");
          sessionStorage.removeItem("rs_last_output");
          sessionStorage.removeItem("rs_intended_action");
          if (authState.authenticated && lastOutput && hasProAccess) {
            setHidden("landing", true);
            setHidden("wizard", true);
            setHidden("results-container", false);
            renderFreeResult(lastOutput);
            renderProReport(lastOutput);
            const previewSection = $("pro-preview-section");
            const proSection = $("pro-report-section");
            if (previewSection) previewSection.hidden = true;
            if (proSection) proSection.hidden = false;
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        } catch (e) {
          console.error("Error restoring session:", e);
        }
      }
    })();
    onAuthStateChange(async (event, session) => {
      if (session?.user) {
        authState = {
          user: session.user,
          authenticated: true,
          loading: false
        };
        const entitlement = await checkEntitlement(session.user.id, session.user.email || void 0);
        hasProAccess = entitlement.hasProAccess;
      } else {
        authState = {
          user: null,
          authenticated: false,
          loading: false
        };
        hasProAccess = false;
      }
      updateNavbar();
    });
    document.querySelectorAll(".auth-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.getAttribute("data-tab");
        switchAuthTab(tabName);
      });
    });
    $("auth-modal-close")?.addEventListener("click", hideAuthModal);
    $("auth-modal")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        hideAuthModal();
      }
    });
    $("btn-signin")?.addEventListener("click", showAuthModal);
    $("btn-signout")?.addEventListener("click", handleSignOut);
    $("signin-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("signin-email")?.value;
      const password = $("signin-password")?.value;
      if (email && password) {
        handleSignIn(email, password);
      }
    });
    $("signup-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("signup-email")?.value;
      const password = $("signup-password")?.value;
      const passwordConfirm = $("signup-password-confirm")?.value;
      if (email && password && passwordConfirm) {
        handleSignUp(email, password, passwordConfirm);
      }
    });
    $("google-signin-btn")?.addEventListener("click", handleGoogleSignIn);
    $("google-signup-btn")?.addEventListener("click", handleGoogleSignIn);
    $("forgot-password-link")?.addEventListener("click", () => {
      switchAuthTab("forgot");
    });
    $("back-to-signin")?.addEventListener("click", () => {
      switchAuthTab("signin");
    });
    $("forgot-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("forgot-email")?.value;
      if (email) {
        handleForgotPassword(email);
      }
    });
    $("btn-view-pro")?.addEventListener("click", handleViewProReport);
    const startWizard = () => {
      setHidden("landing", true);
      setHidden("wizard", false);
      goToStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    $("btn-start")?.addEventListener("click", startWizard);
    $("btn-start-nav")?.addEventListener("click", startWizard);
    $("btn-start-mobile")?.addEventListener("click", () => {
      if (mobileMenu) mobileMenu.hidden = true;
      startWizard();
    });
    $("btn-start-final")?.addEventListener("click", startWizard);
    const scrollToHow = () => {
      const target = document.querySelector("#how-it-works");
      if (target) {
        setHidden("landing", false);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    $("btn-see-how")?.addEventListener("click", scrollToHow);
    $("btn-hero-how")?.addEventListener("click", scrollToHow);
    $("btn-next")?.addEventListener("click", () => {
      clearError("step-1-error");
      const err = validateStep1();
      if (err) {
        showError("step-1-error", err);
        return;
      }
      saveStep1();
      renderProductCards();
      goToStep(2);
    });
    $("btn-back-2")?.addEventListener("click", () => goToStep(1));
    $("btn-next-2")?.addEventListener("click", () => {
      clearError("step-2-error");
      const err = validateStep2();
      if (err) {
        showError("step-2-error", err);
        return;
      }
      renderProductDetails();
      goToStep(3);
    });
    $("btn-back-3")?.addEventListener("click", () => goToStep(2));
    $("btn-next-3")?.addEventListener("click", () => {
      clearError("step-3-error");
      const err = validateStep3();
      if (err) {
        showError("step-3-error", err);
        return;
      }
      saveStep3();
      goToStep(4);
    });
    $("discount_status")?.addEventListener("change", updateDiscountFields);
    updateDiscountFields();
    $("btn-back-4")?.addEventListener("click", () => goToStep(3));
    $("btn-next-4")?.addEventListener("click", () => {
      saveStep4();
      renderReview();
      goToStep(5);
    });
    const step5Back = $("btn-back-5");
    if (step5Back) step5Back.addEventListener("click", () => goToStep(4));
    const btnAnalyze = $("btn-analyze");
    if (btnAnalyze) btnAnalyze.addEventListener("click", () => {
      void runAnalysis();
    });
    $("btn-new-analysis")?.addEventListener("click", () => {
      state = makeInitialState();
      setHidden("results-container", true);
      setHidden("loading", true);
      setHidden("wizard", true);
      setHidden("landing", false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    $("btn-download-pdf")?.addEventListener("click", () => {
      if (!authState.authenticated) {
        alert("Please sign in to download the Professional Report PDF.");
        showAuthModal();
        return;
      }
      if (lastOutput && lastInput) generatePDF(lastOutput, lastInput);
    });
    $("btn-new-analysis")?.addEventListener("click", () => {
      lastInput = null;
      lastOutput = null;
      sessionStorage.removeItem("rs_last_input");
      sessionStorage.removeItem("rs_last_output");
      window.location.reload();
    });
  });
})();
