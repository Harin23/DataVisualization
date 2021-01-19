const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
const w = 1200;
const h= 600;
const padding = 40;

const svg = d3.select('.svg')
                .append('svg');

const tooltip = d3.select('.svg')
                    .append("div")
                    .attr("id", "tooltip")
                    .style("opacity", 0)

let data;
let xAxisScale;
let yAxisScale;
let xScale;
let yScale;
let datesArr;

let drawCanvas = () =>{
    svg
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "black")
    .append("text")
    .text("US GDP")
    .attr("x", 590)
    .attr("y", 20)
    .attr("id", "title")
}

let createScales = ()=>{
    xScale = d3.scaleLinear()
    .domain([0, data.length-1])
    .range([padding, w-padding]);

    yScale = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d[1])])
    .range([0, h-(2*padding)]);

    datesArr = data.map((date)=>{
        return new Date(date[0])
      });
    xAxisScale = d3.scaleTime()
                    .domain([d3.min(datesArr), d3.max(datesArr)])
                    .range([padding, w - padding]);

  
    yAxisScale = d3.scaleLinear()
                   .domain([0, d3.max(data, (d) => d[1])])
                   .range([h - padding, padding]);
  
}
let createPlot = ()=>{
    let windowW = (window.innerWidth-w)*0.5;
    let WindowH = (window.innerHeight+h)*0.5;
    let barWidth = (w-(2*padding))/data.length
    svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr('x', (d,i) => (barWidth*i)+padding)
    .attr("y", (d) => h-yScale(d[1])-padding)
    .attr('height', (d) => yScale(d[1]))
    .attr('width', barWidth)
    .attr("class", "bar")
    .attr("data-date", (d)=>d[0])
    .attr("data-gdp", (d)=>d[1])
    .on('mouseover', (d,i)=>{
        tooltip.transition()
        .duration(250)
        .style('opacity', 0.9);
        tooltip.html(d[0]).attr("data-date", d[0]);
        tooltip.style("left", windowW+(barWidth*i+(padding*1.375)) + "px")
                .style("top",  WindowH+(yScale(h-d[1])-(padding*2.5)) + "px")
    })
    .on("mouseout", ()=>{
        tooltip.transition()
        .duration(250)
        .style('opacity', 0);
    })

}
let createAxis = ()=>{
    const xAxis = d3.axisBottom(xAxisScale)
    svg.append("g")
       .attr("transform", "translate(0," + (h - padding) + ")")
       .attr("id", "x-axis")
       .call(xAxis);

  const yAxis = d3.axisLeft(yAxisScale);
    svg.append("g")
       .attr("transform", "translate("+padding+  ",0)")
       .attr("id", "y-axis")
       .call(yAxis);
}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
.then(response => response.json())
.then(res => { 
    data = res.data;
    drawCanvas();
    createScales();
    createPlot();
    createAxis();
})