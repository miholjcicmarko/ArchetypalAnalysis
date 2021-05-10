class PlotData {
    constructor (value, variable_name) {
        this.value = value;
        this.variable_name = variable_name;
    }
}

class aa_view {

    constructor(data, numArch, updateArch, customImplement, imageData, preload) {

        d3.select("#customImplement").style("opacity", 0);
        document.getElementById("customImplement").style.zIndex = "-2";
        d3.select("#Introduction").style("opacity", 0);
        document.getElementById("Introduction").style.zIndex = "-1";
        d3.select("#header-wrap").style("opacity", 1);
        d3.select(".topnav").style("opacity", 1);
        d3.select("#brushButton").style("opacity", "1");
        document.getElementById("submit").innerHTML = 'Submit Selected Attributes/IDs';

        this.XC = data.XC;
        this.S = data.S;
        this.raw = data.raw; 
        for (let i = 0; i < this.raw.length; i++) {
            this.raw[i].id = this.raw[i].id.replace(/\s/g, "");
        }
        this.variables = Object.keys(this.raw[0]);
        this.updateArch = updateArch;
        this.timeline = data.time_data;
        this.customImplement = customImplement;
        this.imageData = imageData;
        this.count = 0; // count for the cicles 
        this.brushOn = false;
        this.brushedData = [];

        this.filteredData = [];
        this.chosenVars = ["id"];
        this.chosenIDs = [];
        this.chosenLineVar = ["id"];
        this.timelineActive = false;
        this.dateSelected = false;
        this.date = null;
        this.selectionActive = false; // selected IDs
        this.tooltipCircleON = false;
        this.barsOn = false;
        this.origVar = [];
        this.origId = [];
        this.countImages = 0;
        this.imageBrushToggled = false;
        this.imageNames = [];

        let parseTime = d3.timeParse("%Y-%m-%d");

        if (this.timeline === true) {
            d3.select("#dateInput").style("opacity", 1);
            let dataTime = [];
            for (let i = 0; i < this.raw.length; i++) {
                let datapoint = {...this.raw[i]};
                dataTime.push(datapoint);
            }
            let dates = dataTime;
            let date1 = dates[0]["date"];
            let date2 = dates[dates.length - 1]["date"];
            let date1D = 0;
            let date2D = 0;

            if (typeof date1 !== "object" && typeof date2 !== 'object') {
                date1D = parseTime(date1);
                date2D = parseTime(date2);
            }

            if (date2D <= date1D || date2 <= date1) {
                document.getElementById("dateInput").value = date2;
                document.getElementById("dateInput").min = date2;
                document.getElementById("dateInput").max = date1;
                this.origDate = date2;
                this.date = date2D;
            }
            else if (date2D > date1D || date2 > date1) {
                document.getElementById("dateInput").value = date1;
                document.getElementById("dateInput").min = date1;
                document.getElementById("dateInput").max = date2;
                this.origDate = date1;
                this.date = date1D;
            }

        }

        this.color = d3.scaleOrdinal(d3.schemeTableau10)
                .domain([0,9]);
                //.range(["blue","orange"," #D37B23","red","#168787"]);

        if (this.imageData !== false || this.customImplement === true) {
            this.S = math.matrix(this.S);
            this.XC = math.matrix(this.XC);
        }

        let matrix_data = [];

        if (preload === true) {
            for (let m = 0; m < this.S.length; m++) {
                let vals = Object.values(this.S[m]);
                matrix_data.push(vals);
            }
            this.S = math.matrix(matrix_data);
        }

        let newS = [];
        let id_list = [];

        for (let i = 0; i < this.raw.length; i++) {
            if (!id_list.includes(this.raw[i].id)) {
                id_list.push(this.raw[i].id);
            }
        }

        for (let i = 0; i < this.S._data[0].length; i++) {
            let newObj = {};
            for (let k = 0; k < this.S._data.length; k++) {
                newObj[""+k] = this.S._data[k][i];
            }
            newObj["id"] = id_list[i];
            newS.push(newObj);
        }

        this.S = newS;
        this.numberOfArchetypes = parseInt(numArch, 10);
        this.drawCircleChart(this.numberOfArchetypes);
        if (this.imageData === undefined) {
            document.getElementById('selectNow').selectedIndex=this.numberOfArchetypes - 1;
        }
        else if (this.imageData !== undefined) {
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
        }

        let that = this;

        let dInput = d3.select("#dateInput");
            dInput.on("change", function () {
                that.dateSelected = true;
                let parseTime = d3.timeParse("%Y-%m-%d");
                that.date = parseTime(this.value);
            });

        let dateSubmit = d3.select("#dateSubmit");
            dateSubmit.on("click", function () {
                if (that.brushOn === true) {
                    that.barsOn = true;
                    //that.makeBrushedBarCharts(that.chosenVars, that.raw, that.timeline, true);
                    that.makeBarCharts(that.chosenVars, that.raw, that.timeline, true);
                }
                else if (that.brushOn === false && (that.chosenVars.length > 1)) {
                    that.barsOn = true;
                    //that.makeBarCharts(that.chosenVars, that.raw, that.timeline, false);
                    that.makeBarCharts(that.chosenVars, that.raw, that.timeline, false);
                }
            })

        let dropdown = d3.select("#selectNow");

            dropdown.on("change", function () {
                if (that.imageData === false) {

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

                    let diviDs = document.getElementById("iDs")
                    while (diviDs.firstChild) {
                        diviDs.removeChild(diviDs.firstChild);
                    }

                    if (this.timeline === true) {
                        let divTimeL = document.getElementById("timeL")
                            while (divTimeL.firstChild) {
                                divTimeL.removeChild(divTimeL.firstChild);
                            }
            
                        let divTimeButtons = document.getElementById("timeLButtons")
                        while (divTimeButtons.firstChild) {
                            divTimeButtons.removeChild(divTimeButtons.firstChild);
                        }
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

        let chooseDataset = d3.select("#header-button");

        chooseDataset.on("click", function () {
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

                    d3.select("#Introduction").style("opacity", 1);
                    document.getElementById("Introduction").style.zIndex = "1";
                    d3.select("#header-wrap").style("opacity", 0.1);
                    d3.select(".topnav").style("opacity", 0.1);
                    d3.select("#brushButton").style("opacity", "0");
                    document.getElementById("submit").innerHTML = 'Submit Selected Attributes/IDs';
        })

        // if (this.timeline === true) {
        //     this.drawTimeLine(this.raw, this.variables[2]);
        // }

        let selectRegion = d3.select("#brushButton");

        selectRegion.on("click", function () {
            that.imageBrushToggled = false;
            that.origVar= that.chosenVars;
            if (that.brushOn === false && imageData === false) {
                if (that.chosenVars.length > 1) {
                    that.drawBrush();
                    that.drawIds();
                    document.getElementById("submit").innerHTML = 'Drag and Select ID Points';
                }
                else {
                    alert("Select One or More Attributes");
                }
            }
            else if (that.brushOn === true && imageData === false) {
                document.getElementById("submit").innerHTML = 'Submit Selected Attributes/IDs';
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
                    that.makeBarCharts(that.chosenVars, that.raw, that.timeline, false);
                    if (that.timeline === true) {
                        that.drawTimeLine(that.raw, that.chosenLineVar);
                    }
                    that.drawIds();
                //}
            }
            else if (that.brushOn === false && that.imageData !== false) {
                that.drawBrush();
                that.drawIds();
                document.getElementById("submit").innerHTML = 'Drag and Select ID Points';
            }
            else if (that.brushOn === true && that.imageData !== false) {
                document.getElementById("submit").innerHTML = 'Image Analysis';
                that.removeBrush();   
                d3.selectAll(".brushDataTemp").remove();
                that.chosenIDs = that.origId;
                    let divBar = document.getElementById("bar1")
                        while (divBar.firstChild) {
                            divBar.removeChild(divBar.firstChild);
                        }

                    let diviDs = document.getElementById("iDs")
                        while (diviDs.firstChild) {
                            diviDs.removeChild(diviDs.firstChild);
                        }
                    
                    that.drawIds();
                if (that.chosenIDs.length > 0) {
                    for (let i = 0; i < that.chosenIDs.length; i++) { 
                        that.displayMultipleImages(that.chosenIDs, true);
                        that.imageBrushToggled = true;
                    }
                }
            }
        });
    }

    drawCircleChart (numberOfArchetypes) {

        this.numberOfArchetypes = numberOfArchetypes;

        this.margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let width = 450 - this.margin.right - this.margin.left;
        let height = 5000 - this.margin.bottom - this.margin.top;
        if (this.imageData === false) {
            height = 345 - this.margin.bottom - this.margin.top;
        }

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

            let that = this;
            
            if (numberOfArchetypes >= 5) {
                oneD.attr("height", function () {
                    if (that.imageData === false) {
                        return (height / numberOfArchetypes);
                    }
                    else if (that.imageData !== false) {
                        return (height / numberOfArchetypes) - 
                        24*that.margin.top - 20*that.margin.bottom;
                    }  
                })
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
                .attr("class", "axis_line");

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
                else  if (numberOfArchetypes >= 5) {
                    return 45;
                }
            })
            .attr("r", function() {
                if (numberOfArchetypes >= 5 && numberOfArchetypes <= 7) {
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

    let submitButton = d3.select("#submitMagniGlass");

    submitButton.on("click", function (d,i) {
        let searchVal = searchBar.property("value").toLowerCase();
            if (searchVal !== "") {
                that.variable_name = searchVal;
                that.onSearch(searchVal,that.dataS, that.numberOfArchetypes, false);
                that.drawIds();
            }
    })

    let searchBar = d3.select("#search-bar");
        searchBar.on("keyup", (e) => {

            let searchVal = searchBar.property("value").toLowerCase();
            if (e.keyCode === 13 && searchVal !== "") {
                that.variable_name = searchVal;
                that.onSearch(searchVal,that.dataS, that.numberOfArchetypes, false);
                that.drawIds();
            }
            
        });

    if (that.imageData === false) {
        that.drawVariables();

    let submit = d3.select("#submit");
        submit.on("click", function(d,i) {
            if (that.brushOn === false && that.chosenVars.length > 1) {
                that.barsOn = true;
                if (that.chosenIDs.length !== 0) {
                    that.makeBarCharts(that.chosenVars, that.raw, that.timeline, false);
                    that.drawIds();
                }
                else {
                    alert("Select ID/IDs");
                }
            }
            else if (that.brushOn === true && that.chosenVars.length > 1) {
                //that.makeBrushedBarCharts(that.chosenVars, that.raw, that.timeline, true);
                that.makeBarCharts(that.chosenVars, that.raw, that.timeline, true);
                that.drawIds();
            }
            else if (that.chosenVars.length === 1) {
                alert("Select an Attribute/Attributes");
            }
        });
    }

    let data_circ = d3.selectAll("#oned").selectAll("circle");

    this.tooltip(data_circ);

    }

    drawBrush() {
        let selectedRegion = d3.select("#brushButton");
            selectedRegion.style("background-color", "steelblue");

        let numberOfArchetypes = this.numberOfArchetypes;

        this.margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let width = 450 - this.margin.right - this.margin.left;
        let height = 345 - this.margin.bottom - this.margin.top;

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
        let tooltip = d3.selectAll('.tooltip');
        tooltip.style("z-index", "-2");

        this.brushOn = true;
        let that = this;
        let activeBrush = null;
        let activeBrushNode = null;
        //if (that.barsOn === true) {
        if (that.imageData === false) {
            that.origVar = that.chosenVars;
        }
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
                    d3.selectAll(".tempLine").remove();
                    d3.selectAll(".selectedLine").remove();

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

                        if (that.imageData === false) {
                            that.makeBarCharts(that.chosenVars, that.raw, that.timeline, true);
                        }
                        else if (that.imageData !== false) {
                            that.displayMultipleImages(that.chosenIDs);
                        }
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

                        if (that.imageData === false) {
                            //that.makeBrushedBarCharts(that.chosenVars, that.raw, that.timeline, true);
                            that.makeBarCharts(that.chosenVars, that.raw, that.timeline, true);
                        }
                        else if (that.imageData !== false) {
                            that.displayMultipleImages(that.chosenIDs);
                        }

                        //that.makeBrushedBarCharts(that.chosenVars, that.raw, that.brushedData, that.timeline);
                    }
                    
                });
            selection.call(brush);
        });
    }
    
    displayMultipleImages (circleData, oldData) {
        d3.selectAll("img").remove();
        this.countImages = 0;

        if (oldData === undefined) {
            circleData.forEach(d => {
                this.displayImages(d, false, true)
            }) 
        }
        else if (oldData === true) {
            circleData.forEach(d => {
                this.displayImages(d, true, false)
            }) 
        }       
    }

    displayImages (circleData, clicked, brushed) {

        if (clicked === true || brushed === true) {
            this.countImages = this.countImages + 1;
        }
        
        let selectedFile = circleData;
        if (brushed === undefined) {
            selectedFile = circleData.id;
        }

        let width = 150 - this.margin.right - this.margin.left;
        let height = 150 - this.margin.top - this.margin.bottom;

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
                .append("div")
                .attr("id", "Img" + that.countImages)
                .append("img")
                .classed("imgdiv", function() {
                    if (clicked !== true) {
                        return true;
                    }
                    else  {
                        return false;
                    }
                })
                .classed("imgBrush", function () {
                    if (brushed === true) {
                        return true;
                    }
                    else {
                        return false;
                    }
                })
                .attr("id", function () {
                    if (clicked !== true) {
                        return "selectedImg" + that.countImages + "tooltip";
                    } 
                    else {
                        return "selectedImg" + that.countImages;
                    }
                })
                .attr("src", "#")
                .attr("width", width)
                .attr("height", height);

            let reader = new FileReader();

            reader.onloadend = function (e) {
                if (clicked === true) {
                    let image = d3.select("#selectedImg" + that.countImages)
                    .style("border-color", function() {
                        let id = document.getElementById('selectedImg'+ that.countImages);

                        if (id.className === "imgdiv") {
                            return "rgb(71, 105, 1)";
                        }
                        else if (id.className !== "imgdiv") {
                            let target_id = target.id.toLowerCase();
                            let index = that.chosenIDs.indexOf(target_id);
                            return that.color(index);
                        }})
                    .attr("src", function () {
                        if (brushed === undefined) {
                            that.countImages = that.countImages + 1;
                        }
                        else if (brushed === false) {
                            that.countImages = that.countImages - 1;
                        }
                        return e.target.result;
                        });

                    // image.append("text")
                    //     .attr("dy", ".35em")
                    //     .text(e.target + "");
                }
                else if (clicked === false) {
                    let image = d3.select("#selectedImg" + that.countImages + "tooltip")
                    .style("border-color", function() {
                        let id = document.getElementById('selectedImg'+ that.countImages + "tooltip");

                        if (id.className === "imgdiv" && that.brushOn === false) {
                            return "rgb(71, 105, 1)";
                        }
                        else if (id.className !== "imgdiv" && that.brushOn === false) {
                            let target_id = target.id.toLowerCase();
                            let index = that.chosenIDs.indexOf(target_id);
                            return that.color(index);
                        }
                        else if (id.className !== "imgdiv" && that.brushOn === true) {
                            return "steelblue";
                        }})
                    .attr("src", function () {
                        if (brushed === true || brushed === false) {
                            that.countImages = that.countImages - 1;
                        }
                        return e.target.result});

                    // image.append("text")
                    //     .attr("dy", ".35em")
                    //     .text(target.id + "");
                }
            }
            reader.readAsDataURL(fileName);
            that.imageNames.push(fileName);
            that.drawIds();
        }
    }

