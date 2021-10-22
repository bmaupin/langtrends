// Derived from https://github.com/d3/d3-shape/blob/master/src/curve/linear.js

function point(that, x, y) {
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
function D3SigmoidCurve(context, compression) {
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
  point: function (x, y) {
    x = +x;
    y = +y;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
        break;
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
};

export default (function custom(compression) {
  function cardinal(context) {
    return new D3SigmoidCurve(context, compression);
  }

  cardinal.compression = function (compression) {
    return custom(compression);
  };

  return cardinal;
})(0.75);
