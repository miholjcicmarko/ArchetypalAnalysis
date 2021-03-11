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
            document.getElementById('csv').value= null;
        }
        else if (id === "covidButton") {
            selectedData.newData(preData["covid"]);
            document.getElementById('csv').value= null;
        }
        else if (id === "custom") {
            selectedData.newData(data);
            document.getElementById("fifaButton").style.color = "white";
            document.getElementById("fifaButton").style.backgroundColor = "rgb(134, 124, 189)";
            document.getElementById("covidButton").style.color = "white";
            document.getElementById("covidButton").style.backgroundColor = "rgb(134, 124, 189)";
        }
    }

    function updateArch (number) {
        selectedData.newArch(number);
    }

    function performAnalysis (data, numArch) {
        if (data === null && numArch !== null) {
            alert("Error! Select Data Set");
        }
        else if (data !== null && numArch === null || data !== null && numArch === '-') { 
            alert("Error! Select Number of Archetypes");
        }
        else if (data === null && numArch === null || data === null && numArch === '-') {
            alert("Error! Select Data Set and Number of Archetypes");

            // let window = d3.select("#Introduction").append("svg")
            //                 .attr("id", "warning")
            //                 .attr("height", 75)
            //                 .attr("width", 750);
            
            // window.append("text")
            //     .text("Error! Select Data Set and Number of Archetypes")
            //     .attr("transform", "translate(150, 50)")
            //     .attr("fill", "black")
            //     .attr("font-size", "24");

            // let button = document.createElement("button");
            // button.innerHTML = "Ok";
            // button.id = "OkButton";

            // let introDiv = document.getElementById("Introduction");
            // introDiv.append(button);
    
            // button.addEventListener("click", function () {
            //     d3.select("#warning").remove();
            //     d3.select("#OkButton").remove();
            // })
        }
        else {
            let aa_result = new Algorithms(data, numArch);
        }
    }

    let selectedData = new dataSelection(preData, updateData, updateArch, performAnalysis);

})