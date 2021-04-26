class dataSelection {

    constructor(data, updateData, updateArch, performAnalysis, customAnalysis) {
        this.data = null;
        this.numArch = null;
        this.updateData = updateData;
        this.updateArch = updateArch;
        this.performAnalysis = performAnalysis;
        this.customXC = null;
        this.customS = null;
        this.customDataImplement = null;
        this.customArch = null;
        this.customAnalysis = customAnalysis;
        this.image = false;
        this.imageData = null;

        this.timeSeries = false;

        let that = this;

        let diabetesdata = d3.select("#diabetesButton");
        diabetesdata.on("click", function() {
            document.getElementById("covidButton").style.color = "white"
            document.getElementById("covidButton").style.backgroundColor = "rgb(134, 124, 189)"
            document.getElementById("diabetesButton").style.color = "black"
            document.getElementById("diabetesButton").style.backgroundColor = "silver"
            that.updateData("diabetesButton");
        });

        let covid = d3.select("#covidButton");
        covid.on("click", function () {
            document.getElementById("diabetesButton").style.color = "white"
            document.getElementById("diabetesButton").style.backgroundColor = "rgb(134, 124, 189)"
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
            if (that.timeSeries === false) {
                that.timeSeries = true;
            }
            else if (that.timeSeries === true) {
                that.timeSeries = false;
            }
        });

        let imageCheckBox = d3.select("#imageCheckBox");
        imageCheckBox.on("click", function () {
            if (that.image === false) {
                that.image = true;
            }
            else if (that.image === true) {
                that.image = false;
            }
        });

        let imageFiles = d3.select("#upImages");

        imageFiles.on("change", function () {
            that.imageData = this.files;
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
            if (that.image === false) {
                if (that.customS !== null && that.customXC !== null && 
                    that.customDataImplement !== null && that.customArch !== null) {
                        that.customAnalysis(that.customS, that.customXC, 
                            that.customDataImplement, that.customArch, that.timeSeries);
                    }
            }
            if (that.image === true && that.timeSeries === true) {
                alert("Choose between Time Series and Image Data")
            }
            if (that.image === true && that.timeSeries === false && that.imageData === null) {
                alert("Select Image Files");
            }
            if (that.image === true && that.timeSeries === false && that.imageData !== null) {
                if (that.customS !== null && that.customXC !== null && 
                    that.customDataImplement !== null && that.customArch !== null) {
                        that.customAnalysis(that.customS, that.customXC, 
                            that.customDataImplement, that.customArch, that.timeSeries,
                            that.image, that.imageData);
                    }
            }
        });

        let backbutton = d3.select("#backButton");

        backbutton.on("click", function () {
            d3.select("#Introduction").style("opacity", 1);
            document.getElementById("Introduction").style.zIndex = "0";
            
            d3.select("#customImplement").style("opacity", 0);
        });

    }

    newData (data) {
        this.data = data;
    }

    newArch (numArch) {
        this.numArch = numArch;
    }
}