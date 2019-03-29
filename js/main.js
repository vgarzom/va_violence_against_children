const width = 600;
const margin = { top: 70, left: 150, right: 50, bottom: 0 };
const svg = d3.select("#chart-container").append("svg");
const groot = svg.append("g");
const g = groot.append("g");
const gText = g.append("g");
const gAxis = g.append("g");
const mapLayer = svg.append('g').classed('map-layer', true);
var mapColorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 200]);

const minLabel = margin.left + 150;
const transitionDuration = 500;
let height = d3.select("#chart-container").node().getBoundingClientRect().height;
let x; // X scale
const xScaleRange = [margin.left, width - margin.right];

let dataAll = [];
let dataG = [];
let dataKeys = {};
let mapData = [];

let value_key = "total_casos";
let total_key = "total";
let currentSlide = 0;
let drawingByGender = false;
let drawStacked = false;
let drawCentralLine = false;

let delay = (d, i) => { return i * 5 };

let updateBarChart = (data, sortedNames) => {
  height = (drawingByGender ? data.length / 2 : data.length) * 22 + margin.top + margin.bottom;

  //Defines the scales
  const y = d3.scaleBand()
    .domain(sortedNames)
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  //Defines the x Axis
  const xAxis = g => g
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(width / 80))
    .call(g => g.select(".domain").remove())


  svg.attr("height", height)
    .attr("width", width - 5);

  g.selectAll('.bar')
    .sort((a, b) => {
      return y(a.nombre) - y(b.nombre);
    })

  //Draw barchart
  g.selectAll(".bar").data(data).exit().remove();
  var transition = g.transition().duration(transitionDuration);

  transition
    .selectAll(".bar")
    .delay(delay)
    .attr("x", d => { return !drawStacked ? x(0) : (d.type === "m" ? x(0) : x(d[total_key] - d[value_key])) })
    .attr("y", (d) => barPosition(d, y))
    .attr("width", d => x(d[value_key]) - x(0))
    .attr("height", d => barHeight(d, y))
    .attr("fill", (d) => color(d.type));

  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => { return !drawStacked ? x(0) : (d.type === "m" ? x(0) : x(d[total_key] - d[value_key])) })
    .attr("fill", (d) => color(d.type))
    .attr("y", (d) => barPosition(d, y))
    .attr("height", d => barHeight(d, y))
    .attr("width", d => x(d[value_key]) - x(0));

  g.select(".centralLine").remove();
  if (drawCentralLine) {
    g.append("line")
      .attr("class", "centralLine")
      .attr("x1", x(50))
      .attr("y1", 0)
      .attr("x2", x(50))
      .attr("y2", height)
      .attr("stroke", "gray")
      .attr("stroke-width", 1);
  }



  //Draw text
  /*
  gText.selectAll("text").data(data).exit().remove();
  gText.style("font", "13px sans-serif")
    .selectAll("text")
    .data(data)
    .enter().append("text")
    .attr("x", d => {
      const v = x(d[value_key]);
      return v + (v < minLabel ? 4 : -4)
    })
    .attr("class", "label_test")
    .attr("text-anchor", d => (x(d[value_key]) < minLabel ? "start" : "end"))
    .attr("fill", d => (x(d[value_key]) < minLabel ? "currentColor" : "white"))
    .attr("fill-opacity", d => (x(d[value_key]) < minLabel ? .7 : 1))
    .attr("y", d => y(d.nombre) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .text(d => d[value_key]);
 
  gText.selectAll(".label_test")
    .transition()
    .duration(transitionDuration)
    .delay(delay)
    .attr("x", d => {
      const v = x(d[value_key]);
      return v + (v < minLabel ? 4 : -4)
    })
    .attr("text-anchor", d => (x(d[value_key]) < minLabel ? "start" : "end"))
    .attr("fill", d => (x(d[value_key]) < minLabel ? "currentColor" : "white"))
    .attr("fill-opacity", d => (x(d[value_key]) < minLabel ? .7 : 1))
    .text(d => d[value_key]);
*/
  // Draw Axes
  let axisTransition = gAxis.transition().duration(transitionDuration);
  axisTransition.select(".y.axis")
    .call(d3.axisLeft(y))
    .selectAll("g")
    .delay(delay);

  g.select("#xAxisG").remove();
  g.append("g").attr("id", "xAxisG").call(xAxis);

}

let drawYAxis = () => {
  const y = d3.scaleBand()
    .domain(dataAll.map(d => d.nombre))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  gAxis.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
}

