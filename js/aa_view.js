class PlotData {
    constructor (value, variable_name) {
        this.value = value;
        this.variable_name = variable_name;
    }
}

class aa_view {

    constructor(data, numArch, updateArch, customImplement) {

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
        this.variables = Object.keys(this.raw[0]);
        this.updateArch = updateArch;
        this.timeline = data.time_data;
        this.customImplement = customImplement;
        this.count = 0;
        this.brushOn = false;
        this.brushedData = [];

        this.filteredData = [];
        this.chosenVars = ["id"];
        this.chosenIDs = [];
        this.chosenLineVar = ["id"];
        this.timelineActive = false;
        this.dateSelected = false;
        this.date = null;

        let parseTime = d3.timeParse("%Y-%m-%d");

        if (this.timeline === true) {
            let dates = [...this.raw];
            let date1 = dates[0]["date"];
            let date2 = dates[dates.length - 1]["date"];
            let date1D = 0;
            let date2D = 0;

            if (typeof date1 !== "object" && typeof date2 !== 'object') {
                date1D = parseTime(date1);
                date2D = parseTime(date2);
            }

            if (date2D <= date1D || date2 <= date1) {
                d3.select("#dateInput").style("opacity", 1);
                document.getElementById("dateInput").value = date2;
                document.getElementById("dateInput").min = date2;
                document.getElementById("dateInput").max = date1;
                this.date = date2D;
            }
            else if (date2D > date1D || date2 > date1) {
                d3.select("dateInput").style("opacity", 0);
                document.getElementById("dateInput").value = date1;
                document.getElementById("dateInput").min = date1;
                document.getElementById("dateInput").max = date2;
                this.date = date1D;
            }

        }

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
        document.getElementById('selectNow').selectedIndex=this.numberOfArchetypes - 1;

        let that = this;

        let dInput = d3.select("#dateInput");
            dInput.on("keyup", function () {
                that.dateSelected = true;
                let parseTime = d3.timeParse("%Y-%m-%d");
                that.date = parseTime(this.value);
            });

        let dateSubmit = d3.select("#dateSubmit");
            dateSubmit.on("click", function () {
                if (that.brushOn === true) {

                }
                else if (that.brushOn = false) {
                    that.makeBarCharts(that.chosenVars, that.raw, that.timeline);
                }
            })

        let dropdown = d3.select("#selectNow");

            dropdown.on("change", function () {
                if (that.customImplement === false) {

                    let number = this.value;

                    let div = document.getElementById("oned")
                    while (div.firstChild) {
                        div.removeChild(div.firstChild);
                    }

                    let divBar = document.getElementById("bar1")
                    while (divBar.firstChild) {
                        divBar.removeChild(divBar.firstChild);
                    }

                    let divTimeLine = document.getElementById("timeL");
                    while (divTimeLine.firstChild) {
                        divTimeLine.removeChild(divTimeLine.firstChild);
                    }

                    let divTimeButtons = document.getElementById("timeLButtons");
                    while (divTimeButtons.firstChild) {
                        divTimeButtons.removeChild(divTimeButtons.firstChild);
                    }
                
                    that.updateArch(number, "same");
                }
                else if (that.customImplement === true) {
                    alert("This feature is not available for Custom Implementations");
                    document.getElementById('selectNow').selectedIndex = that.numberOfArchetypes - 1;
                }
            });

        let resetButton = d3.select("#reset");

            resetButton.on("click", function () {
                that.resetViz();
            });

        if (this.timeline === true) {
            this.drawTimeLine(this.raw, this.variables[2]);
        }

        let selectRegion = d3.select("#brushButton");

        selectRegion.on("click", function () {
            if (that.brushOn === false) {
                that.drawBrush();
                that.drawIds();
            }
            else if (that.brushOn === true) {
                that.removeBrush();   
                d3.selectAll(".brushDataTemp").remove();
                that.drawIds();
            }
        });
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

    that.drawVariables();

    let submit = d3.select("#submit");
        submit.on("click", function(d,i) {
            if (that.brushOn === false) {
                that.makeBarCharts(that.chosenVars, that.raw, that.timeline);
                that.drawIds();
            }
            else if (that.brushOn === true) {
                that.makeBrushedBarCharts(that.chosenVars, that.raw, that.brushedData, that.timeline);
                that.drawIds();
            }
        });

    let data_circ = d3.selectAll("#oned").selectAll("circle");

    this.tooltip(data_circ);

    }

