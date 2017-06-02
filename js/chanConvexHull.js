const ChanConvexHull = function () {
	'use strict';
	
	const LEFT = 1;
	const RIGHT = -1;
	const SAME = 0;

	return { calculate: calculateHull }

	/**
	 * Calculate the angle between two points with respect to the x axis
	 * @param {*} pt1 
	 * @param {*} pt2 
	 */
	function angleToPoint(pt1, pt2) {
		return Math.atan2(pt1.y - pt2.y, pt2.x - pt1.x);
	}

	/**
	 * Calculate the angle between 3 points, with pt2 being the center point
	 * @param {*} pt1 
	 * @param {*} pt2 
	 * @param {*} pt3 
	 */
	function getAngleBetween3Points(pt1, pt2, pt3) {
		let ab = Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
		let bc = Math.sqrt(Math.pow(pt2.x - pt3.x, 2) + Math.pow(pt2.y - pt3.y, 2));
		let ac = Math.sqrt(Math.pow(pt3.x - pt1.x, 2) + Math.pow(pt3.y - pt1.y, 2));
		return Math.acos((bc * bc + ab * ab - ac * ac) / (2 * bc * ab));
	}
	/**
	 * based on the textbook, 2d area calculation between 3 points
	 * @param {*} pt1 
	 * @param {*} pt2 
	 * @param {*} pt3 
	 */
	function getAreaBetween3Points(pt1, pt2, pt3) {
		//reversed the y because js coordinates
		return (pt2.x - pt1.x) * (pt1.y - pt3.y) - (pt3.x - pt1.x) * (pt1.y - pt2.y);
	}
	/**
	 * 3 points are defined as being "left" if the area between them using the area calculation is positive.
	 * @param {*} pt1 
	 * @param {*} pt2 
	 * @param {*} pt3 
	 */
	function checkIfLeftTurn(pt1, pt2, pt3) {
		return getAreaBetween3Points(pt1, pt2, pt3) > 0;
	}

	/**
	 * Check if the points are the same
	 * @param {*} p1 
	 * @param {*} p2 
	 */
	function isSamePoint(p1, p2) {
		if (!p1 || !p2) return false;
		return p1.x === p2.x && p1.y === p2.y;
	}

	/**
	 * Do graham scan on the set of points given.
	 * @param {*} points 
	 */
	function grahamScan(points) {
		let vertexLowest = points[0];
		//find lowest point
		for (let i = 1; i < points.length; i++) {
			if (points[i].y > vertexLowest.y) {
				vertexLowest = points[i];
			}
			else if (points[i].y === vertexLowest.y && points[i].x < vertexLowest.x) {
				vertexLowest = points[i];
			}
			//console.log(v_lowest);
		}
		if (vertexLowest)

			//sort the array by angle
			points.sort(function (a, b) {
				//a is lowest point
				if (a.y === vertexLowest.y && a.x === vertexLowest.x) return -1;
				//b is lowest point
				if (b.y === vertexLowest.y && b.x === vertexLowest.x) return 1;
				//neither

				let angleA = angleToPoint(vertexLowest, a);
				let angleB = angleToPoint(vertexLowest, b);
				if (angleA > angleB) return 1;
				else return -1;
			});

		//remove doubles
		let i = 0;
		while (i < points.length - 1) {
			if (points[i].x === points[i + 1].x && points[i].y === points[i + 1].y) {
				points.splice(i + 1, 0);
			}
			i++;
		}

		let stack = [];
		if (points.length < 4) return points;
		//yeah im hardcoding this but we're not doing 
		//graham scan with < 4 things anyway i think having
		//2 is ok

		stack[0] = points[0];
		stack[1] = points[1];
		let current = points[2];
		let index = 2;
		let stackLength = 2;
		while (index < points.length) {
			stackLength = stack.length;
			//console.log(stacklen);
			if (stackLength > 1) {//make sure there's at least 2 things before left test
				let l = checkIfLeftTurn(stack[stackLength - 2], stack[stackLength - 1], points[index])
				if (l) {
					stack.push(points[index]);
					index++;
				}
				else {
					stack.pop();
				}
			}
			else {
				stack.push(points[index]);
				index++;
			}

		}

		return stack;

	}
	/**
	 * Variation of binary search to find the tangent.
	 * Full details on report
	 * @param {*} hull 
	 * @param {*} p1 
	 * @param {*} p2 
	 */
	function tangentBinarySearch(hull, p1, p2) {

		let index = -1;
		let value = -999;
		let length = hull.length;

		let start = 0;
		let end = length - 1;
		let leftSplit = -1;
		let rightSplit = -1;

		let direction = null;
		let searchSize = (end - start) + 1;
		//doing a variation of binary search by comparing range of values instead-- because the order is wrapped around
		//the section containing the larger value will be larger on the ends

		if (searchSize === 1) return 0;
		else if (searchSize === 2) {
			let ret0 = findAngle(0)
			let ret1 = findAngle(1)
			if (ret0 > ret1) return 0;
			return 1;
		}
		while (searchSize > 2) {
			searchSize = (end - start) + 1;

			let startAngle = findAngle(start);
			let endAngle = findAngle(end);
			let split = Math.floor((searchSize) / 2) + start;
			let mid = null;
			if (searchSize % 2 === 0) {//even case
				leftSplit = split - 1;
				rightSplit = split;
			} else {
				mid = split;
				leftSplit = split - 1;
				rightSplit = split + 1;
			}

			let leftAngle = findAngle(leftSplit);
			let rightAngle = findAngle(rightSplit);
			let midAngle = mid ? findAngle(mid) : -9999;
			let maxLeft = Math.max(startAngle, leftAngle);
			let maxRight = Math.max(rightAngle, endAngle)
			if (midAngle >= leftAngle && midAngle >= rightAngle) {
				return mid;
			}
			else if (maxLeft > maxRight) {
				end = leftSplit;
				if (startAngle === leftAngle) return end;
			}
			else {
				start = rightSplit;
				if (rightAngle === endAngle) return start;
			}
		}
		return start;

		function findAngle(param) {
			return (isSamePoint(p2, hull[param]) ? -999 : getAngleBetween3Points(p1, p2, hull[param]))
		}

	}


	/**
	 * do Jarvis March on the subHulls calculated by graham scan
	 * @param {*} m 
	 * @param {*} subHulls 
	 */
	function jarvisMarch(m, subHulls) {
		//We do not need to Jarvis march if there is only one subhull. This is our convex hull.
		if (subHulls.length === 1) return subHulls[0]

		//sort our sub hulls by their lowest point.
		subHulls.sort(function (a, b) {
			if (a[0].y < b[0].y) return 1;
			else return -1;
		});

		let convexhull = [];
		convexhull[0] = subHulls[0][0]

		let hullIndex = 0;
		//initial search point set to (0, first point in the full hull) for tangent search purposes
		let p0 = { x: 0, y: convexhull[0].y };


		for (let i = 0; i < m; i++) {
			let maxAngle = -99999999;
			let pk_1 = null;
			let last = (i === 0) ? p0 : convexhull[i - 1];
			for (let j = 0; j < subHulls.length; j++) {
				let result = tangentBinarySearch(subHulls[j], last, convexhull[i]);
				let angle = getAngleBetween3Points(last, convexhull[i], subHulls[j][result])

				if (!isNaN(angle) && angle > maxAngle) {
					maxAngle = angle;
					pk_1 = subHulls[j][result];
				}
			}
			//we went full circle, have convex hull
			if (pk_1.x === convexhull[0].x && pk_1.y === convexhull[0].y) return convexhull;
			convexhull.push(pk_1);
		}
		return false;
	}

	//do partial hull
	function calculatePartialHulls(m, points) {
		let numpartition = Math.ceil(points.length / m);
		let partition = [];
		let partialHullIndex = 0;
		partition.push([]);
		for (let i = 0; i < points.length; i++) {
			if (i >= (partialHullIndex + 1) * m) {
				partialHullIndex++;
				partition.push([]);
			}
			partition[partialHullIndex].push(points[i]);

		}
		let hulls = []
		for (let i = 0; i < partition.length; i++) {
			let h = grahamScan(partition[i]);
			hulls.push(h);
		}

		return hulls;


	}

	/**
	 * find the convex hull of a set of points and also the partial hulls used in the final calculation
	 * @param {*} points 
	 */
	function calculateHull(points) {
		let finalHull;
		let partialHulls = [];

		if (points.length > 3) {
			let exponent = 1;
			while (!finalHull) {
				let m = Math.pow(2, Math.pow(2, exponent));
				partialHulls = calculatePartialHulls(m, points);
				finalHull = jarvisMarch(m, partialHulls);
				exponent++;
			}

		}
		else
			finalHull = points;
		return {
			convexHull: finalHull,
			partialHulls: partialHulls
		}
	}

}();
