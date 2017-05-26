(function () {
	'use strict'

	const canvas = $("#point-canvas")[0]
	const canvasOffset = $(canvas).offset();
	const ctx = canvas.getContext("2d");
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;

	const minNumPoints = 500;
	const maxNumPoints = 1000;
	
	let points = [];

	initEventListeners();

	function initEventListeners() {
		$("#btn-gen-pts").on("click", generateAndDrawNewPoints);
		$("#btn-gen-hull").on("click", generateAndRenderConvexHull)
		$("#btn-clear").on("click", resetCanvas)
		$(canvas).on("click", drawPoint)
	}


	function renderPoint(point) {
		ctx.beginPath();
		ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
		ctx.fill();
	}
	function clearCanvas() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	}
	
	//randomly generate points
	function generatePoints() {
		let pts = [];

		let numpts = Math.floor(Math.random() * (maxNumPoints - minNumPoints + 1)) + minNumPoints;
		for (let i = 0; i < numpts; i++) {
			let genx = Math.floor(Math.random() * (canvasWidth - 60)) + 30;
			let geny = Math.floor(Math.random() * (canvasHeight - 60)) + 30;
			let dot = { x: genx, y: geny };
			pts.push(dot);
		}

		return pts;

	}
	function redrawPoints(points) {
		clearCanvas();
		for (let i = 0; i < points.length; i++) {
			renderPoint(points[i]);
		}
	}
	function connectPointsByLine(points) {
		if (!points.length) return;
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.lineTo(points[0].x, points[0].y);
		ctx.stroke();
		ctx.closePath();
	}

	function renderLine(p1, p2) {
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.stroke();
		ctx.closePath();

	}

	function generateAndDrawNewPoints() {
		points = generatePoints();
		redrawPoints(points);
	}

	function generateAndRenderConvexHull() {
		let { convexHull, partialHulls } = ChenConvexHull.calculate(points);
		ctx.strokeStyle = "#FF0000";
		for (let i = 0; i < partialHulls.length; i++) {
			connectPointsByLine(partialHulls[i]);
		}
		ctx.strokeStyle = "#000000";
		connectPointsByLine(convexHull);
	}

	function resetCanvas() {
		clearCanvas();
		points = [];
	}

	function drawPoint(e) {
		let x = e.pageX - canvasOffset.left;
		let y = e.pageY - canvasOffset.top;
		let dot = { x: x, y: y };
		renderPoint(dot);
		points.push(dot);
	}


})();

