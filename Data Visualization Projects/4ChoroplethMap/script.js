const mapURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
let dataCounties, dataStates, dataEducation, dataMax, dataMin;
const H = 600, W = 1000, padding=60;
const selection = d3.select("body").append("section");
const headings = selection.append("heading");
const svg = selection.append("svg").attr("height", H).attr("width", W).attr("id", "svg");
const tooltip = selection.append("div").attr("id", "tooltip");
var color; 

var color = d3.scaleThreshold()
    .domain([0, 1])
    .range(["red", "white", "green"]);

let createHeadings =()=>{
    headings.append("h1").attr("id", "title").text("Regional Education Standards in the US");
    headings.append("h3").attr("id", "description").text("The percentage of individuals that are 25 or older and are holding one or more degrees. (2010-2014)");
}

let generateMap =()=>{

    color = d3.scaleThreshold()
    .domain(d3.range(dataMin, dataMax, (dataMax - dataMin)/6))
    .range(d3.schemeGreens[7]);

    svg.selectAll("path")
    .data(dataCounties)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("fill", (val)=>{
        let dataFiltered = dataEducation.filter((obj)=>{
            return val.id == obj.fips;
        });
        if(dataFiltered[0] !== null){
            return color(dataFiltered[0].bachelorsOrHigher);
        }else{
            return color(0);
        }
        
    })
    .attr("data-fips", val=>val.id)
    .attr("data-education", (val)=>{
        return dataEducation.filter((obj)=>{
            return val.id == obj.fips;
        })[0].bachelorsOrHigher;
    }).on("mouseover", (val)=>{
        let fip = val.toElement.dataset.fips;
        let dataFiltered = dataEducation.filter((obj)=>{
            return fip == obj.fips;
        });
        dataFiltered = dataFiltered[0]
        tooltip
        .attr("data-education", val.toElement.dataset.education)
        .style("left", val.x+25+"px")
        .style("top", val.y+"px")
        .html("Location: "+ dataFiltered["area_name"]+", "+dataFiltered.state+"<br>Education: " + val.toElement.dataset.education+"%")
        .style("transition", "3s")
        .style("opacity", .8)
    }).on("mouseout", (val)=>{
        tooltip
        .style("opacity", "0")
        .style("transition", "0s")
    });

    svg.append("path")
    .datum(dataStates)
    .attr("d", d3.geoPath())
    .attr("class", "states");
}

let createLegend =()=>{
    let dom  = color.domain()
    dom = dom.map(val=>Math.round(val))
    let scale = d3.scaleLinear()
    .domain([dom[0], dom[dom.length-1]])
    .range([600, 900]);

    let axis = d3.axisBottom(scale)
    .tickValues(dom)
    .tickFormat(val=>val+"%");

    let legend = svg.append("g")
    .attr("id", "legend")
    .call(axis)
    .attr("transform", "translate(0,10)")

    dom.pop();

    legend.selectAll("rect")
    .data(dom)
    .enter()
    .append("rect")
    .attr("height", 9)
    .attr("width", 60)
    .attr("fill", (val,i)=>color.range()[i+1])
    .attr("x", (val)=>{
        return scale(val)
    })
    .select('.domain')
    .remove();
}

d3.json(mapURL).then((res, err) =>{
    if(err){
        console.log(err)
    }else{
        dataCounties = topojson.feature(res, res.objects.counties).features;
        dataStates = topojson.mesh(res, res.objects.states, function(a, b) { return a !== b; });
        d3.json(educationURL).then((res, err)=>{
            if(err){
                console.log(err)
            }else{
                dataEducation = res;
                dataMin = d3.min(dataEducation.map(value => value.bachelorsOrHigher));
                dataMax = d3.max(dataEducation.map(value => value.bachelorsOrHigher));
                createHeadings();
                generateMap();
                createLegend();
            }
        })
    }
})