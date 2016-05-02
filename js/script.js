+function(){
	var canvas = $("#dotcanvas")[0]
	var offset = $(canvas).offset();
	var ctx = canvas.getContext("2d");
	var canvaswidth = canvas.width;
	var canvasheight = canvas.height;

	var pts = [];

	var drawdot = function(dot){
		ctx.beginPath();
		ctx.arc(dot.x,dot.y,2,0,2*Math.PI);
		ctx.fill();
	}
	var clearCanvas = function(){
		ctx.clearRect(0, 0, canvaswidth, canvasheight);
	}
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
	}



	var partialhull = function(m){
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
		return partition;

	}

	var calchull = function(){
		console.log(partialhull(16));
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

