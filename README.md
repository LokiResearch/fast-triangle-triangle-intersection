# triangle-triangle-intersection-js

[![build](https://github.com/LokiResearch/triangle-triangle-intersection-js/actions/workflows/node.js.yml/badge.svg)](https://github.com/LokiResearch/triangle-triangle-intersection-js/actions/workflows/node.js.yml)

A simple package providing an utility function allowing to precisely determine if two 3D triangles intersect and obtain the intersection.

Typescript definitions are included.

### Install

`npm i triangle-triangle-intersection-js`

### Documentation

```ts
trianglesIntersect(t1: Triangle, t2: Triangle, target?: Vector3[]): Intersection
```

Computes wether triangle `t1` and `t2` are intersecting and returns `Intersection.Cross` if triangles are *cross-intersecting*, `Intersection.Coplanar` if triangles are *coplanar-intersecting*, otherwise returns `null`.
If `target` array is given, **it is emptied** and intersection points are then computed and put in the array.

### Use

Check if triangles are simply crossing in 3D space.

```ts
import {Triangle} from 'three';
import {trianglesIntersect, Intersection} from 'triangle-triangle-intersection-js';

const t1 = new Triangle();
t1.a.set(-1, 0, 0);
t1.b.set(2, 0, -2);
t1.c.set(2, 0, 2);

const t2 = new Triangle();
t2.a.set(1, 0, 0);
t2.b.set(-2, -2, 0);
t2.c.set(-2, 2, 0);

const intersection = trianglesIntersect(t1, t2);
if (intersection === Intersection.Cross) {
  console.log("Triangles are cross-intersecting.");
} else if (intersection === Intersection.Coplanar) {
  console.log("Triangles are coplanar-intersecting.");
} else {
  console.log("Triangles are not intersecting.");
}
```

Obtening the intersection points.

```ts
const points = new Array<Vector3>();
if (trianglesIntersect(t1, t2, points)) {
  console.log("Intersection points: ", points) // [Vector3(1, 0, 0), Vector3(-1, 0, 0)]
}
```

### Info

This algorithm is based on this [publication](https://hal.inria.fr/inria-00072100/document).

```
@techreport{devillers:inria-00072100,
  TITLE = {{Faster Triangle-Triangle Intersection Tests}},
  AUTHOR = {Devillers, Olivier and Guigue, Philippe},
  URL = {https://hal.inria.fr/inria-00072100},
  NUMBER = {RR-4488},
  INSTITUTION = {{INRIA}},
  YEAR = {2002},
  MONTH = Jun,
  KEYWORDS = {LOW DEGREE PREDICATE ; COLLISION DETECTION ; GEOMETRIC PREDICATES},
  PDF = {https://hal.inria.fr/inria-00072100/file/RR-4488.pdf},
  HAL_ID = {inria-00072100},
  HAL_VERSION = {v1},
}
```