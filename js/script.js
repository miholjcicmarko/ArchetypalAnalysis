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
let customData = null;

Promise.all([preProcessData, customData]).then(data => {

    let preData = data[0];
    let custData = data[1];

    this.chosenData = null;
    this.numArch = null;

    let that = this;

    function updateData (id, data) {
        if (id === "fifaButton") {
            that.chosenData = preData["fifa"]
            selectedData.newData(preData["fifa"]);
            document.getElementById("selectNowInitial").selectedIndex = 0;
        }
        else if (id === "covid19Button") {
            that.chosenData = preData["fifa"]; //fix the dataset
            selectedData.newData(preData["covid"]);
            document.getElementById("selectNowInitial").selectedIndex = 0;
        }
        else if (id === "custom") {
            that.chosenData = data;
            selectedData.newData(data);
            document.getElementById("selectNowInitial").selectedIndex = 0;
        }
    }

    function updateArch (number) {
        selectedData.newArch(number);
    }

    function performAnalysis (data, numArch) {

    }

    let selectedData = new dataSelection(this.data, updateData, updateArch, performAnalysis);

})