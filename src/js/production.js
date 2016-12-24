(function(d3) {
  'use strict';

  var width = 560;
  var height = 360;
  var radius = Math.min(width, height) / 2;

  var donutShape = false;
  var donutWidth = 75;

  var legendRectSize = 12;
  var legendSpacing = 4;

  var initialOpacity = 0.8;

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
    .outerRadius(radius)

  var pie = d3.pie()
    .value(function(d){ return d.count; })
    .sort(null);

  var tooltip = d3.select('#chart')
    .append('div')
    .attr('class', 'd3tooltip');

  tooltip.append('div').attr('class','label');
  tooltip.append('div').attr('class','count');
  tooltip.append('div').attr('class','percent');

  d3.csv('datasets/production.csv', function(error, dataset){
    dataset.forEach(function(d){
      d.count = +d.count;
      d.enabled = true;
    });

    var path = pieContainer.selectAll('g')
      .data( pie(dataset) )
      .enter()
      .append( 'g' ).attr('class','slice')
      .append( 'path' )
      .attr('d', arc)
      .attr('fill', function(d, i){
        return color(d.data.label);
      })
      .style('opacity', initialOpacity)
      .each( function(d){ this._current = d; });

      path.on('mouseout', function(d){
        console.log("mouseout, setting");
        tooltip.style('display','none');
        d3.select(this).transition().attr("d","");
        d3.select(this).transition().attr("d",d3.select(this).attr("dtemp"));
        d3.select(this).transition().style('opacity', initialOpacity);
      });

      path.on('mouseover', function(d){
        console.log("mouseover");
        var total = d3.sum(dataset.map(function(d){
          return (d.enabled) ? d.count : 0;
        }));
        var percent = Math.round(1000 * d.data.count / total) / 10;
        tooltip.select('.label').html(d.data.label);
        tooltip.select('.count').html(d.data.count);
        tooltip.select('.percent').html(percent + '%');
        tooltip.style('display','block');

        // var circleUnderMouse = d3.select(this);
        // path.transition().style('opacity',function () {
        //     return (d3.select(this) === circleUnderMouse) ? 1.0 : 0.5;
        // });
        // // path.style('opacity','0.5');
        //
        var arcOver = arc.outerRadius(radius+10);
        d3.select(this).attr("dtemp",d3.select(this).attr("d"));
        d3.select(this).transition().attr("d", arcOver).style('opacity', '1');
      });



      path.on('mousemove', function(d){
        tooltip.style('top', (d3.event.layerY + 10) + 'px').style('left', (d3.event.layerX + 10) + 'px');
      });

      var legend = legendContainer.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i){
          var height = legendRectSize + legendSpacing;
          var offset = height * color.domain().length / 2;
          var horz = 250;
          var vert = i * height - offset;
          return 'translate('+horz+','+vert+')'
        });

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', color)
      .style('stroke', color)
      .on('click', function(label){
        var rect = d3.select(this);
        var enabled = true;
        var totalEnabled = d3.sum(dataset.map(function(d){
          return (d.enabled) ? 1 : 0;
        }));

        if(rect.attr('class') == 'disabled'){
          rect.attr('class', '');
        }
        else{
          if(totalEnabled < 2) return;
          rect.attr('class','disabled');
          enabled = false;
        }

        pie.value(function(d){
          if(d.label == label) d.enabled = enabled;
          return (d.enabled) ? d.count : 0;
        });

        path = path.data(pie(dataset));

        path.transition()
          .duration(750)
          .attrTween('d', function(d){
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t){
              return arc(interpolate(t));
            }
          });
      });

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text( function(d){ return d; } );

  });

})(window.d3);
