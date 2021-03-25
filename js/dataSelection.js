class dataSelection {

    constructor(data, updateData, updateArch, performAnalysis, customAnalysis) {
        this.data = null;
        this.numArch = 0;
        this.updateData = updateData;
        this.updateArch = updateArch;
        this.performAnalysis = performAnalysis;
        this.customXC = null;
        this.customS = null;
        this.customDataImplement = null;
        this.customArch = 0;
        this.customAnalysis = customAnalysis;

        this.timeSeries = false;

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
            
        });

        let XC_file = d3.select("#upXC");
        XC_file.on("change", function () {
            let reader = new FileReader();
            
            reader.readAsText(this.files[0]);

            reader.onload = function () {
                let textData = reader.result;
                textData = textData.split("/\r\n|\n/");
                let customData = jQuery.csv.toArrays(textData[0]);
                that.customXC = customData;
            }

        });

        let S_file = d3.select("#upS");
        S_file.on("change", function () {
            let reader = new FileReader();
            
            reader.readAsText(this.files[0]);

            reader.onload = function () {
                let textData = reader.result;
                textData = textData.split("/\r\n|\n/");
                let customData = jQuery.csv.toArrays(textData[0]);
                that.customS = customData;
            }
        });

        let data_file = d3.select("#upData");
        data_file.on("change", function () {
            let reader = new FileReader();
            
            reader.readAsText(this.files[0]);

            reader.onload = function () {
                let textData = reader.result;
                textData = textData.split("/\r\n|\n/");
                let customData = jQuery.csv.toObjects(textData[0]);
                that.customDataImplement = customData;
            }
        });

        let numberinput = d3.select("#upArch");
        numberinput.on("keyup", (e) => {
            let inputVal = numberinput.property("value").toLowerCase();
            
            that.customArch = parseInt(inputVal);
            
        });

        let timeSeriesCheckBox = d3.select("#TimeSeriesCheckBox");
        timeSeriesCheckBox.on("click", function () {
            that.timeSeries = true;
        });

        let vizualizeButton = d3.select("#vizualizeButton");
        vizualizeButton.on("click", function () {
            if (that.customS === null) {
                alert("Upload your S matirx");
            }
            if (that.customXC === null) {
                alert("Upload your XC matrix");
            }
            if (that.customDataImplement === null) {
                alert("Upload your data");
            }
            if (that.customArch === null || that.customArch === "") {
                alert("Enter number of Archetypes");
            }
            that.customAnalysis(that.customS, that.customXC, 
                that.customDataImplement, that.customArch, that.timeSeries);
        });

    }

    newData (data) {
        this.data = data;
    }

    newArch (numArch) {
        this.numArch = numArch;
    }
}