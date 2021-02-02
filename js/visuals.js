class visuals {

    constructor(phca_result, data) {

        this.XC = phca_result.XC;
        this.S = phca_result.S;

        this.data = data;

        this.matrix_data = math.matrix(this.XC);

    }

    addBars() {

        let arch1 = math.column(this.matrix_data,0);

        let arch1_d = [arch1._data[0]];

        for (let p = 1; p < arch1._data.length; p++) {
            arch1_d = math.concat(arch1_d, arch1_d._data[p]);
        }

        let arch2 = math.column(this.matrix_data,1);

        let arch2_d = [];

        for (let p = 0; p < arch2._data.length; p++) {
            arch2_d.push(arch2._data[p]);
        }

        let arch3 = math.column(this.matrix_data,2);

        let arch3_d = [];

        for (let p = 0; p < arch3._data.length; p++) {
            arch3_d.push(arch3._data.length);
        }

        let w = 500;
        let h = 100;
        let barpadding = 1;

        let svg = d3.select("#barCharts")
            .append("svg")
            .attr("width", w)
            .attr("hegiht", h);

        svg.selectAll("rect")
            .data(arch1_d)
            .enter()
            .append("rect")
            .attr("x", function (d,i) {
                return i * (w/arch1_d.length)
            })
            .attr("y",function(d) {
                return h - d;
            })
            .attr("width", w/arch1_d.length - barpadding)
            .attr("height", function(d) {
                return d;
            });

        



        // let margin = 10;
        // let width = svg.attr("width") - margin;
        // let height = svg.attr("height") - margin;

        // let xScale = d3.scaleBand().range ([0, width]).padding(0.4);
        // let yScale = d3.scaleLinear().range ([height, 0]);

        


    }



}