//const { i } = require("mathjs");

class PlotData {
    constructor (value, state) {
        this.value = value;
        this.state = state;
    }
}

class visuals {

    constructor(data) {

        this.XC = data[0].XC;
        this.S = data[0].S;

        // this.XC = phca_result.XC;
        // this.S = phca_result.S;

        // this.data = data;

        // this.matrix_data = math.matrix(this.XC);

    }

    addArch () {

        let circle_dist = {"nodes":[
                            {"distance": 30, "names": 1, 
                            "colors": "orange"}, {"distance": 120,
                            "names": 2, "colors": "steelblue"},
                            {"distance": 210, "names": 3,
                            "colors": "darkgreen"}]};

        let margin = {top: 10, right: 20, bottom: 10, left: 20};

        let w = 500 - margin.right - margin.left;
        let h = 400 - margin.bottom - margin.top;

        let svg = d3.select("#archs")
            .append("svg")
            .classed("plot-svg", true)
            .attr("width", w + margin.right + margin.left)
            .attr("height", h + margin.top + margin.bottom);

        let g = svg.selectAll("g")
            .data(circle_dist.nodes);

        let gEnter = g.enter()
            .append("g")
            .attr("transform", (d) => {return "translate(70," +
                (d.distance) + ")"});

        let circles = gEnter.append('circle')
            .attr('r', 25)
            .attr('stroke', 'black')
            .attr('fill', d => { 
                return d.colors});

        let textd = gEnter.append("text")
            .text((d,i) => d.names);

    }

    addOneD () {

        let margin = {top: 10, right: 20, bottom: 10, left: 20};

        let w = 500 - margin.right - margin.left;
        let h = 400 - margin.bottom - margin.top;

        let oneD = d3.select("#oned")
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

        let xScale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([10,w-10]);
        
        let S1 = [];

        for (let p = 0; p < this.S.length; p++) {
            let point = new PlotData(this.S[p][0],this.S[p].state);
            S1.push(point);
        }

        let S2 = [];

        //for (let p = 0; )

        oneD.selectAll("circle")
            .data(S1)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d.value);
            })
            .attr("cy", function(d,i) {
                return i + 10;
            })
            .attr("r", 5)
            .attr('stroke', 'black')
            .attr("fill", "orange");

    }


    addBars() {

        let names = ["positive", "negative", "totalTestResults", "recovered", "death"]

        let arch1 = math.column(this.matrix_data,0);

        let arch1_d = arch1._data[0];

        for (let p = 1; p < arch1._data.length; p++) {
            arch1_d = math.concat(arch1_d, arch1._data[p]);
        }

        let arch1_data = [];

        for (let p = 0; p < arch1_d.length; p++) {
            let data = new PlotData(arch1_d[p], name[p]);
            arch1_data.push(data);
        }

        console.log(arch1_d);

        let arch2 = math.column(this.matrix_data,1);

        let arch2_d = arch2._data[0];

        for (let p = 1; p < arch2._data.length; p++) {
            arch2_d = math.concat(arch2_d, arch2._data[p]);
        }

        console.log(arch2_d);

        let arch3 = math.column(this.matrix_data,2);

        let arch3_d = arch3._data[0];

        for (let p = 1; p < arch3._data.length; p++) {
            arch3_d = math.concat(arch3_d, arch3._data[p]);
        }

        console.log(arch3_d);

        let margin = {top: 10, right: 20, bottom: 10, left: 20};

        let w = 500 - margin.right - margin.left;
        let h = 200 - margin.bottom - margin.top;
        let barpadding = 1;

        let yScale1 = d3.scaleLinear()
            .domain([d3.max(arch1_d), 0])
            .range([0,h-5]);

        let svg = d3.select("#bar1")
            .append("svg")
            .classed("plot-svg", true)
            .attr("width", w + margin.right + margin.left)
            .attr("height", h + margin.top + margin.bottom);

        svg.selectAll("rect")
            .data(arch1_data)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y", function(d,i) {
                return yScale1(d.value);
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return h-yScale1(d.value);
            })
            .attr("fill","steelblue")
            .attr("transform", "translate(" + 3.25*margin.left +
            "," + 0+")");

        let yaxis = svg.append("g")
            .attr("id", "y-axis");

        yaxis.append("text")
            .attr("class", "axis-label")
            .attr("transform", "translate(-" + 0
            + "," + 0)
            .attr("text-anchor", "middle")
            .attr("class", "y-label");

        yaxis.call(d3.axisLeft(yScale1).ticks(5))
            .attr("transform", "translate(" + 6*margin.top + "," + "5)")
            .attr("class", "axis_line");

        let yScale2 = d3.scaleLinear()
            .domain([d3.max(arch2_d), 0])
            .range([0,h-5]);
        
        let svg2 = d3.select("#bar2")
            .append("svg")
            .attr("width", w + margin.right + margin.left)
            .attr("height", h + margin.top + margin.bottom);

        svg2.selectAll("rect")
            .data(arch2_d)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y", function(d,i) {
                return yScale2(d);
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return h-yScale2(d);
            })
            .attr("fill","orange")
            .attr("transform", "translate(" + 3.25*margin.left +
            "," + 0+")");

        let yaxis2 = svg2.append("g")
            .attr("id", "y-axis2");

        yaxis2.append("text")
            .attr("class", "axis-label")
            .attr("transform", "translate(-" + 0
            + "," + 0)
            .attr("text-anchor", "middle")
            .attr("class", "y-label");

        yaxis2.call(d3.axisLeft(yScale2).ticks(5))
            .attr("transform", "translate(" + 6*margin.top + "," + "5)")
            .attr("class", "axis_line");

        let yScale3 = d3.scaleLinear()
            .domain([d3.max(arch3_d), 0])
            .range([0,h-5]);
        
        let svg3 = d3.select("#bar3")
            .append("svg")
            .attr("width", w + margin.right + margin.left) 
            .attr("height", h + margin.top + margin.bottom);

        svg3.selectAll("rect")
            .data(arch3_d)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y", function(d,i) {
                return yScale3(d);
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return h-yScale3(d);
            })
            .attr("fill", "darkgreen")
            .attr("transform", "translate(" + 3.25*margin.left +
            "," + 0+")");

        let yaxis3 = svg3.append("g")
            .attr("id", "y-axis3");

        yaxis3.append("text")
            .attr("class", "axis-label")
            .attr("transform", "translate(-" + 0
            + "," + 0)
            .attr("text-anchor", "middle")
            .attr("class", "y-label");

        yaxis3.call(d3.axisLeft(yScale3).ticks(5))
            .attr("transform", "translate(" + 6*margin.top + "," + "5)")
            .attr("class", "axis_line");

        d3.select('.ContainerA')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        let that = this;

        let tooltip = d3.selectAll('.plot-svg').selectAll("rect");

        tooltip.on("mouseover", function(d) {
    
        d3.select(this).append("title")
            .attr("class", "div.tooltip")
            .attr("class", "tooltip h2")
            .text(that.tooltipRender(d));
        });

    }

    tooltipRender(data) {
        let text = data.name;
        return text;
    }

}