    drawBrush() {
        let selectedRegion = d3.select("#brushButton");
            selectedRegion.style("background-color", "steelblue");
        // creates the brushes
    //if (this.timeline === true) {

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
    //    }
    }

    brush(svg, brush_chart, brush_width, brush_height) {
        this.brushOn = true;
        let that = this;
        let activeBrush = null;
        let activeBrushNode = null;

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
                        if (that.timeline === true) {
                            that.createTempLine(selectionData, true);
                        }
                        
                        that.brushedData = selectionData;

                        for (let i = 0; i < that.brushedData.length; i++) {
                            let id = that.brushedData[i].variable_name;
                            that.chosenIDs.push(id);
                        }
                        that.chosenIDs = [... new Set(that.chosenIDs)];
                        that.drawIds();
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

                        for (let i = 0; i < that.brushedData.length; i++) {
                            let id = that.brushedData[i].variable_name;
                            that.chosenIDs.push(id);
                        }
                        that.chosenIDs = [... new Set(that.chosenIDs)];
                        that.drawIds();
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
        that.drawIds();
    }

    drawVariables () {

        if (this.timeline === true) {
            let buttons2 = d3.select("#timeLButtons")
                         .append("g")
                         .attr("id", "buttonGroupLine");

            for (let i = 1; i < this.variables.length; i++) {
                if (this.variables[i] !== "date") {

                    let button = d3.select('#buttonGroupLine')
                                .append("button")
                                .attr("class", "button")
                                .attr("id", "" + this.variables[i] + "line")
                                .style("margin", "5px");

                    document.getElementById("" + this.variables[i] + "line").innerHTML = this.variables[i];
                }
                let that = this;

                let buttonsLine = d3.select('#timeLButtons').selectAll("button");

                buttonsLine.on("click", function (d) {
                    let elem_id = d.srcElement.id;
                    let chosenLineId = elem_id.slice(0, elem_id.length - 4);
                    if (that.chosenLineVar[0] !== chosenLineId) {
                        let buttonsColor = d3.select("#timeLButtons").selectAll("button");
                        buttonsColor.classed("pressedLineVar", false);
                        that.changeTimeLineVarColor(d);
                        that.chosenLineVar[0] = chosenLineId;
                        that.timelineActive = true;
                        that.drawTimeLine(that.raw, that.chosenLineVar);
                        d3.select("#timeL").style("opacity", 1);
                    }
                })
            }
        }

        let buttons = d3.select("#bar1")
                        .append("g")
                        .attr("id", "buttonGroup");

        for (let i = 1; i < this.variables.length; i++) {
            if (this.variables[i] !== "date") {

                let button = d3.select('#buttonGroup')
                    .append("button")
                    .attr("class", "button")
                    .attr("id", "" + this.variables[i])
                    .style("margin", "5px");       

                document.getElementById("" + this.variables[i]).innerHTML = this.variables[i];
            }
            let that = this;

            let buttons = d3.select('#bar1').selectAll("button");

            buttons.on("click", function (d) {
                that.addChosenVar(d);
                that.chosenVars.push(d.srcElement.id);
            })
        }
    }

    addChosenVar (event) {
        let id = event.srcElement.id;

        let button = d3.select("#" + id)
                        .classed("pressed", true);
    }

    drawIds () {
        d3.select("#iDs").selectAll(".idButton").remove();

        let buttons = d3.select("#iDs")
                        .append("g")
                        .attr("id", "buttoniDs");

        this.chosenIDs = [... new Set(this.chosenIDs)];

        for (let i = 0; i < this.chosenIDs.length; i++) {

                let button = d3.select('#buttonGroup')
                    .append("button")
                    .attr("class", "idbutton")
                    .classed("idButton", true)
                    .attr("id", "" + this.chosenIDs[i] + "button")
                    .style("margin", "5px");       

                document.getElementById("" + this.chosenIDs[i]+ "button").innerHTML = this.chosenIDs[i];
            
            // let that = this;

            // let buttons = d3.select('#bar1').selectAll("button");

            // buttons.on("click", function (d) {
            //     that.addChosenVar(d);
            //     that.chosenVars.push(d.srcElement.id);
            // })
        }
    }

