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

    this.data = null;
    this.numArch = null;

    let that = this;

    function updateData (id) {
        if (id === "fifaButton") {
            that.data = d3.csv("./data/fifaRatingsSmall.csv");
            selectedData.newData(data);
            document.getElementById("selectNowInitial").selectedIndex = 0;
        }
        else if (id === "covid19Button") {
            that.data = d3.csv("./data/COVID19states.csv"); //fix the dataset
            selectedData.newData(data);
            document.getElementById("selectNowInitial").selectedIndex = 0;
        }
    }

    function chooseArch (number) {
        let e = document.getElementById("ddlViewBy");
        let numArch = e.options[e.selectedIndex].text;
        selectedData.newArch(numArch);
    }

    let selectedData = new dataSelection(this.data, updateData, chooseArch);

})