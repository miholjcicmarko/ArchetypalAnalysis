/** The script to run the program on the webpage */
let data = d3.csv("./data/COVID19.csv");

Promise.all([data]).then(data => {

    let [XC, S, C, SSE, varexpl] = new Algorithms(data, 3);

    console.log(XC);
    console.log(S);
    console.log(C);
    console.log(SSE);
    console.log(varexpl);
})