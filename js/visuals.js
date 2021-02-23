//const { i } = require("mathjs");

class PlotLine {
    constructor (date, value) {
        return {
            "y": parseInt(value)
        }
    }
}

class visuals {

    constructor(data) {

        this.XC = data[0].XC;
        this.S = data[0].S;

        this.raw = data[0].raw; 

        this.timeline = data[0].time_data;

        // this.XC = phca_result.XC;
        // this.S = phca_result.S;

        // this.data = data;

        // this.matrix_data = math.matrix(this.XC);

    }

    addArch () {

        let circle_dist = {"nodes":[
                            {"distance": 30, "names": 1, 
                            "colors": "orange"}, {"distance": 95,
                            "names": 2, "colors": "steelblue"},
                            {"distance": 135, "names": 3,
                            "colors": "darkgreen"}]};

        let margin = {top: 10, right: 20, bottom: 10, left: 20};

        let w = 100 - margin.right - margin.left;
        let h = 600 - margin.bottom - margin.top;

        let svg = d3.select("#archs")
            .append("svg")
            .classed("plot-svg", true)
            .attr("width", w + margin.right + margin.left)
            .attr("height", h + margin.top + margin.bottom);

        let g = svg.selectAll("g")
            .data(circle_dist.nodes);

        let gEnter = g.enter()
            .append("g")
            .attr("transform", (d,i) => {return "translate(70," +
                (75+(d.distance*(i+1))) + ")"});

        let circles = gEnter.append('circle')
            .attr('r', 25)
            .attr('stroke', 'black')
            .attr('fill', d => { 
                return d.colors});

        let textd = gEnter.append("text")
            .text((d,i) => d.names);

    }

