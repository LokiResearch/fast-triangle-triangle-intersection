// Author: Axel Antoine
// mail: ax.antoine@gmail.com
// website: https://axantoine.com
// 24/02/2022

// Loki, Inria project-team with Université de Lille
// within the Joint Research Unit UMR 9189 CNRS-Centrale
// Lille-Université de Lille, CRIStAL.
// https://loki.lille.inria.fr

// LICENCE: Licence.md

import {Triangle, Matrix4, Vector3} from 'three';
import {orient2D, permuteTriLeft, permuteTriRight,
  makeTriCounterClockwise, linesIntersect2d} from './utils';

const _matrix = new Matrix4();
const _n = new Vector3();
const _u = new Vector3();
const _v = new Vector3();
const _affineMatrix = new Matrix4().set(
  0,1,0,0,
  0,0,1,0,
  0,0,0,1,
  1,1,1,1
);

export function coplanarIntersect(t1: Triangle, t2: Triangle, target?: Vector3[]) {

  // Convert 3D coordinates into coplanar plane coordinates (so that z=0)

  // Get the unit vectors of the plane basis
  t1.getNormal(_n);
  _u.subVectors(t1.a, t1.b).normalize();
  _v.crossVectors(_n, _u);

  // Move basis to t1.a
  _u.add(t1.a);
  _v.add(t1.a);
  _n.add(t1.a);

  _matrix.set(
    t1.a.x, _u.x, _v.x, _n.x,
    t1.a.y, _u.y, _v.y, _n.y,
    t1.a.z, _u.z, _v.z, _n.z,
    1, 1, 1, 1
  );

  _matrix.invert();
  _matrix.premultiply(_affineMatrix);

  t1.a.applyMatrix4(_matrix);
  t1.b.applyMatrix4(_matrix);
  t1.c.applyMatrix4(_matrix);
  t2.a.applyMatrix4(_matrix);
  t2.b.applyMatrix4(_matrix);
  t2.c.applyMatrix4(_matrix);

  makeTriCounterClockwise(t1);
  makeTriCounterClockwise(t2);

  const p1 = t1.a;
  const p2 = t2.a;
  const q2 = t2.b;
  const r2 = t2.c;
  
  const o_p2q2 = orient2D(p2, q2, p1);
  const o_q2r2 = orient2D(q2, r2, p1);
  const o_r2p2 = orient2D(r2, p2, p1);

  // See paper Figure 6 to a better understanding of the decision tree.

  let intersecting = false;
  if (o_p2q2 >= 0) {
    if (o_q2r2 >= 0) {
      if (o_r2p2 >= 0) {
        // + + +
        intersecting = true;
      } else {
        // + + -
        intersecting = intersectionTypeR1(t1, t2);
      }
    } else {
      if (o_r2p2 >= 0) {
        // + - +
        permuteTriRight(t2);
        intersecting = intersectionTypeR1(t1, t2);
      } else {
        // + - -
        intersecting = intersectionTypeR2(t1, t2);
      }
    }
  } else {
    if (o_q2r2 >= 0) {
      if (o_r2p2 >= 0) {
        // - + +
        permuteTriLeft(t2);
        intersecting = intersectionTypeR1(t1, t2);
      } else {
        // - + -
        permuteTriLeft(t2);
        intersecting = intersectionTypeR2(t1, t2);
      }
    } else {
      if (o_r2p2 >= 0) {
        // - - +
        permuteTriRight(t2);
        intersecting = intersectionTypeR2(t1, t2);
      } else {
        // - - -
        console.error("Triangles should not be flat.", t1, t2, _v);
        return false;
      }
    }
  }

  if (intersecting && target) {
    clipTriangle(t1, t2, target);

    _matrix.invert();
    for (const p of target) {
      p.applyMatrix4(_matrix);
    }
  }

  return intersecting;
}


