/** Class implementing the Algorithms on the data. */
class Algorithms {

    constructor(data, noc, ini_obs) {
        this.data = data;
        this.noc = noc;
        this.ini_obs = ini_obs; 
    }

    furthest_Sum() {

        let dimensions = [this.data[0].length, this.data.length];
        let index = [];

        for (let i = 0; i < this.data.length; i++) {
            index.push(i);
        }

        index[this.ini_obs+1] = 0;

        ind_t = this.ini_obs;

        let sum_dist = [];

        for (let i = 0; i < this.data.length; i++) {
            sum_dist.push(0);
        }

        // if (this.data.length > this.noc * this.data.length) {
        //     kt = this.data;
        //     kt_2 = kt.array.forEach(element, kt_index, kt_array => {
        //         kt_array[kt_index] = element * element;
        //     });
            
        //     for (let i = 1; i < this.noc + 10; i++) {
        //         if (i > this.noc - 1) {
        //             kq = 
        //         }
        //     }

        // }
        


    }


}