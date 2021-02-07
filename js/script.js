/** The script to run the program on the webpage */

async function loadSandXC() {
    let XC = await d3.csv("./data/XC.csv");
    let SdataFrame = await d3.csv("./data/SdataFrame.csv");

    return {
        "XC": XC,
        "S": SdataFrame
    }
}

//let data = d3.csv("./data/COVID19.csv");
let data = loadSandXC();

Promise.all([data]).then(data => {

    //let aa_result = new Algorithms(data, 3);
 
    let plots = new visuals(data);
    
    plots.addBars();

})