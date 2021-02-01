/** The script to run the program on the webpage */
let data = d3.csv("./data/COVID19.csv");

Promise.all([data]).then(data => {

    let aa_result = new Algorithms(data, 3);

    
})