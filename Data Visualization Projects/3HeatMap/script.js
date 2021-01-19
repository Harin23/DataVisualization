const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const selection = d3.select("body").append("section");
const headings = selection.append("heading");
const svg = selection.append("svg");
const legend = selection.append("svg");
const tooltip = selection.append("div").attr("id", "tooltip");
const H = 600, W = 1200, padding=60;
let data, years, baseTemp, minV, maxV;
let yScale, xScale;
const colors = ["#136aec", "#b3d1ff", "#ffcc80", "#ff0000" ]

let createHeadingsAndCanvas=()=>{
    headings.append("h1").attr("id", "title").text("Monthly Temperature");
    headings.append("h3").attr("id", "description").text("The base Temperature is "+baseTemp);
    svg.attr("height", H).attr("width", W).attr("id", "SVG");
};

let createScales=()=>{
    yScale = d3.scaleTime()
                .domain([new Date(0, 0, 1, 0, 0, 0, 0), new Date(0, 11, 31, 0, 0, 0, 0)])
                .range([padding, H-padding]);

    xScale = d3.scaleLinear()
                .domain([d3.min(years), d3.max(years)])
                .range([padding, W-padding]); 

                //console.log(yScale(4))
};

let plotData=()=>{
    svg.selectAll("rect")
        .data(data.monthlyVariance)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("fill", (obj)=>{
            let variance = obj.variance;
            if(variance<= -3){
                return colors[0]
            }else if(variance<= 0){
                return colors[1]
            }else if(variance<=3){
                return colors[2]
            }else{
                return colors[3]
            };
        })
        .attr("data-month", (obj)=>obj.month-1)
        .attr("data-year", (obj)=>obj.year)
        .attr("data-temp", (obj)=>obj.variance)
        .attr("height", (H-(2*padding))/12)
        .attr("width", (W-(2*padding))/years.length)
        .attr("x", (obj)=> xScale(obj.year))
        .attr("y", (obj)=>yScale(new Date(0, obj.month-1, 1, 0, 0, 0, 0)))
        .on("mouseover", (obj)=>{
            tooltip
                .attr("data-year", obj["toElement"]["__data__"].year)
                .style("opacity", 0.9)
                .html("Month: "+obj["toElement"]["__data__"].month+"<br>"+"Year: "+obj["toElement"]["__data__"].year
                +"<br>"+"Variance: "+obj["toElement"]["__data__"].variance+"<br> Temperature: "
                +(baseTemp + obj["toElement"]["__data__"].variance))
                .style("left",  obj.x+(padding/4)+ "px")
                .style("top", obj.y+(padding/4)+"px")

        }).on("mouseout", (obj)=>{
            tooltip.style("opacity", 0);
        });
};

let createAxis=()=>{
    yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));
    svg.append("g").call(yAxis)
    .attr("transform", "translate("+padding+  ",0"+")")
    .attr("id", "y-axis");

    xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    svg.append("g").call(xAxis)
    .attr("transform", "translate(0," + (H - padding) + ")")
    .attr("id", "x-axis");
};

let createLegend=()=>{
    let h=100, w=200, size=w/4;
    legend.attr("id", "legend")
    .attr("height", h)
    .attr("width", w+40);

    legend.selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("height", size)
    .attr("width", size)
    .attr("x", (c, i)=>(size*i)+20)
    .attr("y", 0)
    .attr("fill", (c)=>c);

    let legendScale = d3.scaleLinear()
                        .domain([-6, 6])
                        .range([0, w]);
    let legendAxis = d3.axisBottom(legendScale).tickValues([-6, -3, 0, 3, 6]);
    legend.append("g").call(legendAxis)
    .attr("transform", "translate(20, "+(h-size)+")")
}

fetch(dataURL)
    .then(res => res.json())
    .then(res =>{
        data = res;
        baseTemp = data.baseTemperature;
        let repeatedYears = data.monthlyVariance.map(obj => obj.year);
        years = repeatedYears.filter((val, i)=>repeatedYears.indexOf(val)==i);
        let tempV = data.monthlyVariance.map(obj=>obj.variance);
        minV = Math.min(...tempV);
        maxV = Math.max(...tempV);
        createHeadingsAndCanvas();
        createScales();
        plotData();
        createAxis();
        createLegend();
    });
                