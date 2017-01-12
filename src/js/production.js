(function(d3) {
  'use strict';

  var width = 560;
  var height = 360;
  var radius = Math.min(width, height) / 2;

  var donutShape = false;
  var donutWidth = 75;

  var legendRectSize = 12;
  var legendSpacing = 4;

  var initialOpacity = 0.9;

  var sliceLabel = "percentage";

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var svg = d3.select('#chart')
    .append('svg')
    .attr('width',width+150)
    .attr('height',height+50)
    .append('g')
    .attr('class', 'chartContainer')
    .attr('transform', 'translate(' + (radius+10) + ','+ (height / 2) +')');

  var legendContainer = svg.append('g').attr('class','legendContainer');
  var pieContainer = svg.append('g').attr('class','pieContainer');

  var arc = d3.arc()
    .innerRadius((donutShape)? (radius - donutWidth) : 0 )
    .outerRadius(radius);

  var labelArc = d3.arc()
    .outerRadius(radius - 20)
    .innerRadius(radius - 20);

  var pie = d3.pie()
    .value(function(d){ return d.count; })
    .sort(null);

  var tooltip = d3.select('#chart')
    .append('div')
    .attr('class', 'd3tooltip');

  tooltip.append('b').attr('class','labelname');
  tooltip.append('div').attr('class','count');
  // tooltip.append('div').attr('class','percent');

  d3.csv('datasets/production.csv', function(error, dataset){
    dataset.forEach(function(d){
      d.count = +d.count;
      d.enabled = true;
    });

    var slice = pieContainer.selectAll('g')
      .data( pie(dataset) )
      .enter()
      .append( 'g' )
      .attr('id', function(d){ return "slice"+d.data.label.replace(/[( )]/gi,'')})
      .attr('class','slice');

    var path = slice.append( 'path' )
      .attr('d', arc)
      .attr('dinit', arc)
      .attr('class', 'slicePath')
      .attr('fill', function(d, i){
        return color(d.data.label);
      })
      .style('opacity', initialOpacity)
      .each( function(d){ this._current = d; });

      path.on('mouseout', function(d){
        tooltip.style('display','none');
        d3.select(this)
          .transition()
          // .attr("d","")
          .attr("d",d3.select(this).attr("dinit"))
          .style('opacity', initialOpacity);

          var parent = d3.select(this.parentNode);
          var targetId = parent.attr('id').replace('slice','');
          d3.select('#legend'+targetId).classed('active', false);
      });

      path.on('mouseover', function(d){
        var total = d3.sum(dataset.map(function(d){
          return (d.enabled) ? d.count : 0;
        }));
        var percent = Math.round(1000 * d.data.count / total) / 10;
        tooltip.select('.labelname').html(d.data.label);
        tooltip.select('.count').html(d.data.count+" MW");
        // tooltip.select('.percent').html(percent + '%');
        tooltip.style('display','block');

        // var circleUnderMouse = d3.select(this);
        // path.transition().style('opacity',function () {
        //     return (d3.select(this) === circleUnderMouse) ? 1.0 : 0.5;
        // });
        // // path.style('opacity','0.5');
        //
        var arcOver = arc.outerRadius(radius+10);
        d3.select(this)
          .transition()
          // .attr("dtemp",d3.select(this).attr("d"))
          .attr("d", arcOver)
          .style('opacity', '1');

        var parent = d3.select(this.parentNode);
        var targetId = parent.attr('id').replace('slice','');
        d3.select('#legend'+targetId).classed('active', true);
      });

      path.on('mousemove', function(d){
        tooltip.style('top', (d3.event.layerY + 10) + 'px').style('left', (d3.event.layerX + 10) + 'px');
      });

      slice.append("text")
        .attr("transform", function(d){ return "translate("+labelArc.centroid(d)+")"})
        .attr("dy", ".35em")
        .text( function(d){
          var count = d.data.count;

          var total = d3.sum(dataset.map(function(d){
            return (d.enabled) ? d.count : 0;
          }));
          var percent = Math.round(1000 * count / total) / 10;

          var output = "";
          if(sliceLabel == "percentage"){
            output = percent + "%";
          }
          else{
            output = count + "MW"
          }

          if(count > 0) return output;
        } );

      var legend = legendContainer.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('id', function(d){ return "legend"+d.replace(/[( )]/gi,'')})
        .attr('targetSlice', function(d){ return "slice"+d.replace(/[( )]/gi, "")})
        .attr('class', 'legend')
        .attr('transform', function(d, i){
          var height = legendRectSize + legendSpacing;
          var offset = height * color.domain().length / 2;
          var horz = 250;
          var vert = i * height - offset;
          return 'translate('+horz+','+vert+')'
        });

      legend.on('mouseover', function(d){
        var targetSlice = d3.select("#"+d3.select(this).attr("targetSlice"));
        if( !targetSlice.empty() ){
          var arcOver = arc.outerRadius(radius+10);
          targetSlice.select('path').transition()
            // .attr("dtemp",d3.select(this).attr("d"))
            .attr("d", arcOver)
            .style('opacity', '1');
        }
        // var arcOver = arc.outerRadius(radius+10);
        // target.transition()
        //   // .attr("dtemp",d3.select(this).attr("d"))
        //   .attr("d", arcOver)
        //   .style('opacity', '1');
      });

      legend.on('mouseout', function(d){
        var targetSlice = d3.select("#"+d3.select(this).attr("targetSlice"));
        if( !targetSlice.empty() ){
          targetSlice.select('path').transition()
          .attr("d","")
          .attr("d",targetSlice.select('path').attr("dinit"))
          .style('opacity', initialOpacity);
        }
      })

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', color)
      .style('stroke', color)
      .style('opacity', initialOpacity)
      // .on('click', function(label){
      //   var rect = d3.select(this);
      //   var enabled = true;
      //   var totalEnabled = d3.sum(dataset.map(function(d){
      //     return (d.enabled) ? 1 : 0;
      //   }));
      //
      //   if(rect.attr('class') == 'disabled'){
      //     rect.attr('class', '');
      //   }
      //   else{
      //     if(totalEnabled < 2) return;
      //     rect.attr('class','disabled');
      //     enabled = false;
      //   }
      //
      //   pie.value(function(d){
      //     if(d.label == label) d.enabled = enabled;
      //     return (d.enabled) ? d.count : 0;
      //   });
      //
      //   path = path.data(pie(dataset));
      //
      //   path.transition()
      //     .duration(750)
      //     .attrTween('d', function(d){
      //       var interpolate = d3.interpolate(this._current, d);
      //       this._current = interpolate(1);
      //       return function(t){
      //         console.log(t);
      //         return arc(interpolate(t));
      //       }
      //     });
      // });

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing + 2)
      .text( function(d){ return d; } );

  });

})(window.d3);

