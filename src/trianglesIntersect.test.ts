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
import {trianglesIntersect, Intersection} from './trianglesIntersect';
import './testUtils/matchers';

const t1 = new Triangle();
const t2 = new Triangle();
let expected = new Array<Vector3>();
let target = new Array<Vector3>();

describe("Special cases", () => {

  test ("Parallel triangles", () => {
    t1.a.set(1, 0, 0);
    t1.b.set(0, 0, 1);
    t1.c.set(0, 1, 0);

    t2.a.set(2, 0, 0);
    t2.b.set(0, 0, 2);
    t2.c.set(0, 2, 0);

    expect(trianglesIntersect(t1, t2)).toBeNull();
    expect(trianglesIntersect(t2, t1)).toBeNull();
  });

  test ("One triangle degenerated", () => {
    t1.a.set(1, 0, 0);
    t1.b.set(1, 1, 2);
    t1.c.set(1, 0.5, 1);

    t2.a.set(2, 0, 0);
    t2.b.set(0, 0, 2);
    t2.c.set(0, 2, 0);

    const warn = jest.spyOn(console, 'warn').mockImplementation();
    expect(trianglesIntersect(t1, t2)).toBeNull();
    expect(warn).toHaveBeenCalledWith("Degenerated triangles provided, skipping.");
    expect(trianglesIntersect(t2, t1)).toBeNull();
    expect(warn).toHaveBeenCalledWith("Degenerated triangles provided, skipping.");
    warn.mockRestore();

  });

});

describe("Testing epsilon precision", () => {

  test ("One point close with 1e-10", () => {
    t1.a.set(0, 0, 0);
    t1.b.set(1, 1, 1);
    t1.c.set(1, 1, -1);

    t2.a.set(-1e-10, 0, 0);
    t2.b.set(-1, 1, 1);
    t2.c.set(-1, 1, -1);

    expect(trianglesIntersect(t1, t2)).toBeNull();
    expect(trianglesIntersect(t2, t1)).toBeNull();
  });

  test ("One point close with 1e-11", () => {
    t1.a.set(0, 0, 0);
    t1.b.set(1, 1, 1);
    t1.c.set(1, 1, -1);

    t2.a.set(-1e-11, 0, 0);
    t2.b.set(-1, 1, 1);
    t2.c.set(-1, 1, -1);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Cross);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Cross);
  });

  test ("Two points close with 1e-10", () => {
    t1.a.set(1,0,0);
    t1.b.set(-1,0,0);
    t1.c.set(0,1,1);

    t2.a.set(1, 0, -1e-10);
    t2.b.set(-1, 0, -1e-10);
    t2.c.set(0,1,-1);

    expect(trianglesIntersect(t1, t2)).toBeNull();
    expect(trianglesIntersect(t2, t1)).toBeNull();
  });

  test ("Two points close with 1e-11", () => {
    t1.a.set(1,0,0);
    t1.b.set(-1,0,0);
    t1.c.set(0,1,1);

    t2.a.set(1, 0, -1e-11);
    t2.b.set(-1, 0, -1e-11);
    t2.c.set(0,1,-1);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Cross);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Cross);
  });

  test ("Three points close with 1e-10", () => {
    t1.a.set(1, 0, 0);
    t1.b.set(0, 0, 1);
    t1.c.set(0, 1, 0);

    t2.a.set(1+1e-10, 0, 0);
    t2.b.set(0, 0, 1+1e-10);
    t2.c.set(0, 1+1e-10, 0);

    expect(trianglesIntersect(t1, t2)).toBeNull();
    expect(trianglesIntersect(t2, t1)).toBeNull();

  });

  test ("Three points close with 1e-11", () => {
    t1.a.set(1, 0, 0);
    t1.b.set(0, 0, 1);
    t1.c.set(0, 1, 0);

    t2.a.set(1+1e-11, 0, 0);
    t2.b.set(0, 0, 1+1e-11);
    t2.c.set(0, 1+1e-11, 0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

});

describe("Cross triangles", () => {

  test ("Normal intersection", () => {
    t1.a.set(0, 0, 0);
    t1.b.set(0, 0, 5);
    t1.c.set(5, 0, 0);

    t2.a.set(1, -1, 1);
    t2.b.set(1, -1, -1);
    t2.c.set(1, 1, 1);

    expected = [
      new Vector3(1,0,0),
      new Vector3(1,0,1),
    ];

    target = new Array<Vector3>();
    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);

    target = new Array<Vector3>();
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);
  });

  test("One tri point on the plane of the other tri", () => {
    t1.a.set(-1, 0, 0);
    t1.b.set(2, 0, -2);
    t1.c.set(2, 0, 2);

    t2.a.set(1, 0, 0);
    t2.b.set(-2, -2, 0);
    t2.c.set(-2, 2, 0);

    expected = [
      new Vector3(1,0,0),
      new Vector3(-1,0,0),
    ];

    target = new Array<Vector3>();
    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);

    target = new Array<Vector3>();
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);
  });

  test("One point of intersection", () => {
    t1.a.set(0,0,0);
    t1.b.set(0,0,2);
    t1.c.set(2,0,0);

    t2.a.set(1, -1, 0);
    t2.b.set(1, 1, 0);
    t2.c.set(1, 0, -1);

    expected = [
      new Vector3(1,0,0),
    ];

    target = new Array<Vector3>();
    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);

    target = new Array<Vector3>();
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);
  });

  test("One point in common", () => {
    t1.a.set(1, 0, 0);
    t1.b.set(2, 0, -2);
    t1.c.set(2, 0, 2);

    t2.a.set(1, 0, 0);
    t2.b.set(0, -2, 0);
    t2.c.set(0, 2, 0);

    expected = [
      new Vector3(1,0,0),
    ];

    target = new Array<Vector3>();
    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);

    target = new Array<Vector3>();
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);
  });

  test("One side in common", () => {
    t1.a.set(0,0,0);
    t1.b.set(3,0,0);
    t1.c.set(0,1,2);

    t2.a.set(0,0,0);
    t2.b.set(3,0,0);
    t2.c.set(0,1,-2);

    expected = [
      new Vector3(0,0,0),
      new Vector3(3,0,0),
    ];

    target = new Array<Vector3>();
    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);

    target = new Array<Vector3>();
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);
  });

  test("A part of a side in common", () => {
    t1.a.set(0,0,0);
    t1.b.set(3,0,0);
    t1.c.set(0,1,2);

    t2.a.set(1,0,0);
    t2.b.set(2,0,0);
    t2.c.set(0,1,-2);

    expected = [
      new Vector3(1,0,0),
      new Vector3(2,0,0),
    ];

    target = new Array<Vector3>();
    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);

    target = new Array<Vector3>();
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);
  });

  test("Almost coplanar and common point", () => {
    t1.a.set(0.0720, 0.2096, 0.3220);
    t1.b.set(0.0751, 0.2148, 0.3234);
    t1.c.set(0.0693, 0.2129, 0.3209);

    t2.a.set(0.0677, 0.2170, 0.3196);
    t2.b.set(0.0607, 0.2135, 0.3165);
    t2.c.set(0.0693, 0.2129, 0.3209);

    expected = [
      new Vector3(0.0693, 0.2129, 0.3209),
    ];

    target = new Array<Vector3>();
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);

    target = new Array<Vector3>();
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Cross);
    expect(target).toEqualVectors(expected);
  });

});

