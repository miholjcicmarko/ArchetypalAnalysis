// class PlotData {
//     constructor (value, state) {
//         this.value = value;
//         this.state = state;
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

        let margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let width = 350 - margin.right - margin.left;
        let height = 350 - margin.bottom - margin.top;

        d3.select('#oned')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([10,width-10]);

        let xScale = d3.scaleLinear()
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
                oneD.attr("height", (height / numberOfArchetypes) - margin.top
                            - margin.bottom);
            }
            else {
                oneD.attr("height", (height / numberOfArchetypes) - margin.top
                            - margin.bottom - margin.bottom);
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
            let point = new PlotData(this.S[p][i],this.S[p].state);
            this.dataS[i].push(point);
        }

        let circles = oneD.append("g")
                .attr("id", "circle"+i);

        circles.selectAll("circle")
            .data(this.dataS[i])
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d.value);
            })
            .attr("cy", function() {
                if (numberOfArchetypes <= 4) {
                    return 45;
                }
                else {
                    return 45 - margin.top;
                }
            })
            .attr("r", function() {
                if (numberOfArchetypes >= 5) {
                    return 3;
                }
                else {
                    return 7;
                }
            })
            .classed("circleData", true);
            
    }  
    
    let that = this;

    let searchBar = d3.select("#search-bar");
        searchBar.on("keyup", (e) => {

            let searchVal = searchBar.property("value").toLowerCase();
            if (e.keyCode === 13 || searchVal == "") {
                this.onSearch(searchVal,this.dataS, this.numberOfArchetypes);
            }
            
        });

    let states_circ = d3.selectAll("#oned").selectAll("circle");

    that.tooltip(states_circ);

    that.drawVariables();

    }

    drawVariables () {

        for (let i = 0; i < this.variables.length; i++) {
            let button = d3.select('#bar1')
                .append("button")
                .attr("class", "button")
                .attr("id", "var" + i)
                .style("margin", "5px");

            document.getElementById("var"+ i).innerHTML = this.variables[i];
        }
        
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
        let text = data.currentTarget.__data__.state;
        return text;
    }

    onSearch(searchVal, data) {
        let searchBar = d3.select("#search-bar");
        
        for (let i = 0; i < this.numberOfArchetypes; i++) {
            this.filteredData = data[i].filter(d => d.state.toLowerCase().includes(searchVal));

            let circles = d3.select('#circle' + i);

            circles.append("circle")
                .attr("cx", function(d) {
                    return this.xScale(this.filteredData);
                })
                .attr("cy", function() {
                    if (this.numberOfArchetypes <= 4) {
                        return 45;
                    }
                else {
                    return 45 - margin.top;
                    }
                })
                .attr("r", function() {
                    if (this.numberOfArchetypes >= 5) {
                        return 3;
                    }
                    else {
                        return 7;
                    }
                })
                .classed("hovered", true);

            // circles.selectAll("circle")
            //     .data(this.filteredData)
            //     .enter()
            //     .append("circle")
            //     .attr("cx", function(d) {
            //         return this.xScale(d.value);
            //     })
            //     .attr("cy", function() {
            //         if (this.numberOfArchetypes <= 4) {
            //             return 45;
            //         }
            //     else {
            //         return 45 - margin.top;
            //         }
            //     })
            //     .attr("r", function() {
            //         if (this.numberOfArchetypes >= 5) {
            //             return 3;
            //         }
            //         else {
            //             return 7;
            //         }
            //     })
            //     .classed("hovered", true);

        }


    }

}