    removeBrush () {
        let svg = d3.select('#oned');

        svg.selectAll("circle").classed("notbrushed", false);

        this.brushOn = false;
        let selectedRegion = d3.select("#brushButton");
            selectedRegion.style("background-color", "thistle");

        d3.selectAll('.brushes').remove();
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
                that.chosenVars = [... new Set(that.chosenVars)];
            })
        }
    }

    addChosenVar (event) {
        let id = event.srcElement.id;

        let button = d3.select("#" + id)
                        .classed("pressed", true);
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

        //if (this.imageData === undefined) {

            for (let i = 0; i < this.chosenIDs.length; i++) {
                let that = this;

                let button = d3.select('#iDs')
                    .append("button")
                    .classed("idButton", true)
                    .attr("id", "" + this.chosenIDs[i] + "button")
                    .style("margin", "5px")
                    .style("background-color", function() {
                        if (that.brushOn === false) {
                            let index = i;
                            return that.color(index);
                        }
                        else if (that.brushOn === true) {
                            return "steelblue";
                        }
                    })      

                document.getElementById("" + this.chosenIDs[i]+ "button").innerHTML = this.chosenIDs[i];   
            }
        //}
        // else if (this.imageData != undefined) {
        //     this.imageNames = [...new Set(this.imageNames)];

        //     let img = document.getElementById("Img"+ this.imageNames.length);
        //         img
        //             .append("button")
        //             .classed("idButton", true)
        //             .attr("id", "" + this.imageNames[this.imageNames.length - 1] + "button")
        //             .style("margin", "5px")
        //             .style("background-color", function() {
        //                 if (that.brushOn === false) {
        //                     let index = i;
        //                     return that.color(index);
        //                 }
        //                 else if (that.brushOn === true) {
        //                     return "steelblue";
        //                 }
        //             })
        //     document.getElementById("" + this.imageNames[this.imageNames.length - 1]+ "button")
        //         .innerHTML = this.imageNames[this.imageNames.length - 1];
            
        // }
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

            if (that.brushOn === true) {
                tooltip.html("");
            }

            if (that.brushOn === false) {
        
            tooltip.html(that.tooltipRender(d, that.imageData))
                .style("left", (pageX) + "px")
                .style("top", (pageY) + "px");

            if (that.chosenIDs.includes(this.id.toLowerCase()) && that.imageData === false) {
                let name = this.id.toLowerCase();
                document.getElementById("" + name+ "button").style.backgroundColor = "rgb(71, 105, 1)";     
            }
            
            if (this.localName !== "path" && that.imageData === false) {
                d3.select(this).classed("hovered", true);
                d3.select(this).raise();
                that.createTempCircle(this);

                if (that.timeline === true) {
                    that.tooltipCircleON = true;
                    that.createTempLine(this, undefined, true);
                }
                if (that.barsOn === true && that.imageData === false && that.brushOn === false
                    && that.chosenIDs.includes(this.id.toLowerCase())) {
                    d3.select("#bar1").select("#bars").selectAll("#"+this.id.toLowerCase()).classed("hovered", true);
                }
            }
            else if (this.localName === "path" && that.imageData === false) {
                d3.select(this.parentNode).raise();
                if (that.timeline === true) {
                    if (!that.chosenIDs.includes(this.id.toLowerCase())) {
                        d3.select(this).classed("timeLine", false);
                        d3.select(this).classed("hoveredLine", true);
                    }
                    else {
                        d3.select(this).classed("hoveredLine", true);
                    }
                }
                that.createTempCircle(this);
            }
            if (that.barsOn === true && that.imageData === false && that.brushOn === false
                && that.chosenIDs.includes(this.id)) {
                d3.select("#bar1").select("#bars").selectAll("#"+this.id.toLowerCase()).classed("hovered", true);
            }

            if (that.imageData !== false) {
                d3.select(this).classed("hovered", true);
                that.createTempCircle(this);
                that.displayImages(this, false);
            }

            }
        });

        onscreenData.on("mouseout", function(d,i) {
            if (that.brushOn === false) {

            if (that.chosenIDs.includes(this.id.toLowerCase()) && that.imageData === false) {
                let index = that.chosenIDs.indexOf(this.id.toLowerCase());
                let name = this.id.toLowerCase();
                document.getElementById("" + name+ "button").style.backgroundColor = that.color(index);     
            }

            if (this.localName !== "path" && that.imageData === false) {
                d3.select(this).classed("hovered",false);
                d3.select(this).lower();

                if (this.classList[0] === "selectedCircle") {
                    d3.select(this).raise();
                }
                
                d3.selectAll(".tempCircle").remove();
                if (that.timeline === true) {
                    d3.select(".toolTempLine").remove();
                    that.tooltipCircleON = false;
                }
                d3.select(name + "button").classed("hoveredButton", false);

                if (that.barsOn === true && that.chosenIDs.includes(this.id.toLowerCase())) {
                    d3.select("#bar1").select("#bars").selectAll("#"+this.id.toLowerCase()).classed("hovered", false);
                }
            }
            else if (this.localName === "path" && that.imageData === false && that.brushOn === false) {
                d3.select(this.parentNode).lower();

                if (that.timeline === true) {
                    if (this.classList[0] === "selectedLine") {
                        d3.select(this.parentNode).raise();
                    }
                    
                    //d3.select(this).classed("timeLine", true);
                    // if (that.brushOn === true) {
                    //     d3.select(this).classed("brushedLine", true);
                    // }
                    if (!that.chosenIDs.includes(this.id.toLowerCase())) {
                        d3.select(this).classed("hoveredLine", false);
                        d3.select(this).classed("timeLine", true);
                    }
                    else {
                        d3.select(this).classed("hoveredLine", false);
                    }
                    //d3.select(this).classed("hoveredLine", false);
                    d3.select(name + "button").classed("hoveredButton", false);
                }
                for (let i = 0; i < that.numberOfArchetypes; i++) {
                    let circle = d3.select("#circle" + i);
                    d3.selectAll(".tempCircle").remove();
                }
            }

            if (that.imageData !== false || that.customImplement) {
                d3.select(this).classed("hovered",false);
                d3.selectAll(".tempCircle").remove();
                d3.selectAll(".imgdiv").remove();
            }

            if (that.barsOn === true && that.chosenIDs.includes(this.id.toLowerCase())) {
                d3.select("#bar1").select("#bars").selectAll("#"+this.id.toLowerCase()).classed("hovered", false);
            }

            }
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

        onscreenData.on("click", function(d,i) {
            if (that.brushOn === false) {
            d3.selectAll(".circleData").lower();

            this.id = this.id.toLowerCase();
            that.variable_name = this.id.toLowerCase();
            if (!that.chosenIDs.includes(this.id)) {
                that.chosenIDs.push(this.id.toLowerCase());
                that.onSearch(this,that.dataS, that.numberOfArchetypes, true);
                that.drawIds();

                if (that.imageData !== false) {
                    if (that.imageBrushToggled === true) {
                        that.countImages = that.countImages + that.chosenIDs.length - 1;
                    }
                    that.displayImages(this, true);
                }
            }
            for (let i = 0; i < that.chosenIDs.length; i++) {
                d3.select("#line"+ that.chosenIDs[i]).raise();
            }
            }
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
                else if (numberOfArch >= 5 && numberOfArch <= 7) {
                    return 45 - (margin_top);
                }
                else if (numberOfArch > 7) {
                    return 45;
                }
            })
            .attr("r", function() {
                if (numberOfArch >= 5 && numberOfArch <= 7) {
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

    createTempLine (item, brushed, tooltipLineOn) {
        if (this.timelineActive === true) {

        d3.selectAll("#timeL").selectAll(".tempLineBrush").remove();
        let objarray = this.lineData;
        let line = this.line;
        let itemArray = null;

        if (item !== false && brushed !== false) {

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

        }
        else if (item === false && brushed === false) {
            let array = [];

            for (let i = 0; i < objarray.length; i++) {
                for (let j = 0; j < this.chosenIDs.length; j++) {
                    if (objarray[i].id.toLowerCase() === this.chosenIDs[j].toLowerCase()) {
                        array.push(objarray[i]);
                    }
                }
            }
            itemArray = array;
        }

        let svg = d3.select("#svg-time");

        if (brushed === undefined || brushed === false && this.selectionActive) {

            if (this.tooltipCircleON === false) {

                let lines = svg.selectAll("lines")
                    .data(itemArray)
                    .enter()
                    .append("g")
                    .attr("transform", "translate(" + 60 + "," + 0 + ")");

                let that = this;

                that.linecounter = 0;

                lines.append("path")
                .style('fill', 'none')
                .attr("d", function (d) { return line(d.values)})
                .attr("stroke", function (d,i) {
                    if (that.brushOn === false) {
                        let array = [...that.chosenIDs];
                        array = array.map(d => d.toLowerCase())
                        let index = array.indexOf(d.id.toLowerCase());
                        return that.color(index);
                    }
                    //let index = 0;
                    // that.linecounter = that.linecounter + 1;
                    // if (that.selectionActive === true && that.brushOn === false) {
                    //     index = that.linecounter - 1;
                    //     return that.color(index);
                    // }
                    // else if (that.selectionActive === false && 
                    //     that.timelineActive === true && that.brushOn === false) {
                    //     //index = that.linecounter - 1;
                    //     index = that.chosenIDs.length-1;
                    //     return that.color(index);
                    // }
                    else if (that.brushOn === true) {
                        return "steelblue";
                    }
                })
                .attr("stroke-width", 2.5)
                .classed("tempLine", true)
                .classed("tempLineBrush", function () {
                    if (that.brushOn === true) {
                        return true;
                    }
                    else {
                        return false;
                    }
                })
                .attr("id", function(d) {
                    return d.id;
                }); 

            }
            else if (this.tooltipCircleON === true) {
                let lines = svg.selectAll("lines")
                        .data(itemArray)
                        .enter()
                        .append("g")
                        .attr("transform", "translate(" + 60 + "," + 0 + ")");
    
                let that = this;
    
                lines.append("path")
                .style('fill', 'none')
                 .attr("d", function (d) { return line(d.values)})
                 .classed("hoveredLine", true)
                 .classed("toolTempLine", function () {
                    if (tooltipLineOn === true) {
                        return true
                    } 
                    else {
                        return false;
                    }
                 })
                 .classed("tempLine", true)
                 .attr("id", function(d) {
                    return d.id;
                 });
            }
        }
        else if (brushed === true) {

                let lines = svg.selectAll("lines")
                    .data(itemArray)
                    .enter()
                    .append("g")
                    .attr("transform", "translate(" + 60 + "," + 0 + ")");

                lines.append("path")
                     .style("fill", "none")
                     .attr("d", function (d) { return line(d.values)})
                     .attr("stroke", "steelblue")
                     .attr("stroke-width", 2.5)
                     .classed("tempLineBrush", true)
                     .attr("id", function(d) {
                        return d.id;
                     });  
        }

        let data_line = d3.selectAll("#timeL").selectAll(".tempLineBrush");

        this.tooltip(data_line);

        let data_line2 = d3.selectAll("#timeL").selectAll(".tempLine");

        this.tooltip(data_line2);
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
                    return 45;
                }
            })
            .attr("r", function() {
                if (numberOfArchetypes >= 5 && numberOfArchetypes <= 7) {
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

    tooltipRender(data, imageData) {
        let text = data.currentTarget.id;
        if (imageData === false) {
            return text;
        }
        else if (imageData !== false) {
            let text_arr = text.split("/");
            text = text_arr[text_arr.length -1];
            return text;
        }
    }

    onSearch(searchVal, data, numberOfArch, isTooltip) {
        let value = searchVal;
        if (isTooltip === true) {
            value = value.id
        }
        if (this.chosenIDs.length > 20) {
            this.chosenIDs.pop();
            alert("Too many IDs chosen!");
            return;
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
                    searchVal = searchVal.trim();
                    this.filteredData = data[i].filter(d => d.variable_name.toLowerCase().includes(searchVal));
                }
                else if (isTooltip === true) {
                    let toolData = searchVal.id;
                    toolData = toolData.toLowerCase();
                    this.filteredData = data[i].filter(d => d.variable_name.toLowerCase().includes(toolData));
                }
            
            //    if (!this.chosenIDs.includes(this.filteredData[0].variable_name)) {

                this.chosenIDs.push(this.filteredData[0].variable_name.toLowerCase());

                this.chosenIDs = [...new Set(this.chosenIDs)];

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
                    else if (numberOfArch >= 5 && numberOfArch <= 7) {
                        return 45 - (margin_top);
                    }
                    else if (numberOfArch > 7) {
                        return 45;
                    }
                })
                .attr("r", function() {
                    if (numberOfArch >= 5 && numberOfArch <= 7) {
                        return 3;
                    }
                    else {
                        return 7;
                    }
                })
                .classed("selectedCircle", true)
                .attr("fill", function () {
                    let target_id = point.variable_name.toLowerCase();
                    let index = that.chosenIDs.indexOf(target_id);
                    return that.color(index);
                })
                .attr("stroke", function () {
                    let target_id = point.variable_name.toLowerCase();
                    let index = that.chosenIDs.indexOf(target_id);
                    return that.color(index);
                })
                .attr("id", function(d) {
                    return point.variable_name + "";
                })
                .classed("tooltipCircle"+that.count, true);

            //}
            }

            if (this.timeline === true && this.timelineActive === true
                && this.imageData === false) {

                //this.createTempLine()

                let objarray = this.lineData;
                let line = this.line;
        
                let itemArray = objarray.filter(key => key.id.toLowerCase() === value);
        
                let svg = d3.select("#lineGroup");
        
                let lines = svg.selectAll("lines")
                            .data(itemArray)
                            .enter()
                            .append("g")
                            .attr("transform", "translate(" + 0 + "," + 0 + ")");

                let that = this;
        
                lines.append("path")
                     .style('fill', 'none')
                     .attr("d", function(d) { return line(d.values)})
                     .classed("selectedLine", true)
                     .attr("stroke", function () {
                        let target_id = value.toLowerCase();
                        let index = that.chosenIDs.indexOf(target_id);
                        return that.color(index);
                     })
                     .attr("stroke-width", 3)
                     .attr("id", function(d) {
                        return ""+value;
                     });
            }
        }
        let data_circ = d3.selectAll("#oned").selectAll("circle");

        this.tooltip(data_circ);

        if (this.timeline === true) {
            let line_data = d3.selectAll("#timeL").selectAll(".selectedLine");

            this.tooltip(line_data);
        }

        if (this.imageData !== false && isTooltip === false) {
            this.displayImages(this.filteredData[0].variable_name.toLowerCase(), true, false);
        }
    }

    makeBarCharts (chosenVariables, rawData, timeSeries, brushed) {
        let divBar = document.getElementById("bar1")
                while (divBar.firstChild) {
                    divBar.removeChild(divBar.firstChild);
                }
        
        let dataTime = [];

        for (let i = 0; i < rawData.length; i++) {
            let datapoint = {...rawData[i]};
            dataTime.push(datapoint);
        }
        
        let data = dataTime;
        
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
            .attr("class", "tooltipRect")
            .style("opacity", 0);

        let numberOfArch = this.numberOfArchetypes;

        d3.select("#buttonGroup").remove();

        let margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let w = 500 - margin.right - margin.left;
        let h = 345 - margin.bottom - margin.top;
        let barpadding = 70;

        let svg = d3.select("#bar1")
                            .append("svg")
                            .attr("id", "bars")
                            .attr("width", w + margin.right + margin.left)
                            .attr("height", h + margin.top + margin.bottom);

        let filteredData = this.filterObjsInArr(data, chosenVariables);

        let rawDataVarSpecific = [];
        let yScales = [];
        let xScales = [];
        let maxes = [];
        
        for (let i = 1; i < chosenVariables.length; i++) {
            let arrayofData = [];

            for (let k = 0; k < this.raw.length; k++) {
                if (this.chosenIDs.includes(this.raw[k]["id"].toLowerCase()) ||
                this.chosenIDs.includes(this.raw[k]["id"])) {
                    let number = parseFloat(this.raw[k][""+chosenVariables[i]])
                    arrayofData.push(number);
                }
            }
            rawDataVarSpecific.push(arrayofData);

            let arrayRaw = rawDataVarSpecific[i-1];

            maxes.push(d3.max(arrayRaw));
            
            let yScaleOne = d3.scaleLinear()
                                .domain([0, d3.max(arrayRaw)])
                                .range([h - margin.bottom, margin.top]);

            for (let k = 0; k < this.chosenIDs.length; k++) {
                yScales.push(yScaleOne);
            };

            let xScaleOne = d3.scaleBand()
                          .domain(["" + this.chosenIDs])
                          .range([0,w/(chosenVariables.length-1) - barpadding]);
            xScales.push(xScaleOne);

        }

        let ydata = [];
        
        for (let p = 0; p < this.chosenIDs.length; p++) {
            let specificData = filteredData.filter(d => d.id.toLowerCase().includes(this.chosenIDs[p].toLowerCase())); 
            if (specificData[0] !== undefined) {
                ydata.push(specificData[0]);
            }
        }

        let variables = chosenVariables.slice(1);
        let array_of_variable_objects = [];

        for (let i = 0; i < variables.length; i++) {
            let var_group_key = variables[i];
            let obj = {"var": var_group_key}
            for (let j = 0; j < this.chosenIDs.length; j++) {
                if (ydata[j] !== undefined) {
                    let name = this.chosenIDs[j];
                    let value = ydata[j][""+var_group_key];
                    obj[""+name] = value;
                    let variable_name = var_group_key;
                    obj[""+variable_name] = variable_name;
                }
            }
            array_of_variable_objects.push(obj);
        }

        for (let i = 0; i < this.chosenIDs.length; i++) {
            let name = this.chosenIDs[i];
            for (let j = 1; j < this.chosenVars.length; j++) {
                if (array_of_variable_objects[j-1]["" + name] === undefined) {
                    array_of_variable_objects[j-1]["" + name] = 0;
                }
            }
        }

        let var_id = "var";
        let that = this;

        let xlargeScale = d3.scaleBand()
                .domain(array_of_variable_objects.map(d => d[var_id]))
                .range([margin.left, w - margin.right])
                .paddingInner(0.5);

        let xcatsScale = d3.scaleBand()
                .domain(that.chosenIDs)
                .range([0, xlargeScale.bandwidth()]);

        let altXscale = xcatsScale;

        //let yScale = d3.scaleLinear()
        //       .domain([0, d3.max(array_of_variable_objects, d => d3.max(that.chosenIDs, key => d[key]))]).nice()
        //       .range([h - margin.bottom, margin.top]);

        that.barcounter = 0;
        that.barcounter2 = 0;

        if (brushed === false) {     

        svg.append("g")
            .selectAll("g")
            .data(array_of_variable_objects)
            .join("g")
            .attr("transform", d => `translate(${xlargeScale(d[var_id])+25},0)`)
            .selectAll("rect")
            .data(d => that.chosenIDs.map(key => ({key, value: d[key], variable_name: d["var"]})))
            .join("rect")
            .attr("x", d => xcatsScale(d.key) + 5)
            .attr("y", function(d,i) {
               that.barcounter = that.barcounter + 1;
               let scale = yScales[that.barcounter-1];
               return scale(d.value);
            })
            .attr("width", xcatsScale.bandwidth())
            .attr("height", function(d,i) {
               that.barcounter2 = that.barcounter2 + 1;
               let scale = yScales[that.barcounter2-1];
               return scale(0) - scale(d.value);
            })
            .attr("fill", (d,i) => that.color(i))
            .attr("id", (d,i) => d.key+"");
        }
        else if (brushed === true && yScales.length !== 0) {
            
            let array_of_avg_objects = [];

            for (let i = 0; i < array_of_variable_objects.length; i++) {
                let obj = {"var": array_of_variable_objects[i]["var"]}
                let avg = 0
                for (let j = 0; j < this.chosenIDs.length; j++) {
                    avg = avg + parseFloat(array_of_variable_objects[i][this.chosenIDs[j]])
                }
                avg = avg/this.chosenIDs.length;
                obj["avg"] = avg;
                array_of_avg_objects.push(obj);
            }

            let avg_list = ["avg"]

            let xcatsScale = d3.scaleBand()
                .domain(avg_list)
                .range([0, xlargeScale.bandwidth()]);

            altXscale = xcatsScale;

            svg.append("g")
            .selectAll("g")
            .data(array_of_avg_objects)
            .join("g")
            .attr("transform", d => `translate(${xlargeScale(d[var_id])+25},0)`)
            .selectAll("rect")
            .data(d => avg_list.map(key => ({key, value: d["avg"], variable_name: d["var"]})))
            .join("rect")
            .attr("x", d => xcatsScale("avg") + 5)
            .attr("y", function(d,i) {
               that.barcounter = that.barcounter + 1;
               if (that.barcounter === 1 || that.chosenIDs.length === 1) {
                    let scale = yScales[that.barcounter-1];
                    return scale(d.value); 
               }
               else if (that.barcounter >= 2) {
                   if (((that.barcounter-1)*(that.chosenIDs.length-1)) === yScales.length) {
                        let scale = yScales[(that.barcounter-1) * (that.chosenIDs.length) - 1];
                        return scale(d.value);
                   }
                   else if (((that.barcounter-1)*(that.chosenIDs.length-1)) !== yScales.length) {
                        let scale = yScales[(that.barcounter-1) * (that.chosenIDs.length)];
                        return scale(d.value);
                   }
               }
            })
            .attr("width", xcatsScale.bandwidth()/2)
            .attr("height", function(d,i) {
               that.barcounter2 = that.barcounter2 + 1;
               if (that.barcounter2 === 1 || that.chosenIDs.length === 1) {
                    let scale = yScales[that.barcounter2-1];
                    return scale(0) - scale(d.value);
               }
               else if (that.barcounter2 >= 2) {
                    if (((that.barcounter2-1)*(that.chosenIDs.length-1)) === yScales.length) {
                        let scale = yScales[(that.barcounter2-1) * (that.chosenIDs.length) - 1];
                        return scale(0) - scale(d.value);
                    }
                    else if (((that.barcounter2-1)*(that.chosenIDs.length-1)) !== yScales.length) {
                        let scale = yScales[(that.barcounter2-1) * (that.chosenIDs.length)];
                        return scale(0) - scale(d.value);
                    }
                }
            })
            .attr("fill", (d,i) => that.color(i))
            .attr("id", (d,i) => d.variable_name+"Rect")
            .attr("transform", "translate("+(xlargeScale.bandwidth()/4 + ",0)"));

        }
     
            for (let i = 0; i < chosenVariables.length; i++) {

                if (chosenVariables[i] !== "id" && yScales.length !== 0) {
                    let var_id = chosenVariables[i];
                    let displace = xlargeScale(var_id);
                       
                    let yaxis = svg.append("g")
                                .attr("id", "y-axis" + i);

                    let that = this;

                    yaxis.call(d3.axisLeft(yScales[(i*that.chosenIDs.length)-1]).ticks(5))
                        .attr("transform", "translate(" + (displace+30) + ",0)")
                        .attr("class", "axis_line")
                        .style("font-size", function () {
                            let scale = yScales[i-1]
                            if (scale(maxes[i-1]) > 10000 && scale(maxes[i]) < 100000) {
                                return "5";
                            }
                            else if (scale(maxes[i-1]) > 100000) {
                                return "4";
                            }
                            else if (scale(maxes[i-1]) < 10000) {
                                return "7";
                            }
                        })
                    
                    if (that.chosenIDs.length * that.chosenVars.length < 10 && brushed === false) {

                        let xaxis = svg.append("g")
                        .attr("id", "x-axis")
                        .attr("transform", "translate("+ (displace+30) +","+ (h - margin.bottom)+")")
                        .call(d3.axisBottom(xcatsScale));

                    }
                    else if (brushed === true) {
                        let xaxis = svg.append("g")
                        .attr("id", "x-axis")
                        .attr("transform", "translate("+ (displace+30) +","+ (h - margin.bottom)+")")
                        .call(d3.axisBottom(altXscale));
                    }
                
                    yaxis.append("text")
                            .text(""+chosenVariables[i])
                            .attr("class", "axis-label")
                            .style("font-size", function() {
                                return 10;
                            }
                            )
                            .attr("transform", function () {
                                if(i >= 2 && chosenVariables[i].length > 8) {
                                    return "translate(" + (-35) + "," + (h/3+5)+")rotate(-90)";
                                }
                                else if(i >= 2 && chosenVariables[i].length <= 8) {
                                    return "translate(" + (-35) + "," + (h/2.5+5)+")rotate(-90)";
                                }
                                else if (i === 1 && chosenVariables.length > 2 && chosenVariables[i].length > 8) {
                                    return "translate(" + (displace-42) + "," + (h/3+5)+")rotate(-90)";
                                }
                                else if (i === 1 && chosenVariables.length > 2 && chosenVariables[i].length <= 8) {
                                    return "translate(" + (displace-42) + "," + (h/2.5+5)+")rotate(-90)";
                                }
                                else if (i === 1 && (chosenVariables.length === 2 || chosenVariables.length === 1) &&
                                chosenVariables[i].length > 8) {
                                    return "translate(" + (displace-155) + "," + (h/2.5+5)+")rotate(-90)";
                                }
                                else if (i === 1 && (chosenVariables.length === 2 || chosenVariables.length === 1) &&
                                chosenVariables[i].length <= 8) {
                                    return "translate(" + (displace-155) + "," + (h/2.5+5)+")rotate(-90)";
                                }
                            })
                    
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
        
        let dataTime = [];

        for (let i = 0; i < raw.length; i++) {
            let datapoint = {...raw[i]};
            dataTime.push(datapoint);
        }
                
        let data = dataTime;

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
        let h = 345 - margin.bottom - margin.top;
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
                if (ydata[m] !== undefined) {
                    barDataAvg = barDataAvg + Number(ydata[m][""+chosenVariables[i]]);
                } 
                else {
                    barDataAvg = barDataAvg + 0;
                }
            }
            barDataAvg = barDataAvg/this.chosenIDs.length;
            barData.push(barDataAvg);
            
            let arrayofData = [];
            for (let k = 0; k < filteredData.length; k++) {
                if (this.chosenIDs.includes(filteredData[k]["id"])){
                    let number = parseInt(filteredData[k][""+chosenVariables[i]])
                    arrayofData.push(number);
                }
            }

            let avg_xlabel = ["avg"];

            let x_var = d3.scaleBand()
                          .domain(avg_xlabel)
                          .range([0,w/(chosenVariables.length-1) - barpadding]);
            xScales.push(x_var);

            let yScaleOne = d3.scaleLinear()
                                .domain([0, d3.max(arrayofData)])
                                .range([h - margin.bottom, margin.top]);

            yScales.push(yScaleOne);
        }

        let that = this;

        let xlargeScale = d3.scaleBand()
                .domain(that.chosenVars)
                .range([margin.left, w - margin.right])
                .paddingInner(0.5);

        avg_xlabel = ["avg"]

        let xcatsScale = d3.scaleBand()
                .domain(avg_xlabel)
                .range([0, xlargeScale.bandwidth()]);

        if (barData !== []) {

        that.barcounter3 = 0;
        that.barcounter4 = 0;

        for (let i = 0; i < yScales.length; i++) {
            let that = this;

            let currData = [{id: "average",
                            value: barData[i], 
                            variable_name: chosenVariables[i+1]}];

            let yscales = yScales;

            let na_true = false;

            for (let k = 0; k < currData.length; k++) {
                if (Object.is(currData[k].value, NaN)) {
                    na_true = true;
                    break;
                }
            }

            if (na_true === false) {

            svg.selectAll()
                .data(currData)
                .enter()
                .append('rect')
                .attr("x", function (d,i) {
                    return xlargeScale(d.variable_name);
                    //return ((i)*(w/(chosenVariables.length-1))+3*margin.left+10);
                })
                .attr("y", function(d,i) {
                    that.barcounter3 = that.barcounter3 + 1;
                    let scale = yScales[that.barcounter3-1];
                    return scale(d.value);
                })
                .attr("width", w/(that.chosenVars.length) - barpadding/(that.chosenVars.length))
                .attr("height", function(d,i) {
                    that.barcounter4 = that.barcounter4 + 1;
                    let scale = yScales[that.barcounter4-1];
                    return scale(0) - scale(d.value);
                })
                .attr("fill","steelblue")
                .attr("transform", "translate(" +(i*(w/(chosenVariables.length-1))+
                (xScales[i].bandwidth()/2-(w/(that.chosenVars.length) - barpadding)/2)+30)+",0)");
        
            }
        }
        }

        for (let i = 0; i < chosenVariables.length; i++) {

            if (chosenVariables[i] !== "id") {

                let yaxis = svg.append("g")
                            .attr("id", "y-axis" + i);

                yaxis.call(d3.axisLeft(yScales[i-1]).ticks(5))
                    .attr("transform", "translate(" + ((i-1)*(w/(chosenVariables.length-1))+3*margin.left+40) + ",0)")
                    .attr("class", "axis_line");
                
                let xaxis = svg.append("g")
                    .attr("id", "x-axis")
                    .attr("transform", "translate("+ ((i-1)*(w/(chosenVariables.length-1))+(3*margin.left+40))+","+ (h - margin.bottom)+")")
                    .call(d3.axisBottom(xScales[i-1])); 
            
                yaxis.append("text")
                        .text(""+chosenVariables[i])
                        .attr("class", "axis-label")
                        .attr("transform", function () {
                            if(i >= 2) {
                                return "translate(" + (-35) + "," + (h/2.5+5)+")rotate(-90)";
                            }
                            else if (i === 1 && chosenVariables.length > 2) {
                                return "translate(" + (-35) + "," + (h/2.5+5)+")rotate(-90)";
                            }
                            else if (i === 1 && chosenVariables.length === 2) {
                                return "translate(" + (-95) + "," + (h/2.5+5)+")rotate(-90)";
                            }
                        })
                
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
            that.tooltipCircleON = true;

            if (that.brushOn === false) {

            if (that.chosenIDs.includes(this.id.toLowerCase())) {
                let name = this.id.toLowerCase();
                document.getElementById("" + name+ "button").style.backgroundColor = "rgb(71, 105, 1)";     
            }

            that.createTempCircle(this);
            if (that.timelineActive === true) {
                that.createTempLine(this, undefined, true);
            }
            }
        });

        onscreenData.on("mouseout", function(d,i) {
            if (that.chosenIDs.includes(this.id.toLowerCase())) {
                let index = that.chosenIDs.indexOf(this.id.toLowerCase());
                let name = this.id.toLowerCase();
                document.getElementById("" + name+ "button").style.backgroundColor = that.color(index);     
            }

            d3.select(this).classed("hovered",false);

            d3.selectAll(".tempCircle").remove();
                if (that.timelineActive === true) {
                    d3.select(".toolTempLine").remove();
                    that.tooltipCircleON = false;
                }

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    }

    tooltipRectRender(data) {
        let value = data.currentTarget.__data__.value;
        let value_display = 0;
        let num_value = Number(value);
        let avg_value = num_value.toFixed(1);
        value_display = avg_value;
        let variable_name = data.currentTarget.__data__.variable_name;
        
        let name = data.currentTarget.__data__.key;

        if (name === undefined) {
            name = "Average";
        }

        return "<h5>" + "ID: " + name + "<br/>" +
                "Attribute: " + variable_name + "<br/>" +
                "Value: " + value_display;
    }

    drawTimeLine(data, variable) { 
        let dataTime = [];
        for (let i = 0; i < data.length; i++) {
            let datapoint = {...data[i]};
            dataTime.push(datapoint);
        }

        //let dataTime = [...data];

        if (this.timelineActive === true) {
            d3.select("#svg-time").remove();
        }

        let margin = {top: 10, right: 20, bottom: 10, left: 20};
        
        let w = 500 - margin.right - margin.left;
        let h = 300 - margin.bottom - margin.top;

        let parseTime = d3.timeParse("%Y-%m-%d");

        //if (this.timelineActive === false) {
            if ((typeof dataTime[0]["date"]) !== "object") {
                dataTime.forEach(function(d) {
                    d.date = parseTime(d.date);
                });
            }

            d3.select('#timeL')
                .append('div')
                .attr("class", "tooltip")
                .style("opacity", 0);
        //}

        let uniqueID_arr = [];

        for (let i = 0; i < dataTime.length; i++) {
            uniqueID_arr.push(dataTime[i].id);
        }

        uniqueID_arr = [...new Set(uniqueID_arr)];

        let newObjArray = [];

        for (let k = 0; k < uniqueID_arr.length; k++) {
            let newObj = {};
            for (let i = 0; i < dataTime.length; i++) {
                if (uniqueID_arr[k] === dataTime[i].id) {
                    let id = dataTime[i].id;
                    newObj["id"] = id;

                    let newValuesArray = [];

                    for (let p = 0; p < data.length; p++) {
                        if (uniqueID_arr[k] === data[p].id) {
                            let values = {};
                            let date = dataTime[p].date;
                            let number = dataTime[p][""+variable];
                            number = parseFloat(number);
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
                num = parseFloat(num);
                yScaleData.push(num);
            }
        }

        this.lineData = newObjArray;

        let xScale = d3.scaleTime()
                        .domain(d3.extent(dataTime, function(d) {
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
            .attr("transform", "translate(" + 3*margin.left + "," + 0 + ")")
            .attr("id", "lineGroup");

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
                    })
                    .style("fill", "none");

        lines.append("path")
             .attr("d", function(d) { return line(d.values)})
             .classed("timeLine", true)
             .attr("id", function(d) {
                return d.id + "";
            })
            .style("fill", "none"); 

        let data_line = d3.selectAll("#timeL").selectAll(".timeLine");

        this.tooltip(data_line);

        if (this.timelineActive === false) {
            d3.select("#timeL").style("opacity", 0);
        }

        if (this.chosenIDs.length > 0 && this.brushOn === false) {
            for (let i = 0; i < this.chosenIDs.length; i++) {
                let val = this.chosenIDs[i];
                this.onSearch(val,this.dataS, this.numberOfArchetypes, false);
            }
        }
        else if (this.brushOn === true) {
            this.createTempLine(this.brushedData, true);
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
        this.chosenLineVar = ["id"];
        this.count = 0;
        this.countImages = 0;

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

