+function(){
	//fields
	var canvas = $("#dotcanvas")[0]
	var offset = $(canvas).offset();
	var ctx = canvas.getContext("2d");
	var canvaswidth = canvas.width;
	var canvasheight = canvas.height;
	var pi = 3.1415926535897;
	var pts = [];
	var lowestpt = null;
	var _LEFT = 1;
	var _RIGHT = -1;
	var _SAME = 0;
	//ui functions
	var drawdot = function(dot){
		ctx.beginPath();
		ctx.arc(dot.x,dot.y,2,0,2*Math.PI);
		ctx.fill();
	}
	var clearCanvas = function(){
		ctx.clearRect(0, 0, canvaswidth, canvasheight);
	}
	var bot_limit = 100;
	var top_limit = 100;
	//randomly generate points
	var generatedots = function(){
		clearCanvas();
		pts = [];
		
		var numpts = Math.floor(Math.random()*(top_limit-bot_limit+1))+bot_limit;
		for(var i = 0; i < numpts; i++){
			var genx = Math.floor(Math.random()*(canvaswidth-60))+30;
			var geny = Math.floor(Math.random()*(canvasheight-60))+30;
			var dot = {x:genx,y:geny};
			drawdot(dot);
			pts.push(dot);
		}
		//console.log(pts);

	}
	var redrawdots = function(){
		clearCanvas();
		for(var i = 0; i < pts.length;i++){
			drawdot(pts[i]);
		}
	}
	var linepts = function(p){
		ctx.beginPath();
		ctx.moveTo(p[0].x,p[0].y);
		console.log(p.length);
		console.log(p);
		for(var i = 1; i < p.length; i ++){
			console.log(i);
			ctx.lineTo(p[i].x,p[i].y);
			
		}
		ctx.lineTo(p[0].x,p[0].y);
		ctx.stroke();
		ctx.closePath();
	}

	var drawline = function(p1,p2){
		ctx.beginPath();
		ctx.moveTo(p1.x,p1.y);
		ctx.lineTo(p2.x,p2.y);
		ctx.stroke();
		ctx.closePath();

	}

	//angle calculation helper function
	var angletopt = function(pt1, pt2){
		/*if(pt1.x === pt2.x) return pi/2; //same x case
		if(pt1.y === pt2.y){
			if(pt1.x > pt2.x) return pi; //180 degrees
			else return 0; 
		}*/
		var num = Math.atan2(pt1.y-pt2.y,pt2.x-pt1.x);
		//console.log(num)
		return num;
	}
	//find angle between 3 points, 
	//pt2 is the center point
	var angle3pt = function(pt1,pt2,pt3){
		var ab = Math.sqrt(Math.pow(pt2.x-pt1.x,2)+ Math.pow(pt2.y-pt1.y,2));    
    	var bc = Math.sqrt(Math.pow(pt2.x-pt3.x,2)+ Math.pow(pt2.y-pt3.y,2)); 
    	var ac = Math.sqrt(Math.pow(pt3.x-pt1.x,2)+ Math.pow(pt3.y-pt1.y,2));
    	return Math.acos((bc*bc+ab*ab-ac*ac)/(2*bc*ab));
	}
	//area2 from the textbook
	var area2 = function(pt1, pt2, pt3){
		//reversed the y because js coordinates
		return (pt2.x*10 - pt1.x*10)*(pt1.y*10-pt3.y*10)-(pt3.x*10-pt1.x*10)*(pt1.y*10-pt2.y*10);
	}
	//left turn
	var left = function(pt1, pt2, pt3){
		return  area2(pt1,pt2,pt3) > 0; 
	}

	var dir = function(pt1, pt2, pt3){
		var d = area2(pt1,pt2,pt3); 
		if(d === 0) return _SAME;
		else if(d < 0) return _RIGHT;
		else return _LEFT;
	}
	var samept = function(p1, p2){
		return p1.x === p2.x && p1.y === p2.y;
	}
	//graham scan function
	var grahamscan = function(p){
		var v_lowest = p[0];
		//find lowest point
		for(var i = 1; i < p.length; i++){
			//console.log(p[i])
			if(p[i].y > v_lowest.y){
				v_lowest = p[i];
			}
			else if(p[i].y === v_lowest.y && p[i].x < v_lowest.x){
				v_lowest = p[i];
			}
			//console.log(v_lowest);
		}
		if(v_lowest)
		
		//sort the array by angle
		p.sort(function(a,b){
			//a is lowest point
			if(a.y === v_lowest.y && a.x === v_lowest.x)return -1;
			//b is lowest point
			if(b.y === v_lowest.y && b.x === v_lowest.x)return 1;
			//neither
			
			var ang_a = angletopt(v_lowest,a);
			var ang_b = angletopt(v_lowest,b);
			if(ang_a > ang_b) return 1;
			else return -1;
		});

		//remove doubles
		var i = 0;
		while(i < p.length-1){
			if(p[i].x === p[i+1].x && p[i].y === p[i+1].y){
				p.splice(i+1,0);
			}
			i++;
		}

		var stack = [];
		if(p.length < 4) return p;
		 //yeah im hardcoding this but we're not doing 
		 //graham scan with < 4 things anyway i think having
		 //2 is ok

		stack[0] = p[0];
		stack[1] = p[1];
		var current = p[2];
		var index = 2;
		var stacklen = 2;
		while(index < p.length){
			stacklen = stack.length;
			//console.log(stacklen);
			if(stacklen > 1){//make sure there's at least 2 things before left test
				var l = left(stack[stacklen-2],stack[stacklen-1],p[index])
				if(l){
					stack.push(p[index]);
					index++;
				}
				else{
					stack.pop();
				}
			}
			else{
				stack.push(p[index]);
				index++;
			}
			
		}
		//stack.push(p[0]);
		console.log(stack);
		//linepts(stack);
		return stack;

	}
	//variation on binary search
	var tangent_bin_search = function(hull,p1,p2){
		
		var index = -1;
		var value = -999;
		var length = hull.length;

		var start = 0;
		var end = length-1;
		var leftsplit = -1; 
		var rightsplit = -1;

		var direction = null;
		var searchsize = (end-start)+1;
		//doing a variation of binary search by comparing range of values instead-- because the order is wrapped around, the section containing the larger value will be larger on the ends
		//console.log("HULL SIZE",length);
		while(searchsize > 2){
			searchsize = (end-start)+1;

			var s_ang = samept(p2,hull[start])?-999:angle3pt(p1,p2,hull[start]);
			var e_ang = samept(p2,hull[end])?-999:angle3pt(p1,p2,hull[end]);
			var split = Math.floor((searchsize)/2)+start;
			var mid = null;
			if(searchsize%2 === 0){//even case
				leftsplit = split-1;
				rightsplit = split;
			}else{
				mid = split;
				leftsplit = split-1;
				rightsplit = split+1;
			}

			//console.log(start,leftsplit,mid,rightsplit,end);
			var l_ang = samept(p2,hull[leftsplit])?-999:angle3pt(p1,p2,hull[leftsplit]);
			var r_ang = samept(p2,hull[rightsplit])?-999:angle3pt(p1,p2,hull[rightsplit]);
			var m_ang = mid?(samept(p2,hull[mid])?-999:angle3pt(p1,p2,hull[mid])):-9999;
			var maxleft = Math.max(s_ang,l_ang);
			var maxright = Math.max(r_ang,e_ang)
			if(m_ang >= l_ang && m_ang >= r_ang){
				//console.log("MID");
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

	var jarvismarch = function(m,hulls){
		if (hulls.length === 1) return hulls[0] //there is one hull why are we jarvismarching
		//sort hulls;
		hulls.sort(function(a,b){
			if(a[0].y < b[0].y) return 1;
			else return -1;
		})
		//test code for hull order
			ctx.strokeStyle="#FF0000";
		for(var i = 0; i < hulls.length;i++){
		
			linepts(hulls[i]);

		}
		ctx.strokeStyle="#000000";

		
		var convexhull = [];
		convexhull[0] = hulls[0][0]//bottom most point;
		var hullindex = 0;
		var p0 = {x:0, y:convexhull[0].y};
		//console.log("start",hulls[0][0])

		for(var i = 0; i < m; i++){
			var max_ang = -99999999;
			var pk_1 = null;
			var last = (i === 0)?p0:convexhull[i-1];
			for(var j = 0; j < hulls.length; j++){
				var res = tangent_bin_search(hulls[j],last,convexhull[i]);
				//console.log(res);
				var ang = angle3pt(last,convexhull[i],hulls[j][res])
				//console.log(last,convexhull[i],hulls[j][res])
				//console.log(ang);
				if(!isNaN(ang) && ang > max_ang){
					max_ang = ang;
					pk_1 = hulls[j][res];
				}
			}
			//console.log("result",pk_1)
			//console.log(convexhull[i])
			if(pk_1.x === convexhull[0].x && pk_1.y === convexhull[0].y) return convexhull;
			convexhull.push(pk_1);
			//drawline(convexhull[i],pk_1);
		}
		return false;
	}

	//do partial hull
	var partialhull = function(m,pts){
		var numpartition = Math.ceil(pts.length/m);
		var partition = [];
		var ph_index = 0;
		partition.push([]);
		for(var i = 0; i < pts.length; i++){
			if(i >= (ph_index+1)*m){
				ph_index++;
				partition.push([]);
			}
			partition[ph_index].push(pts[i]);

		}
		var hulls = []
		for(var i = 0; i < partition.length; i++){
			var h = grahamscan(partition[i]);
			hulls.push(h);
		}
		console.log(hulls);
		return jarvismarch(m,hulls);


	}

	var calchull = function(){
		var hull = null;
		if(pts.length > 3){
			var exp = 1;
			while(!hull){
				redrawdots();
				var m = Math.pow(2,Math.pow(2,exp));
				hull = partialhull(m,pts);	
				exp++;
			}
			//hull = partialhull(16);	
		}
		else 
			hull = pts;
		linepts(hull);

	}

	$("#gen_pts").on("click",function(){
		generatedots();
	})
	$("#gen_hull").on("click",function(){
		calchull();
	})
	$("#clear").on("click",function(){
		clearCanvas();
		pts = [];
	})
	$(canvas).on("click",function(e){
    	var x = e.pageX - offset.left;
    	var y = e.pageY - offset.top;
		var dot = {x:x,y:y};
		drawdot(dot);
		pts.push(dot);
	})
}();

