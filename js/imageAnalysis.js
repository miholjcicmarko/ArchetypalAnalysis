class imageAnalysis {

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
        //this.variables = Object.keys(this.raw[0]);
        this.updateArch = updateArch;
        this.timeline = data.time_data;
        this.customImplement = customImplement;
        this.count = 0;
        this.brushOn = false;
        this.brushedData = [];

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
        document.getElementById('selectNow').selectAll('option').remove();
        let dropdownMenu = document.getElementById('selectNow');

        let numberOfArchetypes_array = [];

        for (let i = 0; i < this.numberOfArchetypes; i++) {
            let number = i+1;
            numberOfArchetypes_array.push(number);
        }

        dropdownMenu.selectAll('option')
                    .data(numberOfArchetypes_array)
                    .enter().append("option")
                    .attr("value", function (d) { return d; })

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
}