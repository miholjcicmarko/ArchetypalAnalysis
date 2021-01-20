/** Class implementing the Algorithms on the data. */

// import { create, all } from 'mathjs';

// const config = { };
// const math = create(all, config);

// console.log(math.square(4));

import * as mathjs from "./node_modules/mathjs/lib/browser/";

class algorithms {

    constructor(data, noc) {
        this.data = data;
        this.noc = noc;
        // let mathjs = require('mathjs');

        // let num = mathjs.square(4);
        // console.log(num);
    }

    furthest_Sum(ini_obs) {

        // import { create, all } from 'mathjs';

        // const config = { };
        // const math = create(all, config);

        let num = mathjs.square(4);
        console.log(num);

        this.ini_obs = ini_obs; 

        let dimensions = [this.data[0].length, this.data[0].columns.length];
        let index = [];

        for (let i = 0; i < this.data[0].columns.length; i++) {
            index.push(i);
        }

        index[this.ini_obs] = -1;

        let ind_t = this.ini_obs;

        let sum_dist = [];

        // for (let i = 0; i < this.data[0].columns.length; i++) {
        //     sum_dist.push(0);
        // }

        // if (this.data[0].columns.length > 0) {
        //     let kt = this.data;
        //     let kt_temp = Math.multiply(kt,kt);



        //     // for (let l = 0; l < this.data[0].length; l++) {
        //     //     for (let p = 0; p < this.data[0].columns.length; p++) {
        //     //         let squared_elem = this.data[0][l][p] * this.data[0][l][p];
        //     //         kt_temp[l][p] = squared_elem;
        //     //     }
        //     // }

        //     let kt_2 = math.sum(kt_temp);
            
        //     for (let i = 1; i < this.noc + 10; i++) {
        //         if (i > this.noc - 1) {
        //             kq = dot(kt[0][ini_obs[0]],kt);
                    
                    
        //             kq = math.dot(kt[0][ini_obs[0]],kt);
        //             sum_dist[i] -=  math.sqrt(kt_2 - 2*kq + kt_2[ind_t]);
        //             index[ini_obs[0]] = ini_obs[0];
        //             ini_obs = [];
        //             t = index.find(element => element != -1);
        //         }
        //     }

        // }
        


    }


}