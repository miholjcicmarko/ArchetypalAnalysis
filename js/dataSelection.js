class dataSelection {

    //change all of this

    constructor(data, updateData, chooseArch) {
        this.data = data;
        this.updateData = updateData;
        this.chooseArch = chooseArch;
        
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
            document.getElementById("fifaButton").style.color = "black"
            document.getElementById("fifaButton").style.backgroundColor = "silver"
            that.updateData("fifaButton");
        })



    }

    newData (data) {
        this.data = data;
    }

    newArch (numArch) {
        this.numArch = numArch;
    }
}