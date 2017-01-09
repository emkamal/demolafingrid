var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 70, left: 60},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]),
    y = d3.scaleLinear().rangeRound([height, 0]);
var	parseDate = d3.timeParse("%H")
var hAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat("%H"));
var vAxis = d3.axisLeft().scale(y).tickFormat(d3.format(",d"));
var div = d3.select('body').append('div')
              .attr("class", "tooltip")
              .style("opacity", 0);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Consumption Bar Chart
d3.csv("datasets/consumption.csv", function(d) {
  d.time = parseDate(d.time);
  d.consumption = +d.consumption;
  return d;
}, function(error, data) {
  if (error) throw error;

  x.domain(data.map(function(d) { return d.time; }));
  y.domain([0,4500]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(hAxis)
      .selectAll("text")
					.style("text-anchor", "end")
          .style("fill", "#e0e0e0")
					.attr("dx", "+.50em")
					.attr("dy", "+1.55em")
					.attr("transform", "rotate(0)" );

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, ",d"))
      .selectAll("text")
					.style("text-anchor", "end")
          .style("fill", "#e0e0e0");

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.time); })
      .attr("y", function(d) { return y(d.consumption); })
      .attr("width", 0.8*x.bandwidth())
      .attr("height", function(d) { return height - y(d.consumption); })
      .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", 1);
            div	.html(d.consumption+"MWh/h")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
            })
      .on("mouseout", function(d) {
           div.transition()
               .duration(500)
               .style("opacity", 0);
       });
});

// Forecast Line Chart
d3.csv("datasets/consumption-forecast.csv", function(d) {
  d.time = parseDate(d.time);
  d.consumption = +d.consumption;
  return d;
}, function(error, data) {
  if (error) throw error;

  var line = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.consumption); });

  x.domain(data.map(function(d) { return d.time; }));
  y.domain([0, 4500]);

  g.append("path")
      .attr("transform", "translate(" + 0.5*x.bandwidth() + ", 0)")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      //.curveCardinal()
      .style("stroke", "white")
      .style("fill", "none")
      .style("stroke-width", "4px")
      .style("stroke-linecap", "round")
      .style("stroke-linejoin", "round");

  g.selectAll("circle")
      .data(data)
      .enter().append('circle')
      .attr('cx', function (d) {
          return (x(d.time)+0.45*x.bandwidth());
      })
      .attr('cy', function (d) {
          return y(d.consumption);
      })
      .attr("r", "5")
      .style("stroke", "#b5cde1")
      .style("stroke-width", "3px")
      .style("fill", "#dae6f0")
      .on("mouseover", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", "9");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", "5");
      });
});

// MAX Line Chart
d3.csv("datasets/consumption_max.csv", function(d) {
  d.time = parseDate(d.time);
  d.consumption = +d.consumption;
  return d;
}, function(error, data) {
  if (error) throw error;

  var line = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.consumption); });

  x.domain(data.map(function(d) { return d.time; }));
  y.domain([0, 4500]);

  g.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      //.curveCardinal()
      .style("stroke", "#FF6347")
      .style("stroke-dasharray", 3.3)
      .style("stroke-width", "2px")
      .style("stroke-linecap", "round");

})
