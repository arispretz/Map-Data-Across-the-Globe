 d3.select("body")
    .append("h1")
    .text("Map Data Across the Globe");

let width = '100%',
    height = '100%',
    sizeModifier = 50,
    hue = 0, colors = {},
    meteorites;

let projection = d3.geo.mercator()
  .translate([780,360])
  .scale(300);

let zoom = d3.behavior.zoom()
  .translate([0, 0])
  .scale(1)
  .scaleExtent([.5, 18])
  .on("zoom", zoomed);

let path = d3.geo.path()
  .projection(projection);

let svg = d3.select('#container')
  .append('svg')
  .attr('width', '100%')

svg.append('rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', '#266D98')
  .call(zoom)


d3.select(window).on("resize", sizeChange);

let div = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

let map = svg.append('g');

d3.json('https://d3js.org/world-50m.v1.json', function(json) {
  map.selectAll('path')
    .data(topojson.feature(json, json.objects.countries).features)
    .enter()
    .append('path')
    .attr('fill', '#95E1D3')
    .attr('stroke', '#266D98')
    .attr('d', path)
});

d3.json('https://data.nasa.gov/resource/y77d-th95.geojson', function(json) {

  json.features.sort(function(a,b) {
    return new Date(a.properties.year) - new Date(b.properties.year);
  })
  json.features.map(function(e) {
    hue+=.35;
    colors[e.properties.year] = hue;
    e.color = 'hsl(' + hue + ',100%, 50%)';
  })

  json.features.sort(function(a,b) {
    return b.properties.mass - a.properties.mass
  })

  meteorites = svg.append('g')
  .selectAll('path')
    .data(json.features)
    .enter()
      .append('circle')
      .attr('cx', function(d) { return projection([d.properties.reclong,d.properties.reclat])[0] })
      .attr('cy', function(d) { return projection([d.properties.reclong,d.properties.reclat])[1] })
      .attr('r', function(d) { 
        let range = 718750/2/2;
    
        if (d.properties.mass <= range) return 2;
        else if (d.properties.mass <= range*2) return 10;
        else if (d.properties.mass <= range*3) return 20;
        else if (d.properties.mass <= range*20) return 30;
        else if (d.properties.mass <= range*100) return 40;
        return 50;
      })
      .attr('fill-opacity', function(d) {
        let range = 718750/2/2;
        if (d.properties.mass <= range) return 1;
        return .5;
      })
      .attr('stroke-width', 1)
      .attr('stroke', '#EAFFD0')
      .attr('fill', function(d) { return d.color })
      .on('mouseover', function(d) {
        d3.select(this).attr('d', path).style('fill', 'black');
        
        div.transition()
          .duration(200)
          .style('opacity', .9);
        div.html( '<span class="def">fall:</span> ' + d.properties.fall + '<br>' + 
                  '<span class="def">mass:</span> ' + d.properties.mass + '<br>' + 
                  '<span class="def">name:</span> ' + d.properties.name + '<br>' + 
                  '<span class="def">nametype:</span> ' + d.properties.nametype + '<br>' +
                  '<span class="def">recclass:</span> ' + d.properties.recclass + '<br>' + 
                  '<span class="def">reclat:</span> ' + d.properties.reclat + '<br>' + 
                  '<span class="def">year:</span> ' + d.properties.year + '<br>')
          .style('left', (d3.event.pageX+30) + 'px')
          .style('top', (d3.event.pageY/1.5) + 'px')
      })
      .on('mouseout', function(d) {
        d3.select(this).attr('d', path).style('fill', function(d) { return d.properties.hsl });

        div.transition()
          .duration(500)
          .style('opacity', 0);
      });
  
  sizeChange();
});

function zoomed() {
  map.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  meteorites.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
}

function sizeChange() {
  d3.selectAll("g").attr("transform", "scale(" + $("#container").width()/1900 + ")");
  $("svg").height($("#container").width()/2);
}

d3.select('body')
  .append('h3')
  .attr('class', 'footer')
  .text("Created by Ariana Spretz - Copyright 2024")
  .style('color', 'blue');