// var plotDiv = document.getElementById('container');
// var traces = [
// 	{x: [1,2,3], y: [2,1,4], fill: 'tozeroy'},
// 	{x: [1,2,3], y: [1,1,2], fill: 'tonexty'},
// 	{x: [1,2,3], y: [3,0,2], fill: 'tonexty'}
// ];
//
// function stackedArea(traces) {
// 	for(var i=1; i<traces.length; i++) {
// 		for(var j=0; j<(Math.min(traces[i]['y'].length, traces[i-1]['y'].length)); j++) {
// 			traces[i]['y'][j] += traces[i-1]['y'][j];
// 		}
// 	}
// 	return traces;
// }
//
// Plotly.newPlot(plotDiv, stackedArea(traces), {title: 'stacked and filled line chart'});

var typeProperties = {
  wind: {title: "Wind",color: "#a1f4d6"},
  nuclear: {title:  "Nuclear",color: "#9fcc92"},
  hydro: {title:  "Hydro",color: "#53afed"},
  condensing: {title:  "Condensing",color: "#a867f7"},
  codistrictheating: {title:  "Cogeneration distric heating",color: "#f7e167"},
  coindustry: {title:  "Cogeneration industry",color: "#ff8484"},
  other: {title:  "Others",color: "#afafaf"}
};

