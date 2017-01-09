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

$(function(){

  var mode = "last"
  var apiVersion = "v1";
  var baseUrl = `http://devel-loadb-189d3hbq1rx2l-2025466794.eu-west-1.elb.amazonaws.com/${apiVersion}/variable`;
  var baseUrl = `https://data.fingrid.fi/${apiVersion}/variable`;
  var dataType = "json"
  var apiKey = "E3wjvPIcUG6xdcRp5SXew1HRNHNa64P4a4O72nbv"

  var start = new Date(2016, 12, 1);
  var end = new Date(2016, 12, 30);

  $.ajax({
    url: `${baseUrl}/200/event/json/`,
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    crossDomain: true,
    // dataType: "jsonp",
    data: {
      "Accept": "application/json",
      "x-api-key": apiKey,
    }
  })
  .done(function( data ) {
    // if ( console && console.log ) {
    //   console.log( "Sample of data:", data.slice( 0, 100 ) );
    // }
    $("#dump").html("data\n"+data);
  });

  // $("#dump").html("hoho"+start.toUTCString()+"\n"+end.toUTCString());
});
