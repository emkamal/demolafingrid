const API = 'https://api.fingrid.fi/v1/variable/event/json/188,181,189,191';
const config = {
    headers: {'X-API-Key': 'mHk7WXBfAK9ZorNggsUZW54rroV7poHv7mmHS5NL'}
};

let powerArray = [];
const powerTypes = ['Wind', 'Nuclear', 'Condensing', 'Hydro'];

axios.get(API, config).then(({data: res}) => {
    powerArray = res.map((power, index) => ({
        Type: powerTypes[index],
        Current: Math.round(power.value),
        Maximum: Math.round(power.value + Math.floor(Math.random() * 1000))
    }));
    drawChart(powerArray);
});


let svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

let x1 = d3.scaleBand()
    .padding(0.05);

let y = d3.scaleLinear()
    .rangeRound([height, 0]);

let z = d3.scaleOrdinal()
    .range(["#98abc5", "#ff8c00"]);

let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function drawChart(powerArray) {
    const data = powerArray;
    const keys = ["Current", "Maximum"];

    x0.domain(data.map(function(d) { return d.Type; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

    g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + x0(d.Type) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) { return z(d.key); })
        .on("mousemove", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.key + ": " + d.value)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .style("width", "120px")
                .style("height", "20px")
                .style("font-size", "15px")
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "white")
        .attr("font-size", 15)
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Capacity (MW)");

    let legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 15)
        .attr("text-anchor", "end")
        .attr("fill", "white")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });
}