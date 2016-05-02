+function(){
	//fields
	var canvas = $("#dotcanvas")[0]
	var offset = $(canvas).offset();
	var ctx = canvas.getContext("2d");
	var canvaswidth = canvas.width;
	var canvasheight = canvas.height;
	var pi = 3.1415926535897;
	var pts = [];
	//ui functions
	var drawdot = function(dot){
		ctx.beginPath();
		ctx.arc(dot.x,dot.y,2,0,2*Math.PI);
		ctx.fill();
	}
	var clearCanvas = function(){
		ctx.clearRect(0, 0, canvaswidth, canvasheight);
	}
	//randomly generate points
	var generatedots = function(){
		clearCanvas();
		pts = [];
		//generate between 15 and 30 points
		var numpts = Math.floor(Math.random()*16)+15;
		for(var i = 0; i < numpts; i++){
			var genx = Math.floor(Math.random()*(canvaswidth-60))+30;
			var geny = Math.floor(Math.random()*(canvasheight-60))+30;
			var dot = {x:genx,y:geny};
			drawdot(dot);
			pts.push(dot);
		}
		console.log(pts);

	}
	var linepts = function(p){
		ctx.beginPath();
		ctx.moveTo(p[0].x,p[0].y);
		for(var i = 1; i < p.length; i ++){
			console.log(angletopt(p[0],p[i]))
			//console.log(p[i].y)
			
			ctx.lineTo(p[i].x,p[i].y);
			
		}
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
	//area2 from the textbook
	var area2 = function(pt1, pt2, pt3){
		return (pt2.x - pt1.x)*(pt1.y-pt3.y)-(pt3.x-pt1.x)*(pt1.y-pt2.y);
	}
	//left turn
	var left = function(pt1, pt2, pt3){
		var a = area2(pt1,pt2,pt3);
		console.log(a)
		return  a > 0; //reverse of normal left because js screen coordinate reverses y
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
			console.log(stacklen);
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
		stack.push(p[0]);
		console.log(stack);
		linepts(stack);

	}

	//do partial hull
	var partialhull = function(m){
		console.log(pts);
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
			grahamscan(partition[i]);
		}

	}

	var calchull = function(){
		if(pts.length){
			partialhull(256);
		}
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

