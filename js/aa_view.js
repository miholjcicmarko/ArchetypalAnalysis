class PlotData {
    constructor (value, variable_name) {
        this.value = value;
        this.variable_name = variable_name;
    }
}

class aa_view {

    constructor(data, numArch, updateArch) {

        //write time series part

        d3.select("#Introduction").style("opacity", 0);
        document.getElementById("Introduction").style.zIndex = "-1";
        d3.select("#header-wrap").style("opacity", 1);
        d3.select(".topnav").style("opacity", 1);

        this.XC = data.XC;
        this.S = data.S;
        this.raw = data.raw; 
        this.variables = Object.keys(this.raw[0]);
        this.updateArch = updateArch;
        this.timeline = data.time_data;
        this.count = 0;

        this.filteredData = [];
        this.chosenVars = ["id"];
        this.chosenIDs = [];
        this.chosenLineVar = ["id"];

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

        let dropdown = d3.select("#selectNow");

            dropdown.on("change", function () {
                let number = this.value;

                let div = document.getElementById("oned")
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }

                let divBar = document.getElementById("bar1")
                while (divBar.firstChild) {
                    divBar.removeChild(divBar.firstChild);
                }
                
                that.updateArch(number, "same");
            });

        let resetButton = d3.select("#reset");

            resetButton.on("click", function () {
                that.resetViz();
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
                    that.chosenLineVar[0] = chosenLineId;
                    that.drawTimeLine(that.raw, that.chosenLineVar);
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

        onscreenData.on("click", function(d,i) {
            this.id = this.id.toLowerCase();
            that.onSearch(this,that.dataS, that.numberOfArchetypes, true);
            that.variable_name = this.id.toLowerCase();
            that.chosenIDs.push(this.id.toLowerCase());
        })

    }

    tooltipRender(data) {
        let text = data.currentTarget.id;
        //let text = data.currentTarget.__data__.variable_name;
        return text;
    }

    onSearch(searchVal, data, numberOfArch, isTooltip) {
        let value = searchVal;
        if (isTooltip === true) {
            value = value.id
        }
        if (this.chosenIDs.length > 4 && ((this.chosenIDs.includes(value) !== true) ||
        !this.chosenIDs.includes(searchVal.id))) {
            alert("Too many IDs chosen! Please Deselect One or more IDs");
        }
        else if ((this.chosenIDs.includes(value) === true)){
            let index = this.chosenIDs.indexOf(value);
            this.chosenIDs = this.chosenIDs.splice(index,1);

            d3.selectAll(".tooltipCircle"+this.count).remove();
            // is tooltip
            //then remove the highlight from chosenID list and visually
        }
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
        }
        let data_circ = d3.selectAll("#oned").selectAll("circle");

        this.tooltip(data_circ);
    }

