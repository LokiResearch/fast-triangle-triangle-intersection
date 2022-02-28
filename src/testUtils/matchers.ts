// Author: Axel Antoine
// mail: ax.antoine@gmail.com
// website: https://axantoine.com
// 24/02/2022

// Loki, Inria project-team with Université de Lille
// within the Joint Research Unit UMR 9189 CNRS-Centrale
// Lille-Université de Lille, CRIStAL.
// https://loki.lille.inria.fr

// LICENCE: Licence.md

import {Vector3} from 'three';

declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualVectors(espected: Vector3[], precision?: number): CustomMatcherResult;
    }
  }
}

function strVector3(a: Vector3) {
  return `(${a.x}, ${a.y}, ${a.z})`;
}

function strPoly3(p: Vector3[]) {
  let s = "";
  p.map((v,idx) => s += '\t'+idx+": "+strVector3(v)+'\n');
  return s;
}

function compareVector3(a: Vector3, b: Vector3) {
  if (Math.abs(a.x - b.x) > 1e-10) {
    return a.x - b.x;
  } else if (Math.abs(a.y - b.y) > 1e-10) {
    return a.y - b.y;
  } else {
    return a.z - b.z;
  }
}

expect.extend({
  toEqualVectors(received: Vector3[], expected: Vector3[], precision = 1e-10) {

    if (received.length !== expected.length) {
      return {
        message: () =>
          `Expected polygons to have the same size \n`+
          `Received [ size = ${received.length} ]:\n`+strPoly3(received)+
          `Expected [ size = ${expected.length} ]:\n`+strPoly3(expected),
        pass: false
      }
    }

    received.sort(compareVector3);
    expected.sort(compareVector3);

    let pass = true;
    let i = 0;
    while (pass && i<received.length) {
      pass = received[i].distanceTo(expected[i]) <= precision;
      i += 1;
    }

    if (pass) {
      return {
        message: () =>
          `Expected polygons not to be equal \n`+
          'Received:\n'+strPoly3(received)+
          'Expected:\n'+strPoly3(expected),
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected polygons to be equal [failed at index ${i-1}]\n`+
          'Received:\n'+strPoly3(received)+
          'Expected:\n'+strPoly3(expected),
        pass: false,
      };
    }
  }

});
