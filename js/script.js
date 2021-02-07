/** The script to run the program on the webpage */

async function loadSandXC() {
    let XC = await d3.csv("./data/XC.csv");
    let SdataFrame = await d3.csv("./data/SdataFrame.csv");

    return {
        "XC": XC,
        "S":S dataFrame
    }
}

//let data = d3.csv("./data/COVID19.csv");
let data = loadSandXC();

Promise.all([data]).then(data => {

    //let aa_result = new Algorithms(data, 3);
 
    //let plots = new visuals(aa_result,data);
    let plots = new
    
    plots.addBars();

})