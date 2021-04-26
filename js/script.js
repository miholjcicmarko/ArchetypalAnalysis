/** The script to run the program on the webpage */

async function loadPreProcessData () {
    // let fifadata = await d3.csv("./data/fifaRatingsSmall.csv");
    // let covid = await d3.csv("./data/COVID19time.csv");

    // return {
    //     "fifa" : fifadata,
    //     "covid" : covid
    // }
    let covid = await d3.csv("./data/COVIDDataMatrix.csv");
    let diabetes = await d3.csv("./data/DiabetesData.csv");

    let dataobject = {
        "COVID": covid,
        "diabetes": diabetes
    };

    for (let i = 0; i < 7; i++) {
        let index = i+1;
        let covidS = await d3.csv("./data/COVIDSMatrix" + index + ".csv");
        let covidXC = await d3.csv("./data/COVIDXCMatrix" + index + ".csv");
        let diabetesS = await d3.csv("./data/DiabetesSMatrix" + index + ".csv");
        let diabetesXC = await d3.csv("./data/DiabetesXCMatrix" + index + ".csv");

        dataobject["COVIDS"+index] = covidS;
        dataobject["COVIDXC"+index] = covidXC;
        dataobject["diabetesS"+index] = diabetesS;
        dataobject["diabetesXC"+index] = diabetesXC;
    }

    return dataobject;
}

let preProcessData = loadPreProcessData();

Promise.all([preProcessData]).then(data => {

    let preData = data[0];

    function updateData (id, data) {
        if (id === "diabetesButton") {
        //if (id === "fifaButton") {
            selectedData.newData(preData["diabetes"]);
            selectedData.preloaded = true;
            document.getElementById('csv').value= null;
        }
        else if (id === "covidButton") {
            selectedData.newData(preData["COVID"]);
            selectedData.preloaded = true;
            document.getElementById('csv').value= null;
        }
        else if (id === "custom") {
            selectedData.newData(data);
            document.getElementById("diabetesButton").style.color = "white";
            document.getElementById("diabetesButton").style.backgroundColor = "rgb(134, 124, 189)";
            document.getElementById("covidButton").style.color = "white";
            document.getElementById("covidButton").style.backgroundColor = "rgb(134, 124, 189)";
        }
    }

    function updateArch (number, sameData) {
        selectedData.newArch(number);

        if (sameData === "same" && selectedData.preloaded === false) {
            performAnalysis(selectedData.data, number);
        }
        else if (sameData === "same" && (selectedData.preloaded === "diabetes" || 
        selectedData.preloaded === "COVID")) {
            performAnalysis(selectedData.data, number, selectedData.preloaded);
        }
    }

    function performAnalysis (data, numArch, preloaded) {
        if (data === null && numArch !== null) {
            alert("Error! Select Data Set");
        }
        else if (data !== null && numArch === null || data !== null && numArch === '-') { 
            alert("Error! Select Number of Archetypes");
        }
        else if (data === null && numArch === null || data === null && numArch === '-') {
            alert("Error! Select Data Set and Number of Archetypes");
        }
        else if (preloaded === undefined) {
            let aa_result = new Algorithms(data, numArch);
            let matricies = result_to_Object(aa_result);
            let plots = new aa_view(matricies, numArch, updateArch, false);
        }
        else if (preloaded !== undefined) {
            let matricies = preloaded_to_Object(preloaded, numArch);
            let plots = new aa_view(matricies, numArch, updateArch, false, false, true);
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
            "time_data": result.timeSeries
        }
    }

    function preloaded_to_Object(preload, numArch) {
        if (preload === "COVID") {
            return {
                "XC": preData["COVIDXC"+numArch], 
                "S": preData["COVIDS"+numArch],
                "raw": preData["COVID"],
                "time_data": true
            }
        }
        else if (preload === "diabetes") {
            return {
                "XC": preData["diabetesXC"+numArch], 
                "S": preData["diabetesS"+numArch],
                "raw": preData["diabetes"],
                "time_data": false
            }
        }
    }

    let selectedData = new dataSelection(preData, updateData, 
                        updateArch, performAnalysis, customAnalysis, false);

})