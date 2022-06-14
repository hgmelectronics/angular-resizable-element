(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('angular-resizable-element', ['exports', '@angular/core', '@angular/common', 'rxjs', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['angular-resizable-element'] = {}, global.ng.core, global.ng.common, global.rxjs, global.rxjs.operators));
}(this, (function (exports, i0, common, rxjs, operators) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar)
                        ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    /**
     * @hidden
     */
    var IS_TOUCH_DEVICE = (function () {
        // In case we're in Node.js environment.
        if (typeof window === 'undefined') {
            return false;
        }
        else {
            return ('ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                navigator.msMaxTouchPoints > 0);
        }
    })();

    /** Creates a deep clone of an element. */
    function deepCloneNode(node) {
        var clone = node.cloneNode(true);
        var descendantsWithId = clone.querySelectorAll('[id]');
        var nodeName = node.nodeName.toLowerCase();
        // Remove the `id` to avoid having multiple elements with the same id on the page.
        clone.removeAttribute('id');
        descendantsWithId.forEach(function (descendant) {
            descendant.removeAttribute('id');
        });
        if (nodeName === 'canvas') {
            transferCanvasData(node, clone);
        }
        else if (nodeName === 'input' ||
            nodeName === 'select' ||
            nodeName === 'textarea') {
            transferInputData(node, clone);
        }
        transferData('canvas', node, clone, transferCanvasData);
        transferData('input, textarea, select', node, clone, transferInputData);
        return clone;
    }
    /** Matches elements between an element and its clone and allows for their data to be cloned. */
    function transferData(selector, node, clone, callback) {
        var descendantElements = node.querySelectorAll(selector);
        if (descendantElements.length) {
            var cloneElements = clone.querySelectorAll(selector);
            for (var i = 0; i < descendantElements.length; i++) {
                callback(descendantElements[i], cloneElements[i]);
            }
        }
    }
    // Counter for unique cloned radio button names.
    var cloneUniqueId = 0;
    /** Transfers the data of one input element to another. */
    function transferInputData(source, clone) {
        // Browsers throw an error when assigning the value of a file input programmatically.
        if (clone.type !== 'file') {
            clone.value = source.value;
        }
        // Radio button `name` attributes must be unique for radio button groups
        // otherwise original radio buttons can lose their checked state
        // once the clone is inserted in the DOM.
        if (clone.type === 'radio' && clone.name) {
            clone.name = "mat-clone-" + clone.name + "-" + cloneUniqueId++;
        }
    }
    /** Transfers the data of one canvas element to another. */
    function transferCanvasData(source, clone) {
        var context = clone.getContext('2d');
        if (context) {
            // In some cases `drawImage` can throw (e.g. if the canvas size is 0x0).
            // We can't do much about it so just ignore the error.
            try {
                context.drawImage(source, 0, 0);
            }
            catch (_a) { }
        }
    }

    function getNewBoundingRectangle(startingRect, edges, clientX, clientY) {
        var newBoundingRect = {
            top: startingRect.top,
            bottom: startingRect.bottom,
            left: startingRect.left,
            right: startingRect.right,
        };
        if (edges.top) {
            newBoundingRect.top += clientY;
        }
        if (edges.bottom) {
            newBoundingRect.bottom += clientY;
        }
        if (edges.left) {
            newBoundingRect.left += clientX;
        }
        if (edges.right) {
            newBoundingRect.right += clientX;
        }
        newBoundingRect.height = newBoundingRect.bottom - newBoundingRect.top;
        newBoundingRect.width = newBoundingRect.right - newBoundingRect.left;
        return newBoundingRect;
    }
    function getElementRect(element, ghostElementPositioning) {
        var translateX = 0;
        var translateY = 0;
        var style = element.nativeElement.style;
        var transformProperties = [
            'transform',
            '-ms-transform',
            '-moz-transform',
            '-o-transform',
        ];
        var transform = transformProperties
            .map(function (property) { return style[property]; })
            .find(function (value) { return !!value; });
        if (transform && transform.includes('translate')) {
            translateX = transform.replace(/.*translate3?d?\((-?[0-9]*)px, (-?[0-9]*)px.*/, '$1');
            translateY = transform.replace(/.*translate3?d?\((-?[0-9]*)px, (-?[0-9]*)px.*/, '$2');
        }
        if (ghostElementPositioning === 'absolute') {
            return {
                height: element.nativeElement.offsetHeight,
                width: element.nativeElement.offsetWidth,
                top: element.nativeElement.offsetTop - translateY,
                bottom: element.nativeElement.offsetHeight +
                    element.nativeElement.offsetTop -
                    translateY,
                left: element.nativeElement.offsetLeft - translateX,
                right: element.nativeElement.offsetWidth +
                    element.nativeElement.offsetLeft -
                    translateX,
            };
        }
        else {
            var boundingRect = element.nativeElement.getBoundingClientRect();
            return {
                height: boundingRect.height,
                width: boundingRect.width,
                top: boundingRect.top - translateY,
                bottom: boundingRect.bottom - translateY,
                left: boundingRect.left - translateX,
                right: boundingRect.right - translateX,
                scrollTop: element.nativeElement.scrollTop,
                scrollLeft: element.nativeElement.scrollLeft,
            };
        }
    }
    var DEFAULT_RESIZE_CURSORS = Object.freeze({
        topLeft: 'nw-resize',
        topRight: 'ne-resize',
        bottomLeft: 'sw-resize',
        bottomRight: 'se-resize',
        leftOrRight: 'col-resize',
        topOrBottom: 'row-resize',
    });
    function getResizeCursor(edges, cursors) {
        if (edges.left && edges.top) {
            return cursors.topLeft;
        }
        else if (edges.right && edges.top) {
            return cursors.topRight;
        }
        else if (edges.left && edges.bottom) {
            return cursors.bottomLeft;
        }
        else if (edges.right && edges.bottom) {
            return cursors.bottomRight;
        }
        else if (edges.left || edges.right) {
            return cursors.leftOrRight;
        }
        else if (edges.top || edges.bottom) {
            return cursors.topOrBottom;
        }
        else {
            return '';
        }
    }
    function getEdgesDiff(_a) {
        var edges = _a.edges, initialRectangle = _a.initialRectangle, newRectangle = _a.newRectangle;
        var edgesDiff = {};
        Object.keys(edges).forEach(function (edge) {
            edgesDiff[edge] = (newRectangle[edge] || 0) - (initialRectangle[edge] || 0);
        });
        return edgesDiff;
    }
    var getTotalDiff = function (edgesDiff) { return Object.values(edgesDiff)
        .map(function (edge) { return Math.abs(edge || 0); })
        .reduce(function (a, b) { return Math.max(a, b); }, 0); };
    var RESIZE_ACTIVE_CLASS = 'resize-active';
    var RESIZE_GHOST_ELEMENT_CLASS = 'resize-ghost-element';
    var MOUSE_MOVE_THROTTLE_MS = 50;
    var DISABLE_CLICK_MOVE_THRESHOLD = 0;
    /**
     * Place this on an element to make it resizable. For example:
     *
     * ```html
     * <div
     *   mwlResizable
     *   [resizeEdges]="{bottom: true, right: true, top: true, left: true}"
     *   [enableGhostResize]="true">
     * </div>
     * ```
     * Or in case they are sibling elements:
     * ```html
     * <div mwlResizable #resizableElement="mwlResizable"></div>
     * <div mwlResizeHandle [resizableContainer]="resizableElement" [resizeEdges]="{bottom: true, right: true}"></div>
     * ```
     */
    var ResizableDirective = /** @class */ (function () {
        /**
         * @hidden
         */
        function ResizableDirective(platformId, renderer, elm, zone) {
            this.platformId = platformId;
            this.renderer = renderer;
            this.elm = elm;
            this.zone = zone;
            /**
             * Set to `true` to enable a temporary resizing effect of the element in between the `resizeStart` and `resizeEnd` events.
             */
            this.enableGhostResize = false;
            /**
             * A snap grid that resize events will be locked to.
             *
             * e.g. to only allow the element to be resized every 10px set it to `{left: 10, right: 10}`
             */
            this.resizeSnapGrid = {};
            /**
             * The mouse cursors that will be set on the resize edges
             */
            this.resizeCursors = DEFAULT_RESIZE_CURSORS;
            /**
             * Define the positioning of the ghost element (can be fixed or absolute)
             */
            this.ghostElementPositioning = 'fixed';
            /**
             * Allow elements to be resized to negative dimensions
             */
            this.allowNegativeResizes = false;
            /**
             * The mouse move throttle in milliseconds, default: 50 ms
             */
            this.mouseMoveThrottleMS = MOUSE_MOVE_THROTTLE_MS;
            /**
             * The distance in pixels that the mouse must move to trigger a resize event, <= 0 to disable (default)
             *
             * Below this threshold, a click event will be emitted instead
             */
            this.resizeMoveThreshold = DISABLE_CLICK_MOVE_THRESHOLD;
            /**
             * Called when the mouse is pressed and a resize event is about to begin. `$event` is a `ResizeEvent` object.
             */
            this.resizeStart = new i0.EventEmitter();
            /**
             * Called as the mouse is dragged after a resize event has begun. `$event` is a `ResizeEvent` object.
             */
            this.resizing = new i0.EventEmitter();
            /**
             * Called after the mouse is released after a resize event. `$event` is a `ResizeEvent` object.
             */
            this.resizeEnd = new i0.EventEmitter();
            /**
             * Called after the mouse is released after a click event. `$event` is a `ClickEvent` object.
             */
            this.clicked = new i0.EventEmitter();
            /**
             * @hidden
             */
            this.mouseup = new rxjs.Subject();
            /**
             * @hidden
             */
            this.mousedown = new rxjs.Subject();
            /**
             * @hidden
             */
            this.mousemove = new rxjs.Subject();
            this.destroy$ = new rxjs.Subject();
            this.pointerEventListeners = PointerEventListeners.getInstance(renderer, zone);
        }
        /**
         * @hidden
         */
        ResizableDirective.prototype.ngOnInit = function () {
            var _this = this;
            var mousedown$ = rxjs.merge(this.pointerEventListeners.pointerDown, this.mousedown);
            var mousemove$ = rxjs.merge(this.pointerEventListeners.pointerMove, this.mousemove).pipe(operators.tap(function (_a) {
                var event = _a.event;
                if (currentResize) {
                    try {
                        event.preventDefault();
                    }
                    catch (e) {
                        // just adding try-catch not to see errors in console if there is a passive listener for same event somewhere
                        // browser does nothing except of writing errors to console
                    }
                }
            }), operators.share());
            var mouseup$ = rxjs.merge(this.pointerEventListeners.pointerUp, this.mouseup);
            var currentResize;
            var removeGhostElement = function () {
                if (currentResize && currentResize.clonedNode) {
                    _this.elm.nativeElement.parentElement.removeChild(currentResize.clonedNode);
                    _this.renderer.setStyle(_this.elm.nativeElement, 'visibility', 'inherit');
                }
            };
            var getResizeCursors = function () {
                return Object.assign(Object.assign({}, DEFAULT_RESIZE_CURSORS), _this.resizeCursors);
            };
            var startVisibleResize = function () {
                currentResize.visible = true;
                var resizeCursors = getResizeCursors();
                var cursor = getResizeCursor(currentResize.edges, resizeCursors);
                _this.renderer.setStyle(document.body, 'cursor', cursor);
                _this.setElementClass(_this.elm, RESIZE_ACTIVE_CLASS, true);
                if (_this.enableGhostResize) {
                    currentResize.clonedNode = deepCloneNode(_this.elm.nativeElement);
                    _this.elm.nativeElement.parentElement.appendChild(currentResize.clonedNode);
                    _this.renderer.setStyle(_this.elm.nativeElement, 'visibility', 'hidden');
                    _this.renderer.setStyle(currentResize.clonedNode, 'position', _this.ghostElementPositioning);
                    _this.renderer.setStyle(currentResize.clonedNode, 'left', currentResize.startingRect.left + "px");
                    _this.renderer.setStyle(currentResize.clonedNode, 'top', currentResize.startingRect.top + "px");
                    _this.renderer.setStyle(currentResize.clonedNode, 'height', currentResize.startingRect.height + "px");
                    _this.renderer.setStyle(currentResize.clonedNode, 'width', currentResize.startingRect.width + "px");
                    _this.renderer.setStyle(currentResize.clonedNode, 'cursor', getResizeCursor(currentResize.edges, resizeCursors));
                    _this.renderer.addClass(currentResize.clonedNode, RESIZE_GHOST_ELEMENT_CLASS);
                    currentResize.clonedNode.scrollTop = currentResize.startingRect
                        .scrollTop;
                    currentResize.clonedNode.scrollLeft = currentResize.startingRect
                        .scrollLeft;
                }
                if (_this.resizeStart.observers.length > 0) {
                    _this.zone.run(function () {
                        _this.resizeStart.emit({
                            edges: getEdgesDiff({
                                edges: currentResize.edges,
                                initialRectangle: currentResize.startingRect,
                                newRectangle: currentResize.startingRect,
                            }),
                            rectangle: getNewBoundingRectangle(currentResize.startingRect, {}, 0, 0),
                        });
                    });
                }
            };
            var mousedrag = mousedown$
                .pipe(operators.mergeMap(function (startCoords) {
                function getDiff(moveCoords) {
                    return {
                        clientX: moveCoords.clientX - startCoords.clientX,
                        clientY: moveCoords.clientY - startCoords.clientY,
                    };
                }
                var getSnapGrid = function () {
                    var snapGrid = { x: 1, y: 1 };
                    if (currentResize) {
                        if (_this.resizeSnapGrid.left && currentResize.edges.left) {
                            snapGrid.x = +_this.resizeSnapGrid.left;
                        }
                        else if (_this.resizeSnapGrid.right &&
                            currentResize.edges.right) {
                            snapGrid.x = +_this.resizeSnapGrid.right;
                        }
                        if (_this.resizeSnapGrid.top && currentResize.edges.top) {
                            snapGrid.y = +_this.resizeSnapGrid.top;
                        }
                        else if (_this.resizeSnapGrid.bottom &&
                            currentResize.edges.bottom) {
                            snapGrid.y = +_this.resizeSnapGrid.bottom;
                        }
                    }
                    return snapGrid;
                };
                function getGrid(coords, snapGrid) {
                    return {
                        x: Math.ceil(coords.clientX / snapGrid.x),
                        y: Math.ceil(coords.clientY / snapGrid.y),
                    };
                }
                return rxjs.merge(mousemove$.pipe(operators.take(1)).pipe(operators.map(function (coords) { return [, coords]; })), mousemove$.pipe(operators.pairwise()))
                    .pipe(operators.map(function (_a) {
                    var _b = __read(_a, 2), previousCoords = _b[0], newCoords = _b[1];
                    return [
                        previousCoords ? getDiff(previousCoords) : previousCoords,
                        getDiff(newCoords),
                    ];
                }))
                    .pipe(operators.filter(function (_a) {
                    var _b = __read(_a, 2), previousCoords = _b[0], newCoords = _b[1];
                    if (!previousCoords) {
                        return true;
                    }
                    var snapGrid = getSnapGrid();
                    var previousGrid = getGrid(previousCoords, snapGrid);
                    var newGrid = getGrid(newCoords, snapGrid);
                    return (previousGrid.x !== newGrid.x || previousGrid.y !== newGrid.y);
                }))
                    .pipe(operators.map(function (_a) {
                    var _b = __read(_a, 2), newCoords = _b[1];
                    var snapGrid = getSnapGrid();
                    return {
                        clientX: Math.round(newCoords.clientX / snapGrid.x) * snapGrid.x,
                        clientY: Math.round(newCoords.clientY / snapGrid.y) * snapGrid.y,
                    };
                }))
                    .pipe(operators.takeUntil(rxjs.merge(mouseup$, mousedown$)));
            }))
                .pipe(operators.filter(function () { return !!currentResize; }));
            mousedrag
                .pipe(operators.map(function (_a) {
                var clientX = _a.clientX, clientY = _a.clientY;
                return getNewBoundingRectangle(currentResize.startingRect, currentResize.edges, clientX, clientY);
            }))
                .pipe(operators.filter(function (newBoundingRect) {
                return (_this.allowNegativeResizes ||
                    !!(newBoundingRect.height &&
                        newBoundingRect.width &&
                        newBoundingRect.height > 0 &&
                        newBoundingRect.width > 0));
            }))
                .pipe(operators.filter(function (newBoundingRect) {
                return _this.validateResize
                    ? _this.validateResize({
                        rectangle: newBoundingRect,
                        edges: getEdgesDiff({
                            edges: currentResize.edges,
                            initialRectangle: currentResize.startingRect,
                            newRectangle: newBoundingRect,
                        }),
                    })
                    : true;
            }), operators.takeUntil(this.destroy$))
                .subscribe(function (newBoundingRect) {
                var edges = getEdgesDiff({
                    edges: currentResize.edges,
                    initialRectangle: currentResize.startingRect,
                    newRectangle: newBoundingRect,
                });
                if (!currentResize.visible &&
                    getTotalDiff(edges) >= _this.resizeMoveThreshold) {
                    startVisibleResize();
                }
                if (currentResize.visible && currentResize.clonedNode) {
                    _this.renderer.setStyle(currentResize.clonedNode, 'height', newBoundingRect.height + "px");
                    _this.renderer.setStyle(currentResize.clonedNode, 'width', newBoundingRect.width + "px");
                    _this.renderer.setStyle(currentResize.clonedNode, 'top', newBoundingRect.top + "px");
                    _this.renderer.setStyle(currentResize.clonedNode, 'left', newBoundingRect.left + "px");
                }
                if (currentResize.visible && _this.resizing.observers.length > 0) {
                    _this.zone.run(function () {
                        _this.resizing.emit({
                            edges: edges,
                            rectangle: newBoundingRect,
                        });
                    });
                }
                currentResize.currentRect = newBoundingRect;
            });
            mousedown$
                .pipe(operators.map(function (_a) {
                var edges = _a.edges;
                return edges || {};
            }), operators.filter(function (edges) {
                return Object.keys(edges).length > 0;
            }), operators.takeUntil(this.destroy$))
                .subscribe(function (edges) {
                if (currentResize) {
                    removeGhostElement();
                }
                var startingRect = getElementRect(_this.elm, _this.ghostElementPositioning);
                currentResize = {
                    edges: edges,
                    startingRect: startingRect,
                    currentRect: startingRect,
                    visible: false,
                };
                if (_this.resizeMoveThreshold <= 0) {
                    startVisibleResize();
                }
            });
            mouseup$.pipe(operators.takeUntil(this.destroy$)).subscribe(function (event) {
                if (!currentResize) {
                    return;
                }
                if (currentResize.visible) {
                    _this.renderer.removeClass(_this.elm.nativeElement, RESIZE_ACTIVE_CLASS);
                    _this.renderer.setStyle(document.body, 'cursor', '');
                    _this.renderer.setStyle(_this.elm.nativeElement, 'cursor', '');
                    if (_this.resizeEnd.observers.length > 0) {
                        _this.zone.run(function () {
                            _this.resizeEnd.emit({
                                edges: getEdgesDiff({
                                    edges: currentResize.edges,
                                    initialRectangle: currentResize.startingRect,
                                    newRectangle: currentResize.currentRect,
                                }),
                                rectangle: currentResize.currentRect,
                            });
                        });
                    }
                    removeGhostElement();
                }
                else {
                    if (_this.clicked.observers.length > 0) {
                        _this.zone.run(function () {
                            _this.clicked.emit(event);
                        });
                    }
                }
                currentResize = null;
            });
        };
        /**
         * @hidden
         */
        ResizableDirective.prototype.ngOnDestroy = function () {
            // browser check for angular universal, because it doesn't know what document is
            if (common.isPlatformBrowser(this.platformId)) {
                this.renderer.setStyle(document.body, 'cursor', '');
            }
            this.mousedown.complete();
            this.mouseup.complete();
            this.mousemove.complete();
            this.destroy$.next();
        };
        ResizableDirective.prototype.setElementClass = function (elm, name, add) {
            if (add) {
                this.renderer.addClass(elm.nativeElement, name);
            }
            else {
                this.renderer.removeClass(elm.nativeElement, name);
            }
        };
        return ResizableDirective;
    }());
    ResizableDirective.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0__namespace, type: ResizableDirective, deps: [{ token: i0.PLATFORM_ID }, { token: i0__namespace.Renderer2 }, { token: i0__namespace.ElementRef }, { token: i0__namespace.NgZone }], target: i0__namespace.ɵɵFactoryTarget.Directive });
    ResizableDirective.ɵdir = i0__namespace.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.3", type: ResizableDirective, selector: "[mwlResizable]", inputs: { validateResize: "validateResize", enableGhostResize: "enableGhostResize", resizeSnapGrid: "resizeSnapGrid", resizeCursors: "resizeCursors", ghostElementPositioning: "ghostElementPositioning", allowNegativeResizes: "allowNegativeResizes", mouseMoveThrottleMS: "mouseMoveThrottleMS", resizeMoveThreshold: "resizeMoveThreshold" }, outputs: { resizeStart: "resizeStart", resizing: "resizing", resizeEnd: "resizeEnd", clicked: "clicked" }, exportAs: ["mwlResizable"], ngImport: i0__namespace });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0__namespace, type: ResizableDirective, decorators: [{
                type: i0.Directive,
                args: [{
                        selector: '[mwlResizable]',
                        exportAs: 'mwlResizable',
                    }]
            }], ctorParameters: function () {
            return [{ type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [i0.PLATFORM_ID]
                        }] }, { type: i0__namespace.Renderer2 }, { type: i0__namespace.ElementRef }, { type: i0__namespace.NgZone }];
        }, propDecorators: { validateResize: [{
                    type: i0.Input
                }], enableGhostResize: [{
                    type: i0.Input
                }], resizeSnapGrid: [{
                    type: i0.Input
                }], resizeCursors: [{
                    type: i0.Input
                }], ghostElementPositioning: [{
                    type: i0.Input
                }], allowNegativeResizes: [{
                    type: i0.Input
                }], mouseMoveThrottleMS: [{
                    type: i0.Input
                }], resizeMoveThreshold: [{
                    type: i0.Input
                }], resizeStart: [{
                    type: i0.Output
                }], resizing: [{
                    type: i0.Output
                }], resizeEnd: [{
                    type: i0.Output
                }], clicked: [{
                    type: i0.Output
                }] } });
    var PointerEventListeners = /** @class */ (function () {
        function PointerEventListeners(renderer, zone) {
            this.pointerDown = new rxjs.Observable(function (observer) {
                var unsubscribeMouseDown;
                var unsubscribeTouchStart;
                zone.runOutsideAngular(function () {
                    unsubscribeMouseDown = renderer.listen('document', 'mousedown', function (event) {
                        observer.next({
                            clientX: event.clientX,
                            clientY: event.clientY,
                            event: event,
                        });
                    });
                    if (IS_TOUCH_DEVICE) {
                        unsubscribeTouchStart = renderer.listen('document', 'touchstart', function (event) {
                            observer.next({
                                clientX: event.touches[0].clientX,
                                clientY: event.touches[0].clientY,
                                event: event,
                            });
                        });
                    }
                });
                return function () {
                    unsubscribeMouseDown();
                    if (IS_TOUCH_DEVICE) {
                        unsubscribeTouchStart();
                    }
                };
            }).pipe(operators.share());
            this.pointerMove = new rxjs.Observable(function (observer) {
                var unsubscribeMouseMove;
                var unsubscribeTouchMove;
                zone.runOutsideAngular(function () {
                    unsubscribeMouseMove = renderer.listen('document', 'mousemove', function (event) {
                        observer.next({
                            clientX: event.clientX,
                            clientY: event.clientY,
                            event: event,
                        });
                    });
                    if (IS_TOUCH_DEVICE) {
                        unsubscribeTouchMove = renderer.listen('document', 'touchmove', function (event) {
                            observer.next({
                                clientX: event.targetTouches[0].clientX,
                                clientY: event.targetTouches[0].clientY,
                                event: event,
                            });
                        });
                    }
                });
                return function () {
                    unsubscribeMouseMove();
                    if (IS_TOUCH_DEVICE) {
                        unsubscribeTouchMove();
                    }
                };
            }).pipe(operators.share());
            this.pointerUp = new rxjs.Observable(function (observer) {
                var unsubscribeMouseUp;
                var unsubscribeTouchEnd;
                var unsubscribeTouchCancel;
                zone.runOutsideAngular(function () {
                    unsubscribeMouseUp = renderer.listen('document', 'mouseup', function (event) {
                        observer.next({
                            clientX: event.clientX,
                            clientY: event.clientY,
                            event: event,
                        });
                    });
                    if (IS_TOUCH_DEVICE) {
                        unsubscribeTouchEnd = renderer.listen('document', 'touchend', function (event) {
                            observer.next({
                                clientX: event.changedTouches[0].clientX,
                                clientY: event.changedTouches[0].clientY,
                                event: event,
                            });
                        });
                        unsubscribeTouchCancel = renderer.listen('document', 'touchcancel', function (event) {
                            observer.next({
                                clientX: event.changedTouches[0].clientX,
                                clientY: event.changedTouches[0].clientY,
                                event: event,
                            });
                        });
                    }
                });
                return function () {
                    unsubscribeMouseUp();
                    if (IS_TOUCH_DEVICE) {
                        unsubscribeTouchEnd();
                        unsubscribeTouchCancel();
                    }
                };
            }).pipe(operators.share());
        }
        PointerEventListeners.getInstance = function (renderer, zone) {
            if (!PointerEventListeners.instance) {
                PointerEventListeners.instance = new PointerEventListeners(renderer, zone);
            }
            return PointerEventListeners.instance;
        };
        return PointerEventListeners;
    }());

    /**
     * An element placed inside a `mwlResizable` directive to be used as a drag and resize handle
     *
     * For example
     *
     * ```html
     * <div mwlResizable>
     *   <div mwlResizeHandle [resizeEdges]="{bottom: true, right: true}"></div>
     * </div>
     * ```
     * Or in case they are sibling elements:
     * ```html
     * <div mwlResizable #resizableElement="mwlResizable"></div>
     * <div mwlResizeHandle [resizableContainer]="resizableElement" [resizeEdges]="{bottom: true, right: true}"></div>
     * ```
     */
    var ResizeHandleDirective = /** @class */ (function () {
        function ResizeHandleDirective(renderer, element, zone, resizableDirective) {
            this.renderer = renderer;
            this.element = element;
            this.zone = zone;
            this.resizableDirective = resizableDirective;
            /**
             * The `Edges` object that contains the edges of the parent element that dragging the handle will trigger a resize on
             */
            this.resizeEdges = {};
            this.eventListeners = {};
            this.destroy$ = new rxjs.Subject();
        }
        ResizeHandleDirective.prototype.ngOnInit = function () {
            var _this = this;
            this.zone.runOutsideAngular(function () {
                _this.listenOnTheHost('mousedown').subscribe(function (event) {
                    _this.onMousedown(event, event.clientX, event.clientY);
                });
                _this.listenOnTheHost('mouseup').subscribe(function (event) {
                    _this.onMouseup(event.clientX, event.clientY);
                });
                if (IS_TOUCH_DEVICE) {
                    _this.listenOnTheHost('touchstart').subscribe(function (event) {
                        _this.onMousedown(event, event.touches[0].clientX, event.touches[0].clientY);
                    });
                    rxjs.merge(_this.listenOnTheHost('touchend'), _this.listenOnTheHost('touchcancel')).subscribe(function (event) {
                        _this.onMouseup(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                    });
                }
            });
        };
        ResizeHandleDirective.prototype.ngOnDestroy = function () {
            this.destroy$.next();
            this.unsubscribeEventListeners();
        };
        /**
         * @hidden
         */
        ResizeHandleDirective.prototype.onMousedown = function (event, clientX, clientY) {
            var _this = this;
            event.preventDefault();
            if (!this.eventListeners.touchmove) {
                this.eventListeners.touchmove = this.renderer.listen(this.element.nativeElement, 'touchmove', function (touchMoveEvent) {
                    _this.onMousemove(touchMoveEvent, touchMoveEvent.targetTouches[0].clientX, touchMoveEvent.targetTouches[0].clientY);
                });
            }
            if (!this.eventListeners.mousemove) {
                this.eventListeners.mousemove = this.renderer.listen(this.element.nativeElement, 'mousemove', function (mouseMoveEvent) {
                    _this.onMousemove(mouseMoveEvent, mouseMoveEvent.clientX, mouseMoveEvent.clientY);
                });
            }
            this.resizable.mousedown.next({
                clientX: clientX,
                clientY: clientY,
                edges: this.resizeEdges,
            });
        };
        /**
         * @hidden
         */
        ResizeHandleDirective.prototype.onMouseup = function (clientX, clientY) {
            this.unsubscribeEventListeners();
            this.resizable.mouseup.next({
                clientX: clientX,
                clientY: clientY,
                edges: this.resizeEdges,
            });
        };
        Object.defineProperty(ResizeHandleDirective.prototype, "resizable", {
            // directive might be passed from DI or as an input
            get: function () {
                return this.resizableDirective || this.resizableContainer;
            },
            enumerable: false,
            configurable: true
        });
        ResizeHandleDirective.prototype.onMousemove = function (event, clientX, clientY) {
            this.resizable.mousemove.next({
                clientX: clientX,
                clientY: clientY,
                edges: this.resizeEdges,
                event: event,
            });
        };
        ResizeHandleDirective.prototype.unsubscribeEventListeners = function () {
            var _this = this;
            Object.keys(this.eventListeners).forEach(function (type) {
                _this.eventListeners[type]();
                delete _this.eventListeners[type];
            });
        };
        ResizeHandleDirective.prototype.listenOnTheHost = function (eventName) {
            return rxjs.fromEvent(this.element.nativeElement, eventName).pipe(operators.takeUntil(this.destroy$));
        };
        return ResizeHandleDirective;
    }());
    ResizeHandleDirective.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0__namespace, type: ResizeHandleDirective, deps: [{ token: i0__namespace.Renderer2 }, { token: i0__namespace.ElementRef }, { token: i0__namespace.NgZone }, { token: ResizableDirective, optional: true }], target: i0__namespace.ɵɵFactoryTarget.Directive });
    ResizeHandleDirective.ɵdir = i0__namespace.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.3", type: ResizeHandleDirective, selector: "[mwlResizeHandle]", inputs: { resizeEdges: "resizeEdges", resizableContainer: "resizableContainer" }, ngImport: i0__namespace });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0__namespace, type: ResizeHandleDirective, decorators: [{
                type: i0.Directive,
                args: [{
                        selector: '[mwlResizeHandle]',
                    }]
            }], ctorParameters: function () {
            return [{ type: i0__namespace.Renderer2 }, { type: i0__namespace.ElementRef }, { type: i0__namespace.NgZone }, { type: ResizableDirective, decorators: [{
                            type: i0.Optional
                        }] }];
        }, propDecorators: { resizeEdges: [{
                    type: i0.Input
                }], resizableContainer: [{
                    type: i0.Input
                }] } });

    var ResizableModule = /** @class */ (function () {
        function ResizableModule() {
        }
        return ResizableModule;
    }());
    ResizableModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0__namespace, type: ResizableModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    ResizableModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0__namespace, type: ResizableModule, declarations: [ResizableDirective, ResizeHandleDirective], exports: [ResizableDirective, ResizeHandleDirective] });
    ResizableModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0__namespace, type: ResizableModule });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.3", ngImport: i0__namespace, type: ResizableModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        declarations: [ResizableDirective, ResizeHandleDirective],
                        exports: [ResizableDirective, ResizeHandleDirective],
                    }]
            }] });

    /*
     * Public API Surface of angular-resizable-element
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.ResizableDirective = ResizableDirective;
    exports.ResizableModule = ResizableModule;
    exports.ResizeHandleDirective = ResizeHandleDirective;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-resizable-element.umd.js.map
