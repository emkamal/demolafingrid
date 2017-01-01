import * as d3 from "d3";
var gauge = function(container, configuration) {
	var that = {};
	var config = {
		size						: 200,
		clipWidth					: 200,
		clipHeight					: 110,
		ringInset					: 20,
		ringWidth					: 20,

		pointerWidth				: 10,
		pointerTailLength			: 5,
		pointerHeadLengthPercent	: 0.9,

		minValue					: 0,
		maxValue					: 10,

		minAngle					: -90,
		maxAngle					: 90,

		transitionMs				: 750,

		majorTicks					: 5,
		labelFormat					: d3.format(',g'),
		labelInset					: 10,

		arcColorFn					: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
	};
	var range = undefined;
	var r = undefined;
	var pointerHeadLength = undefined;
	var value = 0;

  var svg = undefined;
	var arc = undefined;
	var scale = undefined;
	var ticks = undefined;
	var tickData = undefined;
	var pointer = undefined;

	var donut = d3.layout.pie();

	function deg2rad(deg) {
		return deg * Math.PI / 180;
	}

	function newAngle(d) {
		var ratio = scale(d);
		var newAngle = config.minAngle + (ratio * range);
		return newAngle;
	}

	function configure(configuration) {
		var prop = undefined;
		for ( prop in configuration ) {
			config[prop] = configuration[prop];
		}

		range = config.maxAngle - config.minAngle;
		r = config.size / 2;
		pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

		// a linear scale that maps domain values to a percent from 0..1
		scale = d3.scale.linear()
			.range([0,1])
			.domain([config.minValue, config.maxValue]);

		ticks = scale.ticks(config.majorTicks);
		tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});

		arc = d3.svg.arc()
			.innerRadius(r - config.ringWidth - config.ringInset)
			.outerRadius(r - config.ringInset)
			.startAngle(function(d, i) {
				var ratio = d * i;
				return deg2rad(config.minAngle + (ratio * range));
			})
			.endAngle(function(d, i) {
				var ratio = d * (i+1);
				return deg2rad(config.minAngle + (ratio * range));
			});
	}
	that.configure = configure;

	function centerTranslation() {
		return 'translate('+(r+250) +','+ (r+150) +')';
	}

	function isRendered() {
		return (svg !== undefined);
	}
	that.isRendered = isRendered;

	function render(newValue) {
		var svg = d3.select(container)
			.append('svg:svg')
				.attr('class', 'balance')
				.attr('width', 2*config.clipWidth)
				.attr('height', 2*config.clipHeight);

    // // Add lines
    // var margin = 10;
    // var lineDir = [
    //   { x1:400, y1:250, x2:40, y2:50 },
    //   { x1:400, y1:250, x2:40, y2:450 },
    //   { x1:400, y1:250, x2:660, y2:50 },
    //   { x1:400, y1:250, x2:660, y2:450 },
    // ];
    //
    // d3.range(4).forEach(function(i){
    // 	svg.append('line')
    // 		.attr("class", "arrow")
  	// 		.attr("marker-end", "url(#arrow)")
  	// 		.attr("x1", lineDir[i].x1)
    // 		.attr("y1", lineDir[i].y1)
    // 		.attr("x2", lineDir[i].x2)
    // 		.attr("y2", lineDir[i].y2)
  	// 		});
    // })
    var line1 = svg.append('line')
          .attr("class", "flowline-input")
          .attr("marker-end", "url(#arrow)")
        	.attr("x1", 400)
          .attr("y1", 250)
          .attr("x2", 100)
          .attr("y2", 70);
    var line2 = svg.append('line')
          .attr("class", "flowline-input")
          .attr("marker-end", "url(#arrow)")
          .attr("x1", 400)
          .attr("y1", 250)
          .attr("x2", 100)
          .attr("y2", 450);
    var line3 = svg.append('line')
          .attr("class", "flowline-output")
          .attr("marker-end", "url(#arrow)")
          .attr("x1", 400)
          .attr("y1", 250)
          .attr("x2", 660)
          .attr("y2", 50);
    var line4 = svg.append('line')
          .attr("class", "flowline-output")
          .attr("marker-end", "url(#arrow)")
          .attr("x1", 400)
          .attr("y1", 250)
          .attr("x2", 660)
          .attr("y2", 450);
    // Add Gauge Panel
    var gaugePanel = svg.append("rect")
          .attr("class", "gaugePanel")
          .attr('x',200)
          .attr('y', 130)
          .attr('rx', 10)
          .attr('ry', 10)
          .attr('width', 340)
          .attr('height', 220);
    var panelLabel = svg.append("text")
          .attr("id", "panelLabel")
          .attr('x', 310)
          .attr('y', 330)
          .text("Real-time Frequency")
          .attr('fill', 'beige');
    // Add Gauge
    var svgContainer = svg.append("g")
          .attr("class", "gauge")
          .attr('width', config.clipWidth)
          .attr('height', config.clipHeight);

    //dummy data
    var dataset = [
      [ 'import', 1000 ],
      [ 'production', 3000 ],
      [ 'export', 2498 ],
      [ 'consumption', 1573 ]
    ];
    var c=d3.rgb('#3e6c0a') // d3_Rgb object
    c.toString(); // "#ee82ee"
    // Add Circles
    var svgContainer2 = svg.append("g")
          .attr("class", "components_circles")
          .attr("width", 200)
          .attr("height", 200);
    var impCircle = svgContainer2.append("circle")
          .data(dataset)
          .attr('class', 'impCircle')
          .attr("cx", 70)
          .attr("cy", 60)
          .attr('r', Math.sqrt(dataset[0][1] *4/Math.PI))
          .style("fill", c)
          .transition()
          .duration(2500)
          .on("start", function repeat() {
            d3.active(this)
              .attr('r', 1.1*Math.sqrt(dataset[0][1] *4/Math.PI))
              .style("fill", c.brighter().toString())
          .transition()
              .attr('r', .9*Math.sqrt(dataset[0][1] *4/Math.PI))
              .style("fill", c.darker().toString())
          .transition()
            .on("start", repeat);
      });
    var prodCircle = svgContainer2.append("circle")
          .attr('class', 'prodCircle')
          .attr("cx", 70)
          .attr("cy", 450)
          .attr('r', Math.sqrt(dataset[1][1] *4/Math.PI))
          .style("fill", c)
          .transition()
          .duration(2500)
          .on("start", function repeat() {
            d3.active(this)
              .attr('r', 1.1*Math.sqrt(dataset[1][1] *4/Math.PI))
              .style("fill", c.brighter().toString())
          .transition()
              .attr('r', .9*Math.sqrt(dataset[1][1] *4/Math.PI))
              .style("fill", c.darker().toString())
          .transition()
            .on("start", repeat);
      });
    var expCircle = svgContainer2.append("circle")
          .attr('class', 'expCircle')
          .attr("cx", 660)
          .attr("cy", 60)
          .attr('r', Math.sqrt(dataset[2][1] *4/Math.PI))
          .style("fill", c)
          .transition()
          .duration(2500)
          .on("start", function repeat() {
            d3.active(this)
              .attr('r', 1.1*Math.sqrt(dataset[2][1] *4/Math.PI))
              .style("fill", c.brighter().toString())
          .transition()
              .attr('r', .9*Math.sqrt(dataset[2][1] *4/Math.PI))
              .style("fill", c.darker().toString())
          .transition()
            .on("start", repeat);
      });
    var consCircle = svgContainer2.append("circle")
          .attr('class', 'consCircle')
          .attr("cx", 660)
          .attr("cy", 450)
          .attr('r', Math.sqrt(dataset[3][1] *4/Math.PI))
          .style("fill", c)
          .transition()
          .duration(2500)
          .on("start", function repeat() {
            d3.active(this)
              .attr('r', 1.1*Math.sqrt(dataset[3][1] *4/Math.PI))
              .style("fill", c.brighter().toString())
          .transition()
              .attr('r', .9*Math.sqrt(dataset[3][1] *4/Math.PI))
              .style("fill", c.darker().toString())
          .transition()
            .on("start", repeat);
      });
    // Add Circle Texts
    var impLabel = svgContainer2.append("text")
          .attr("id", "impLabel")
          .attr("x", 40+10)
          .attr("y", 65)
          .text("Import")
          .attr("fill", "white");
    var prodLabel = svgContainer2.append("text")
          .attr("id", "prodLabel")
          .attr("x", 40)
          .attr("y", 450)
          .text("Production")
          .attr("fill", "white");
    var expLabel = svgContainer2.append("text")
          .attr("id", "expLabel")
          .attr("x", 640)
          .attr("y", 60)
          .text("Export")
          .attr("fill", "white");
    var consLabel = svgContainer2.append("text")
          .attr("id", "consLabel")
          .attr("x", 620)
          .attr("y", 450)
          .text("Consumption")
          .attr("fill", "white");

		var centerTx = centerTranslation();
		var arcs = d3.select('.gauge').append('g')
				.attr('class', 'arc')
				.attr('transform', centerTx);

		arcs.selectAll('path')
				.data(tickData)
			.enter().append('path')
				.attr('fill', function(d, i) {
					return config.arcColorFn(d * i);
				})
				.attr('d', arc);

		var lg = d3.select('.gauge').append('g')
				.attr('class', 'label')
				.attr('transform', centerTx);
		lg.selectAll('text')
				.data(ticks)
			.enter().append('text')
				.attr('transform', function(d) {
					var ratio = scale(d);
					var newAngle = config.minAngle + (ratio * range);
					return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
				})
				.text(config.labelFormat);

		var lineData = [ [config.pointerWidth / 2, 0],
						[0, -pointerHeadLength],
						[-(config.pointerWidth / 2), 0],
						[0, config.pointerTailLength],
						[config.pointerWidth / 2, 0] ];
		var pointerLine = d3.svg.line().interpolate('monotone');
		var pg = d3.select('.gauge').append('g').data([lineData])
				.attr('class', 'pointer')
				.attr('transform', centerTx);

		pointer = pg.append('path')
			.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
			.attr('transform', 'rotate(' +config.minAngle +')');

		update(newValue === undefined ? 0 : newValue);
	}
	that.render = render;

	function update(newValue, newConfiguration) {
		if ( newConfiguration  !== undefined) {
			configure(newConfiguration);
		}
		var ratio = scale(newValue);
		var newAngle = config.minAngle + (ratio * range);
		pointer.transition()
			.duration(config.transitionMs)
			//.ease('elastic')
			.attr('transform', 'rotate(' +newAngle +')');
	}
	that.update = update;

	configure(configuration);

	return that;
};

function onDocumentReady() {
	var powerGauge = gauge('#power-gauge', {
		size: 250,
		clipWidth: 400,
		clipHeight: 400,
		ringWidth: 60,
		maxValue: 100,
		transitionMs: 4000,
	});
	powerGauge.render();

	function updateReadings() {
		// just pump in random data here...
		powerGauge.update(Math.random() * 10);
	}

	// every few seconds update reading values
	updateReadings();
	setInterval(function() {
		updateReadings();
	}, 5 * 1000);
}

if ( !window.isLoaded ) {
	window.addEventListener("load", function() {
		onDocumentReady();
	}, false);
} else {
	onDocumentReady();
}
