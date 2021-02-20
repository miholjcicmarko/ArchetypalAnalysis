class aa_view {

    constructor(data) {

        this.XC = data[0].XC;
        this.S = data[0].S;
    
        this.raw = data[0].raw; 
        this.variables = Object.keys(this.raw[0]);
    
        this.timeline = data[0].time_data;

        this.chartOn = false;

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

        let margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let width = 350 - margin.right - margin.left;
        let height = 370 - margin.bottom - margin.top;

        d3.select('#oned')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        let xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([10,w-10]);

        for (let i = 0; i < numberOfArchetypes; i++) {
            let label = d3.select('#oned')
                .append('svg')
                .attr("id", "label").classed("labelArch", true)
                .attr("width", width)
                .attr("height", (height / numberOfArchetypes));

            label.append("text")
                .text("Percentage of Archetype " + i)
                .attr("transform", "translate(0,20)");

            let xaxis = oneD.append("g")
                .attr("id", "x-axis"+i);

            xaxis.append("text")
                .attr("class", "axis-label")
                .attr("transform", "translate(-" + 0+ "," + 0)
                .attr("text-anchor", "middle");

            xaxis.call(d3.axisBottom(xScale).ticks(5))
                .attr("transform", "translate(0,5)")
                .attr("class", "axis_line");

            
        }

        this.drawVariables();

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



}

