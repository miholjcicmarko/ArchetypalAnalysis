class PlotData {
    constructor (value, variable_name) {
        this.value = value;
        this.variable_name = variable_name;

        this.country = null;
    }
}

class aa_view {

    constructor(data) {

        this.XC = data[0].XC;
        this.S = data[0].S;
    
        this.raw = data[0].raw; 
        this.variables = Object.keys(this.raw[0]);
    
        this.timeline = data[0].time_data;

        this.chartOn = false;
        this.filteredData = [];
        this.chosenVars = [];

        let that = this;

        let dropdown = d3.select("#selectNow");

            dropdown.on("change", function () {
                let number = this.value;

                that.chartON = true;

                if (number === '-') {
                    that.resetViz();
                }
                else {
                    that.drawCircleChart(number);
                }
            });

        this.drawTimeLine(this.timeline);
    
    }

    drawCircleChart (numberOfArchetypes) {

        this.numberOfArchetypes = numberOfArchetypes;

        this.margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let width = 350 - this.margin.right - this.margin.left;
        let height = 350 - this.margin.bottom - this.margin.top;

        d3.select('#oned')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([10,width-10]);

        for (let i = 0; i < numberOfArchetypes; i++) {
            let oneD = d3.select('#oned')
                .append('svg')
                .attr("id", "label" + i)
                .attr("width", width);
            
            if (numberOfArchetypes >= 5) {
                oneD.attr("height", (height / numberOfArchetypes));
            }
            else if (numberOfArchetypes === 4) {
                oneD.attr("height", (height / numberOfArchetypes) - this.margin.top
                            - this.margin.bottom);
            }
            else {
                oneD.attr("height", (height / numberOfArchetypes) - this.margin.top
                            - this.margin.bottom);
            }

            oneD.append("text")
                .text("Percentage of Archetype " + (i + 1))
                .attr("transform", "translate(0,10)")
                .style("font-weight", "bold") 
                .classed("labelArch", true); 

            let xaxis = oneD.append("g")
                .attr("id", "x-axis"+i);

            xaxis.append("text")
                .attr("class", "axis-label")
                .attr("text-anchor", "middle")
                .classed("labelArch", true);

            xaxis.call(d3.axisBottom(this.xScale).ticks(5))
                .attr("transform", "translate(0,15)")
                .attr("class", "axis_line")

            if (numberOfArchetypes >= 6) {
                oneD.style("font-size", "7px");
                xaxis.style("font-size", "5px");
            }
            else if (numberOfArchetypes < 6 && numberOfArchetypes >= 5) {
                oneD.style("font-size", "10px");
                xaxis.style("font-size", "8px");
            }
            else if (numberOfArchetypes <= 4) {
                oneD.style("font-size", "13px");
                xaxis.style("font-size", "10px");
            }

        if (i === 0) {
            this.dataS = [];
        }
            
        this.dataS[i] = [];
        for (let p = 0; p < this.S.length; p++) {
            // need to generalize, can't have state
            let point = new PlotData(this.S[p][i],this.S[p].state); 
            this.dataS[i].push(point);
        }

        let circles = oneD.append("g")
                .attr("id", "circle"+i);

        let circleScale = this.xScale;

        let margin_top = this.margin.top;

        circles.selectAll("circle")
            .data(this.dataS[i])
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return circleScale(d.value);
            })
            .attr("cy", function() {
                if (numberOfArchetypes <= 3) {
                    return 45;
                }
                else if (numberOfArchetypes == 4) {
                    return 42;
                }
                else {
                    return 45 - margin_top;
                }
            })
            .attr("r", function() {
                if (numberOfArchetypes >= 5) {
                    return 3;
                }
                else if (numberOfArchetypes === 4) {
                    return 5;
                }
                else {
                    return 7;
                }
            })
            .classed("circleData", true)
            .attr("id", function(d) {
                return d.variable_name + "";
            });
            
    }  
    
    let that = this;

    let searchBar = d3.select("#search-bar");
        searchBar.on("keyup", (e) => {

            let searchVal = searchBar.property("value").toLowerCase();
            if (e.keyCode === 13 || searchVal == "") {
                this.onSearch(searchVal,this.dataS, this.numberOfArchetypes);
                that.variable_name = searchVal;
            }
            
        });

    let data_circ = d3.selectAll("#oned").selectAll("circle");

    that.tooltip(data_circ);

    that.drawVariables();

    let submit = d3.select("#submit");
        submit.on("click", function(d,i) {
            that.makeBarCharts(that.chosenVars, that.raw);
        });

    }

    drawVariables () {

        let buttons = d3.select("#bar1")
                        .append("g")
                        .attr("id", "buttonGroup");

        for (let i = 0; i < this.variables.length; i++) {
            let button = d3.select('#buttonGroup')
                .append("button")
                .attr("class", "button")
                .attr("id", "" + this.variables[i])
                .style("margin", "5px");

            document.getElementById("" + this.variables[i]).innerHTML = this.variables[i];
            let that = this;

            let buttons = d3.select('#bar1').selectAll("button");

            buttons.on("click", function (d) {
                that.addChosenVar (d);
                that.chosenVars.push(d.srcElement.id);
            })

            // document.getElementById(this.variables[i]).addEventListener("click", this.addChosenVar);
        }
    }

    addChosenVar (event) {
        let id = event.srcElement.id;

        let button = d3.select("#" + id)
                        .classed("pressed", true);
    }

    tooltip (onscreenData) {
        let that = this;
        let tooltip = d3.select('.tooltip')

        onscreenData.on("mouseover", function(d,i) {
            
            let pageX = d.clientX;
            let pageY = d.clientY;

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
        
            tooltip.html(that.tooltipRender(d))
                .style("left", (pageX) + "px")
                .style("top", (pageY) + "px");

            d3.select(this).classed("hovered", true);
        });

        onscreenData.on("mouseout", function(d,i) {
            d3.select(this).classed("hovered",false);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    }

    tooltipRender(data) {
        let text = data.currentTarget.__data__.variable_name;
        return text;
    }

    onSearch(searchVal, data) {
        let searchBar = d3.select("#search-bar");
        
        for (let i = 0; i < this.numberOfArchetypes; i++) {
            this.filteredData = data[i].filter(d => d.variable_name.toLowerCase().includes(searchVal));

        // for (let k = 0; k < this.filteredData.length; k++) {
        //     let circles = d3.select('#circle' + i);
        //     let circle = circles.select("#"+this.filteredData[k].variable_name)
        //                    .classed("hovered", true);
        // }

            let circles = d3.select('#circle' + i);

            let circleScale = this.xScale;

            let margin_top = this.margin.top;

            let numberOfArch = this.numberOfArchetypes; 
            
            circles.append("circle")
                .attr("cx", circleScale(this.filteredData[0].value))
                .attr("cy", function() {
                    if (numberOfArch <= 3) {
                        return 45;
                    }
                    else if (numberOfArch == 4) {
                        return 43;
                    }
                    else {
                        return 45 - (margin_top);
                    }
                })
                .attr("r", function() {
                    if (numberOfArch >= 5) {
                        return 3;
                    }
                    else {
                        return 7;
                    }
                })
                .classed("hovered", true);

        }
    }

    makeBarCharts (chosenVariables, rawData) {

        d3.select('#bar1')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        let numberOfArch = this.numberOfArchetypes;

        d3.select("#buttonGroup").remove();

        let margin = {top: 10, right: 20, bottom: 10, left: 20};
        
        let w = 600 - margin.right - margin.left;
        let h = 350 - margin.bottom - margin.top;
        let barpadding = 70;

        let filteredData = this.filterObjsInArr(rawData, chosenVariables);

        // make more general
        let specificData = filteredData.filter(d => d.state.toLowerCase().includes(this.variable_name));   

        let ydata = [];
        let rawDataVarSpecific = [];

        for (let i = 0; i < chosenVariables.length; i++) {

            if (chosenVariables[i] !== "state") {

                for (let k = 0; k < specificData.length; k++){
                    let number = {value : parseInt(specificData[k][""+chosenVariables[i]])
                    }
                    ydata.push(number);
                }
                let arrayofData = [];

                for (let k = 0; k < filteredData.length; k++) {
                    let number = parseInt(filteredData[k][""+chosenVariables[i]])
                    arrayofData.push(number);
                }
                rawDataVarSpecific.push(arrayofData);
            }
        }
                let svg = d3.select("#bar1")
                            .append("svg")
                            .attr("id", "bars")
                            .attr("width", w + margin.right + margin.left)
                            .attr("height", h + margin.top + margin.bottom);
                        
                let x_lab = [];
                let yScale = [];

                for (let i = 1; i < chosenVariables.length; i++) {
                    let x_var = d3.scaleBand()
                          .domain(["" + chosenVariables[i]])
                          .range([0,w/(chosenVariables.length-1) - barpadding]);
                    x_lab.push(x_var);

                    let arrayRaw = rawDataVarSpecific[i-1];

                    let yScaleOne = d3.scaleLinear()
                               .domain([d3.max(arrayRaw), 0])
                               .range([0, (h-5)]);
                    yScale.push(yScaleOne);
                }

                // let x_lab = d3.scaleBand()
                //           .domain(["" + chosenVariables[i]])
                //           .range([0,(w-5)/numberOfArch]);

                // let ydata = [];
                // for (let k = 0; k < specificData.length; k++){
                //     ydata.push(parseInt(specificData[k][""+chosenVariables[i]]))
                // }

                // let rawDataVarSpecific = [];
                // for (let k = 0; k < filteredData.length; k++) {
                //     rawDataVarSpecific.push(parseInt(filteredData[k][""+chosenVariables[i]]));

                // }
                
                // let yScale = d3.scaleLinear()
                //                .domain([d3.max(rawDataVarSpecific), 0])
                //                .range([0, (h-5)]);

                svg.selectAll("rect")
                    .data(ydata)
                    .enter()
                    .append("rect")
                    .attr("x", function (d,i) {
                        return i * (w/(chosenVariables.length-1));
                    })
                    .attr("y", function(d,i) {
                        let scale = yScale[i];
                        return scale(d.value);
                    })
                    .attr("width", w/(chosenVariables.length-1) - barpadding)
                    .attr("height", function(d,i) {
                        let scale = yScale[i];
                        return h-scale(d.value);
                    })
                    .attr("fill","orangered")
                    .attr("transform", "translate(70,0)");


                // svg.append("rect")
                //    .attr("x", (i * w/numberOfArch))
                //    .attr("y", yScale(ydata))
                //    .attr("width", w/numberOfArch - barpadding)
                //    .attr("height", function(d) {
                //         return yScale(ydata);
                //     })
                //    .attr("fill","steelblue")
                //    .attr("transform", "translate(0,0)");

                for (let i = 0; i < chosenVariables.length; i++) {

                    if (chosenVariables[i] !== "state") {
                       
                        let yaxis = svg.append("g")
                                .attr("id", "y-axis" + i);
                           
                        yaxis.append("text")
                             .text("cases")
                             .attr("class", "axis-label")
                             .attr("text-anchor", "middle")
                             .attr("transform", "translate(" + (-60+((i-1))) +","+h/2+")rotate(-90)");
                           
                        yaxis.call(d3.axisLeft(yScale[i-1]).ticks(5))
                             .attr("transform", "translate(" + ((i-1)*(w/(chosenVariables.length-1))+3*margin.left+10) + ",5)")
                             .attr("class", "axis_line");
                   
                        let xaxis = svg.append("g")
                                       .attr("id", "x-axis")
                                       .attr("transform", "translate("+ ((i-1)*(w/(chosenVariables.length-1))+(3*margin.left+10))+","+ h+")")
                                       .call(d3.axisBottom(x_lab[i-1]));
                    }

                }
            let data_rect = d3.selectAll("#bar1").selectAll("rect");

            this.tooltipRect(data_rect);
    }

    filterObjsInArr (arr, selection) {
        let filteredArray = [];
        arr.map((obj) => {
            let filteredObj = {};
            for (let key in obj) {
                if (selection.includes(key)) {
                    filteredObj[key] = obj[key];
                };
            };
            filteredArray.push(filteredObj);
        })
        return filteredArray;
    }

    tooltipRect (onscreenData) {
        let that = this;
        let tooltip = d3.select('.tooltip')

        onscreenData.on("mouseover", function(d,i) {
            
            let pageX = d.clientX;
            let pageY = d.clientY - 25;

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
        
            tooltip.html(that.tooltipRectRender(d))
                .style("left", (pageX) + "px")
                .style("top", (pageY) + "px");

            d3.select(this).classed("hovered", true);
        });

        onscreenData.on("mouseout", function(d,i) {
            d3.select(this).classed("hovered",false);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    }

    tooltipRectRender(data) {
        let text = data.currentTarget.__data__.value;
        return text;
    }

    drawTimeLine(data) {

        let margin = {top: 10, right: 20, bottom: 10, left: 20};
        
        let w = 500 - margin.right - margin.left;
        let h = 400 - margin.bottom - margin.top;

        for (let i = 0; i < data.length; i++) {
            let date = data[i].date.split('-');
            let date_format = new Date(date[0], date[1] - 1, date[2]);

            data[i].date = date_format
        }

        let sumstat = d3.nest()
                        .key(function(d) { d.state})
                        .entries(data);

        let xScale = d3.scaleLinear()
                        .domain([0, d3.max(data, d=> d.death)])
                        .range([0, w]);

        let yScale = d3.scaleLinear()
                        .domain([0, d3.max(data, d => d.positive)])
                        .range([h, 0]);

        // let line = d3.line()
        //             .x(function(d) {
        //                 return xScale(d.death);
        //             })
        //             .y(function(d) {
        //                 return yScale(d.positive)
        //             })
        //             .curve(d3.curveMonotoneX);

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

        let res = sumstat.map(function(d){ return d.key }) // list of group names
        let color = d3.scaleOrdinal()
              .domain(res)
              .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

        svg.selectAll(".line")
            .data(sumstat)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                            .x(function(d) { return x(d.year); })
                            .y(function(d) { return y(+d.n); })
                            (d.values)
                });

        // svg.append("path")
        //     .datum(data)
        //     .attr("id", "line-chart")
        //     .attr("class", "line")
        //     .attr("d", line);
    }

}