function intersectionTypeR1(t1: Triangle, t2: Triangle) {

  // Follow paper's convention to ease debug
  const p1 = t1.a;
  const q1 = t1.b;
  const r1 = t1.c;
  const p2 = t2.a;
  const r2 = t2.c;

  // See paper Figure 9 for a better understanding of the decision tree.

  if (orient2D(r2, p2, q1) >= 0) { // I
    if (orient2D(r2, p1, q1) >= 0) { // II.a
      if (orient2D(p1, p2, q1) >= 0) { // III.a
        return true;
      } else {
        if (orient2D(p1, p2, r1) >= 0) { // IV.a
          if (orient2D(q1, r1, p2) >= 0) { // V
            return true;
          }
        }
      }
    }
  } else {
    if (orient2D(r2, p2, r1) >= 0) { // II.b
      if (orient2D(q1, r1, r2) >= 0) { // III.b
        if (orient2D(p1, p2, r1) >= 0) { // IV.b  Diverge from paper
          return true;
        } 
      }
    }
  }

  return false;
}

function intersectionTypeR2(t1: Triangle, t2: Triangle) {

  // Follow paper's convention to ease debug
  const p1 = t1.a;
  const q1 = t1.b;
  const r1 = t1.c;
  const p2 = t2.a;
  const q2 = t2.b;
  const r2 = t2.c;

  // See paper Figure 10 for a better understanding of the decision tree.

  if (orient2D(r2, p2, q1) >= 0) { // I
    if (orient2D(q2, r2, q1) >= 0) { // II.a
      if (orient2D(p1, p2, q1) >= 0) { // III.a
        if (orient2D(p1, q2, q1) <= 0) { // IV.a
          return true;
        }
      } else {
        if (orient2D(p1, p2, r1) >= 0) { // IV.b
          if (orient2D(r2, p2, r1) <= 0) { // V.a
            return true;
          }
        }
      }
    } else {
      if (orient2D(p1, q2, q1) <= 0) { // III.b
        if (orient2D(q2, r2, r1) >= 0) { // IV.c
          if (orient2D(q1, r1, q2) >= 0) { // V.b
            return true;
          }
        }
      }
    }
  } else {
    if (orient2D(r2, p2, r1) >= 0) { // II.b
      if (orient2D(q1, r1, r2) >= 0) { // III.c
        if (orient2D(r1, p1, p2) >= 0) { // IV.d
          return true;
        }
      } else {
        if (orient2D(q1, r1, q2) >= 0) { // IV.e
          if (orient2D(q2, r2, r1) >= 0) { // V.c
            return true;
          }
        }
      }
    }
  }

  return false;
}

const _tmp = new Vector3();
const _clip = new Array<Vector3>(3).fill(_tmp);
const _output = new Array<Vector3>();
const _inter = new Vector3();
const _orients = new Array<number>(9).fill(0);

export function clipTriangle(t1: Triangle, t2: Triangle, target: Vector3[]) {
  // https://en.wikipedia.org/wiki/Sutherland–Hodgman_algorithm

  _clip[0] = t1.a;
  _clip[1] = t1.b;
  _clip[2] = t1.c;

  _output.splice(0, _output.length);
  _output.push(t2.a);
  _output.push(t2.b);
  _output.push(t2.c);

  for (let i=0; i<3; i++) {

    const input = [..._output];
    _output.splice(0, _output.length);
    const i_prev = (i+2)%3;

    // Compute orientation for the input regarding the current clip edge
    for (let j=0; j<input.length; j++) {
      _orients[j] = orient2D(_clip[i_prev], _clip[i], input[j]);
    }

    for (let j=0; j<input.length; j++) {
      const j_prev = (j-1+input.length)%input.length;

      if (_orients[j] >= 0) {
        if (_orients[j_prev] < 0) {
          linesIntersect2d(_clip[i_prev], _clip[i], input[j_prev], input[j], _inter);
          _output.push(_inter.clone());
        }
        _output.push(input[j].clone());
      } else if (_orients[j_prev] >= 0){
        linesIntersect2d(_clip[i_prev], _clip[i], input[j_prev], input[j], _inter);
        _output.push(_inter.clone());
      }
    }
  }

  // Clear duplicated points
  for (const point of _output) {

    let j = 0;
    let sameFound = false;
    while (!sameFound && j < target.length) {
      sameFound = point.distanceTo(target[j]) <= 1e-10;
      j++;
    }

    if (!sameFound) {
      target.push(point);
    }
  }

}
