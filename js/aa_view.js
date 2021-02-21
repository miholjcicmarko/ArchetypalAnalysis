// class PlotData {
//     constructor (value, variable) {
//         this.value = value;
//         this.variable = variable;
//     }
// }

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
                            - this.margin.bottom - this.margin.bottom);
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
            }
            
        });

    let data_circ = d3.selectAll("#oned").selectAll("circle");

    that.tooltip(data_circ);

    that.drawVariables();

    let submit = d3.select("#submit");
        submit.on("click", function(d,i) {
            that.makeBarCharts(this.chosenVars, this.raw);
        });

    }

    drawVariables () {

        for (let i = 0; i < this.variables.length; i++) {
            let button = d3.select('#bar1')
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

    makeBarCharts () {



    }

}

