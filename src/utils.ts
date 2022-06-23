// Author: Axel Antoine
// mail: ax.antoine@gmail.com
// website: https://axantoine.com
// 24/02/2022

// Loki, Inria project-team with Université de Lille
// within the Joint Research Unit UMR 9189 CNRS-Centrale
// Lille-Université de Lille, CRIStAL.
// https://loki.lille.inria.fr

// LICENCE: Licence.md

import {Triangle, Vector3, Matrix3, Matrix4} from 'three';

const EPSILON = 1e-10;
const _tmp1 = new Vector3();
const _tmp2 = new Vector3();
const _matrix4 = new Matrix4();
const _matrix3 = new Matrix3();

export function isTriDegenerated(tri: Triangle) {

  _tmp1.subVectors(tri.a, tri.b);
  _tmp2.subVectors(tri.a, tri.c);
  _tmp1.cross(_tmp2);

  return _tmp1.x > -EPSILON && _tmp1.x < EPSILON &&
         _tmp1.y > -EPSILON && _tmp1.y < EPSILON &&
         _tmp1.z > -EPSILON && _tmp1.z < EPSILON;
}

export function orient3D(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {

  _matrix4.set(
    a.x, a.y, a.z, 1,
    b.x, b.y, b.z, 1,
    c.x, c.y, c.z, 1,
    d.x, d.y, d.z, 1
  );
  const det = _matrix4.determinant();

  if (det < -EPSILON)
    return -1;
  else if (det > EPSILON)
    return 1;
  else
    return 0;
}

export function orient2D(a: Vector3, b: Vector3, c: Vector3) {

  _matrix3.set(
    a.x, a.y, 1,
    b.x, b.y, 1,
    c.x, c.y, 1
  );
  const det = _matrix3.determinant();

  if (det < -EPSILON)
    return -1;
  else if (det > EPSILON)
    return 1;
  else
    return 0;
}

export function permuteTriLeft(tri: Triangle) {
  const tmp = tri.a;
  tri.a = tri.b;
  tri.b = tri.c;
  tri.c = tmp;
}

export function permuteTriRight(tri: Triangle) {
  const tmp = tri.c;
  tri.c = tri.b;
  tri.b = tri.a;
  tri.a = tmp;
}

export function makeTriCounterClockwise(tri: Triangle) {

  if (orient2D(tri.a, tri.b, tri.c) < 0) {
    const tmp = tri.c;
    tri.c = tri.b;
    tri.b = tmp;
  }
}

export function linesIntersect2d(
    a1: Vector3, b1: Vector3,
    a2: Vector3, b2: Vector3,
    target: Vector3) {

  const dx1 = (a1.x-b1.x);
  const dx2 = (a2.x-b2.x);
  const dy1 = (a1.y-b1.y);
  const dy2 = (a2.y-b2.y);

  const D = dx1*dy2 - dx2*dy1;

  // if (D > -EPSILON && D < EPSILON) {
  //   return false;
  // }

  const n1 = a1.x*b1.y - a1.y*b1.x;
  const n2 = a2.x*b2.y - a2.y*b2.x;

  target.set((n1*dx2 - n2*dx1)/D, (n1*dy2 - n2*dy1)/D, 0);

  // return true;
}

