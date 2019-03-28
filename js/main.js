const width = 700;
const margin = { top: 50, left: 100, right: 50, bottom: 0 };
const svg = d3.select("#chart-container").append("svg");
let g = svg.append("g");
let gText = svg.append("g");
let gAxis = svg.append("g");
let data = [];
let dataAll = [];
let dataG = [];
let height;
let value_key = "total_casos"
const minLabel = margin.left + 150;
let currentSlide = 0;
let transitionDuration = 500;
let drawingByGender = false;

let delay = (d, i) => { return i * 5 };

let updateBarChart = (sortedNames) => {
  height = (drawingByGender ? data.length / 2 : data.length) * 22 + margin.top + margin.bottom;

  //Defines the scales
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[value_key])])
    .range([margin.left, width - margin.right]);

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
    .attr("y", (d) =>  barPosition(d,y))
    .attr("width", d => x(d[value_key]) - x(0))
    .attr("height", d => barHeight(d,y))
    .attr("fill", (d) => color(d.type));

  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", x(0))
    .attr("fill", (d) => color(d.type))
    .attr("y", (d) =>  barPosition(d,y))
    .attr("height", d => barHeight(d,y))
    .attr("width", d => x(d[value_key]) - x(0));


/*
  //Draw text
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
    .domain(data.map(d => d.nombre))
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
      drawingByGender = false;
      data = dataAll;
      value_key = "total_casos";
      var sortedData = data.sort((a, b) => d3.ascending(a.nombre, b.nombre))
        .map(d => d.nombre);
      updateBarChart(sortedData);
      break;
    case 1:
      drawingByGender = false;
      data = dataAll;
      value_key = "total_casos";
      var sortedData = data.sort((a, b) => d3.descending(a.total_casos, b.total_casos))
        .map(d => d.nombre);
      updateBarChart(sortedData);
      break;
    case 2:
      drawingByGender = false;
      data = dataAll;
      value_key = "total_porciento";
      var sortedData = data.sort((a, b) => d3.descending(a.total_casos, b.total_casos))
        .map(d => d.nombre);
      updateBarChart(sortedData);
      break;
    case 3:
      drawingByGender = false;
      data = dataAll;
      value_key = "total_porciento";
      var sortedData = data.sort((a, b) => d3.descending(a.total_porciento, b.total_porciento))
        .map(d => d.nombre);
      updateBarChart(sortedData);
      break;
    case 4:
      drawingByGender = true;
      data = dataG;
      value_key = "total_porciento";
      var sortedData = data.sort((a, b) => d3.descending(a.total, b.total))
        .map(d => d.nombre);
      updateBarChart(sortedData);
      break;
  }
}

let readData = () => {
  var result = {};
  d3.csv(
    "../assets/data.csv",
    (d, i) => {
      if (!d.codigo.includes("|")) {
        d.municipios = []
        result[d.codigo] = d;
      } else {
        let k_d = d.codigo.split("|")[0];
        d.codigo = d.codigo.split("|")[1];
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
    let keys = d3.keys(result);
    keys.map((d) => {
      let obj = result[d];
      obj.type = "b";
      dataAll.push(obj);

      let dm = {
        nombre: obj.nombre,
        total_porciento: (obj.hombre_casos / obj.total_casos) * obj.total_porciento,
        type: "m",
        total: obj.total_porciento
      };

      let df = {
        nombre: obj.nombre,
        total_porciento: (obj.mujer_casos / obj.total_casos) * obj.total_porciento,
        type: "f",
        total: obj.total_porciento
      };

      dataG.push(dm);
      dataG.push(df);
    });
    
    data.sort((a, b) => d3.ascending(a.nombre, b.nombre));
    drawYAxis();
    drawBySlide();
  });
}

let color = (type) => {
  switch (type) {
    case "m":
      return "steelblue";
    case "f":
      return "pink";
    default:
      return "green"
  }
}

let barHeight = (d, scale) => {
  return (d.type === "b" ? 1.0 : 0.5) * scale.bandwidth();
}

let barPosition = (d, scale) => {
  let h = barHeight(d, scale);
  return (d.type === "f" ? h : 0.0) + scale(d.nombre);
}

Reveal.addEventListener('slidechanged', function (evt) {
  currentSlide = evt.indexh;
  drawBySlide();
});

readData();