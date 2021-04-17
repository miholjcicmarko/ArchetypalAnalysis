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
        document.getElementById("submit").innerHTML = 'Image Analysis';

        this.XC = data.XC;
        this.S = data.S;
        this.raw = data.raw; 
        //this.variables = Object.keys(this.raw[0]);
        this.updateArch = updateArch;
        this.timeline = data.time_data;
        this.customImplement = customImplement;
        this.brushOn = false;
        this.brushedData = [];
        this.imageData = imageData;
        this.count = 0;

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

        this.color = d3.scaleOrdinal(d3.schemeTableau10)
                .domain([0,4])
                //.range(["blue","orange","pink","red","purple"]);

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

        selectRegion.on("click", function () {
            that.origVar = that.chosenVars;
            if (that.brushOn === false) {
                //if (that.chosenVars.length > 1) {
                    that.drawBrush();
                    that.drawIds();
                    document.getElementById("submit").innerHTML = 'Drag and Select ID Points';
                //}
            }
            else if (that.brushOn === true) {
                document.getElementById("submit").innerHTML = 'Image Analysis';
                that.removeBrush();   
                d3.selectAll(".brushDataTemp").remove();
                that.chosenIDs = that.origId;
                that.chosenVars = that.origVar;
                //if (that.chosenIDs.length === 0) {
                    //alert("Select ID/IDs");
                    let divBar = document.getElementById("bar1")
                        while (divBar.firstChild) {
                            divBar.removeChild(divBar.firstChild);
                        }

                    let diviDs = document.getElementById("iDs")
                        while (diviDs.firstChild) {
                            diviDs.removeChild(diviDs.firstChild);
                        }
                    
                //}
                //else if (that.chosenIDs.length > 0) {
                    //that.makeBarCharts(that.chosenVars, that.raw, that.timeline);
                    //that.drawTimeLine(that.raw, that.chosenLineVar);
                    that.drawIds();
                //}
            }
        });
    }

    drawBrush() {
        let selectedRegion = d3.select("#brushButton");
            selectedRegion.style("background-color", "steelblue");

        let numberOfArchetypes = this.numberOfArchetypes;

        this.margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let width = 450 - this.margin.right - this.margin.left;
        let height = 350 - this.margin.bottom - this.margin.top;

        this.max_brush_width = width;
        let height_1d = 0;
        for (let i = 0; i < this.numberOfArchetypes; i++) {
            let g = d3.select('#oned').select("#label"+i)
                        .append('g').classed('brushes', true)
                        .attr("id", "brush"+i);
                    
            if (numberOfArchetypes >= 5) {
                g.attr("height", (height / numberOfArchetypes));
                height_1d = (height / numberOfArchetypes)
            }
            else if (numberOfArchetypes === 4) {
                g.attr("height", (height / numberOfArchetypes) - this.margin.top
                                - this.margin.bottom);
                height_1d = (height / numberOfArchetypes) - this.margin.top 
                - this.margin.bottom;
            }
            else {
                g.attr("height", (height / numberOfArchetypes) - this.margin.top
                                - this.margin.bottom);
                height_1d = (height / numberOfArchetypes) - this.margin.top
                - this.margin.bottom
            }
    
            g.attr("transform", 'translate(0,'+(25)+')');
        }
    
        let svg = d3.select('#oned');
    
        let brush_chart = d3.selectAll('.brushes');
    
        let brush_width = this.xScale(this.max_brush_width);
        let brush_height = height_1d;
        
        this.brush(svg, brush_chart, brush_width, brush_height);
    }

    brush(svg, brush_chart, brush_width, brush_height) {
        d3.selectAll(".tempLine").remove();
        
        this.brushOn = true;
        let that = this;
        let activeBrush = null;
        let activeBrushNode = null;
        //if (that.barsOn === true) {
        that.origVar = that.chosenVars;
        that.origId = that.chosenIDs;
        //}

        brush_chart.each(function() {
            let selectionThis = this;
            let layer = selectionThis.id;
            layer = layer.substr(layer.length-1);
            let brushData = [...that.dataS];
            brushData = brushData[layer];

            let selection = d3.select(selectionThis);

            let brush = d3.brushX().extent([[0,0], [brush_width, brush_height]]);

            brush
                .on('start', function() {
                    if (activeBrush && selection !== activeBrushNode) {
                        activeBrushNode.call(activeBrush.move, null);
                    }
                    activeBrush = brush;

                    activeBrushNode = selection;
                   
                });
            brush
                .on('brush', function () {
                    
                    let brushSelection = d3.brushSelection(selectionThis);

                    let selectedData = [];
                    if (brushSelection) {

                        let [x1,x2] = brushSelection;
                        
                        let selectionData = brushData.filter(d => d.value >= that.xScale.invert(x1) &&
                                                    d.value <= that.xScale.invert(x2));   
                            
                        svg.selectAll("circle").classed("notbrushed", true);

                        that.createTempCircleBrush(selectionData);
                        
                        that.brushedData = selectionData;

                        that.chosenIDs = [];

                        for (let i = 0; i < that.brushedData.length; i++) {
                            let id = that.brushedData[i].variable_name;
                            that.chosenIDs.push(id);
                        }
                        that.chosenIDs = [... new Set(that.chosenIDs)];
                        that.drawIds();

                        if (that.timeline === true) {
                            that.createTempLine(selectionData, true);
                        }

                        that.makeBrushedBarCharts(that.chosenVars, that.raw, that.brushedData, that.timeline);
                    }
                });
            brush   
                .on('end', function() {
                    
                    let brushSelection = d3.brushSelection(selectionThis);
                    if(!brushSelection){
                        svg.selectAll("circle").classed("notbrushed",false);
                        return;
                    }
                 
                    if (brushSelection !== null) {
                        let [x1,x2] = brushSelection;
                        
                        let selectionData = brushData.filter(d => d.value >= that.xScale.invert(x1) &&
                                                d.value <= that.xScale.invert(x2));

                        svg.selectAll("circle").classed("notbrushed", true);

                        that.createTempCircleBrush(selectionData);

                        if (that.timeline === true) {
                            that.createTempLine(selectionData, true);
                        }

                        that.brushedData = selectionData;

                        that.chosenIDs = [];

                        for (let i = 0; i < that.brushedData.length; i++) {
                            let id = that.brushedData[i].variable_name;
                            that.chosenIDs.push(id);
                        }
                        that.chosenIDs = [... new Set(that.chosenIDs)];
                        that.drawIds();

                        that.makeBrushedBarCharts(that.chosenVars, that.raw, that.brushedData, that.timeline);
                    }
                    
                });
            selection.call(brush);
        });
    }

    removeBrush () {
        let svg = d3.select('#oned');

        svg.selectAll("circle").classed("notbrushed", false);

        this.brushOn = false;
        let selectedRegion = d3.select("#brushButton");
            selectedRegion.style("background-color", "thistle");

        d3.selectAll('.brushes').remove();
    }

    drawCircleChart (numberOfArchetypes) {
        this.numberOfArchetypes = numberOfArchetypes;

        this.margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let width = 450 - this.margin.right - this.margin.left;
        let height = 5000 - this.margin.bottom - this.margin.top;

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
            
            if (numberOfArchetypes >= 95) {
            oneD.attr("height", (height / numberOfArchetypes));
            }
            else if (numberOfArchetypes >= 85) {
                 oneD.attr("height", (height / numberOfArchetypes) - this.margin.top);
            }
            else if (numberOfArchetypes >= 75) {
                oneD.attr("height", (height / numberOfArchetypes) - this.margin.top
                        - this.margin.bottom);
            }
            else if (numberOfArchetypes >= 65) {
                oneD.attr("height", (height / numberOfArchetypes) - 2*this.margin.top
                        - this.margin.bottom);
            }
            else if (numberOfArchetypes >= 55) {
                oneD.attr("height", (height / numberOfArchetypes) - 2*this.margin.top
                        - 2*this.margin.bottom);
            }
            else if (numberOfArchetypes >= 45) {
                oneD.attr("height", (height / numberOfArchetypes) - 3*this.margin.top
                        - this.margin.bottom);
            }
            else if (numberOfArchetypes >= 35) {
                oneD.attr("height", (height / numberOfArchetypes) - 5*this.margin.top
                        - 3*this.margin.bottom);
            }
            else if (numberOfArchetypes >= 25) {
                oneD.attr("height", (height / numberOfArchetypes) - 10*this.margin.top
                        - 4*this.margin.bottom);
            }
            else if (numberOfArchetypes >= 15) {
                oneD.attr("height", (height / numberOfArchetypes) - 14*this.margin.top
                        - 14*this.margin.bottom);
            }
            else if (numberOfArchetypes >= 10) {
                oneD.attr("height", (height / numberOfArchetypes) - 24*this.margin.top
                        - 20*this.margin.bottom);
            }
            else if (numberOfArchetypes >= 5) {
                oneD.attr("height", (height / numberOfArchetypes) - 48*this.margin.top
                        - 42*this.margin.bottom);
            } 
            else {
                oneD.attr("height", (height / numberOfArchetypes) - 150*this.margin.top
                        - 6*this.margin.bottom);
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

            //if (numberOfArchetypes >= 6) {
                oneD.style("font-size", "7px");
                xaxis.style("font-size", "5px");
            //}
            // else if (numberOfArchetypes < 6 && numberOfArchetypes >= 5) {
            //     oneD.style("font-size", "10px");
            //     xaxis.style("font-size", "8px");
            // }
            // else if (numberOfArchetypes <= 4) {
            //     oneD.style("font-size", "13px");
            //     xaxis.style("font-size", "10px");
            //}

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
                //if (numberOfArchetypes <= 3) {
                    return 45;
                //}
                // else if (numberOfArchetypes == 4) {
                //     return 42;
                // }
                // else {
                //     return 45 - margin_top;
                // }
            })
            .attr("r", function() {
                // if (numberOfArchetypes >= 5) {
                //     return 3;
                // }
                // else if (numberOfArchetypes === 4) {
                //     return 5;
                // }
                //else {
                    return 7;
                //}
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
                //that.variable_name = searchVal;
                that.chosenIDs.push(searchVal);
                that.displayImages(this, true);
                //that.drawIds();
            }
            
        });

    //that.drawVariables();

    // let submit = d3.select("#submit");
    //     submit.on("click", function(d,i) {
    //         if (that.brushOn === false) {
    //             that.makeBarCharts(that.chosenVars, that.raw, that.timeline);
    //             that.drawIds();
    //         }
    //         else if (that.brushOn === true) {
    //             that.makeBrushedBarCharts(that.chosenVars, that.raw, that.brushedData, that.timeline);
    //             that.drawIds();
    //         }
    //     });

    let data_circ = d3.selectAll("#oned").selectAll("circle");

    this.tooltip(data_circ);
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
            that.createTempCircle(this);
            that.displayImages(this, false);
        });

        onscreenData.on("mouseout", function(d,i) {
            d3.select(this).classed("hovered",false);
            d3.selectAll(".tempCircle").remove();
            d3.selectAll(".imgdiv").remove();
        })

        onscreenData.on("click", function(d,i) {
            this.id = this.id.toLowerCase();
            that.variable_name = this.id.toLowerCase();
            that.chosenIDs.push(this.id.toLowerCase());
            that.displayImages(this, true);
            that.onSearch(this,that.dataS, that.numberOfArchetypes, true);
            that.drawIds();
        })

        tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    }

    onSearch(searchVal, data, numberOfArch, isTooltip) {
        let value = searchVal;
        if (isTooltip === true) {
            value = value.id
        }
        // if (this.chosenIDs.length > 4 && ((this.chosenIDs.includes(value) !== true) ||
        // !this.chosenIDs.includes(searchVal.id))) {
        //     alert("Too many IDs chosen!");
        // }
        //else if ((this.chosenIDs.includes(value) === true)){
        //    let index = this.chosenIDs.indexOf(value);
        //    this.chosenIDs = this.chosenIDs.splice(index,1);

        //    d3.selectAll(".tooltipCircle"+this.count).remove();
            // is tooltip
            //then remove the highlight from chosenID list and visually
        //}

            for (let i = 0; i < numberOfArch; i++) {

                if (isTooltip === false) {
                    this.filteredData = data[i].filter(d => d.variable_name.toLowerCase().includes(searchVal));
                }
                else if (isTooltip === true) {
                    let toolData = searchVal.id;
                    toolData = toolData.toLowerCase();
                    this.filteredData = data[i].filter(d => d.variable_name.toLowerCase().includes(toolData));
                }
            
                let point = new PlotData(this.filteredData[0].value,this.filteredData[0].variable_name); 

                let circles = d3.select('#circle' + i);

                let circleScale = this.xScale;

                let margin_top = this.margin.top;

                let that = this;
            
                circles.append("circle")
                .attr("cx", circleScale(point.value))
                .attr("cy", function() {
                        return 45;
                })
                .attr("r", function() {
                        return 7;
                })
                .classed("selectedCircle", true)
                .attr("fill", function () {
                    let index = that.chosenIDs.length - 1;
                    return that.color(index);
                })
                .attr("stroke", function () {
                    let index = that.chosenIDs.length - 1;
                    return that.color(index);
                })
                .attr("id", function(d) {
                    return point.variable_name + "";
                })
                .classed("tooltipCircle"+that.count, true);
            }
        let data_circ = d3.selectAll("#oned").selectAll("circle");

        this.tooltip(data_circ);
    }

    displayImages (circleData, clicked) {
        if (clicked === true) {
            this.count = this.count + 1;
        }

        let selectedFile = circleData.id;

        let width = 250 - this.margin.right - this.margin.left;
        let height = 250 - this.margin.top - this.margin.bottom;

        let target = "0";

        for (let i = 0; i < this.raw.length; i++) {
            if (selectedFile.toLowerCase() === this.raw[i].id.toLowerCase()) {
                target = this.raw[i];
            }
        }

        let targetName = target.id.split("/");

        targetName = targetName[targetName.length - 1];

        let fileName; 

        for (let i = 0; i < this.imageData.length; i++) {
            if (targetName.toLowerCase() === this.imageData[i].name.toLowerCase()) {
                fileName = this.imageData[i];
            }
        }

        if (fileName) {
            let that = this;

            d3.select("#bar1")
                .append("img")
                .classed("imgdiv", function() {
                    if (clicked !== true) {
                        return true;
                    }
                    else  {
                        return false;
                    }
                })
                .attr("id", function () {
                    if (clicked !== true) {
                        return "selectedImg" + that.count + "tooltip"
                    } 
                    else {
                        return "selectedImg" + that.count
                    }
                })
                .attr("src", "#")
                .attr("width", width)
                .attr("height", height);

            let reader = new FileReader();

            reader.onload = function (e) {
                if (clicked === true) {
                    d3.select("#selectedImg" + that.count)
                    .style("border-color", function() {
                        let id = document.getElementById('selectedImg'+ that.count);

                        if (id.className === "imgdiv") {
                            return "rgb(71, 105, 1)";
                        }
                        else if (id.className !== "imgdiv") {
                            return that.color(that.chosenIDs.length - 1);
                        }})
                    .attr("src", e.target.result);
                }
                else if (clicked === false) {
                    d3.select("#selectedImg" + that.count + "tooltip")
                    .style("border-color", function() {
                        let id = document.getElementById('selectedImg'+ that.count + "tooltip");

                        if (id.className === "imgdiv") {
                            return "rgb(71, 105, 1)";
                        }
                        else if (id.className !== "imgdiv") {
                            return that.color(that.chosenIDs.length - 1);
                        }})
                    .attr("src", e.target.result);
                }
            }

            reader.readAsDataURL(fileName);

        }

    }

    tooltipRender(data) {
        let text = data.currentTarget.id;
        let text_arr = text.split("/");
        text = text_arr[text_arr.length -1];
        return text;
    }

    createTempCircle (item) {
        
        for (let i = 0; i < this.numberOfArchetypes; i++) {
            let numberOfArch = this.numberOfArchetypes;
            let name = item.id.toLowerCase();
            let filteredData = this.dataS[i].filter(d => d.variable_name.toLowerCase().includes(name));
            
            let point = new PlotData(filteredData[0].value,filteredData[0].variable_name);

            let circle = d3.select("#circle" + i);

            let circleScale = this.xScale;

            let margin_top = this.margin.top;   

            let layer = item.viewportElement.id;
            let layerlen = layer.length;
            layer = Number(layer[layerlen-1]);

            if (layer !== i) {
            
            circle.append("circle")
            .attr("cx", circleScale(point.value))
            .attr("cy", function() {
                // if (numberOfArch <= 3) {
                    return 45;
                // }
                // else if (numberOfArch == 4) {
                //     return 43;
                // }
                // else {
                //     return 45 - (margin_top);
                // }
            })
            .attr("r", function() {
                // if (numberOfArch >= 5) {
                //     return 3;
                // }
                // else {
                    return 7;
                //}
            })
            .classed("hovered", true)
            .classed("tempCircle", true);
            }
        }
    }

    drawIds () {
        this.selectionActive = true;
        let diviDs = document.getElementById("iDs")
                while (diviDs.firstChild) {
                    diviDs.removeChild(diviDs.firstChild);
                }

        let buttons = d3.select("#iDs")
                        .append("g")
                        .attr("id", "buttoniDs");

        this.chosenIDs = [... new Set(this.chosenIDs)];

        for (let i = 0; i < this.chosenIDs.length; i++) {
                let that = this;

                let button = d3.select('#iDs')
                    .append("button")
                    .attr("class", "idbutton")
                    .classed("idButton", true)
                    .attr("id", "" + this.chosenIDs[i] + "button")
                    .style("margin", "5px")
                    .style("background-color", function() {
                        let index = i;
                        return that.color(index);
                    })      

                document.getElementById("" + this.chosenIDs[i]+ "button").innerHTML = this.chosenIDs[i];
            
        }
    }

    resetViz () {
        if (this.timeline === true) {
            let divTimeL = document.getElementById("timeL")
                while (divTimeL.firstChild) {
                    divTimeL.removeChild(divTimeL.firstChild);
                }

            let divTimeButtons = document.getElementById("timeLButtons")
            while (divTimeButtons.firstChild) {
                divTimeButtons.removeChild(divTimeButtons.firstChild);
            }
            this.date = this.origDate;

            document.getElementById("dateInput").value = this.date;
        }

        this.selectionActive = false;
        this.filteredData = [];
        this.chosenVars = ["id"];
        this.chosenIDs = [];

        let div = document.getElementById("oned")
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }

        let divBar = document.getElementById("bar1")
                while (divBar.firstChild) {
                    divBar.removeChild(divBar.firstChild);
                }

        let diviDs = document.getElementById("iDs")
                while (diviDs.firstChild) {
                    diviDs.removeChild(diviDs.firstChild);
                }

        if (this.brushOn === true) {
            this.brushOn = false;
            this.removeBrush();
        }
        
        this.drawCircleChart(this.numberOfArchetypes);
    }

}