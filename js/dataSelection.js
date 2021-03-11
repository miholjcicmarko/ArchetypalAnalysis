class dataSelection {

    //change all of this

    constructor(data, updateData, updateArch) {
        this.data = data;
        this.updateData = updateData;
        this.updateArch = updateArch;
        
        // if (updatePreData === null && loadCustom !== null) {
        //     this.data = loadCustom;
        // }
        // else if (updatePreData !== null) {
        //     this.data = updatePreData;
        // }
        
        // if (chooseArch !== null) {
        //     this.numArch = chooseArch;
        // }

        let that = this;

        let fifadata = d3.select("#fifaButton");
        fifadata.on("click", function() {
            document.getElementById("covidButton").style.color = "white"
            document.getElementById("covidButton").style.backgroundColor = "rgb(134, 124, 189)"
            document.getElementById("fifaButton").style.color = "black"
            document.getElementById("fifaButton").style.backgroundColor = "silver"
            that.updateData("fifaButton");
        })

        let covid = d3.select("#covidButton");
        covid.on("click", function () {
            document.getElementById("fifaButton").style.color = "white"
            document.getElementById("fifaButton").style.backgroundColor = "rgb(134, 124, 189)"
            document.getElementById("covidButton").style.color = "black"
            document.getElementById("covidButton").style.backgroundColor = "silver";
            that.updateData("covidButton");
        })

        let dropdown = d3.select("#home-dropdown");
        dropdown.on("change", function () {
            that.updateArch(this.value);
        })

    }

    newData (data) {
        this.data = data;
    }

    newArch (numArch) {
        this.numArch = numArch;
    }
}