    makeBarCharts (chosenVariables, rawData) {

        chosenVariables = [...new Set(chosenVariables)];

        d3.select('#bar1')
            .append('div')
            .attr("id", "bartip")
            .attr("class", "tooltip")
            .style("opacity", 0);

        let numberOfArch = this.numberOfArchetypes;

        d3.select("#buttonGroup").remove();

        let margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let w = 600 - margin.right - margin.left;
        let h = 350 - margin.bottom - margin.top;
        let barpadding = 70;

        let svg = d3.select("#bar1")
                            .append("svg")
                            .attr("id", "bars")
                            .attr("width", w + margin.right + margin.left)
                            .attr("height", h + margin.top + margin.bottom);

        let filteredData = this.filterObjsInArr(rawData, chosenVariables);

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

        // let rawDataVarSpecific = [];
        // let yScales = [];
        // let xScales = [];
        // let ydata = [];
        // let ydataChosenVar = [];

        // for (let i = 1; i < chosenVariables.length; i++) {
        //     let arrayofData = [];

        //     for (let k = 0; k < filteredData.length; k++) {
        //         let number = parseInt(filteredData[k][""+chosenVariables[i]])
        //         arrayofData.push(number);
        //     }
        //     rawDataVarSpecific.push(arrayofData);

        //     let arrayRaw = rawDataVarSpecific[i-1];
            
        //     let yScaleOne = d3.scaleLinear()
        //                         .domain([d3.max(arrayRaw), 0])
        //                         .range([0, h-5]);
        //     yScales.push(yScaleOne);

        //     let xScaleOne = d3.scaleBand()
        //                   .domain(["" + this.chosenIDs])
        //                   .range([0,w/(chosenVariables.length-1) - barpadding]);
        //     xScales.push(xScaleOne);

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
        // }

        let rawDataVarSpecific = [];
        let ydata = [];
        let yScales = [];
        let xScales = [];
        
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
                .range([0, xlargeScale.bandwidth()])
                .padding(0.05);

        // possibly build multiple y axes
        let yScale = d3.scaleLinear()
                .domain([0, d3.max(array_of_variable_objects, d => d3.max(that.chosenIDs, key => d[key]))]).nice()
                .range([h - margin.bottom, margin.top]);

        svg.append("g")
            .selectAll("g")
            .data(array_of_variable_objects)
            .join("g")
            .attr("transform", d => `translate(${xlargeScale(d[var_id])},0)`)
            .selectAll("rect")
            .data(d => that.chosenIDs.map(key => ({key, value: d[key]})))
            .join("rect")
            .attr("x", d => xcatsScale(d.key))
            .attr("y", d => yScale(d.value))
            .attr("width", xcatsScale.bandwidth())
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

        

            for (let i = 0; i < chosenVariables.length; i++) {

                if (chosenVariables[i] !== "id") {
                       
                    let yaxis = svg.append("g")
                                .attr("id", "y-axis" + i);
                           
                    yaxis.append("text")
                            .text(""+chosenVariables[i])
                            .attr("class", "axis-label")
                            .attr("text-anchor", "middle")
                            .attr("transform", "translate(" + (-50+((i-1))) +","+h/2+")rotate(-90)");
                           
                    yaxis.call(d3.axisLeft(yScale[i-1]).ticks(5))
                            .attr("transform", "translate(" + ((i-1)*(w/(chosenVariables.length-1))+3*margin.left+10) + ",5)")
                            .attr("class", "axis_line");
                   
                    let xaxis = svg.append("g")
                                    .attr("id", "x-axis")
                                    .attr("transform", "translate("+ ((i-1)*(w/(chosenVariables.length-1))+(3*margin.left+10))+","+ h+")")
                                    .call(d3.axisBottom(xScales[i-1]));
                    
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

    drawTimeLine(data, variable) { // probably need to create an object in order to access 
        // the attributes

        let margin = {top: 10, right: 20, bottom: 10, left: 20};
        
        let w = 500 - margin.right - margin.left;
        let h = 400 - margin.bottom - margin.top;

        let parseTime = d3.timeParse("%Y-%m-%d");

        data.forEach(function(d) {
            d.date = parseTime(d.date);
        });

        // for (let date of Object.keys(data))

        // for (let i = 0; i < data.length; i++) {
        //     data[i].date = parseTime(data[i].date);
        //     //let date = data[i].date.split('-');
        //     //let date_format = new Date(date[0], date[1] - 1, date[2]);

        //     //data[i].date = date_format
        // }

        // let sumstat = d3.nest()
        //                 .key(function(d) { d.state})
        //                 .entries(data);

        let xScale = d3.scaleTime()
                        .domain(d3.extent(data, function(d) {
                            return d.date;
                        }))
                        .range([0, w-50]);

        let yScale = d3.scaleLinear()
                        .domain([0, d3.max(data, d => d.positive)])
                        .range([h, 0]);

        let line = d3.line()
                     .x(function(d,i) {
                         return xScale(d.date);
                     })
                     .y(function(d,i) {
                         return yScale(d.positive);
                     });

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
            .call(d3.axisLeft(yScale));

        // let res = sumstat.map(function(d){ return d.key }) // list of group names
        // let color = d3.scaleOrdinal()
        //       .domain(res)
        //       .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

        // svg.selectAll(".line")
        //     .data(data)
        //     .enter()
        //     .append("g");

        svg.append("path")
            .attr("d",line(data))
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5);

            // .attr("d", function(d){
            //     return d3.line()
            //                 .x(function(d) { return xScale(d.date); })
            //                 .y(function(d) { return yScale(d.positive); })
            //                 .curve(d3.curveMonotoneX)
            //     });

        // svg.append("path")
        //     .datum(data)
        //     .attr("id", "line-chart")
        //     .attr("class", "line")
        //     .attr("d", line);
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

