class visuals {

    constructor(phca_result, data) {

        this.XC = phca_result.XC;
        this.S = phca_result.S;

        this.data = data;

        this.matrix_data = math.matrix(this.XC);

    }

    addBars() {

        let arch1 = math.column(this.matrix_data,0);

        let arch1_d = arch1._data[0];

        for (let p = 1; p < arch1._data.length; p++) {
            arch1_d = math.concat(arch1_d, arch1._data[p]);
        }

        console.log(arch1_d);

        let arch2 = math.column(this.matrix_data,1);

        let arch2_d = arch2._data[0];

        for (let p = 1; p < arch2._data.length; p++) {
            arch2_d = math.concat(arch2_d, arch2._data[p]);
        }

        console.log(arch2_d);

        let arch3 = math.column(this.matrix_data,2);

        let arch3_d = arch3._data[0];

        for (let p = 1; p < arch3._data.length; p++) {
            arch3_d = math.concat(arch3_d, arch3._data[p]);
        }

        console.log(arch3_d);

        let margin = {top: 10, right: 20, bottom: 10, left: 20};

        let w = 500 - margin.right - margin.left;
        let h = 200 - margin.bottom - margin.top;
        let barpadding = 1;

        let yScale1 = d3.scaleLinear()
            .domain([d3.max(arch1_d), 0])
            .range([0,h-5]);

        let svg = d3.select("#bar1")
            .append("svg")
            .attr("width", w + margin.right + margin.left)
            .attr("height", h + margin.top + margin.bottom);

        svg.selectAll("rect")
            .data(arch1_d)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y", function(d,i) {
                return yScale1(d);
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return h-yScale1(d);
            })
            .attr("fill","steelblue")
            .attr("transform", "translate(" + 3.25*margin.left +
            "," + 0+")");

        let yaxis = svg.append("g")
            .attr("id", "y-axis");

        yaxis.append("text")
            .attr("class", "axis-label")
            .attr("transform", "translate(-" + 0
            + "," + 0)
            .attr("text-anchor", "middle")
            .attr("class", "y-label");

        yaxis.call(d3.axisLeft(yScale1).ticks(5))
            .attr("transform", "translate(" + 6*margin.top + "," + "5)")
            .attr("class", "axis_line");

        let yScale2 = d3.scaleLinear()
            .domain([d3.max(arch2_d), 0])
            .range([0,h-5]);
        
        let svg2 = d3.select("#bar2")
            .append("svg")
            .attr("width", w + margin.right + margin.left)
            .attr("height", h + margin.top + margin.bottom);

        svg2.selectAll("rect")
            .data(arch2_d)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y", function(d,i) {
                return yScale2(d);
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return h-yScale2(d);
            })
            .attr("fill","orange")
            .attr("transform", "translate(" + 3.25*margin.left +
            "," + 0+")");

        let yaxis2 = svg2.append("g")
            .attr("id", "y-axis2");

        yaxis2.append("text")
            .attr("class", "axis-label")
            .attr("transform", "translate(-" + 0
            + "," + 0)
            .attr("text-anchor", "middle")
            .attr("class", "y-label");

        yaxis2.call(d3.axisLeft(yScale2).ticks(5))
            .attr("transform", "translate(" + 6*margin.top + "," + "5)")
            .attr("class", "axis_line");

        let yScale3 = d3.scaleLinear()
            .domain([d3.max(arch3_d), 0])
            .range([0,h-5]);
        
        let svg3 = d3.select("#bar3")
            .append("svg")
            .attr("width", w + margin.right + margin.left) 
            .attr("height", h + margin.top + margin.bottom);

        svg3.selectAll("rect")
            .data(arch3_d)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y", function(d,i) {
                return yScale3(d);
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return h-yScale3(d);
            })
            .attr("fill", "darkgreen")
            .attr("transform", "translate(" + 3.25*margin.left +
            "," + 0+")");

        let yaxis3 = svg3.append("g")
            .attr("id", "y-axis3");

        yaxis3.append("text")
            .attr("class", "axis-label")
            .attr("transform", "translate(-" + 0
            + "," + 0)
            .attr("text-anchor", "middle")
            .attr("class", "y-label");

        yaxis3.call(d3.axisLeft(yScale3).ticks(5))
            .attr("transform", "translate(" + 6*margin.top + "," + "5)")
            .attr("class", "axis_line");
    }

}