let drawBySlide = () => {
  switch (currentSlide) {
    case 0:
      colorMap(false);
      g.attr("visibility", "hidden");
      mapLayer.attr("visibility", "visible");
      d3.select("#legend1").style("visibility", "hidden");
      break;

    case 1:
      colorMap(true);
      g.attr("visibility", "hidden");
      d3.select("#legend1").style("visibility", "visible");
      mapLayer.attr("visibility", "visible");
      break;

    case 2:
      g.attr("visibility", "visible");
      mapLayer.attr("visibility", "hidden");
      d3.select("#legend1").style("visibility", "hidden");
      drawingByGender = false;
      drawStacked = false;
      drawCentralLine = false;
      value_key = "total_casos";
      var sortedData = dataAll.sort((a, b) => d3.ascending(a.nombre, b.nombre))
        .map(d => d.nombre);

      x = d3.scaleLinear()
        .domain([0, d3.max(dataAll, d => d.total_casos)])
        .range(xScaleRange);

      updateBarChart(dataAll, sortedData);
      break;

    case 3:
      drawingByGender = false;
      drawStacked = false;
      drawCentralLine = false;
      value_key = "total_casos";
      var sortedData = dataAll.sort((a, b) => d3.descending(a.total_casos, b.total_casos))
        .map(d => d.nombre);
      x = d3.scaleLinear()
        .domain([0, d3.max(dataAll, d => d.total_casos)])
        .range(xScaleRange);
      updateBarChart(dataAll, sortedData);
      break;

    case 4:
      drawingByGender = false;
      drawStacked = false;
      drawCentralLine = false;
      value_key = "total_porciento";
      var sortedData = dataAll.sort((a, b) => d3.descending(a.total_casos, b.total_casos))
        .map(d => d.nombre);
      x = d3.scaleLinear()
        .domain([0, d3.max(dataAll, d => d.total_porciento)])
        .range(xScaleRange);
      updateBarChart(dataAll, sortedData);
      break;

    case 5:
      drawingByGender = false;
      drawStacked = false;
      drawCentralLine = false;
      value_key = "total_porciento";
      var sortedData = dataAll.sort((a, b) => d3.descending(a.total_porciento, b.total_porciento))
        .map(d => d.nombre);
      x = d3.scaleLinear()
        .domain([0, d3.max(dataAll, d => d.total_porciento)])
        .range(xScaleRange);
      updateBarChart(dataAll, sortedData);
      break;

    case 6:
      drawingByGender = true;
      drawStacked = true;
      drawCentralLine = false;
      value_key = "total_porciento";
      total_key = "total";
      var sortedData = dataG.sort((a, b) => d3.descending(a.total, b.total))
        .map(d => d.nombre);
      x = d3.scaleLinear()
        .domain([0, d3.max(dataAll, d => d.total_porciento)])
        .range(xScaleRange);
      updateBarChart(dataG, sortedData);
      break;

    case 7:
      drawingByGender = true;
      drawStacked = false;
      drawCentralLine = false;
      value_key = "total_porciento";
      var sortedData = dataG.sort((a, b) => d3.descending(a.total, b.total))
        .map(d => d.nombre);
      x = d3.scaleLinear()
        .domain([0, d3.max(dataAll, d => d.total_porciento)])
        .range(xScaleRange);
      updateBarChart(dataG, sortedData);
      break;

    case 8:
      drawingByGender = true;
      drawStacked = true;
      drawCentralLine = true;
      value_key = "total_porciento_parcial";
      total_key = "total_porcentaje";
      var sortedData = dataG.sort((a, b) => d3.descending(a.total, b.total))
        .map(d => d.nombre);
      x = d3.scaleLinear()
        .domain([0, 100])
        .range(xScaleRange);
      updateBarChart(dataG, sortedData);
      break;
  }
}

let readData = (onFinish) => {
  var result = {};
  d3.csv(
    "../assets/data.csv",
    (d, i) => {
      if (!d.codigo.includes("|")) {
        d.municipios = []
        d.codigo = (d.codigo.length === 1 ? "0" : "") + d.codigo;
        result[d.codigo] = d;
      } else {
        let k_d = d.codigo.split("|")[0];
        k_d = (k_d.length === 1 ? "0" : "") + k_d;
        d.codigo = k_d + d.codigo.split("|")[1];
        result[k_d].municipios.push(d);
      }
      d.hombre_casos = +d.hombre_casos;
      d.hombre_porciento = +d.hombre_porciento;
      d.mujer_casos = +d.mujer_casos;
      d.mujer_porciento = +d.mujer_porciento;
      d.total_casos = +d.total_casos;
      d.total_porciento = +d.total_porciento;
      d.id = d.codigo;
      d.type = "b";
    }
  ).then(() => {
    dataKeys = result;
    let keys = d3.keys(result);
    keys.map((d) => {
      let obj = result[d];
      obj.type = "b";
      dataAll.push(obj);

      let dm = {
        nombre: obj.nombre,
        total_porciento: (obj.hombre_casos / obj.total_casos) * obj.total_porciento,
        total_porciento_parcial: (obj.hombre_casos / obj.total_casos) * 100,
        total_porcentaje: 100,
        type: "m",
        total: obj.total_porciento
      };

      let df = {
        nombre: obj.nombre,
        total_porciento: (obj.mujer_casos / obj.total_casos) * obj.total_porciento,
        total_porciento_parcial: (obj.mujer_casos / obj.total_casos) * 100,
        total_porcentaje: 100,
        type: "f",
        total: obj.total_porciento
      };

      dataG.push(dm);
      dataG.push(df);
    });

    //drawYAxis();
    //drawBySlide();
    onFinish();
  });
}

