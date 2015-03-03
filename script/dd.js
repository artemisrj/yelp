function reviewinfo(){
	
	$.getJSON(dataroot, function(data){ //dataroot ��ָ���ļ�����json��ʽ���Կ����������ĸ�ʽ�����
		//alert("reviewinfo");
		arrayYelpData=new Array([data.length]);
		for(var i=0;i<data.length;i++){
			arrayYelpData[i]=data[i];
		}
	});
}

	//������ͼ
function drawChart()
{
	//getData(); //���������ݺ���������
	var newLength=dataLength;
	var _duration=1000;
		
	//����/ɾ��·��
	var lineZero = d3.svg.line()
	.x(function(d,i){if(i>=oldData.length) return w-padding; else return xScale(i);})
    .y(function(d,i){if(i>=oldData.length) return h-foot_height; else 	return yScale(oldData[i]);});
		
		//·����ʼ��
	path.attr("d",lineZero(dataset));
		
	//�ضϾ�����
	oldData=oldData.slice(0,dataset.length);
	var circle=svg.selectAll("circle").data(oldData);
		
	//ɾ�������Բ��
	circle.exit().remove();
		
	//Բ���ʼ�������Բ��,������ĵ��Ҳ�ײ�
	svg.selectAll("circle")
	.data(dataset)
	.enter()
	.append("circle")
	.attr("cx", function(d,i){
		if(i>=oldData.length) return w-padding; else return xScale(i);})  
	.attr("cy",function(d,i){
	if(i>=oldData.length) return h-foot_height; else return yScale(d);
		})  
	.attr("r",5)
	.attr("fill","#6c854b")
	.on("mousemove",function(d,i){
			
	var year=xMarks[i].substr(0,4);
	var month=xMarks[i].substr(5,2);
		
	for(var i=0;i<arrayYelpData.length;i++){
		var ss=arrayYelpData[i].date;
		var vyear=ss.substr(0,4);
		var vmonth=parseInt(ss.substr(5,2));
			
			//console.log(typeof(vmonth)+typeof(month));
		if(year==vyear&&parseInt(month)==vmonth){
				//�ұ���ʾ����
			var reviewtext=d3.select(".container").text(this.text+arrayYelpData[i].text);
				
		}
	}
})
				
		//�������ݶ���
		xScale.domain([0,newLength-1]);		
		xAxis.scale(xScale).ticks(newLength);
		xBar.transition().duration(_duration).call(xAxis);
		xBar.selectAll("text").text(function(d){return xMarks[d];});
		xInner.scale(xScale).ticks(newLength);
		xInnerBar.transition().duration(_duration).call(xInner);				
		
		//�������ݶ���
		yScale.domain([0,d3.max(dataset)]);				
		yBar.transition().duration(_duration).call(yAxis);
		yInnerBar.transition().duration(_duration).call(yInner);		
		
		//·������
		path.transition().duration(_duration).attr("d",line(dataset));
				
		//Բ�㶯��
		svg.selectAll("circle")		
		.transition()
        .duration(_duration)
		.attr("cx", function(d,i) {				
				return xScale(i);
		})  
		.attr("cy", function(d) {
				return yScale(d);  
		})								
		
	}
	
function getData(type)
{	
	if(arrayYelpData==null){
		reviewinfo();	//load review  
	}
	if(dataset.length==0){
		d3.csv("y8VQQO_WkYNjSLcq6hyjPA.csv",function(error,data){ 
		//alert("dataset null");
		if(type=="month"){
			//alert("month");
			averageData(data); //deal the point 
			
		}else if(type=="week"){
			alert("week");
			
		}
		console.log(dataset)
		drawTimeline();
		drawdense();
		fullyelpdata=data;
	})
	}else{
		if(type=="month"){
			averageData(fullyelpdata); //deal the point 
			
		}else if(type=="week"){
			averageWeek(fullyelpdata);
		}
		drawTimeline();
		drawdense();
	}
	
	return 5;
}

function averageData(data){ 	//��ƽ����ƽ����
	
	oldData=dataset; 	//oldData �洢��һ������
	dataset=[];
	var vset=[];
	var allset=[];
	maxcount=0;
	var cc=data.length;
	var oldd=new Date(data[0]["date"]);
	var msum=0;	//score of all the month
	var mc=0;	//number of the score of the month
	dataLength=0;
	var strDate;
	
	for(var i=0;i<cc;i++){
		strDate=new Date(data[i]["date"]);

		if(oldd.getFullYear()==strDate.getFullYear()&&oldd.getMonth()==strDate.getMonth()){
			msum=msum+parseInt(data[i]["score"]);
			vset.push(parseInt(data[i]["score"]));
			mc++;
		}else{
		
			var index=allset.length;
			allset[index]=new Array();
			for(var ii=0;ii<vset.length;ii++)
			{
			    allset[index].push(vset[ii]);
			}
			
			vset.length=0;
			vset.push(parseInt(data[i]["score"]));
		
			dataLength++;
			aveScore=msum/mc;
			msum=parseInt(data[i]["score"]);
			
			var singledata={};
			singledata.count=mc;
			if(mc>maxcount){
				maxcount=mc;
			}
			singledata.aveScore=aveScore;
			singledata.date=oldd.getFullYear()+"-"+(oldd.getMonth()+1)+"-15";
			
			dataset.push(singledata);
			mc=1;
			//xMarks.push(da);
			oldd=strDate;
		}
	}
	dataLength++;
	aveScore=msum/mc;
	
	var singledata={};
	singledata.count=mc;
	if(mc>maxcount){
		maxcount=mc;
	}
	
	var index=allset.length;
	allset[index]=new Array();
	for(var ii=0;ii<vset.length;ii++)
	{
		allset[index].push(vset[ii]);
	}
	
	singledata.aveScore=aveScore;
	singledata.date=strDate.getFullYear()+"-"+(strDate.getMonth()+1)+"-15";
	dataset.push(singledata);
	
	calVariance(allset);

	console.log(dataset);
	
}

