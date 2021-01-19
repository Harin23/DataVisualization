let dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
let data;
let time;
const w = 1200;
const h = 600;
const wWin=window.innerWidth;
const hWin=window.innerHeight;
const padding = 40;
let xAxisScale;
let yAxisScale;

let svg = d3.select(".svg")
            .append("svg");

let drawCanvas = ()=>{
    svg
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "black")
    .append("text")
    .text("STEROIDS AND BICYCLE RACING")
    .attr("x", (w/2))
    .attr("y", 20)
    .attr("font-weight", "bold")
    .attr("id", "title")
    .attr("text-anchor", "middle");

    legend = svg.append("g").attr("id", "legend");
    let xl = w*0.9; let yl=h*0.3; let paddingl= padding/2;
    legend.append("text").text("Legend").attr("x", xl+(paddingl/2)).attr("y", yl-paddingl).attr("font-weight", "bold");
    legend.append("circle").attr("cx", xl).attr("cy", yl).attr("r", 5).attr("fill", "#e6005c");
    legend.append("circle").attr("cx", xl).attr("cy", yl+paddingl).attr("r", 5).attr("fill", "#66ff66");
    legend.append("text").text("No Doping").attr("x", xl+paddingl).attr("y", yl+5);
    legend.append("text").text("Doping").attr("x", xl+paddingl).attr("y", yl+paddingl+5);


}

let createScales = ()=>{
    xAxisScale = d3.scaleLinear()
                .domain([d3.min(data, (d)=>d.Year-1), d3.max(data, (d)=>d.Year+1)])
                .range([padding, w-padding]);
    yAxisScale = d3.scaleTime()
                .domain([d3.min(data, (d)=>new Date((d.Seconds-5)*1000)), d3.max(data, (d)=>new Date((d.Seconds+5)*1000))])
                .range([padding, h-padding]);
}

let plotData = ()=>{
    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d)=>xAxisScale(d.Year))
        .attr("cy", (d)=>yAxisScale(new Date(d.Seconds*1000)))
        .attr("r", 5)
        .attr("data-xvalue", (d)=> d.Year)
        .attr("data-yvalue", (d)=> new Date(d.Seconds*1000))
        .attr("fill", (d)=>{
            if(d.Doping == ""){
                return "#e6005c"
            }else{
                return "#66ff66"
            };
        }).on("mouseover", (d)=>{
            d3.select("#tooltip")
                .attr("data-year", d['toElement']['__data__'].Year)
                .style("opacity", 0.9)
                .html("Name: "+d['toElement']['__data__'].Name+"<br>"+"Year: "+d['toElement']['__data__'].Year
                +"<br>"+"Nationality: "+d['toElement']['__data__'].Nationality+"<br> Place: "+d['toElement']['__data__'].Place
                +"<br> Time: "+d['toElement']['__data__'].Time)
                .style("left",  d.x+(padding/3)+ "px")
                .style("top", d.y+(padding/3)+"px")

        }).on("mouseout", (d)=>{
            d3.select("#tooltip")
                .style("opacity", 0)
        });
}

let createAxis = ()=>{
    const xAxis = d3.axisBottom(xAxisScale)
                    .tickFormat(d3.format('d'));
    svg.append("g")
       .attr("transform", "translate(0," + (h - padding) + ")")
       .attr("id", "x-axis")
       .call(xAxis);

  const yAxis = d3.axisLeft(yAxisScale)
                .tickFormat(d3.timeFormat("%M:%S"));
    svg.append("g")
       .attr("transform", "translate("+padding+  ",0)")
       .attr("id", "y-axis")
       .call(yAxis);
}

fetch(dataURL)
    .then(res => res.json())
    .then(res => {
        //console.log(res)
        data = res;
        drawCanvas();
        createScales();
        plotData();
        createAxis();
    })