function getProductionData(type, start, end){
  var variableId = -1;
  var output = [];
  // start = start.toISOString();
  // end = end.toISOString();
  start = `${start.getFullYear()}-${start.getMonth()+1}-${start.getDate()}T00:00:00Z`;
  end = `${end.getFullYear()}-${end.getMonth()+1}-${end.getDate()}T23:59:59Z`;

  switch (type) {
    case "wind": variableId = 181; break;
    case "peak": variableId = 183; break;
    case "nuclear": variableId = 188; break;
    case "condensing": variableId = 189; break;
    case "hydro": variableId = 191; break;
    case "codistrictheating": variableId = 201; break;
    case "coindustry": variableId = 202; break;
    case "other": variableId = 205; break;
    default:
      variableId = -1;
  }

  $.ajax({
    // url: `https://api.fingrid.fi/v1/variable/${variableId}/events/json?start_time=${start}&end_time=${end}`,
    url: `https://api.fingrid.fi/v1/variable/${variableId}/events/json?start_time=${start}&end_time=${end}`,
    // url: `https://api.fingrid.fi/v1/variable/event/json/181/`,
    headers: { "x-api-key": "E3wjvPIcUG6xdcRp5SXew1HRNHNa64P4a4O72nbv" }
  })
  .done(function( data ) {
    $(".loadingData").addClass("hidden");
    $("#chartDivs").removeClass("hidden");

    var localStorageData = {};
    if (localStorage.getItem("data") === null) {
      localStorage.setItem("data", "LOL")
    }
    else{
      localStorageData = JSON.parse(localStorage.getItem("data"));
    }
    localStorageData[type] = data;

    localStorage.setItem("data", JSON.stringify(localStorageData));
    drawCharts();
  });

  return output;
}

function drawStackedChart(pieChart){
  var tmp = [];

  var stackedChartCategories = [];
  var stackedChartData = [];
  var localStorageData = JSON.parse(localStorage.getItem("data"));
  var minimumXaxis = 999999;

  for (var key in localStorageData) {
    if(localStorageData[key].length < minimumXaxis){
      minimumXaxis = localStorageData[key].length;
    }

    var typeData = [];
    for(var k in localStorageData[key]){
      typeData.push(parseInt(localStorageData[key][k].value));
    }
    stackedChartData.push({id:key, name: typeProperties[key].title, color: typeProperties[key].color, data: typeData});

  }

  for(var i=0;i<minimumXaxis;i++){
    var date = new Date(localStorageData.wind[i].start_time);
    stackedChartCategories.push(
      (date.getHours() < 10?"0"+date.getHours():date.getHours())+":"+
      (date.getMinutes() < 10?"0"+date.getMinutes():date.getMinutes())+":00");
  }

  var stackedArea = Highcharts.chart('stackedArea', {
      chart: {
          type: 'area',
          backgroundColor: 'transparent'
      },
      colors: ['#ff6b6b', '#fff06b', '#6bff6d', '#6b95ff', '#da6bff', '#6be3ff'],
      title: {
          text: ''
      },
      xAxis: {
          categories: stackedChartCategories,
          tickmarkPlacement: 'on',
          labels: {
            enabled: false
          }
      },
      yAxis: {
          title: {
              text: 'MW'
          },
          labels: {
              formatter: function () {
                  return this.value;
              }
          }
      },
      tooltip: {
          split: true,
          valueSuffix: ' MW'
      },
      plotOptions: {
          area: {
              stacking: 'normal',
              lineColor: '#666666',
              lineWidth: 1,
              marker: {
                  lineWidth: 1,
                  lineColor: '#666666'
              }
          },
          series: {
            point: {
              events:{
                mouseOver: function(e){
                  var newPieChartData = [];
                  tmp[this.series.name] = {y: this.y, color: this.series.color};

                  for(key in tmp){
                    newPieChartData.push({name: key, y: tmp[key].y, color: tmp[key].color })
                  }
                  pieChart.update({
                    title: {
                        text: this.category
                    },
                    series: [{
                        name: 'Type',
                        data: newPieChartData
                    }]
                  });
                }
              }
            }
          }
      },
      series: stackedChartData
  });
}

