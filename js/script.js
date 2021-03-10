/** The script to run the program on the webpage */

async function loadPreProcesData () {
    let fifadata = await d3.csv("./data/fifaRatingsSmall.csv");
    let covid = await d3.csv("./data/COVID19states.csv");

    return {
        "fifa" : fifadata,
        "covid" : covid
    }
}

function loadPreData(id) {
    if (id === "fifaButton") {
        let data = d3.csv("./data/fifaRatingsSmall.csv");
        let newData = new dataSelection(data);
        document.getElementById("selectNowInitial").selectedIndex = 0;
    }
    else if (id === "covid19Button") {
        let data = d3.csv("./data/COVID19states.csv"); //fix the dataset
        let newData = new dataSelection(data);
        document.getElementById("selectNowInitial").selectedIndex = 0;
    }
}

function chooseArch (number) {
    let e = document.getElementById("ddlViewBy");
    let numArch = e.options[e.selectedIndex].text;
}

function loadCustom () {
    
}


async function loadSandXC() {
    let XC = await d3.csv("./data/XC.csv");
    let SdataFrame = await d3.csv("./data/SdataFrame.csv");
    let raw = await d3.csv("./data/COVID19states.csv");
    let time_data = await d3.csv("./data/COVID19time.csv")

    return {
        "XC": XC,
        "S": SdataFrame,
        "raw": raw,
        "time_data": time_data
    }
}

//let data = d3.csv("./data/COVID19.csv");
//let data = loadSandXC();

//Promise.all([data]).then(data => {

    //let plots = new aa_view(data);

    //let aa_result = new Algorithms(data, 3);
 
    //let plots = new visuals(data);
    
    //plots.addArch();
    //plots.addOneD();

//})