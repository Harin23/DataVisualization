const VGURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const H = window.innerHeight*(7/9), W = window.innerWidth*(10/13), PADDING=10;
const SELECTION = d3.select("body").append("section");
const HEADING = SELECTION.append("heading")
const SVG = SELECTION.append("svg").attr("height", H).attr("width", W).attr("id", "svg");
const LEGEND = SELECTION.append("svg").attr("id", "legend");
const TOOLTIP = SELECTION.append("div").attr("id", "tooltip");
let data, root, color, categories;

let createHeadings=()=>{
    HEADING.append("h1").attr("id", "title").text("Sales of Video Games");
    HEADING.append("h3").attr("id", "description").text("Top Video Games for Different Platforms");
}

let draw=()=>{
    let colorScheme = d3.schemeCategory10;
    colorScheme.push(...d3.schemePastel2);
    color = d3.scaleOrdinal(colorScheme);
    root = d3.hierarchy(data, (n)=>n.children)
    .sum((n)=>n.value)
    .sort((a, b)=>{
        return b.value - a.value;
    });
    let treemap = d3.treemap().size([W, H])
    treemap(root);

    let containers = SVG.selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d)=>"translate("+d.x0+", "+d.y0+")")

    containers.append("rect")
    .attr("width", (d)=>d.x1-d.x0)
    .attr("height", (d)=>d.y1-d.y0)
    .attr("class", "tile")
    .attr("data-category", (d)=>d.data.category)
    .attr("data-value",(d)=>d.value)
    .attr("data-name",(d)=>d.data.name)
    .attr("fill", (d)=>color(d.data.category))
    .on("mouseover", (d)=>{
        TOOLTIP.attr("data-value", d.srcElement.dataset.value)
        .html("Platform: "+d.srcElement.dataset.category
        +"<br>Game: "+d.srcElement.dataset.name
        +"<br>Value: "+d.srcElement.dataset.value)
        .style("opacity", 0.9)
        .style("top", d.y+40+"px")
        .style("left", d.x+40+"px")
        .style("transition", "0.5s")
    }).on("mouseout", (d)=>{
        TOOLTIP.style("opacity", 0)
    })

    containers.append("text")
    .selectAll("tspan")
    .data((d)=>d.data.name.split(" "))
    .enter()
    .append("tspan")
    .attr("x", 2)
    .attr("y", (d, i)=>10 + (i * 10))
    .text((d)=>d);
    
    
}

let createLegend=()=>{
    console.log(window.innerHeight, window.innerWidth)
    let h= (window.innerHeight*0.5) - (H*0.5) - (2*PADDING);
    let w = window.innerWidth - (2*PADDING);

    let rectH = (h*0.5) - PADDING
    let rectW = (w/(categories.length*0.5))

    LEGEND.attr("height", h)
    .attr("width", w)
    .style("bottom", PADDING+"px")
    .style("left", PADDING+"px");

    let container = LEGEND.selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", (val, i)=>{
        let x=0, y=0;
        if(i<categories.length/2){
            y=0
        }else{
            y=rectH + PADDING
        }
        if(i<categories.length/2){
            x=rectW*i
        }else{
            x=rectW*(i-categories.length/2)
        }
        return "translate("+x+", "+y+")"
    })

    container.append("rect")
    .attr("height", rectH)
    .attr("width", rectW)
    .attr("fill", (val)=>color(val))
    .attr("class", "legend-item")

    container.append("text")
    .text((val)=>val)
    .attr("y", rectH/2)
    .attr("x", rectW/2 - PADDING)
}

d3.json(VGURL).then((res, err) =>{
    if(err){
        console.log(err)
    }else{
        data = res;
        categories = data.children.map(category=>category.name)
        createHeadings();
        draw();
        createLegend();
    }
});