describe("Coplanar triangles", () => {

  test("Same triangles", () => {
    t1.a.set(0,0,0);
    t1.b.set(2,2,0);
    t1.c.set(0,4,0);

    t2.a.set(0,0,0);
    t2.b.set(2,2,0);
    t2.c.set(0,4,0);

    expected = [
      new Vector3(0,0,0),
      new Vector3(0,4,0),
      new Vector3(2,2,0),
    ]

    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
  });

  test("One point in common", () => {
    t1.a.set(0,0,0);
    t1.b.set(1,2,0);
    t1.c.set(0,4,0);

    t2.a.set(1,2,0);
    t2.b.set(3,0,0);
    t2.c.set(3,4,0);

    expected = [
      new Vector3(1,2,0),
    ]

    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
  });

  test("One point inside other triangle", () => {
    t1.a.set(0,0,0);
    t1.b.set(2,2,0);
    t1.c.set(0,4,0);

    t2.a.set(1,2,0);
    t2.b.set(3,0,0);
    t2.c.set(3,4,0);

    expected = [
      new Vector3(1,2,0),
      new Vector3(1.5,1.5,0),
      new Vector3(2,2,0),
      new Vector3(1.5,2.5,0),
    ]

    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
  });

  test("Two points in common", () => {
    t1.a.set(0,0,0);
    t1.b.set(3,3,0);
    t1.c.set(0,6,0);

    t2.a.set(0,0,0);
    t2.b.set(-3,3,0);
    t2.c.set(0,6,0);

    expected = [
      new Vector3(0,0,0),
      new Vector3(0,6,0),
    ]

    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
  });

  test("Two points inside other triangle", () => {
    t1.a.set(0,0,0);
    t1.b.set(3,3,0);
    t1.c.set(0,6,0);

    t2.a.set(1,2,0);
    t2.b.set(2,1,0);
    t2.c.set(2,3,0);

    expected = [
      new Vector3(1,2,0),
      new Vector3(1.5,1.5,0),
      new Vector3(2,2,0),
      new Vector3(2,3,0)
    ]

    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
  });

  test("Triangle inside other triangle in 3D", () => {
    t1.a.set(0,0,0);
    t1.b.set(4,0,0);
    t1.c.set(2,4,4);

    t2.a.set(2,3,3);
    t2.b.set(1,1,1);
    t2.c.set(3,1,1);

    expected = [
      new Vector3(2,3,3),
      new Vector3(1,1,1),
      new Vector3(3,1,1),
    ]

    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
  });

  test("One point inside each other 3D", () => {
    t1.a.set(0,0,0);
    t1.b.set(2,2,2);
    t1.c.set(0,4,4);

    t2.a.set(0,2,2);
    t2.b.set(2,4,4);
    t2.c.set(2,0,0);

    expected = [
      new Vector3(1,1,1),
      new Vector3(0,2,2),
      new Vector3(1,3,3),
      new Vector3(2,2,2),
    ]

    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
  });

  test("All edges crossing 3D", () => {
    t1.a.set(0,2,2);
    t1.b.set(4,0,0);
    t1.c.set(4,4,4);

    t2.a.set(2,0,0);
    t2.b.set(6,2,2);
    t2.c.set(2,4,4);

    expected = [
      new Vector3(2,1,1),
      new Vector3(3,0.5,0.5),
      new Vector3(4,1,1),
      new Vector3(4,3,3),
      new Vector3(3,3.5,3.5),
      new Vector3(2,3,3),
    ]

    expect(trianglesIntersect(t2, t1, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
    expect(trianglesIntersect(t1, t2, target)).toBe(Intersection.Coplanar);
    expect(target).toEqualVectors(expected);
  });

});



describe("More coplanar triangles", () => {

  beforeEach(() => {
    t2.a.set(3,0,0);
    t2.b.set(0,3,0);
    t2.c.set(0,0,0);
  });

  test("p orientation: + - -", () => {
    t1.a.set(-1,-1,0);
    t1.b.set(1,1,0);
    t1.c.set(1,-1,0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: + + -", () => {
    t1.a.set(1,-1,0);
    t1.b.set(1,1,0);
    t1.c.set(5,-1,0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: - + -", () => {
    t1.a.set(5,-1,0);
    t1.b.set(1,1,0);
    t1.c.set(2,2,0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: - + +", () => {
    t1.a.set(2,2,0);
    t1.b.set(1,1,0);
    t1.c.set(-1,5,0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: - - +", () => {
    t1.a.set(-1,5,0);
    t1.b.set(1,1,0);
    t1.c.set(-1,2,0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: + - +", () => {
    t1.a.set(-1,2,0);
    t1.b.set(1,1,0);
    t1.c.set(-1,-1,0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: + + +", () => {
    t1.a.set(1,1,0);
    t1.b.set(-1,5,0);
    t1.c.set(-1,2,0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });


});

describe("Even more coplanar triangles", () => {

  beforeEach(() => {
    t2.a.set(3,0,0);
    t2.b.set(0,3,0);
    t2.c.set(0,0,0);
  });

  test("p orientation: + - -", () => {
    t1.a.set(-1,-1,0);
    t1.b.set(1,1,0);
    t1.c.set(t1.a.x+0.2, t1.a.y-0.3, 0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: + + -", () => {
    t1.a.set(1,-1,0);
    t1.b.set(1,1,0);
    t1.c.set(t1.a.x+0.2, t1.a.y-0.3, 0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: - + -", () => {
    t1.a.set(5,-1,0);
    t1.b.set(1,1,0);
    t1.c.set(t1.a.x+0.2, t1.a.y-0.3, 0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: - + +", () => {
    t1.a.set(2,2,0);
    t1.b.set(1,1,0);
    t1.c.set(t1.a.x+0.2, t1.a.y-0.3, 0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: - - +", () => {
    t1.a.set(-1,5,0);
    t1.b.set(1,1,0);
    t1.c.set(t1.a.x+0.2, t1.a.y-0.3, 0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: + - +", () => {
    t1.a.set(-1,2,0);
    t1.b.set(1,1,0);
    t1.c.set(t1.a.x+0.2, t1.a.y-0.3, 0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("p orientation: + + +", () => {
    t1.a.set(1,1,0);
    t1.b.set(-1,5,0);
    t1.c.set(t1.a.x+0.2, t1.a.y-0.3, 0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });


});

describe("Github Issues triangles", () => {
  
  test("issue #1", () => {
    t1.a.set(-2,-2,0);
    t1.b.set(2,-2,0);
    t1.c.set(0,2,0);

    t2.a.set(0,3,0);
    t2.b.set(-3,-1,0);
    t2.c.set(3,-1,0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });

  test("issue #3", () => {
    t1.a.set(-1,0,0);
    t1.b.set(2,-2,0);
    t1.c.set(2,2,0);

    t2.a.set(0.551,-0.796,0);
    t2.b.set(1.224,0.326,0);
    t2.c.set(3.469,1,0);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);

    t1.a.set(-1,0,0);
    t1.b.set(2,0,-2);
    t1.c.set(2,0,2);

    t2.a.set(0.551,0,-0.796);
    t2.b.set(1.224,0,0.326);
    t2.c.set(3.469,0,1);

    expect(trianglesIntersect(t1, t2)).toBe(Intersection.Coplanar);
    expect(trianglesIntersect(t2, t1)).toBe(Intersection.Coplanar);
  });


});