let readMapData = () => {
  d3.json("../assets/colombia.geo.json", (error, mapData) => {
    console.log("data read", error, mapData);
  }).then((mdata) => {
    mapData = mdata;
    drawMap();
    drawLegend("#legend1", mapColorScale);
  })
}

let color = (type) => {
  switch (type) {
    case "m":
      return "#0894A1";
    case "f":
      return "#ED9482";
    default:
      return "#F2B134"
  }
}

let barHeight = (d, scale) => {
  if (drawStacked) {
    return scale.bandwidth();
  }
  return (d.type === "b" ? 1.0 : 0.5) * scale.bandwidth();
}

let barPosition = (d, scale) => {
  if (drawStacked) {
    return scale(d.nombre);
  }
  let h = barHeight(d, scale);
  return (d.type === "f" ? h : 0.0) + scale(d.nombre);
}

let drawMap = () => {
  svg.attr("width", width).attr("height", height);
  var features = mapData.features;
  var projection = d3.geoMercator()
    .scale(2000)
    // Center the Map in Colombia
    .center([-74, 4.5])
    .translate([width / 2, height / 2]);

  var path = d3.geoPath()
    .projection(projection);

  // Draw each province as a path
  mapLayer.selectAll('path')
    .data(features)
    .enter().append('path')
    .attr('d', path)
    .attr('vector-effect', 'non-scaling-stroke')
    .style('fill', "#eee");
}

let colorMap = (weighted) => {
  var features = mapData.features;
  mapLayer.selectAll('path')
    .data(features)
    .transition().duration(transitionDuration)
    .style('fill', (d) => {
      if (!weighted) {
        return "#eee";
      }
      let dpto = dataKeys[d.properties.DPTO];
      let value = dpto ? dpto.total_porciento : 0;
      return mapColorScale(value);
    });
}

Reveal.addEventListener('slidechanged', function (evt) {
  currentSlide = evt.indexh;
  drawBySlide();
});

// create continuous color legend
function drawLegend(selector_id, colorscale) {
  var legendheight = 200,
    legendwidth = 80,
    margin = { top: 10, right: 60, bottom: 10, left: 2 };

  var canvas = d3.select(selector_id)
    .style("height", legendheight + "px")
    .style("width", legendwidth + "px")
    .style("position", "relative")
    .append("canvas")
    .attr("height", legendheight - margin.top - margin.bottom)
    .attr("width", 1)
    .style("height", (legendheight - margin.top - margin.bottom) + "px")
    .style("width", (legendwidth - margin.left - margin.right) + "px")
    .style("border", "1px solid #000")
    .style("position", "absolute")
    .style("top", (margin.top) + "px")
    .style("left", (margin.left) + "px")
    .node();

  var ctx = canvas.getContext("2d");

  var legendscale = d3.scaleLinear()
    .range([1, legendheight - margin.top - margin.bottom])
    .domain(colorscale.domain());

  // image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
  var image = ctx.createImageData(1, legendheight);
  d3.range(legendheight).forEach(function (i) {
    var c = d3.rgb(colorscale(legendscale.invert(i)));
    image.data[4 * i] = c.r;
    image.data[4 * i + 1] = c.g;
    image.data[4 * i + 2] = c.b;
    image.data[4 * i + 3] = 255;
  });
  ctx.putImageData(image, 0, 0);

  // A simpler way to do the above, but possibly slower. keep in mind the legend width is stretched because the width attr of the canvas is 1
  // See http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
  /*
  d3.range(legendheight).forEach(function(i) {
    ctx.fillStyle = colorscale(legendscale.invert(i));
    ctx.fillRect(0,i,1,1);
  });
  */

  var legendaxis = d3.axisRight()
    .scale(legendscale)
    .tickSize(6)
    .ticks(8);

  var svg = d3.select(selector_id)
    .append("svg")
    .attr("height", (legendheight) + "px")
    .attr("width", (legendwidth) + "px")
    .style("position", "absolute")
    .style("left", "0px")
    .style("top", "0px")

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
    .call(legendaxis);
};

readData(() => {
  drawYAxis();
  g.attr("visibility", "hidden");
  readMapData();
});
