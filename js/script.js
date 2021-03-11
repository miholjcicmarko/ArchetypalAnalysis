/** The script to run the program on the webpage */

async function loadPreProcessData () {
    let fifadata = await d3.csv("./data/fifaRatingsSmall.csv");
    let covid = await d3.csv("./data/COVID19states.csv");

    return {
        "fifa" : fifadata,
        "covid" : covid
    }
}

let preProcessData = loadPreProcessData();

Promise.all([preProcessData]).then(data => {

    let preData = data[0];

    function updateData (id, data) {
        if (id === "fifaButton") {
            selectedData.newData(preData["fifa"]);
        }
        else if (id === "covid19Button") {
            selectedData.newData(preData["covid"]);
        }
        else if (id === "custom") {
            selectedData.newData(data);
        }
    }

    function updateArch (number) {
        selectedData.newArch(number);
    }

    function performAnalysis (data, numArch) {
        if (data === null && numArch !== null) {
            d3.select("#Introduction").append("svg")
                            .attr("id", "warning")
                            .attr("height", 500)
                            .attr("width", 500);
            
            let window = d3.select("#warning");

            window.append("text")
                .text("Error! Select Data Set")
                .attr("transform", "translate(150, 50)")
                .classed("home-label", true)
                .attr("fill", "black")
                .attr("font-size", "24");

        }
        else if (data !== null && numArch === null || data !== null && numArch === '-') {
            let window = d3.select("#Introduction").append("svg")
                            .attr("height", 500)
                            .attr("width", 500);
            
            window.append("text")
                .text("Error! Select Number of Archetypes")
                .attr("transform", "translate(75, 50)")
                .attr("fill", "black")
                .attr("font-size", "24");
        }
        else if (data === null && numArch === null || data === null && numArch === '-') {
            let window = d3.select("#Introduction").append("svg")
                            .attr("height", 500)
                            .attr("width", 750);
            
            window.append("text")
                .text("Error! Select Data Set and Number of Archetypes")
                .attr("transform", "translate(150, 50)")
                .attr("fill", "black")
                .attr("font-size", "24");
        }
        else {
            let aa_result = new Algorithms(data, numArch);
        }
        
        
    }

    let selectedData = new dataSelection(preData, updateData, updateArch, performAnalysis);

})