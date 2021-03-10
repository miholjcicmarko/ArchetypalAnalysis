class dataSelection {

    constructor(updateData, numArch, customData) {
        if (updateData === null && customData !== null) {
            this.data = customData;
        }
        else if (updateData !== null) {
            this.data = updateData;
        }
        
        if (numArch !== null) {
            this.numArch = numArch;
        }

        
    }

    updateData (data) {
        this.data = data;
    }

    updateArch (numArch) {
        this.numArch = numArch;
    }
}