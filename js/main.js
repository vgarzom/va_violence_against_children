const width = 700;
const margin = { top: 50, left: 100, right: 50, bottom: 0 };
var cursorColor = 'steelblue';
const svg = d3.select("#chart-container").append("svg");
var y;
var g = svg.append("g");
var gText = svg.append("g");
var data = [];
var height;
let value_key = "total_casos"
const minLabel = margin.left + 150;

barChart = (_data) => {
  data = _data;
  height = data.length * 22 + margin.top + margin.bottom;

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[value_key])])
    .range([margin.left, width - margin.right]);
  y = d3.scaleBand()
    .domain(data.map(d => d.nombre))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  const xAxis = g => g
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(width / 80))
    .call(g => g.select(".domain").remove())

  svg.attr("height", height)
    .attr("width", width - 5);

  var bar =
    g.selectAll(".bar")
      .data(data);

  bar.enter().append("rect")
    .attr("class", "bar")
    .attr("x", x(0))
    .attr("fill", cursorColor ? cursorColor : 'steelblue')
    .attr("y", d => y(d.nombre))
    .attr("width", d => x(d[value_key]) - x(0))
    .attr("height", y.bandwidth());




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
  g.select("#xAxisG").remove();
  g.append("g").attr("id", "xAxisG").call(xAxis);

  g.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  return svg.node();
}

changeValue = (_data) => {
  data = _data;

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[value_key])])
    .range([margin.left, width - margin.right]);
  y = d3.scaleBand()
    .domain(data.map(d => d.nombre))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  const xAxis = g => g
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(width / 80))
    .call(g => g.select(".domain").remove())

  svg.attr("height", height)
    .attr("width", width - 5);

  var bar =
    g.selectAll(".bar")
      .data(data);

  bar.transition().duration(500)
    .attr("class", "bar")
    .attr("width", d => x(d[value_key]) - x(0))

  gText
    .selectAll("text")
    .data(data)
    .transition()
    .duration(750)
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

  g.select("#xAxisG").remove();
  g.append("g").attr("id", "xAxisG").call(xAxis);
}



function sortBarChart(sortedData) {
  y0 = d3.scaleBand()
    .domain(sortedData.map(d => d.nombre))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);


  g.selectAll('rect')
    .sort((a, b) => {
      return y0(a.nombre) - y0(b.nombre);
    })

  var transition = g.transition().duration(750);
  var delay = (d, i) => { return i * 10 };

  transition
    .selectAll("rect")
    .delay(delay)
    .attr("y", (d) => { return y0(d.nombre) });
  transition.select(".y.axis")
    .call(d3.axisLeft(y0))
    .selectAll("g")
    .delay(delay);

  transition = gText.transition().duration(750);
  transition
    .selectAll(".label_test")
    .delay(delay)
    .attr("y", (d) => y0(d.nombre) + y0.bandwidth() / 2);


}

var readData = () => {
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
    }
  ).then(() => {
    let keys = d3.keys(result);
    keys.map((d) => {
      data.push(result[d]);
    });

    data.sort((a, b) => d3.ascending(a.nombre, b.nombre))
    barChart(data);
  });
}

readData();

Reveal.addEventListener('slidechanged', function (evt) {
  currentSlide = evt.indexh;
  switch (currentSlide) {
    case 0:
      var sortedData = data.sort((a, b) => d3.ascending(a.nombre, b.nombre));
      sortBarChart(sortedData);
      break;
    case 1:
      var sortedData = data.sort((a, b) => d3.descending(a.total_casos, b.total_casos));
      sortBarChart(sortedData);
      if (value_key !== "total_casos") {
        value_key = "total_casos";
        changeValue(data);
      }
      break;
    case 2:
      if (value_key === "total_porciento") {
        var sortedData = data.sort((a, b) => d3.descending(a.total_casos, b.total_casos));
        sortBarChart(sortedData);
      } else {
        value_key = "total_porciento"
        changeValue(data);
      }
      break;
    case 3:
      var sortedData = data.sort((a, b) => d3.descending(a.total_porciento, b.total_porciento));
      sortBarChart(sortedData);
      break;
  }
});