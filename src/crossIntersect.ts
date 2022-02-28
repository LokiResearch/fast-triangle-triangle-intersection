// Author: Axel Antoine
// mail: ax.antoine@gmail.com
// website: https://axantoine.com
// 24/02/2022

// Loki, Inria project-team with Université de Lille
// within the Joint Research Unit UMR 9189 CNRS-Centrale
// Lille-Université de Lille, CRIStAL.
// https://loki.lille.inria.fr

// LICENCE: Licence.md

import {Triangle, Vector3} from 'three';
import {orient3D, permuteTriLeft, permuteTriRight} from './utils';

const EPSILON = 1e-10;
const _u = new Vector3();
const _v = new Vector3();
const _n1 = new Vector3();
const _n2 = new Vector3();
const _i1 = new Vector3();
const _i2 = new Vector3();

export function crossIntersect(
    t1: Triangle, t2: Triangle,
    o1a: number, o1b: number, o1c: number,
    target?: Vector3[]) {

  // Check relative position of t1's vertices againt t2
  const o2a = orient3D(t1.a, t1.b, t1.c, t2.a);
  const o2b = orient3D(t1.a, t1.b, t1.c, t2.b);
  const o2c = orient3D(t1.a, t1.b, t1.c, t2.c);

  if (o2a === o2b && o2a === o2c) {
    return false;
  }

  makeTriAVertexAlone(t1, o1a, o1b, o1c);
  makeTriAVertexAlone(t2, o2a, o2b, o2c);

  makeTriAVertexPositive(t2, t1);
  makeTriAVertexPositive(t1, t2);

  const o1 = orient3D(t1.a, t1.b, t2.a, t2.b);
  const o2 = orient3D(t1.a, t1.c, t2.c, t2.a);

  if (o1 <= 0 && o2 <=0) {
    if (target) {
      computeLineIntersection(t1, t2, target);
    }
    return true;
  }

  return false;
}

function makeTriAVertexAlone(tri: Triangle, oa: number, ob: number, oc: number) {

  // Permute a, b, c so that a is alone on its side
  if (oa === ob) {
    // c is alone, permute right so c becomes a
    permuteTriRight(tri);

  } else if (oa === oc) {
    // b is alone, permute so b becomes a
    permuteTriLeft(tri);
  } else if (ob !== oc) {

    // In case a, b, c have different orientation, put a on positive side
    if (ob > 0) {
      permuteTriLeft(tri);
    } else if (oc > 0) {
      permuteTriRight(tri);
    }
  }

}

function makeTriAVertexPositive(tri: Triangle, other: Triangle) {
  const o = orient3D(other.a, other.b, other.c, tri.a);
  if (o < 0) {
    const tmp = other.c;
    other.c = other.b;
    other.b = tmp;
  }
}

function intersectPlane(
    a: Vector3, b: Vector3,
    p: Vector3, n: Vector3,
    target: Vector3) {

  _u.subVectors(b, a);
  _v.subVectors(a, p);
  const dot1 = n.dot(_u);
  const dot2 = n.dot(_v);
  _u.multiplyScalar(-dot2/dot1);
  target.addVectors(a, _u);

}

function computeLineIntersection(t1: Triangle, t2: Triangle, target: Vector3[]) {

  t1.getNormal(_n1);
  t2.getNormal(_n2);

  const o1 = orient3D(t1.a, t1.c, t2.b, t2.a);
  const o2 = orient3D(t1.a, t1.b, t2.c, t2.a);

  if (o1 > 0) {
    if (o2 > 0) {

      // Intersection: k i l j
      intersectPlane(t1.a, t1.c, t2.a, _n2, _i1); // i
      intersectPlane(t2.a, t2.c, t1.a, _n1, _i2); // l

    } else {

      // Intersection: k i j l
      intersectPlane(t1.a, t1.c, t2.a, _n2, _i1); // i
      intersectPlane(t1.a, t1.b, t2.a, _n2, _i2); // j

    }

  } else {
    if (o2 > 0) {

      // Intersection: i k l j
      intersectPlane(t2.a, t2.b, t1.a, _n1, _i1); // k
      intersectPlane(t2.a, t2.c, t1.a, _n1, _i2); // l

    } else {

      // Intersection: i k j l
      intersectPlane(t2.a, t2.b, t1.a, _n1, _i1); // i
      intersectPlane(t1.a, t1.b, t2.a, _n2, _i2); // k

    }
  }

  // Be sure to empty target array
  target.splice(0, target.length);

  target.push(_i1.clone());
  if (_i1.distanceTo(_i2) >= EPSILON) {
    target.push(_i2.clone());
  }
}