class dataSelection {

    constructor(data, updateData, updateArch, performAnalysis) {
        this.data = null;
        this.numArch = null;
        this.updateData = updateData;
        this.updateArch = updateArch;
        this.performAnalysis = performAnalysis;

        let that = this;

        let fifadata = d3.select("#fifaButton");
        fifadata.on("click", function() {
            document.getElementById("covidButton").style.color = "white"
            document.getElementById("covidButton").style.backgroundColor = "rgb(134, 124, 189)"
            document.getElementById("fifaButton").style.color = "black"
            document.getElementById("fifaButton").style.backgroundColor = "silver"
            that.updateData("fifaButton");
        });

        let covid = d3.select("#covidButton");
        covid.on("click", function () {
            document.getElementById("fifaButton").style.color = "white"
            document.getElementById("fifaButton").style.backgroundColor = "rgb(134, 124, 189)"
            document.getElementById("covidButton").style.color = "black"
            document.getElementById("covidButton").style.backgroundColor = "silver";
            that.updateData("covidButton");
        });

        let dropdown = d3.select("#selectNowInitial");
        dropdown.on("change", function () {
            that.updateArch(this.value);
        });

        let csv_file = d3.select("#csv");
        csv_file.on("change", function () {
            let reader = new FileReader();
            
            reader.readAsText(this.files[0]);

            reader.onload = function () {
                let textData = reader.result;
                textData = textData.split("/\r\n|\n/");
                let customData = jQuery.csv.toObjects(textData[0]);
                that.updateData("custom", customData);
            }
        });

        let performButton = d3.select("#performButton");
        performButton.on("click", function () {
            that.performAnalysis(that.data, that.numArch);
        });

        let uploadImplementation = d3.select("#uploadImplementButton");
        uploadImplementation.on("click", function () {
            d3.select("#Introduction").style("opacity", 0);
            document.getElementById("Introduction").style.zIndex = "-2";
            
            d3.select("#customImplement").style("opacity", 1);

            // let XC = document.createElement("input");
            // XC.setAttribute("type", "file");
            // XC.setAttribute("id", "XC");

            // let S = document.createElement("input");
            // S.setAttribute("type", "file");
            // S.setAttribute("id", "S");

            // let XCspan = document.createElement("span");
            // let XClabel = document.createTextNode("")

            // let customDiv = document.getElementById("customImplement");

            //customDiv.appendChild(XC);
            //customDiv.appendChild(S);
            
        });

        let csv_file = d3.select("#csv");
        csv_file.on("change", function () {
            let reader = new FileReader();
            
            reader.readAsText(this.files[0]);

            reader.onload = function () {
                let textData = reader.result;
                textData = textData.split("/\r\n|\n/");
                let customData = jQuery.csv.toObjects(textData[0]);
                that.updateData("custom", customData);
            }

        });

    }

    newData (data) {
        this.data = data;
    }

    newArch (numArch) {
        this.numArch = numArch;
    }
}