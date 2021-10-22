// Derived from https://github.com/d3/d3-shape/blob/master/src/curve/linear.js
// NOTE: The types in this file may be completely incorrect 😬

import { CurveFactory, CurveGenerator } from 'd3-shape';
import { Path } from 'd3-path';

interface D3SigmoidCurveFactory extends CurveFactory {
  compression: { (compression: number): D3SigmoidCurveFactory };
}

interface D3SigmoidCurveGenerator extends CurveGenerator {
  _context: CanvasRenderingContext2D | Path;
  _compression: number;
  _line: number;
  _point: number;
  _prevX: number;
  _prevY: number;
}

function point(that: D3SigmoidCurveGenerator, x: number, y: number) {
  that._context.bezierCurveTo(
    that._prevX + (x - that._prevX) * that._compression,
    that._prevY,
    x - (x - that._prevX) * that._compression,
    y,
    x,
    y
  );
}

// I'm not sure if "compression" is the proper mathematical term...
// A compression between 0 (straight lines) and 1 will give the best results
// The closer you approach 1, the cleaner the lines will look but the more difficult it will be to distinguish between
// multiple lines
function D3SigmoidCurve(
  this: D3SigmoidCurveGenerator,
  context: CanvasRenderingContext2D | Path,
  compression: number
) {
  this._context = context;
  this._compression = compression;
}

D3SigmoidCurve.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    this._point = 0;
  },
  lineEnd: function () {
    if (this._line || (this._line !== 0 && this._point === 1))
      this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function (x: number, y: number) {
    x = +x;
    y = +y;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
        break;
      // @ts-ignore
      case 1:
        this._point = 2; // proceed
      // eslint-disable-next-line no-fallthrough
      default:
        point(this, x, y);
        break;
    }
    this._prevX = x;
    this._prevY = y;
  },
} as D3SigmoidCurveGenerator;

export default (function custom(compression: number): D3SigmoidCurveFactory {
  function cardinal(
    context: CanvasRenderingContext2D | Path
  ): D3SigmoidCurveGenerator {
    // https://stackoverflow.com/a/51622913/399105
    return new (D3SigmoidCurve as any)(context, compression);
  }

  cardinal.compression = function (compression: number) {
    return custom(compression);
  };

  return cardinal;
})(0.75);
