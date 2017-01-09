
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
		maxValue					: 100,

		minAngle					: -90,
		midAngle					: -10,
		maxAngle					: 90,

		transitionMs				: 750,

		majorTicks					: 5,
		labelFormat					: d3.format(',d'),
		labelInset					: 10,

		arcColorFn					: [d3.rgb('#F65640'), d3.rgb('#F6AC52'), d3.rgb('#5AF694'), d3.rgb('#F6AC52'), d3.rgb('#F65640')]
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
	var tooltip = d3.select('body').append('div')
	              .attr("class", "tooltip")
	              .style("opacity", 0);
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
		ticks = scale.ticks(5);
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
		return 'translate('+(r+275) +','+ (r+160) +')';
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
          .attr("y2", 430);
    var line3 = svg.append('line')
          .attr("class", "flowline-output")
          .attr("marker-end", "url(#arrow)")
          .attr("x1", 400)
          .attr("y1", 250)
          .attr("x2", 700)
          .attr("y2", 70);
    var line4 = svg.append('line')
          .attr("class", "flowline-output")
          .attr("marker-end", "url(#arrow)")
          .attr("x1", 400)
          .attr("y1", 250)
          .attr("x2", 700)
          .attr("y2", 430);
    // Add Gauge Panel
    var gaugePanel = svg.append("rect")
          .attr("class", "gaugePanel")
          .attr('x', 230)
          .attr('y', 138)
          .attr('rx', 20)
          .attr('ry', 20)
          .attr('width', 340)
          .attr('height', 220);
    var panelLabel = svg.append("text")
          .attr("id", "panelLabel")
          .attr('x', 335)
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
      [ 'import', 2774 ],
      [ 'production', 9161 ],
      [ 'export', 253 ],
      [ 'consumption', 11513 ]
    ];
    var c=d3.rgb('#188324') // d3_Rgb object
    c.toString(); // "#ee82ee"
    // Add Circles
    var svgContainer2 = svg.append("g")
          .attr("class", "components_circles")
          .attr("width", 200)
          .attr("height", 200);
    var impCircle = svgContainer2.append("circle")
          .data(dataset)
          .attr('class', 'impCircle')
          .attr("cx", 100)
          .attr("cy", 70)
          .attr('r', 8*Math.log(dataset[0][1]/Math.PI))
          .style("fill", c)
					.on("mouseover", function(d) {
		            tooltip.transition()
		                .duration(200)
		                .style("opacity", 1);
								tooltip.html("Import:<br>2774MW")
		                .style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY) + "px");
		            })
		      .on("mouseout", function(d) {
		           tooltip.transition()
		               .duration(500)
		               .style("opacity", 0);
		       })
					 .transition()
           .duration(2500)
           .on("start", function repeat() {
             d3.active(this)
               .attr('r', 8.08*Math.log(dataset[0][1]/Math.PI))
               .style("fill", c.brighter().toString())
           .transition()
               .attr('r', 7.84*Math.log(dataset[0][1]/Math.PI))
               .style("fill", c.darker().toString())
           .transition()
             .on("start", repeat);
       		});

    var prodCircle = svgContainer2.append("circle")
          .attr('class', 'prodCircle')
          .attr("cx", 100)
          .attr("cy", 430)
          .attr('r', 8*Math.log(dataset[1][1]/Math.PI))
          .style("fill", c)
					.on("mouseover", function(d) {
		            tooltip.transition()
		                .duration(200)
		                .style("opacity", 1);
								tooltip.html("Production:<br>9161MW")
		                .style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY) + "px");
		            })
		      .on("mouseout", function(d) {
		           tooltip.transition()
		               .duration(500)
		               .style("opacity", 0);
		       })
          .transition()
          .duration(2500)
          .on("start", function repeat() {
            d3.active(this)
              .attr('r', 8.08*Math.log(dataset[1][1]/Math.PI))
              .style("fill", c.brighter().toString())
          .transition()
              .attr('r', 7.84*Math.log(dataset[1][1]/Math.PI))
              .style("fill", c.darker().toString())
          .transition()
            .on("start", repeat);
      });
    var expCircle = svgContainer2.append("circle")
          .attr('class', 'expCircle')
          .attr("cx", 700)
          .attr("cy", 70)
          .attr('r', 8*Math.log(dataset[2][1]/Math.PI))
          .style("fill", c)
					.on("mouseover", function(d) {
		            tooltip.transition()
		                .duration(200)
		                .style("opacity", 1);
								tooltip.html("Export:<br>253MW")
		                .style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY) + "px");
		            })
		      .on("mouseout", function(d) {
		           tooltip.transition()
		               .duration(100)
		               .style("opacity", 0);
		       })
          .transition()
          .duration(2500)
          .on("start", function repeat() {
            d3.active(this)
              .attr('r', 8.08*Math.log(dataset[2][1]/Math.PI))
              .style("fill", c.brighter().toString())
          .transition()
              .attr('r', 7.84*Math.log(dataset[2][1]/Math.PI))
              .style("fill", c.darker().toString())
          .transition()
            .on("start", repeat);
      });
    var consCircle = svgContainer2.append("circle")
          .attr('class', 'consCircle')
          .attr("cx", 700)
          .attr("cy", 430)
          .attr('r', 8*Math.log(dataset[3][1]/Math.PI))
          .style("fill", c)
					.on("mouseover", function(d) {
		            tooltip.transition()
		                .duration(200)
		                .style("opacity", 1);
								tooltip.html("Consumption:<br>11513MW")
		                .style("left", (d3.event.pageX) + "px")
		                .style("top", (d3.event.pageY) + "px");
		            })
		      .on("mouseout", function(d) {
		           tooltip.transition()
		               .duration(500)
		               .style("opacity", 0);
		       })
          .transition()
          .duration(2500)
          .on("start", function repeat() {
            d3.active(this)
              .attr('r', 8.08*Math.log(dataset[3][1]/Math.PI))
              .style("fill", c.brighter().toString())
          .transition()
              .attr('r', 7.84*Math.log(dataset[3][1]/Math.PI))
              .style("fill", c.darker().toString())
          .transition()
            .on("start", repeat);
      });
    // Add Circle Texts
    var impLabel = svgContainer2.append("text")
          .attr("id", "impLabel")
          .attr("x", 80)
          .attr("y", 75)
          .text("Import")
          .attr("fill", "white");
    var prodLabel = svgContainer2.append("text")
          .attr("id", "prodLabel")
          .attr("x", 68)
          .attr("y", 435)
          .text("Production")
          .attr("fill", "white");
    var expLabel = svgContainer2.append("text")
          .attr("id", "expLabel")
          .attr("x", 680)
          .attr("y", 75)
          .text("Export")
          .attr("fill", "white");
    var consLabel = svgContainer2.append("text")
          .attr("id", "consLabel")
          .attr("x", 660)
          .attr("y", 435)
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
					 return config.arcColorFn[i];
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
			.attr('transform', 'rotate(0)');

		update(newValue === undefined ? 0 : newValue);
	}
	that.render = render;

	function update(newValue, newConfiguration) {
		if ( newConfiguration  !== undefined) {
			configure(newConfiguration);
		}
		var ratio = scale(newValue);
		var newAngle = config.midAngle + (ratio * range);
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
