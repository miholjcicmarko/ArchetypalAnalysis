class aa_view {

    constructor(data) {

        this.XC = data[0].XC;
        this.S = data[0].S;
    
        this.raw = data[0].raw; 
    
        this.timeline = data[0].time_data;

        this.chartOn = false;

        this.drawCircleChart();
    
    }

    drawCircleChart () {

        let that = this;

        let dropdown = d3.select("#selectNow");

            dropdown.on("change", function () {
                let number = this.value;

                that.chartON = true;

                if (number === '-') {
                    that.resetViz();
                }
            });

        let margin = {top: 10, right: 10, bottom: 10, left: 10};
        
        let width = 350 - margin.right - margin.left;
        let height = 370 - margin.bottom - margin.top;

        d3.select('#oned')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.select('#oned')
            .append('svg').classed('label', true)
            .attr("id", "label")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.right + margin.left);


    }


}

