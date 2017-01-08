var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 70, left: 60},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]),
    y = d3.scaleLinear().rangeRound([height, 0]);
var	parseDate = d3.timeParse("%Y-%m-%d")
var hAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat("%Y-%m-%d"));
var vAxis = d3.axisLeft().scale(y).tickFormat(d3.format("s"));
var tooltip = d3.select('body').append('div')
    			        .style('position', 'absolute')
    			        .style('background', '#f4f4f4')
    			        .style('padding', '5 15px')
    		          .style('border', '1px #333 solid')
    			        .style('border-radius', '5px')
    	            .style('opacity', 'o');

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// real consumption
d3.csv("datasets/consumption.csv", function(d) {
  d.date = parseDate(d.date);
  d.consumption = +d.consumption;
  return d;
}, function(error, data) {
  if (error) throw error;

  x.domain(data.map(function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.consumption; })]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(hAxis)
      .selectAll("text")
					.style("text-anchor", "end")
          .style("fill", "grey")
					.attr("dx", "-.8em")
					.attr("dy", "-.55em")
					.attr("transform", "rotate(-90)" );

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "s"))
      .selectAll("text")
					.style("text-anchor", "end")
          .style("fill", "grey");

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.date); })
      .attr("y", function(d) { return y(d.consumption); })
      .attr("width", 0.8*x.bandwidth())
      .attr("height", function(d) { return height - y(d.consumption); });
});

d3.csv("datasets/consumption-forecast.csv", function(d) {
  d.date = parseDate(d.date);
  d.consumption = +d.consumption;
  return d;
}, function(error, data) {
  if (error) throw error;
  var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.consumption); });
  x.domain(data.map(function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.consumption; })]);
  g.append("path")
      .attr("transform", "translate(" + 0.4*x.bandwidth() + ", 0)")
      .datum(data)
      .attr("class", "line")
      .attr("d", line)
      //.curveCardinal()
      .style("stroke", "white")
      .style("fill", "none")
      .style("stroke-width", "3px");
})