    addOneD () {

        let margin = {top: 5, right: 20, bottom: 5, left: 20};

        let w = 500 - margin.right - margin.left;
        let h = 200 - margin.bottom - margin.top;

        d3.select('#oned')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        let oneD = d3.select("#oned")
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

        let xScale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([10,w-10]);

        let xaxis = oneD.append("g")
                    .attr("id", "x-axis");
        
        xaxis.append("text")
            .attr("class", "axis-label")
            .attr("transform", "translate(-" + 0+ "," + 0)
            .attr("text-anchor", "middle")
            .attr("class", "y-label");
        
        xaxis.call(d3.axisBottom(xScale).ticks(5))
            .attr("transform", "translate(" + 0 + "," + "5)")
            .attr("class", "axis_line");
        
        let S1 = [];

        for (let p = 0; p < this.S.length; p++) {
            let point = new PlotData(this.S[p][0],this.S[p].state);
            S1.push(point);
        }

        let S2 = [];

        for (let p = 0; p < this.S.length; p++) {
            let point = new PlotData(this.S[p][1],this.S[p].state);
            S2.push(point);
        }

        oneD.selectAll("circle")
            .data(S1)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d.value);
            })
            .attr("cy", function(d,i) {
                return 3 * (i + 10);
            })
            .attr("r", 3)
            .attr('stroke', 'black')
            .attr("fill", "orange");

        let oneD2 = d3.select("#oned")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

        oneD2.selectAll("circle")
                .data(S2)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return xScale(d.value);
                })
                .attr("cy", function(d,i) {
                    return 3 * (i + 10);
                })
                .attr("r", 3)
                .attr('stroke', 'black')
                .attr("fill", "steelblue");

        let S3 = [];

            for (let p = 0; p < this.S.length; p++) {
                let point = new PlotData(this.S[p][2],this.S[p].state);
                S3.push(point);
            }

        let oneD3 = d3.select("#oned")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        oneD3.selectAll("circle")
            .data(S3)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d.value);
            })
            .attr("cy", function(d,i) {
                return 3 * (i + 10);
            })
            .attr("r", 3)
            .attr('stroke', 'black')
            .attr("fill", "darkgreen");

        let svg = d3.select("#bar1")
            .append("svg")
            .classed("plot-svg", true)
            .attr("id", "bars")

        let that = this;

        let states_circ = d3.selectAll("#oned").selectAll("circle");

        states_circ.on("mouseover", function(d) {
            d3.select(this).append("title")
                .attr("class", "div.tooltip")
                .attr("class", "tooltip h2")
                .text(that.tooltipRender(d));

        })

        states_circ.on("click", function (d) {
            that.addBars(d);
        })


    }

    addBars(data) {

        d3.selectAll("#bars").remove();

        let margin = {top: 10, right: 20, bottom: 10, left: 20};
        
        let w = 500 - margin.right - margin.left;
        let h = 400 - margin.bottom - margin.top;
        let barpadding = 1;

        let state_data = [];

        for (let p = 0; p < this.raw.length; p++) {
            if (this.raw[p].state === data.currentTarget.__data__.state) {
                let point = [parseInt(this.raw[p].positive), 
                    parseInt(this.raw[p].negative),
                            parseInt(this.raw[p].totalTestResults),
                        parseInt(this.raw[p].recovered), 
                        parseInt(this.raw[p].death)];
                state_data.push(point);
            }
        }

        state_data = state_data[0];

        let x_lab = d3.scaleBand()
                        .domain(["positive", "negative",
                        "test results", 
                        "recovered", "death"])
                        .range([0,w-5])

        let yScale = d3.scaleLinear()
            .domain([d3.max(state_data),0])
            .range([0,h-5]);

        let svg = d3.select("#bar1")
            .append("svg")
            .classed("plot-svg", true)
            .attr("id", "bars")
            .attr("width", w + margin.right + margin.left)
            .attr("height", h + margin.top + margin.bottom);

        svg.selectAll("rect")
            .data(state_data)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/state_data.length)
            })
            .attr("y", function(d,i) {
                return yScale(d);
            })
            .attr("width", w/state_data.length - barpadding)
            .attr("height", function(d) {
                return h-yScale(d);
            })
            .attr("fill","pink")
            .attr("transform", "translate(" + 3*margin.left +
            "," + 0+")");
    
        let yaxis = svg.append("g")
                    .attr("id", "y-axis");
        
            yaxis.append("text")
                .attr("class", "axis-label")
                .attr("transform", "translate(" + 0
                    + "," + 0)
                .attr("text-anchor", "middle")
                .attr("class", "y-label");
        
            yaxis.call(d3.axisLeft(yScale).ticks(5))
                .attr("transform", "translate(" + 3*margin.left + "," + "5)")
                .attr("class", "axis_line");

        let xaxis = svg.append("g")
                    .attr("id", "x-axis")
                    .attr("transform", "translate(" +3*margin.left+ "," +h+")")
                    .call(d3.axisBottom(x_lab));
        
        this.addTimeLine(data);
    }

    addTimeLine(data) { 

        d3.selectAll("#svg-time").remove();

        let state_data = [];

        for (let p = 0; p < this.timeline.length; p++) {
            if (this.timeline[p].state === data.currentTarget.__data__.state) {
                let point = new PlotLine(this.timeline[p].date,this.timeline[p].positive);
                state_data.push(point);
            }
        }

        let margin = {top: 10, right: 20, bottom: 10, left: 20};
        
        let w = 500 - margin.right - margin.left;
        let h = 400 - margin.bottom - margin.top;

        let xScale = d3.scaleLinear()
                        .domain([0, state_data.length])
                        .range([0, w]);

        let yScale = d3.scaleLinear()
                        .domain([0, d3.max(state_data, d => d.y)])
                        .range([h, 0]);

        let line = d3.line()
                    .x(function(d,i) {
                        return xScale(i);
                    })
                    .y(function(d) {
                        return yScale(d.y)
                    })
                    .curve(d3.curveMonotoneX);

        let svg = d3.select("#timeL")
            .append("svg")
            .attr("id", "svg-time")
            .attr("width", w + margin.right + margin.left)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + 3*margin.left + "," + 0 + ")");

        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(0," + h + ")")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("id", "y-axis")
            .call(d3.axisLeft(yScale));

        svg.append("path")
            .datum(state_data)
            .attr("id", "line-chart")
            .attr("class", "line")
            .attr("d", line);

        // let scale_line = d3
        //     .scaleLinear()
        //     .domain([0, this.timeline.length])
        //     .range([0, w-5]);

        // let yScale = d3.scaleLinear()
        //                 .domain([0, d3.max(state_data, d => d.positive)])
        //                 .range([0, h-5]);

        // let aLineGenerator = d3.line()
        //                         .x((d,i) => xScale(i))
        //                         .y((d,i) => yScale(d.positive));

        // let aAxis_line = d3.axisLeft(yScale).ticks(5);
        // d3.select("#line-chart-axis")
        //     .call(aAxis_line);
        
        // d3.select("#aLineChart-axis").append("text")
        //     .text("Positive Cases")
        //     .attr("transform", "translate(50, -3)");

        // let aLineC = d3.selectAll("#line-chart")
        //                 .datum(data);
                            
        // aLineC
        //     .style("opacity", 0)
        //     .transition()
        //     .duration(750)
        //     .style("opacity", 1)
        //     .attr("d", aLineGenerator);

    }

    // addBars() {

    //     let names = ["positive", "negative", "totalTestResults", "recovered", "death"]

    //     let arch1 = math.column(this.matrix_data,0);

    //     let arch1_d = arch1._data[0];

    //     for (let p = 1; p < arch1._data.length; p++) {
    //         arch1_d = math.concat(arch1_d, arch1._data[p]);
    //     }

    //     let arch1_data = [];

    //     for (let p = 0; p < arch1_d.length; p++) {
    //         let data = new PlotData(arch1_d[p], name[p]);
    //         arch1_data.push(data);
    //     }

    //     console.log(arch1_d);

    //     let arch2 = math.column(this.matrix_data,1);

    //     let arch2_d = arch2._data[0];

    //     for (let p = 1; p < arch2._data.length; p++) {
    //         arch2_d = math.concat(arch2_d, arch2._data[p]);
    //     }

    //     console.log(arch2_d);

    //     let arch3 = math.column(this.matrix_data,2);

    //     let arch3_d = arch3._data[0];

    //     for (let p = 1; p < arch3._data.length; p++) {
    //         arch3_d = math.concat(arch3_d, arch3._data[p]);
    //     }

    //     console.log(arch3_d);

    //     let margin = {top: 10, right: 20, bottom: 10, left: 20};

    //     let w = 500 - margin.right - margin.left;
    //     let h = 200 - margin.bottom - margin.top;
    //     let barpadding = 1;

    //     let yScale1 = d3.scaleLinear()
    //         .domain([d3.max(arch1_d), 0])
    //         .range([0,h-5]);

    //     let svg = d3.select("#bar1")
    //         .append("svg")
    //         .classed("plot-svg", true)
    //         .attr("width", w + margin.right + margin.left)
    //         .attr("height", h + margin.top + margin.bottom);

    //     svg.selectAll("rect")
    //         .data(arch1_data)
    //         .enter()
    //         .append("rect")
    //         .attr("x", function (d,i) {
    //             return i * (w/arch1_d.length)
    //         })
    //         .attr("y", function(d,i) {
    //             return yScale1(d.value);
    //         })
    //         .attr("width", w/arch1_d.length - barpadding)
    //         .attr("height", function(d) {
    //             return h-yScale1(d.value);
    //         })
    //         .attr("fill","steelblue")
    //         .attr("transform", "translate(" + 3.25*margin.left +
    //         "," + 0+")");

    //     let yaxis = svg.append("g")
    //         .attr("id", "y-axis");

    //     yaxis.append("text")
    //         .attr("class", "axis-label")
    //         .attr("transform", "translate(-" + 0
    //         + "," + 0)
    //         .attr("text-anchor", "middle")
    //         .attr("class", "y-label");

    //     yaxis.call(d3.axisLeft(yScale1).ticks(5))
    //         .attr("transform", "translate(" + 6*margin.top + "," + "5)")
    //         .attr("class", "axis_line");

    //     let yScale2 = d3.scaleLinear()
    //         .domain([d3.max(arch2_d), 0])
    //         .range([0,h-5]);
        
    //     let svg2 = d3.select("#bar2")
    //         .append("svg")
    //         .attr("width", w + margin.right + margin.left)
    //         .attr("height", h + margin.top + margin.bottom);

    //     svg2.selectAll("rect")
    //         .data(arch2_d)
    //         .enter()
    //         .append("rect")
    //         .attr("x", function (d,i) {
    //             return i * (w/arch1_d.length)
    //         })
    //         .attr("y", function(d,i) {
    //             return yScale2(d);
    //         })
    //         .attr("width", w/arch1_d.length - barpadding)
    //         .attr("height", function(d) {
    //             return h-yScale2(d);
    //         })
    //         .attr("fill","orange")
    //         .attr("transform", "translate(" + 3.25*margin.left +
    //         "," + 0+")");

    //     let yaxis2 = svg2.append("g")
    //         .attr("id", "y-axis2");

    //     yaxis2.append("text")
    //         .attr("class", "axis-label")
    //         .attr("transform", "translate(-" + 0
    //         + "," + 0)
    //         .attr("text-anchor", "middle")
    //         .attr("class", "y-label");

    //     yaxis2.call(d3.axisLeft(yScale2).ticks(5))
    //         .attr("transform", "translate(" + 6*margin.top + "," + "5)")
    //         .attr("class", "axis_line");

    //     let yScale3 = d3.scaleLinear()
    //         .domain([d3.max(arch3_d), 0])
    //         .range([0,h-5]);
        
    //     let svg3 = d3.select("#bar3")
    //         .append("svg")
    //         .attr("width", w + margin.right + margin.left) 
    //         .attr("height", h + margin.top + margin.bottom);

    //     svg3.selectAll("rect")
    //         .data(arch3_d)
    //         .enter()
    //         .append("rect")
    //         .attr("x", function (d,i) {
    //             return i * (w/arch1_d.length)
    //         })
    //         .attr("y", function(d,i) {
    //             return yScale3(d);
    //         })
    //         .attr("width", w/arch1_d.length - barpadding)
    //         .attr("height", function(d) {
    //             return h-yScale3(d);
    //         })
    //         .attr("fill", "darkgreen")
    //         .attr("transform", "translate(" + 3.25*margin.left +
    //         "," + 0+")");

    //     let yaxis3 = svg3.append("g")
    //         .attr("id", "y-axis3");

    //     yaxis3.append("text")
    //         .attr("class", "axis-label")
    //         .attr("transform", "translate(-" + 0
    //         + "," + 0)
    //         .attr("text-anchor", "middle")
    //         .attr("class", "y-label");

    //     yaxis3.call(d3.axisLeft(yScale3).ticks(5))
    //         .attr("transform", "translate(" + 6*margin.top + "," + "5)")
    //         .attr("class", "axis_line");

    //     d3.select('.ContainerA')
    //         .append('div')
    //         .attr("class", "tooltip")
    //         .style("opacity", 0);

    //     let that = this;

    //     let tooltip = d3.selectAll('.plot-svg').selectAll("rect");

    //     tooltip.on("mouseover", function(d) {
    
    //     d3.select(this).append("title")
    //         .attr("class", "div.tooltip")
    //         .attr("class", "tooltip h2")
    //         .text(that.tooltipRender(d));
    //     });

    // }

    tooltipRender(data) {
        let text = data.currentTarget.__data__.state;
        return text;
    }

}