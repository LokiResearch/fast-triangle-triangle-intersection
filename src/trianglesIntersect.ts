// Author: Axel Antoine
// mail: ax.antoine@gmail.com
// website: https://axantoine.com
// 24/02/2022

// Loki, Inria project-team with Université de Lille
// within the Joint Research Unit UMR 9189 CNRS-Centrale
// Lille-Université de Lille, CRIStAL.
// https://loki.lille.inria.fr

// LICENCE: Licence.md

// From research papers https://hal.inria.fr/inria-00072100/document
// Adapted from https://github.com/risgpta/Triangle-Triangle-Intersection-Algorithm-Optimised_Approach-
// and
// https://raw.githubusercontent.com/erich666/jgt-code/master/Volume_08/Number_1/Guigue2003/tri_tri_intersect.c

import {Triangle, Vector3} from 'three';
import {orient3D, isTriDegenerated} from './utils';
import {crossIntersect} from './crossIntersect';
import {coplanarIntersect} from './coplanarIntersect';

const _t1 = new Triangle();
const _t2 = new Triangle();

export enum Intersection {
  Cross = "Cross",
  Coplanar = "Coplanar"
}

/**
 * Return wether triangle t1 and t2 are cross-intersecting or coplanar-intersecting, otherwise returns null.
 * If target array is given, it is *emptied*, intersection points are then computed and put in array.
 *
 * @param      {Triangle}                t1      The t 1
 * @param      {Triangle}                t2      The t 2
 * @param      {Vector3[]}               target  The target
 * @return     {(Intersection|null)}  { description_of_the_return_value }
 */
export function trianglesIntersect(
    t1: Triangle, t2: Triangle, target?: Vector3[]): Intersection | null {

  // Check wether t1 or t2 is degenerated (flat)
  if (isTriDegenerated(t1) || isTriDegenerated(t2)) {
    console.warn("Degenerated triangles provided, skipping.");
    // TODO: check wether degenerated triangle is a line or a point, and compute
    // intersection with these new shapes
    return null;
  }

  _t1.copy(t1);
  _t2.copy(t2);
  t1 = _t1;
  t2 = _t2;

  // Check relative position of t1's vertices againt t2
  const o1a = orient3D(t2.a, t2.b, t2.c, t1.a);
  const o1b = orient3D(t2.a, t2.b, t2.c, t1.b);
  const o1c = orient3D(t2.a, t2.b, t2.c, t1.c);

  if (o1a === o1b && o1a === o1c && o1a === 0) {
    if (coplanarIntersect(t1, t2, target)) {
      return Intersection.Coplanar;
    }
    return null;
  }

  if (crossIntersect(t1, t2, o1a, o1b, o1c, target)) {
    return Intersection.Cross;
  }

  return null;
}