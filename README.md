# triangles-intersect

[![build](https://github.com/minitoine/triangles-intersect/actions/workflows/node.js.yml/badge.svg)](https://github.com/minitoine/triangles-intersect/actions/workflows/node.js.yml)

A simple package providing an utility function allowing to precisely determine if two 3D triangles intersect and obtain the intersection.



### Use

```ts
import {Triangle, Line3} from 'three';
import {trianglesIntersect} from 'triangles-intersect';

const t1 = new Triangle();
t1.a.set(-1, 0, 0);
t1.b.set(2, 0, -2);
t1.c.set(2, 0, 2);

const t2 = new Triangle();
t2.a.set(1, 0, 0);
t2.b.set(-2, -2, 0);
t2.c.set(-2, 2, 0);

const target = new Line3();
if (trianglesIntersect(t1, t2, target)) {
	console.log(target) // Displays {start:(1, 0, 0), end:(-1, 0, 0)}
}
```

### Documentation

```ts
trianglesIntersect(t1: Triangle, t2: Triangle, target?: Line3): boolean
```

Return true if `t1` and `t2` intersect, false otherwise.
`target` will contain the intersection shape if provided, otherwise, only the intersection status is computed.

Note: coplanar triangles are not currently handled and the function returns false if the case is detected.

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