function calVariance(allset){
	maxVariance=0;
		for(var i=0;i<allset.length;i++){
			var temparray=allset[i];
			var sum=0;
			for(var j=0;j<temparray.length;j++){
				sum=sum+(temparray[j]-dataset[i].aveScore)*(temparray[j]-dataset[i].aveScore);
			}
			sum=sum/allset.length;
			if(sum>maxVariance){
				maxVariance=sum;
			}
			dataset[i].variance=sum;
		}
}
	//�����������
function yeardate(date1){
	date2=new Date();
	return ((date1.valueOf() - date2.valueOf()) / 86400000);
}	
	
function averageWeek(data){
	dataset.length=0;
	//��ʼ����Ҫ��������dataset
	
	//console.log(data[0].date);
	cc=0;
	var csum=0.0;
	var jt=new Date(data[0].date);
	maxcount=0;
	var allset=[];
	var vset=[];
	maxVariance=0;
	
	//console.log(dataset);
	for(var i=0;i<data.length;i++){
		dt=new Date(data[i].date);
		//console.log(dt);
		if(dt.valueOf()>jt.valueOf()){
			//����һ�����
			cc++;
			csum=csum+parseInt(data[i].score);
			vset.push(parseInt(data[i].score));
			aveScore=csum/cc;
			
			var index=allset.length;
			allset[index]=new Array();
			for(var ii=0;ii<vset.length;ii++)
			{
			    allset[index].push(vset[ii]);
			}
			
			vset.length=0;
			
			var singledata={};
			singledata.count=cc;
			if(cc>maxcount){
				maxcount=cc;
			}
			singledata.aveScore=aveScore;
			
			var tempdate=new Date();
			tempdate.setTime(jt.valueOf()+302400000);
			
			singledata.date=tempdate.getFullYear()+"-"+(tempdate.getMonth()+1)+"-"+(tempdate.getDate());
			//console.log(singledata);
			dataset.push(singledata);
			
			csum=parseInt(data[i].score);
			vset.push(parseInt(data[i].score));
			cc=1;
			jt.setTime(jt.valueOf()+604800000);
			
		}else{
			cc++;
			csum=csum+parseInt(data[i].score);
			vset.push(parseInt(data[i].score));
		}
	}
	if(csum!=0){
		aveScore=csum/cc;
		var singledata={};
		singledata.count=cc;
		if(cc>maxcount){
			maxcount=cc;
		}
	
		var index=allset.length;
		allset[index]=new Array();
		console.log(vset);
		for(var ii=0;ii<vset.length;ii++)
		{
			allset[index].push(vset[ii]);
		}
		
		singledata.aveScore=aveScore;
		var tempdate=new Date();
		tempdate.setTime(jt.valueOf()+302400000);
		singledata.date=tempdate.getFullYear()+"-"+(tempdate.getMonth()+1)+"-"+tempdate.getDate();
		dataset.push(singledata);
	}
	
	calVariance(allset);
	console.log(dataset);
	
}
	
function wordcloud(){//����Ҫ�����Ƶķ�Χ��������Ƶ�Ч��
	 $(function() {
        // When DOM is ready, select the container element and call the jQCloud method, passing the array of words as the first argument.
		$("#ajax").click(function(){
			$.get("cgi-bin/freworddb.py",function(data,status){
				var jsons=$.parseJSON(data);
				
				var array=new Array();
				
				for(var i=0;i<jsons.length;i++){
					var obj={};
					obj.text=jsons[i][0];
					obj.weight=jsons[i][1];
					array.push(obj);
				}
				//console.log(array);
				$("#wordcloud").jQCloud(array);
				//console.log("data:" + "\n status: " + status)
				//alert("���ݣ�" + data + "\n״̬��" + status);
			});
		});
		
     });
	 
}
function brushed(){
	//console.log(xscale.range);
	xscale.domain(brush.extent())
		.range([0,w]);
	flow.attr("d",area(dataset));
	path.attr("d", strline(dataset));
	cpath.attr("d",carea(dataset));
}

