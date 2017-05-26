(function(){
	'use strict'
	//fields
	const canvas = $("#dotcanvas")[0] 
	const canvasOffset = $(canvas).offset();
	const ctx = canvas.getContext("2d");
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;
	const LEFT = 1;
	const RIGHT = -1;
	const SAME = 0;

	let pts = [];
	//ui functions
	function renderPoint(point){
		ctx.beginPath();
		ctx.arc(point.x,point.y,2,0,2*Math.PI);
		ctx.fill();
	}
	function clearCanvas(){
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	}
	let minNumPoints = 500;
	let maxNumPoints = 1000;
	//randomly generate points
	function generatePoints(){
		clearCanvas();
		pts = [];
		
		let numpts = Math.floor(Math.random()*(maxNumPoints-minNumPoints+1))+minNumPoints;
		for(let i = 0; i < numpts; i++){
			let genx = Math.floor(Math.random()*(canvasWidth-60))+30;
			let geny = Math.floor(Math.random()*(canvasHeight-60))+30;
			let dot = {x:genx,y:geny};
			renderPoint(dot);
			pts.push(dot);
		}
		//console.log(pts);

	}
	function redrawPoints(points){
		clearCanvas();
		for(let i = 0; i < points.length;i++){
			renderPoint(points[i]);
		}
	}
	function connectPointsByLine(points){
		ctx.beginPath();
		ctx.moveTo(points[0].x,points[0].y);
		//console.log(p.length);
		//console.log(p);
		for(let i = 1; i < points.length; i ++){
			//console.log(i);
			ctx.lineTo(points[i].x,points[i].y);
			
		}
		ctx.lineTo(points[0].x,points[0].y);
		ctx.stroke();
		ctx.closePath();
	}

	function renderLine(p1,p2){
		ctx.beginPath();
		ctx.moveTo(p1.x,p1.y);
		ctx.lineTo(p2.x,p2.y);
		ctx.stroke();
		ctx.closePath();

	}

	/**
	 * Calculate the angle between two points with respect to the x axis
	 * @param {*} pt1 
	 * @param {*} pt2 
	 */
	function angleToPoint(pt1, pt2){
		return Math.atan2(pt1.y-pt2.y,pt2.x-pt1.x);
		
	}
	
	/**
	 * Calculate the angle between 3 points, with pt2 being the center point
	 * @param {*} pt1 
	 * @param {*} pt2 
	 * @param {*} pt3 
	 */
	function getAngleBetween3Points(pt1,pt2,pt3){
		let ab = Math.sqrt(Math.pow(pt2.x-pt1.x,2)+ Math.pow(pt2.y-pt1.y,2));    
    	let bc = Math.sqrt(Math.pow(pt2.x-pt3.x,2)+ Math.pow(pt2.y-pt3.y,2)); 
    	let ac = Math.sqrt(Math.pow(pt3.x-pt1.x,2)+ Math.pow(pt3.y-pt1.y,2));
    	return Math.acos((bc*bc+ab*ab-ac*ac)/(2*bc*ab));
	}
	/**
	 * based on the textbook, 2d area calculation between 3 points
	 * @param {*} pt1 
	 * @param {*} pt2 
	 * @param {*} pt3 
	 */
	function getAreaBetween3Points(pt1, pt2, pt3){
		//reversed the y because js coordinates
		return (pt2.x - pt1.x)*(pt1.y-pt3.y)-(pt3.x-pt1.x)*(pt1.y-pt2.y);
	}
	/**
	 * 3 points are defined as being "left" if the area between them using the area calculation is positive.
	 * @param {*} pt1 
	 * @param {*} pt2 
	 * @param {*} pt3 
	 */
	function checkIfLeftTurn(pt1, pt2, pt3){
		return  getAreaBetween3Points(pt1,pt2,pt3) > 0; 
	}
	function isSamePoint(p1, p2){
		return p1.x === p2.x && p1.y === p2.y;
	}
	//graham scan function
	function grahamScan(points){
		let v_lowest = points[0];
		//find lowest point
		for(let i = 1; i < points.length; i++){
			//console.log(p[i])
			if(points[i].y > v_lowest.y){
				v_lowest = points[i];
			}
			else if(points[i].y === v_lowest.y && points[i].x < v_lowest.x){
				v_lowest = points[i];
			}
			//console.log(v_lowest);
		}
		if(v_lowest)
		
		//sort the array by angle
		points.sort(function(a,b){
			//a is lowest point
			if(a.y === v_lowest.y && a.x === v_lowest.x)return -1;
			//b is lowest point
			if(b.y === v_lowest.y && b.x === v_lowest.x)return 1;
			//neither
			
			let ang_a = angleToPoint(v_lowest,a);
			let ang_b = angleToPoint(v_lowest,b);
			if(ang_a > ang_b) return 1;
			else return -1;
		});

		//remove doubles
		let i = 0;
		while(i < points.length-1){
			if(points[i].x === points[i+1].x && points[i].y === points[i+1].y){
				points.splice(i+1,0);
			}
			i++;
		}

		let stack = [];
		if(points.length < 4) return points;
		 //yeah im hardcoding this but we're not doing 
		 //graham scan with < 4 things anyway i think having
		 //2 is ok

		stack[0] = points[0];
		stack[1] = points[1];
		let current = points[2];
		let index = 2;
		let stacklen = 2;
		while(index < points.length){
			stacklen = stack.length;
			//console.log(stacklen);
			if(stacklen > 1){//make sure there's at least 2 things before left test
				let l = checkIfLeftTurn(stack[stacklen-2],stack[stacklen-1],points[index])
				if(l){
					stack.push(points[index]);
					index++;
				}
				else{
					stack.pop();
				}
			}
			else{
				stack.push(points[index]);
				index++;
			}
			
		}

		return stack;

	}
	//variation on binary search, more details in report
	function tangentBinarySearch(hull,p1,p2){
		
		let index = -1;
		let value = -999;
		let length = hull.length;

		let start = 0;
		let end = length-1;
		let leftsplit = -1; 
		let rightsplit = -1;

		let direction = null;
		let searchsize = (end-start)+1;
		//doing a variation of binary search by comparing range of values instead-- because the order is wrapped around, the section containing the larger value will be larger on the ends
		
		if (searchsize === 1) return 0;
		else if (searchsize === 2) {
			let ret0 = isSamePoint(p2,hull[0])?-999:getAngleBetween3Points(p1,p2,hull[0]);
			let ret1 = isSamePoint(p2,hull[1])?-999:getAngleBetween3Points(p1,p2,hull[1]);
			if(ret0 > ret1) return 0;
			return 1;
		}
		while(searchsize > 2){
			searchsize = (end-start)+1;

			let s_ang = isSamePoint(p2,hull[start])?-999:getAngleBetween3Points(p1,p2,hull[start]);
			let e_ang = isSamePoint(p2,hull[end])?-999:getAngleBetween3Points(p1,p2,hull[end]);
			let split = Math.floor((searchsize)/2)+start;
			let mid = null;
			if(searchsize%2 === 0){//even case
				leftsplit = split-1;
				rightsplit = split;
			}else{
				mid = split;
				leftsplit = split-1;
				rightsplit = split+1;
			}

			
			let l_ang = isSamePoint(p2,hull[leftsplit])?-999:getAngleBetween3Points(p1,p2,hull[leftsplit]);
			let r_ang = isSamePoint(p2,hull[rightsplit])?-999:getAngleBetween3Points(p1,p2,hull[rightsplit]);
			let m_ang = mid?(isSamePoint(p2,hull[mid])?-999:getAngleBetween3Points(p1,p2,hull[mid])):-9999;
			let maxleft = Math.max(s_ang,l_ang);
			let maxright = Math.max(r_ang,e_ang)
			if(m_ang >= l_ang && m_ang >= r_ang){
				
				return mid;
			}
			
			else if (maxleft > maxright){
				end = leftsplit;
				if(s_ang === l_ang) return end;
			}
			else{
				start = rightsplit;
				if(r_ang === e_ang) return start;
			}
		}
		return start;

	}

	function jarvisMarch(m,hulls){
		if (hulls.length === 1) return hulls[0] //there is one hull why are we jarvismarching
		//sort hulls based on lowest point
		hulls.sort(function(a,b){
			if(a[0].y < b[0].y) return 1;
			else return -1;
		})
		//visuals
		ctx.strokeStyle="#FF0000";
		for(let i = 0; i < hulls.length;i++){
			connectPointsByLine(hulls[i]);
		}
		ctx.strokeStyle="#000000";

		
		let convexhull = [];
		convexhull[0] = hulls[0][0]//bottom most point;
		let hullindex = 0;
		let p0 = {x:0, y:convexhull[0].y};
		//console.log("start",hulls[0][0])

		for(let i = 0; i < m; i++){
			let max_ang = -99999999;
			let pk_1 = null;
			let last = (i === 0)?p0:convexhull[i-1];
			for(let j = 0; j < hulls.length; j++){
				let res = tangentBinarySearch(hulls[j],last,convexhull[i]);
				//console.log(res);
				let ang = getAngleBetween3Points(last,convexhull[i],hulls[j][res])
		
				if(!isNaN(ang) && ang > max_ang){
					max_ang = ang;
					pk_1 = hulls[j][res];
				}
			}
			
			if(pk_1.x === convexhull[0].x && pk_1.y === convexhull[0].y) return convexhull;
			convexhull.push(pk_1);
			renderLine(convexhull[i],pk_1);
		}
		return false;
	}

	//do partial hull
	function partialHull(m,pts){
		let numpartition = Math.ceil(pts.length/m);
		let partition = [];
		let ph_index = 0;
		partition.push([]);
		for(let i = 0; i < pts.length; i++){
			if(i >= (ph_index+1)*m){
				ph_index++;
				partition.push([]);
			}
			partition[ph_index].push(pts[i]);

		}
		let hulls = []
		for(let i = 0; i < partition.length; i++){
			let h = grahamScan(partition[i]);
			hulls.push(h);
		}
		
		return jarvisMarch(m,hulls);

	}

	function calculateHull(){
		let hull = null;
		if(pts.length > 3){
			let exp = 1;
			while(!hull){
				redrawPoints(pts);
				let m = Math.pow(2,Math.pow(2,exp));
				hull = partialHull(m,pts);	
				exp++;
			}			
		}
		else 
			hull = pts;
		connectPointsByLine(hull);

	}

	$("#gen_pts").on("click",function(){
		generatePoints();
	})
	$("#gen_hull").on("click",function(){
		calculateHull();
	})
	$("#clear").on("click",function(){
		clearCanvas();
		pts = [];
	})
	$(canvas).on("click",function(e){
    	let x = e.pageX - canvasOffset.left;
    	let y = e.pageY - canvasOffset.top;
		let dot = {x:x,y:y};
		renderPoint(dot);
		pts.push(dot);
	})
})();

