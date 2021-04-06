class imageAnalysis {

    constructor(data, numArch, updateArch, customImplement, imageData) {

        //write time series part

        d3.select("#customImplement").style("opacity", 0);
        document.getElementById("customImplement").style.zIndex = "-2";
        d3.select("#Introduction").style("opacity", 0);
        document.getElementById("Introduction").style.zIndex = "-1";
        d3.select("#header-wrap").style("opacity", 1);
        d3.select(".topnav").style("opacity", 1);
        d3.select("#brushButton").style("opacity", "1");

        this.XC = data.XC;
        this.S = data.S;
        this.raw = data.raw; 
        //this.variables = Object.keys(this.raw[0]);
        this.updateArch = updateArch;
        this.timeline = data.time_data;
        this.customImplement = customImplement;
        this.count = 0;
        this.brushOn = false;
        this.brushedData = [];
        this.imageData = imageData;

        this.filteredData = [];
        //this.chosenVars = ["id"];
        this.chosenIDs = [];
        //this.chosenLineVar = ["id"];
        //this.timelineActive = false;
        //this.dateSelected = false;
        //this.date = null;

        //let parseTime = d3.timeParse("%Y-%m-%d");

        //if (this.timeline === true) {
        //     let dates = [...this.raw];
        //     let date1 = dates[0]["date"];
        //     let date2 = dates[dates.length - 1]["date"];
        //     let date1D = 0;
        //     let date2D = 0;

        //     if (typeof date1 !== "object" && typeof date2 !== 'object') {
        //         date1D = parseTime(date1);
        //         date2D = parseTime(date2);
        //     }

        //     if (date2D <= date1D || date2 <= date1) {
        //         d3.select("#dateInput").style("opacity", 1);
        //         document.getElementById("dateInput").value = date2;
        //         document.getElementById("dateInput").min = date2;
        //         document.getElementById("dateInput").max = date1;
        //         this.date = date2D;
        //     }
        //     else if (date2D > date1D || date2 > date1) {
        //         d3.select("dateInput").style("opacity", 0);
        //         document.getElementById("dateInput").value = date1;
        //         document.getElementById("dateInput").min = date1;
        //         document.getElementById("dateInput").max = date2;
        //         this.date = date1D;
        //     }

        // }

        if (this.customImplement === true) {
            this.S = math.matrix(this.S);
            this.XC = math.matrix(this.XC);
        }

        this.color = d3.scaleOrdinal()
                .range(["#e41a1c","#984ea3","#ff7f00","#999999","#f781bf"]);

        let newS = [];

        for (let i = 0; i < this.S._data[0].length; i++) {
            let newObj = {};
            for (let k = 0; k < this.S._data.length; k++) {
                newObj[""+k] = this.S._data[k][i];
            }
            newObj["id"] = this.raw[i].id;
            newS.push(newObj);
        }

        this.S = newS;
        this.numberOfArchetypes = parseInt(numArch, 10);
        this.drawCircleChart(this.numberOfArchetypes);
        let selectNowButton = document.getElementById('selectNow')
                        while (selectNowButton.firstChild) {
                            selectNowButton.removeChild(selectNowButton.firstChild);
                        }

        let dropdownMenu = d3.select('#selectNow');

        let numberOfArchetypes_array = [];

        for (let i = 0; i < this.numberOfArchetypes; i++) {
            let number = i+1;
            numberOfArchetypes_array.push(number);
        }

        dropdownMenu.selectAll('option')
                    .data(numberOfArchetypes_array)
                    .enter().append("option")
                    .attr("value", function (d) { return d; })
                    .text(function (d) {
                        return d; 
                    });

        document.getElementById('selectNow').selectedIndex=this.numberOfArchetypes - 1;

        let that = this;

        //let dInput = d3.select("#dateInput");
        //    dInput.on("keyup", function () {
        //        that.dateSelected = true;
        //        let parseTime = d3.timeParse("%Y-%m-%d");
        //        that.date = parseTime(this.value);
        //    });

        // let dateSubmit = d3.select("#dateSubmit");
        //     dateSubmit.on("click", function () {
        //         if (that.brushOn === true) {

        //         }
        //         else if (that.brushOn = false) {
        //             that.makeBarCharts(that.chosenVars, that.raw, that.timeline);
        //         }
        //     })

        let dropdown = d3.select("#selectNow");

            dropdown.on("change", function () {
                // if (that.customImplement === false) {

                //     let number = this.value;

                //     let div = document.getElementById("oned")
                //     while (div.firstChild) {
                //         div.removeChild(div.firstChild);
                //     }

                //     let divBar = document.getElementById("bar1")
                //     while (divBar.firstChild) {
                //         divBar.removeChild(divBar.firstChild);
                //     }

                //     let divTimeLine = document.getElementById("timeL");
                //     while (divTimeLine.firstChild) {
                //         divTimeLine.removeChild(divTimeLine.firstChild);
                //     }

                //     let divTimeButtons = document.getElementById("timeLButtons");
                //     while (divTimeButtons.firstChild) {
                //         divTimeButtons.removeChild(divTimeButtons.firstChild);
                //     }
                
                //     that.updateArch(number, "same");
                // }
                //else if (that.customImplement === true) {
                    alert("This feature is not available for Custom Implementations");
                    document.getElementById('selectNow').selectedIndex = that.numberOfArchetypes - 1;
                //}
            });

        let resetButton = d3.select("#reset");

            resetButton.on("click", function () {
                that.resetViz();
            });

        // if (this.timeline === true) {
        //     this.drawTimeLine(this.raw, this.variables[2]);
        // }

        // let selectRegion = d3.select("#brushButton");

        // selectRegion.on("click", function () {
        //     if (that.brushOn === false) {
        //         that.drawBrush();
        //         that.drawIds();
        //     }
        //     else if (that.brushOn === true) {
        //         that.removeBrush();   
        //         d3.selectAll(".brushDataTemp").remove();
        //         that.drawIds();
        //     }
        // });
    }

    drawCircleChart (numberOfArchetypes) {

        this.numberOfArchetypes = numberOfArchetypes;

        this.margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let width = 450 - this.margin.right - this.margin.left;
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
            let point = new PlotData(this.S[p][i],this.S[p].id); 
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
                this.onSearch(searchVal,this.dataS, this.numberOfArchetypes, false);
                that.variable_name = searchVal;
                that.chosenIDs.push(searchVal);
                that.drawIds();
            }
            
        });

        let data_circ = d3.selectAll("#oned").selectAll("circle");

        this.tooltip(data_circ);

    }

}