function drawTimeline(){

	var timelinetop=5;
	var timelinebotton=20
	var timelineHeight=80;
	var bottontimeline=timelineHeight-timelinebotton;
	
	var xscale=d3.time.scale()
	  .domain([new Date(dataset[0].date),new Date(dataset[dataset.length-1].date)])
	  .range([0,w]);
	  
	var txaxis=d3.svg.axis()
			   .scale(xscale)
			   .orient("bottom")
			   .ticks(16);
	  
	var ymax=d3.max(dataset.map(function(d){
		return d.count;
	}))
	  
	var tyscale=d3.scale.linear()
			.domain([0,ymax])
			.range([bottontimeline,timelinetop]);    
	
	mode="basis";
	var timearea=d3.svg.area()
			.interpolate(mode)
			.x(function(d){
				return xscale(new Date(d.date))
			})
			.y0(function(d){
				return bottontimeline;
			})
			.y1(function(d){
				return tyscale(d.count);
			});
	
	var timeline=d3.select("#maincanvas")
			.append("svg")
			.attr("width",w)
			.attr("height",timelineHeight);
	
	console.log("brush");
	brush=d3.svg.brush()
			.x(xscale)
			.extent([new Date(dataset[0].date),new Date(dataset[dataset.length-1].date)])
			.on("brush",brushed);
	
	timeline.append("path")
		.attr("d",timearea(dataset))
		.style("fill",'#9abfe4')
		.style("stroke-width",0.7);
		
	var tbrush=timeline.append("g")
		.attr("class","xbrush")
		.call(brush)
	
	tbrush.selectAll("rect")
		.attr("y",0)
		.attr("height",timelineHeight-10);
		
	timeline.append("g")
	   .attr("class","x axis")
	   .attr("stroke-width","100px")
	   .attr("font-size","3px")
	   .attr("shape-rendering","crispEdges")
	   .attr("transform","translate(0,80)")
	   .call(txaxis);
}

function drawdense(){
	
	var xrange=[0,w];
	var yrange=[ybottom,10];
	//console.log(dataset);
	svg=d3.select("#maincanvas")
	.append("svg")
	.attr("width",w)
	.attr("height",h)
	.append("g")
	.attr("transform","translate(30,0)");
	
	xscale=d3.time.scale()
	  .domain([new Date(dataset[0].date),new Date(dataset[dataset.length-1].date)])
	  .range(xrange)
	  
	var areascale=d3.scale.linear()
			.domain([0,maxVariance*6])
			.range([0,ybottom-10]);
	  
	var xaxis=d3.svg.axis()
			   .scale(xscale)
			   .orient("bottom")
			   .ticks(16);
			   
	var yscale=d3.scale.linear()
				.domain([1,5])
				.range(yrange);
				
	var yaxis=d3.svg.axis()
				.scale(yscale)
				.orient("left")
				.ticks(5);
			   
	
	   
	
	
	mode="basis";
	
	strline=d3.svg.line()
				.interpolate(mode)
				.x(function(d){
					return xscale(new Date(d.date));
				})
				.y(function(d){
					//console.log(d.aveScore);
					return yscale(d.aveScore);
				});
					
	area=d3.svg.area()
			.interpolate(mode)
			.x(function(d){
				return xscale(new Date(d.date))
			})
			.y0(function(d){
				return yscale(d.aveScore)+areascale(d.variance)
			})
			.y1(function(d){
				return yscale(d.aveScore)-areascale(d.variance)
			});
			
	flow=svg.append("g")
		.attr("transform","translate(30,0)")
		.append("path")
		.attr("d",area(dataset))
		.style("fill",'#99b77b')
		.style("stroke-width",0.7);
		
	path=svg.append("g")
		.attr("transform","translate(30,0)")
		.append("path")
        .attr("d", strline(dataset))
		.style("fill","#99b77b")
		.style("fill","none")
		.style("stroke-width",1)
		.style("stroke","#2d4f2c")
		.style("stroke-opacity",0.9);
		
		
	xflowAxis=svg.append("g")
	   .attr("class","x axis")
	   .attr("stroke-width","100px")
	   .attr("font-size","3px")
	   .attr("shape-rendering","crispEdges")
	   .attr("transform","translate(30,300)")
	   .call(xaxis);
	   
	svg.append("g")
	    .attr("class","y axis")
		.attr("font-size","3px")
		.attr("transform","translate(30,0)")
		.call(yaxis);
	drawcount(xscale);
}

function drawcount(xscale){
	var num=dataset.length;

	var cscale=d3.scale.linear()
			.domain([0,maxcount])
			.range([0,60]);
			
	carea=d3.svg.area()
	.interpolate(mode)
	.x(function(d){
		return xscale(new Date(d.date))
	})
	.y0(function(d){
		return ybottom;
	})
	.y1(function(d){
		return ybottom-cscale(d.count);
	});
	
	cpath=svg.append("g")
		.attr("transform","translate(30,0)")
		.append("path")
		.attr("d",carea(dataset))
		.style("fill","#9abfe4")
		.style("stroke-width",0.7);
	
}

