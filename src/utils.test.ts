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
import './testUtils/matchers';
import * as utils from './utils';

const t1 = new Triangle();

describe("isTriDegenerated", () => {

  test ("Degenerated triangles", () => {
    t1.a.set(1, 1, 0);
    t1.b.set(2, 2, 0);
    t1.c.set(3, 3, 0);
    expect(utils.isTriDegenerated(t1)).toBeTruthy();

    // Under 1e-10, triangle should be considered as degenerated
    t1.a.set(1, 1, 0);
    t1.b.set(2-1e-11, 2+1e-11, 0);
    t1.c.set(3, 3, 0);
    expect(utils.isTriDegenerated(t1)).toBeTruthy();
  });

  test ("Non Degenerated triangles", () => {
    t1.a.set(1, 1, 0);
    t1.b.set(3, 3, 0);
    t1.c.set(3, 1, 0);
    expect(utils.isTriDegenerated(t1)).not.toBeTruthy();

    // Above 1e-10, triangle should not be considered as degenerated
    t1.a.set(1, 1, 0);
    t1.b.set(2-1e-9, 2, 0);
    t1.c.set(3, 3, 0);
    expect(utils.isTriDegenerated(t1)).not.toBeTruthy();
  });

});

test("orient2D", () => {

  const a = new Vector3(0,0,0);
  const b = new Vector3(0,3,0);
  const c = new Vector3();

  c.set(-1, -1, 0);
  expect(utils.orient2D(a,b,c)).toBe(1);

  c.set(-1, 2, 0);
  expect(utils.orient2D(a,b,c)).toBe(1);

  c.set(-1, 4, 0);
  expect(utils.orient2D(a,b,c)).toBe(1);

  c.set(1, -1, 0);
  expect(utils.orient2D(a,b,c)).toBe(-1);

  c.set(1, 2, 0);
  expect(utils.orient2D(a,b,c)).toBe(-1);

  c.set(1, 4, 0);
  expect(utils.orient2D(a,b,c)).toBe(-1);

  c.set(0, 2, 0);
  expect(utils.orient2D(a,b,c)).toBe(0);

  c.set(0+1e-11, 2, 0);
  expect(utils.orient2D(a,b,c)).toBe(0);

  c.set(0-1e-9, 2, 0);
  expect(utils.orient2D(a,b,c)).toBe(1);

});


describe("permuteTri", () => {

  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();

  beforeEach(() => {
    t1.a.set(1, 1, 1);
    t1.b.set(2, 2, 2);
    t1.c.set(3, 3, 3);
    a.copy(t1.a);
    b.copy(t1.b);
    c.copy(t1.c);
  });

  test("permute right", () => {
    utils.permuteTriRight(t1);
    expect(t1.a).toEqualVector(c);
    expect(t1.b).toEqualVector(a);
    expect(t1.c).toEqualVector(b);
  });

  test("permute left", () => {
    utils.permuteTriLeft(t1);
    expect(t1.a).toEqualVector(b);
    expect(t1.b).toEqualVector(c);
    expect(t1.c).toEqualVector(a);
  });

});

test("makeTriCounterClockwise", () => {

  const a = new Vector3(1,1,0);
  const b = new Vector3(3,1,0);
  const c = new Vector3(3,3,0);

  // t1 already CCW
  t1.a.copy(a);
  t1.b.copy(b);
  t1.c.copy(c);
  utils.makeTriCounterClockwise(t1);
  expect(t1.a).toEqualVector(a);
  expect(t1.b).toEqualVector(b);
  expect(t1.c).toEqualVector(c);

  // should invert b and c
  t1.a.copy(a);
  t1.b.copy(c);
  t1.c.copy(b);
  utils.makeTriCounterClockwise(t1);
  expect(t1.a).toEqualVector(a);
  expect(t1.b).toEqualVector(b);
  expect(t1.c).toEqualVector(c);

});