function drawPieChart(){
  var pieChartData = [];
  var localStorageData = JSON.parse(localStorage.getItem("data"));

  for (var key in localStorageData) {
    var pieChartDataName = typeProperties[key].title;
    var pieChartDataValue = localStorageData[key][localStorageData[key].length-1].value;
    pieChartData.push({name: pieChartDataName, y: parseInt(pieChartDataValue), color: typeProperties[key].color });
  }

  // Build the chart
  var pieChart = Highcharts.chart('pieChart', {
      chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          backgroundColor: 'transparent',
          animation: true,
          type: 'pie'
      },
      title: {
          text: 'Current'
      },
      tooltip: {
          pointFormat: '<b>{point.y}MW</b><br/>{point.percentage:.1f}%'
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: false
              },
              showInLegend: false
          }
      },
      series: [{
          name: 'Type',
          data: pieChartData
      }]
  });

  return pieChart;
}

function drawCharts(){
  var pieChart = drawPieChart();
  drawStackedChart(pieChart);
}

$(function () {

    // localStorage.setItem("data", "[]");

    var setDate = "2016-12-27";



    var todayStart = new Date(setDate);
    todayStart.setHours(0);
    todayStart.setMinutes(0);
    var todayEnd = new Date(setDate);
    todayEnd.setHours(23);
    todayEnd.setMinutes(59);

    $("#dateInfoArea").html(setDate);

    getProductionData("wind", todayStart, todayEnd);
    getProductionData("nuclear", todayStart, todayEnd);
    // getProductionData("peak", todayStart, todayEnd);
    getProductionData("hydro", todayStart, todayEnd);
    getProductionData("condensing", todayStart, todayEnd);
    getProductionData("codistrictheating", todayStart, todayEnd);
    getProductionData("coindustry", todayStart, todayEnd);
    getProductionData("other", todayStart, todayEnd);

    // $("#dump").html(JSON.stringify(apiData));
    // console.log(apiData);


    // Radialize the colors



    // var mode = "last"
    // var apiVersion = "v1";
    // var baseUrl = `http://devel-loadb-189d3hbq1rx2l-2025466794.eu-west-1.elb.amazonaws.com/${apiVersion}/variable`;
    // var baseUrl = `https://api.fingrid.fi/${apiVersion}/variable`;
    // var dataType = "json"
    // var apiKey = "E3wjvPIcUG6xdcRp5SXew1HRNHNa64P4a4O72nbv"
    //
    // var start = new Date(2016, 12, 1);
    // var end = new Date(2016, 12, 30);
    //
    // $.ajax({
    //   // url: `${baseUrl}/200/event/json/`,
    //   url: `https://api.fingrid.fi/v1/variable/event/json/200/`,
    //   //url: `http://localhost:3000/v1/variable/1/events/json?start_time=2016-02-01T00:00:00Z&end_time=2017-02-01T00:00:00Z&api_key=E3wjvPIcUG6xdcRp5SXew1HRNHNa64P4a4O72nbv`,
    //   // type: "GET",
    //   // contentType: "application/json",
    //   // dataType: "json",
    //   // xhrFields: {
    //   //   withCredentials: false
    //   // },
    //   // crossDomain: true,
    //   // dataType: "jsonp",
    //   // data: {
    //   //   "Accept": "application/json",
    //   //   "x-api-key": apiKey,
    //   // },
    //   headers: { "x-api-key": apiKey }
    // })
    // .done(function( data ) {
    //   console.log("DONE");
    //   // if ( console && console.log ) {
    //   //   console.log( "Sample of data:", data.slice( 0, 100 ) );
    //   // }
    //   $("#dump").html("data\n"+JSON.stringify(data));
    // });
    //
    // // $("#dump").html("hoho"+start.toUTCString()+"\n"+end.toUTCString());
});
