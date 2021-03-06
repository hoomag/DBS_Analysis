var opts = {
  lines: 9, // The number of lines to draw
  length: 9, // The length of each line
  width: 5, // The line thickness
  radius: 14, // The radius of the inner circle
  color: '#999999', // #rgb or #rrggbb or array of colors
  speed: 1.9, // Rounds per second
  trail: 40, // Afterglow percentage
  className: 'spinner', // The CSS class to assign to the spinner
};
var target = document.getElementById('handlesunburst')
var handle_spinner = new Spinner(opts).spin(target);

var width = 250,
    height = 250,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
    .range([0, radius]);

var color = d3.scale.category20c();

var color2 = {
  'undefined':"#EEEEEE",
  'Has h1':"#879942",
  'Has h1 and h2':"#789924",
  'Has h1, h2 and h3':"#669900",

  'Miss h1':"#D65C29",
  
  'Has h1 and miss h2':"#EB4714",
  'Miss h1 and h2':"#EB4714",
  'Miss h1 and has h2':"#EB4714",

  'Has h1, h2 and miss h3':"#FF3300",
  'Has h1, miss h2 and has h3':"#FF3300",
  'Has h1, miss h2 and miss h3':"#FF3300",
  'Miss h1, h2 and h3':"#FF3300",
  'Miss h1, miss h2 and has h3':"#FF3300",
  'Miss h1, has h2 and h3':"#FF3300",
  'Miss h1, has h2 and miss h3':"#FF3300"
}

var partition = d3.layout.partition()
    .value(function(d) { return d.size; });
    
var tmpText = d3.select("#handleinfo").text();

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

var svg = d3.select("#handlesunburst").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

d3.json("handles.json", function(error, root) {
  
  handle_spinner.stop()
  
  if (error) throw error;

  svg.selectAll("path")
      .data(partition.nodes(root))
    .enter().append("path")
      .attr("d", arc)
      //.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
      .style("fill", function(d) { var res = d.name.split("% "); return color2[res[1]]; })
      .on("click", click)
      .on('mouseover', function changeLable(d) { d3.select("#handleinfo").text( d.name + " (" + formatNumber(d.value) + ")" );})
      .on("mouseout", function () {d3.select("#handleinfo").text(tmpText);})
    .append("title")
      .text(function(d) { return d.name + " (" + formatNumber(d.value) + ")"; });
});

function click(d) {
  svg.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
      })
    .selectAll("path")
      .attrTween("d", function(d) { return function() { return arc(d); }; });
}

d3.select(self.frameElement).style("height", height + "px");