    changeTimeLineVarColor (event) {
        let id = event.srcElement.id;

        let timeVar = d3.select("#" + id)
                        .classed("pressedLineVar", true);
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

            if (this.localName !== "path") {
                d3.select(this).classed("hovered", true);
                that.createTempCircle(this);
                if (that.timeline === true) {
                    that.createTempLine(this);
                }
            }
            else if (this.localName === "path") {
                if (that.timeline === true) {
                    d3.select(this).classed("timeLine", false);
                    d3.select(this).classed("hoveredLine", true);
                }
                that.createTempCircle(this);
            }

        });

        onscreenData.on("mouseout", function(d,i) {
            if (this.localName !== "path") {
                d3.select(this).classed("hovered",false);
                d3.selectAll(".tempCircle").remove();
                if (that.timeline === true) {
                    d3.select(".tempLine").remove();
                }
            }
            else if (this.localName === "path") {
                if (that.timeline === true) {
                    
                    d3.select(this).classed("timeLine", true);
                    // if (that.brushOn === true) {
                    //     d3.select(this).classed("brushedLine", true);
                    // }
                    d3.select(this).classed("hoveredLine", false);
                }
                for (let i = 0; i < that.numberOfArchetypes; i++) {
                    let circle = d3.select("#circle" + i);
                    d3.selectAll(".tempCircle").remove();
                }
            }

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

        onscreenData.on("click", function(d,i) {
            this.id = this.id.toLowerCase();
            that.onSearch(this,that.dataS, that.numberOfArchetypes, true);
            that.variable_name = this.id.toLowerCase();
            that.chosenIDs.push(this.id.toLowerCase());
            that.drawIds();
        })

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
            .classed("hovered", true)
            .classed("tempCircle", true);
            }
        }
    }

    createTempLine (item, brushed) {
        d3.selectAll("#timeL").selectAll(".tempLineBrush").remove();
        let objarray = this.lineData;
        let line = this.line;
        let itemArray = null;

        if (brushed === undefined) {
            itemArray = objarray.filter(key => key.id.toLowerCase() === item.id.toLowerCase());
        }
        else if (brushed === true) {
            let array = []
            for (let i = 0; i < objarray.length; i++) {
                for (let j = 0; j < item.length; j++) {
                    if (objarray[i].id.toLowerCase() === item[j].variable_name.toLowerCase()) {
                        array.push(objarray[i]);
                    }
                }
            }
            itemArray = array;
        }

        let svg = d3.select("#svg-time");

        if (brushed === undefined) {

        let lines = svg.selectAll("lines")
                    .data(itemArray)
                    .enter()
                    .append("g")
                    .attr("transform", "translate(" + 60 + "," + 0 + ")");

        lines.append("path")
             .attr("d", function (d) { return line(d.values)})
             .classed("hoveredLine", true)
             .classed("tempLine", true)
             .attr("id", function(d) {
                return d.id;
             }); 

        }
        else if (brushed === true) {

                let lines = svg.selectAll("lines")
                    .data(itemArray)
                    .enter()
                    .append("g")
                    .attr("transform", "translate(" + 60 + "," + 0 + ")");

                lines.append("path")
                     .attr("d", function (d) { return line(d.values)})
                     .attr("stroke", "steelblue")
                     .attr("stroke-width", 2.5)
                     .classed("tempLineBrush", true)
                     .attr("id", function(d) {
                        return d.id;
                     });  
              
                let data_line = d3.selectAll("#timeL").selectAll(".tempLineBrush");

                this.tooltip(data_line);
        }

    }

    createTempCircleBrush (brushed) {
        d3.selectAll(".brushDataTemp").remove();

        let numberOfArchetypes = this.numberOfArchetypes;

        for (let i = 0; i < this.numberOfArchetypes; i++) {
            let numberOfArch = this.numberOfArchetypes;
            let names = [];
            for (let j = 0; j < brushed.length; j++) {
                let name = brushed[j].variable_name.toLowerCase();
                names.push(name);
            }
            let filteredData = [];

            for (let k = 0; k < this.dataS[i].length; k++) {
                let name = this.dataS[i][k].variable_name.toLowerCase();
                if (names.includes(name)) {
                    filteredData.push(this.dataS[i][k]);
                }
            }

            let circle = d3.select("#circle" + i);

            let circleScale = this.xScale;

            let margin_top = this.margin.top;   

            for (let i = 0; i < filteredData.length; i++) {

            circle.append("circle")
            .attr("cx", function(d) {
                return circleScale(filteredData[i].value);
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
            .attr("fill", "steelblue")
            .classed("brushDataTemp", true)
            .attr("id", function(d) {
                return filteredData[i].variable_name;
            }); 
        }
        }
    }

    tooltipRender(data) {
        let text = data.currentTarget.id;
        return text;
    }

    onSearch(searchVal, data, numberOfArch, isTooltip) {
        let value = searchVal;
        if (isTooltip === true) {
            value = value.id
        }
        if (this.chosenIDs.length > 4 && ((this.chosenIDs.includes(value) !== true) ||
        !this.chosenIDs.includes(searchVal.id))) {
            alert("Too many IDs chosen!");
        }
        //else if ((this.chosenIDs.includes(value) === true)){
        //    let index = this.chosenIDs.indexOf(value);
        //    this.chosenIDs = this.chosenIDs.splice(index,1);

        //    d3.selectAll(".tooltipCircle"+this.count).remove();
            // is tooltip
            //then remove the highlight from chosenID list and visually
        //}
        else {
            this.count = this.count + 1;

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
                .classed("selectedCircle", true)
                .attr("fill", function () {
                    let index = that.chosenIDs.length;
                    return that.color(index-1);
                })
                .attr("stroke", function () {
                    let index = that.chosenIDs.length;
                    return that.color(index-1);
                })
                .attr("id", function(d) {
                    return point.variable_name + "";
                })
                .classed("tooltipCircle"+that.count, true);
            }

            if (this.timeline === true) {

                let objarray = this.lineData;
                let line = this.line;
        
                let itemArray = objarray.filter(key => key.id.toLowerCase() === value);
        
                let svg = d3.select("#svg-time");
        
                let lines = svg.selectAll("lines")
                            .data(itemArray)
                            .enter()
                            .append("g")
                            .attr("transform", "translate(" + 60 + "," + 0 + ")");

                let that = this;
        
                lines.append("path")
                     .attr("d", function(d) { return line(d.values)})
                     .classed("timeLine", false)
                     .attr("stroke", function () {
                        let index = that.chosenIDs.length;
                        return that.color(index-1);
                     })
                     .attr("stroke-width", 3)
                     .attr("id", function(d) {
                        return "selectedLine"+value;
                     });
            }
        }
        let data_circ = d3.selectAll("#oned").selectAll("circle");

        this.tooltip(data_circ);
    }

    makeBarCharts (chosenVariables, rawData, timeSeries) {
        let divBar = document.getElementById("bar1")
                while (divBar.firstChild) {
                    divBar.removeChild(divBar.firstChild);
                }
        
        let data = [...rawData];
        
        if (timeSeries === true) {
            let filteredDateData = [];

            if ((typeof data[0]["date"]) !== "object") {
                let parseTime = d3.timeParse("%Y-%m-%d");
    
                data.forEach(function(d) {
                    d.date = parseTime(d.date);
                });
            }

            for (let i = 0; i < data.length; i++) {
                if (+data[i].date == +this.date) {
                    filteredDateData.push(data[i]);
                }
            }
            data = filteredDateData;
        }

        chosenVariables = [...new Set(chosenVariables)];

        d3.select('#bar1')
            .append('div')
            .attr("id", "bartip")
            .attr("class", "tooltip")
            .style("opacity", 0);

        let numberOfArch = this.numberOfArchetypes;

        d3.select("#buttonGroup").remove();

        let margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let w = 500 - margin.right - margin.left;
        let h = 350 - margin.bottom - margin.top;
        let barpadding = 70;

        let svg = d3.select("#bar1")
                            .append("svg")
                            .attr("id", "bars")
                            .attr("width", w + margin.right + margin.left)
                            .attr("height", h + margin.top + margin.bottom);

        let filteredData = this.filterObjsInArr(data, chosenVariables);

        //let specificData = filteredData.filter(d => d.id.toLowerCase().includes(this.variable_name)); 


        // let specificData = [];

        // for (let k = 0; k < this.chosenIDs.length; k++) {
        //     let filter = filteredData.filter(d => d.id.toLowerCase().includes(this.chosenIDs[k])); 
        //     specificData.push({filter});
        // }

        // let specificData_arr = [];

        // for (let k = 0; k < this.chosenIDs.length; k++) {
        //     let object = specificData[k]["filter"][0];
        //     specificData_arr.push(object);
        // }

        // let color = d3.scaleOrdinal()
        //         .range(["red", "steelblue", "darkgreen", "redorange", "black"]);

        let rawDataVarSpecific = [];
        let yScales = [];
        let xScales = [];
        // let ydata = [];
        // let ydataChosenVar = [];

        for (let i = 1; i < chosenVariables.length; i++) {
            let arrayofData = [];

            for (let k = 0; k < filteredData.length; k++) {
                let number = parseInt(filteredData[k][""+chosenVariables[i]])
                arrayofData.push(number);
            }
            rawDataVarSpecific.push(arrayofData);

            let arrayRaw = rawDataVarSpecific[i-1];
            
            let yScaleOne = d3.scaleLinear()
                                .domain([0, d3.max(arrayRaw)])
                                .range([h - margin.bottom, margin.top]);
            yScales.push(yScaleOne);

            let xScaleOne = d3.scaleBand()
                          .domain(["" + this.chosenIDs])
                          .range([0,w/(chosenVariables.length-1) - barpadding]);
            xScales.push(xScaleOne);

        //     let one_chart_ydata = [];

        //     for (let k = 0; k < specificData_arr.length; k++) {
        //         let object = {id: specificData_arr[k].id,
        //             chosenVariables[i]: parseInt(specificData_arr[k][""+chosenVariables[i]])
        //         }
        //         one_chart_ydata.push(object);
        //     }

        //     ydata.push(one_chart_ydata);

        //     let yaxis = svg.append("g")
        //                         .attr("id", "y-axis" + i);
                           
        //     yaxis.append("text")
        //         .text(""+chosenVariables[i])
        //         .attr("class", "axis-label")
        //         .attr("text-anchor", "middle")
        //         .attr("transform", "translate(" + (-60+((i-1))) +","+h/2+")rotate(-90)");
                           
        //     yaxis.call(d3.axisLeft(yScales[i-1]).ticks(5))
        //          .attr("transform", "translate(" + ((i-1)*(w/(chosenVariables.length-1))+3*margin.left+10) + ",5)")
        //          .attr("class", "axis_line");
                   
        //     let xaxis = svg.append("g")
        //                     .attr("id", "x-axis")
        //                     .attr("transform", "translate("+ ((i-1)*(w/(chosenVariables.length-1))+(3*margin.left+10))+","+ h+")")
        //                     .call(d3.axisBottom(xScales[i-1]));

        //     for (let k = 1; k < chosenVariables.length; k++) {
        //         let value = {value: parseInt(ydata[0][i][""+chosenVariables[k]])}
        //         ydataChosenVar.push(value);
        //     }
        }

        //let rawDataVarSpecific = [];
        let ydata = [];
        //let yScales = [];
        //let xScales = [];
        
        for (let p = 0; p < this.chosenIDs.length; p++) {
            let specificData = filteredData.filter(d => d.id.toLowerCase().includes(this.chosenIDs[p])); 
            ydata.push(specificData[0]);
        }

        let variables = chosenVariables.slice(1);
        let array_of_variable_objects = [];

        for (let i = 0; i < variables.length; i++) {
            let var_group_key = variables[i];
            let obj = {"var": var_group_key}
            for (let j = 0; j < this.chosenIDs.length; j++) {
                let name = this.chosenIDs[j];
                let value = ydata[j][""+var_group_key];
                obj[""+name] = value;
            }
            array_of_variable_objects.push(obj);
        }

        let var_id = "var";
        let that = this;

        let xlargeScale = d3.scaleBand()
                .domain(array_of_variable_objects.map(d => d[var_id]))
                .range([margin.left, w - margin.right])
                .paddingInner(0.25);

        let xcatsScale = d3.scaleBand()
                .domain(that.chosenIDs)
                .range([0, xlargeScale.bandwidth()]);
                //.padding(0.05);

        // possibly build multiple y axes
        let yScale = d3.scaleLinear()
               .domain([0, d3.max(array_of_variable_objects, d => d3.max(that.chosenIDs, key => d[key]))]).nice()
               .range([h - margin.bottom, margin.top]);

        // Possibly try a for loop

        svg.append("g")
            .selectAll("g")
            .data(array_of_variable_objects)
            .join("g")
            .attr("transform", d => `translate(${xlargeScale(d[var_id])+20},0)`)
            .selectAll("rect")
            .data(d => that.chosenIDs.map(key => ({key, value: d[key]})))
            .join("rect")
            .attr("x", d => xcatsScale(d.key))
            //.attr("y", function(d,i) {
            //    let scale = yScales[i];
            //    return scale(d.value);
            //})
            .attr("y", d => yScale(d.value))
            .attr("width", xcatsScale.bandwidth())
            //.attr("height", function(d,i) {
             //   let scale = yScales[i];
             //   return scale(0) - scale(d.value);
            //})
            .attr("height", d => yScale(0) - yScale(d.value))
            .attr("fill", d => that.color(d.key));
         


        //Kinda
        // for (let p = 0; p < this.chosenIDs.length; p++) {
        //     let specificData = filteredData.filter(d => d.id.toLowerCase().includes(this.chosenIDs[p])); 
        //     ydata.push(specificData[0]);
        // }


        // let barData = [];

        // for (let i = 1; i < chosenVariables.length; i++) {
        //     let barDataOneID = [];
        //     for (let m = 0; m < this.chosenIDs.length; m++) {
        //         let number = ydata[m][0][""+chosenVariables[i]];
        //         barDataOneID.push(number);
        //     }
        //     barData.push(barDataOneID);
            
        //     let arrayofData = [];
        //     for (let k = 0; k < filteredData.length; k++) {
        //         let number = parseInt(filteredData[k][""+chosenVariables[i]])
        //         arrayofData.push(number);
        //     }
        //     rawDataVarSpecific.push(arrayofData);

        //     let x_var = d3.scaleBand()
        //                   .domain(this.chosenIDs.map((d) => d[""+chosenVariables[i]]))
        //                   .range([0,w/(chosenVariables.length-1) - barpadding])
        //                   .padding(0.5);
        //     xScales.push(x_var);

        //     let yScaleOne = d3.scaleLinear()
        //                        .domain([d3.max(arrayofData), 0])
        //                        .range([0, (h-5)]);
        //     yScales.push(yScaleOne);
        // }

        //Meh
            // object = {id: specificData[p].id}

            // for (let i = 0; i < chosenVariables.length; i++) {

            //     if (chosenVariables[i] !== "id") {
            //         object[""+chosenVariables[i]] = parseInt(specificData[p][""+chosenVariables[i]]);   
        
            //         let arrayofData = [];

            //         for (let k = 0; k < filteredData.length; k++) {
            //             let number = parseInt(filteredData[k][""+chosenVariables[i]])
            //             arrayofData.push(number);
            //         }
            //         rawDataVarSpecific.push(arrayofData);
            //     }
            // }
            // ydata.push(object); 
            
        //         let x_lab = [];
        //         let yScale = [];

        //         for (let i = 1; i < chosenVariables.length; i++) {
        //             let x_var = d3.scaleBand()
        //                   .domain(["" + this.variable_name])
        //                   .range([0,w/(chosenVariables.length-1) - barpadding]);
        //             x_lab.push(x_var);

        //             let arrayRaw = rawDataVarSpecific[i-1];

        //             let yScaleOne = d3.scaleLinear()
        //                        .domain([d3.max(arrayRaw), 0])
        //                        .range([0, (h-5)]);
        //             yScale.push(yScaleOne);
        //         }
        // }

        // let that = this;

        // for (let i = 0; i < yScales.length; i++) {
        //     let that = this;

        //     let data = barData[i];

        //     svg.selectAll()
        //         .data(data)
        //         .enter()
        //         .append("g")
        //         .append("rect")
        //         .attr("x", function (d,i) {
        //             return d => xScales(d.id);
        //             //i * (w/(chosenVariables.length));
        //         })
        //         .attr("y", function(d,i) {
        //             let scale = yScales[i];
        //             return scale(d);
        //         })
        //         .attr("width", w/(that.chosenIDs.length) - barpadding)
        //         .attr("height", function(d,i) {
        //             let scale = yScales[i];
        //             return h-scale(d);
        //         })
        //         .attr("fill","orangered")
        //         .attr("transform", "translate(70,0)");
        // }

        
//GOOOD AREA
            for (let i = 0; i < chosenVariables.length; i++) {

                if (chosenVariables[i] !== "id") {
                    let var_id = chosenVariables[i];
                    let displace = xlargeScale(var_id);
                       
                    let yaxis = svg.append("g")
                                .attr("id", "y-axis" + i);

                    yaxis.call(d3.axisLeft(yScale).ticks(5))
                        .attr("transform", "translate(" + (displace+20) + ",0)")
                        //.attr("transform", "translate(" + ((i-1)*(w/(chosenVariables.length-1))+4*margin.left+10) + ",0)")
                        .attr("class", "axis_line");
                    
                    let xaxis = svg.append("g")
                        .attr("id", "x-axis")
                        .attr("transform", "translate("+ (displace+20) +","+ (h - margin.bottom)+")")
                        //.attr("transform", "translate("+ ((i-1)*(w/(chosenVariables.length-1))+(4*margin.left+10))+","+ (h-5)+")")
                        .call(d3.axisBottom(xcatsScale));


                    if (i >= 2) {
                        displace = xcatsScale.bandwidth() * (i-1) - (xcatsScale.bandwidth()/2) - 20;
                    }        
                
                    yaxis.append("text")
                            .text(""+chosenVariables[i])
                            .attr("class", "axis-label")
                            //.attr("text-anchor", "middle")
                            .attr("transform", "translate(" + (displace-35) + "," + h/2+")rotate(-90)");
                            //.attr("transform", "translate(" + (-50+((i-1))) +","+h/2+")rotate(-90)");
                    
                }

            }
            let data_rect = d3.selectAll("#bar1").selectAll("rect");

            if (this.timeline === true) {
                d3.select("#dateSubmit").style("opacity", 1);
            }

            this.tooltipRect(data_rect);

    }

    makeBrushedBarCharts(chosenVars, raw, brushedData, timeSeries) {
        let divBar = document.getElementById("bar1")
                while (divBar.firstChild) {
                    divBar.removeChild(divBar.firstChild);
                }
        
        let data = [...raw];
        
        if (timeSeries === true) {
            let filteredDateData = [];

            if ((typeof data[0]["date"]) !== "object") {
                let parseTime = d3.timeParse("%Y-%m-%d");
    
                data.forEach(function(d) {
                    d.date = parseTime(d.date);
                });
            }

            for (let i = 0; i < data.length; i++) {
                if (+data[i].date == +this.date) {
                    filteredDateData.push(data[i]);
                }
            }
            data = filteredDateData;
        }

        let chosenVariables = [...new Set(chosenVars)];

        d3.select('#bar1')
            .append('div')
            .attr("id", "bartip")
            .attr("class", "tooltip")
            .style("opacity", 0);

        let numberOfArch = this.numberOfArchetypes;

        d3.select("#buttonGroup").remove();

        let margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let w = 500 - margin.right - margin.left;
        let h = 350 - margin.bottom - margin.top;
        let barpadding = 70;

        let svg = d3.select("#bar1")
                            .append("svg")
                            .attr("id", "bars")
                            .attr("width", w + margin.right + margin.left)
                            .attr("height", h + margin.top + margin.bottom);

        let filteredData = this.filterObjsInArr(data, chosenVariables);

        let ydata = [];

        for (let p = 0; p < this.chosenIDs.length; p++) {
            for (let m = 0; m < filteredData.length; m++) {
                if (filteredData[m].id.toLowerCase() === this.chosenIDs[p].toLowerCase()){
                    ydata.push(filteredData[m]);
                }
            }
        }

        let barData = [];
        let xScales = [];
        let yScales = [];

        for (let i = 1; i < chosenVariables.length; i++) {
            let barDataAvg = 0;
            for (let m = 0; m < this.chosenIDs.length; m++) {
                barDataAvg = barDataAvg + Number(ydata[m][""+chosenVariables[i]]);
            }
            barDataAvg = barDataAvg/this.chosenIDs.length;
            barData.push(barDataAvg);
            
            let arrayofData = [];
            for (let k = 0; k < filteredData.length; k++) {
                let number = parseInt(filteredData[k][""+chosenVariables[i]])
                arrayofData.push(number);
            }

            let x_var = d3.scaleBand()
                          .domain(this.chosenIDs.map((d) => d[""+chosenVariables[i]]))
                          .range([0,w/(chosenVariables.length-1) - barpadding]);
            xScales.push(x_var);

            let yScaleOne = d3.scaleLinear()
                               .domain([d3.max(arrayofData), 0])
                               .range([0, (h)]);
            yScales.push(yScaleOne);
        }

        let that = this;

        for (let i = 0; i < yScales.length; i++) {
            let that = this;

            let currData = [{id: "average",
                            value: barData[i]}];

            let yscales = yScales;

            svg.selectAll()
                .data(currData)
                .enter()
                .append('rect')
                .attr("x", function (d,i) {
                    //return d => xScales(d.id);
                    return i * (w/(chosenVars.length));
                })
                .attr("y", function(d,i) {
                    let scale = yscales[i];
                    return scale(d.value);
                })
                .attr("width", w/(that.chosenIDs.length) - barpadding)
                .attr("height", function(d,i) {
                    let scale = yscales[i];
                    return h-scale(d.value);
                })
                .attr("fill","orangered")
                .attr("transform", "translate(" +(70*i)+",5)");
        }

        for (let i = 0; i < chosenVariables.length; i++) {

            if (chosenVariables[i] !== "id") {
                   
                let yaxis = svg.append("g")
                            .attr("id", "y-axis" + i);

                yaxis.call(d3.axisLeft(yScales[i-1]).ticks(5))
                    //.attr("transform", "translate(" + (displace+20) + ",0)")
                    .attr("transform", "translate(" + ((i-1)*(w/(chosenVariables.length-1))+3*margin.left+10) + ",0)")
                    .attr("class", "axis_line");
                
                let xaxis = svg.append("g")
                    .attr("id", "x-axis")
                    //.attr("transform", "translate("+ (displace+20) +","+ (h - margin.bottom)+")")
                    .attr("transform", "translate("+ ((i-1)*(w/(chosenVariables.length-1))+(3*margin.left+10))+","+ (h-5)+")")
                    .call(d3.axisBottom(xScales[i-1])); 
            
                yaxis.append("text")
                        .text(""+chosenVariables[i])
                        .attr("class", "axis-label")
                        //.attr("text-anchor", "middle")
                        //.attr("transform", "translate(" + (displace-35) + "," + h/2+")rotate(-90)");
                        .attr("transform", "translate(" + (-50+((i-1))) +","+h/2+")rotate(-90)");
                
            }
        }

        let data_rect = d3.selectAll("#bar1").selectAll("rect");

            if (this.timeline === true) {
                d3.select("#dateSubmit").style("opacity", 1);
            }

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
        //more specific id
        let tooltip = d3.select('#bartip')

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

    drawTimeLine(data, variable) { 
        let dataTime = [...data];

        if (this.timelineActive === true) {
            d3.select("#svg-time").remove();
        }

        let margin = {top: 10, right: 20, bottom: 10, left: 20};
        
        let w = 500 - margin.right - margin.left;
        let h = 300 - margin.bottom - margin.top;

        let parseTime = d3.timeParse("%Y-%m-%d");

        if (this.timelineActive === false) {
            if ((typeof dataTime[0]["date"]) !== "object") {
                dataTime.forEach(function(d) {
                    d.date = parseTime(d.date);
                });
            }

            d3.select('#timeL')
                .append('div')
                .attr("class", "tooltip")
                .style("opacity", 0);
        }

        let uniqueID_arr = [];

        for (let i = 0; i < dataTime.length; i++) {
            uniqueID_arr.push(dataTime[i].id);
        }

        uniqueID_arr = [...new Set(uniqueID_arr)];

        let newObjArray = [];

        for (let k = 0; k < uniqueID_arr.length; k++) {
            let newObj = {};
            for (let i = 0; i < dataTime.length; i++) {
                if (uniqueID_arr[k] === data[i].id) {
                    let id = data[i].id;
                    newObj["id"] = id;

                    let newValuesArray = [];

                    for (let p = 0; p < data.length; p++) {
                        if (uniqueID_arr[k] === data[p].id) {
                            let values = {};
                            let date = data[p].date;
                            let number = data[p][""+variable];
                            number = parseInt(number);
                            values["date"] = date;
                            values["number"] = number;
                            newValuesArray.push(values);
                        }
                    }
                newObj["values"] = newValuesArray;
                }
            }
            newObjArray.push(newObj);
        }

        let yScaleData = [];

        for (let i = 0; i < newObjArray.length; i++) {
            for (let j = 0; j < newObjArray[i]["values"].length; j++) {
                let num = newObjArray[i]["values"][j]["number"];
                num = parseInt(num);
                yScaleData.push(num);
            }
        }

        this.lineData = newObjArray;

        let xScale = d3.scaleTime()
                        .domain(d3.extent(data, function(d) {
                            return d.date;
                        }))
                        .range([0, w-50]);

        let yScale = d3.scaleLinear()
                        .domain([(0), d3.max(yScaleData)])
                        .range([h-5, 0]);

        let line = d3.line()
                     .x(function(d) {
                         return xScale(d.date);
                     })
                     .y(function(d,i) {
                         return yScale(d.number);
                     });

        this.line = line;

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
            .call(d3.axisBottom(xScale).ticks(5))
            .attr("class", "axis_line");

        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(0,5)")
            .attr("class", "axis_line")
            .call(d3.axisLeft(yScale));

        let lines = svg.selectAll("lines")
                    .data(newObjArray)
                    .enter()
                    .append("g")
                    .attr("id", function (d) {
                        return "line"+ d.id;
                    });

        lines.append("path")
             .attr("d", function(d) { return line(d.values)})
             .classed("timeLine", true)
             .attr("id", function(d) {
                return d.id + "";
            }); 

        let data_line = d3.selectAll("#timeL").selectAll(".timeLine");

        this.tooltip(data_line);

        if (this.timelineActive === false) {
            d3.select("#timeL").style("opacity", 0);
        }
    }

    resetViz () {
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
        
        this.drawCircleChart(this.numberOfArchetypes);
    }

}

