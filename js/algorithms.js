/** Class implementing the Algorithms on the data. */
//import { dot } from "mathjs";

class Algorithms {

    constructor(data, noc) {
        this.data = data;
        this.noc = noc;
    }

    furthest_Sum(ini_obs) {

        this.ini_obs = ini_obs; 

        let dimensions = [this.data[0].length, this.data[0].columns.length];
        let index = [];

        for (let i = 0; i < this.data[0].columns.length; i++) {
            index.push(i);
        }

        index[this.ini_obs] = -1;

        let ind_t = this.ini_obs;

        let sum_dist = [];

        for (let i = 0; i < this.data.length; i++) {
            sum_dist.push(0);
        }

        if (this.data.length > this.noc * this.data.length) {
            kt = this.data;
            kt_temp = kt.array.forEach(element, kt_index, kt_array => {
                kt_array[kt_index] = element * element;
            });
            kt_2 = math.sum(kt_temp);
            
            for (let i = 1; i < this.noc + 10; i++) {
                if (i > this.noc - 1) {
                    kq = math.dot(kt[0][ini_obs[0]],kt);
                    sum_dist[i] -=  math.sqrt(kt_2 - 2*kq + kt_2[ind_t]);
                    index[ini_obs[0]] = ini_obs[0];
                    ini_obs = [];
                    t = index.find(element => element != -1);
                }
            }

        }
        


    }


}