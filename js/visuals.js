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

        let w = 500;
        let h = 200;
        let barpadding = 1;

        let yScale1 = d3.scaleLinear()
            .domain([0, d3.max(arch1_d)])
            .range([0,h-5]);

        let svg = d3.select("#bar1")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("rect")
            .data(arch1_d)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y", function(d,i) {
                return h-yScale1(d);
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return yScale1(d);
            })
            .attr("fill","steelblue");

        let yScale2 = d3.scaleLinear()
            .domain([0, d3.max(arch2_d)])
            .range([0,h-5]);
        
        let svg2 = d3.select("#bar2")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        svg2.selectAll("rect")
            .data(arch2_d)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y", function(d,i) {
                return h-yScale2(d);
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return yScale2(d);
            })
            .attr("fill","orange");;

        let yScale3 = d3.scaleLinear()
            .domain([0, d3.max(arch3_d)])
            .range([0,h-5]);
        
        let svg3 = d3.select("#bar3")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        svg3.selectAll("rect")
            .data(arch2_d)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y", function(d,i) {
                return h-yScale3(d);
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return yScale3(d);
            })
            .attr("fill", "darkgreen");
    }

}