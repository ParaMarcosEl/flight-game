// utils/LinearSpline.ts
export class LinearSpline<T> {
  private _points: { t: number; d: T }[] = [];
  private _lerp: (t: number, a: T, b: T) => T;

  constructor(lerpFunc: (t: number, a: T, b: T) => T) {
    this._lerp = lerpFunc;
  }

  AddPoint(t: number, d: T) {
    this._points.push({ t, d });
  }

  Get(t: number): T {
    if (this._points.length === 0) return null!;
    if (t <= this._points[0].t) return this._points[0].d;
    if (t >= this._points[this._points.length - 1].t) return this._points[this._points.length - 1].d;

    for (let i = 0; i < this._points.length - 1; i++) {
      if (t >= this._points[i].t && t <= this._points[i + 1].t) {
        const p1 = this._points[i];
        const p2 = this._points[i + 1];
        const localT = (t - p1.t) / (p2.t - p1.t);
        return this._lerp(localT, p1.d, p2.d);
      }
    }

    return this._points[this._points.length - 1].d;
  }
}
