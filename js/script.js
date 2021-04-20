/** The script to run the program on the webpage */

async function loadPreProcessData () {
    let fifadata = await d3.csv("./data/fifaRatingsSmall.csv");
    let covid = await d3.csv("./data/COVID19time.csv");

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

    function updateArch (number, sameData) {
        selectedData.newArch(number);

        if (sameData === "same") {
            performAnalysis(selectedData.data, number);
        }
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
        }
        else {
            let aa_result = new Algorithms(data, numArch);
            let matricies = result_to_Object(aa_result);
            let plots = new aa_view(matricies, numArch, updateArch, false);
        }
    }

    function customAnalysis (customS, customXC, customData, numArch, timeSeries, 
        imageBoolean, imageData) {
        let matricies = {
            "XC": customXC,
            "S": customS,
            "raw": customData,
            "time_data": timeSeries
        }

        if (imageBoolean === true) {
            //let plots = new imageAnalysis(matricies, numArch, updateArch, true, imageData);
            let plots = new aa_view(matricies, numArch, updateArch, true, imageData);
        }
        else if (imageBoolean !== true) {
            let plots = new aa_view(matricies, numArch, updateArch, true);
        }
        
    }

    function result_to_Object(result) {
        return {
            "XC": result.XC,
            "S": result.S,
            "raw": result.origData,
            //"data_id_less": result.data,
            "time_data": result.timeSeries
        }
    }

    let selectedData = new dataSelection(preData, updateData, 
                        updateArch, performAnalysis, customAnalysis);

})