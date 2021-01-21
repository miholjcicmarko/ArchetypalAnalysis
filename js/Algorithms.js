/** Class implementing the Algorithms on the data. */

// const { matrix, number, null } = require("mathjs");

// import { create, all } from 'mathjs';

// const config = { };
// const math = create(all, config);

// console.log(math.square(4));

// import { matrix } from 'mathjs';

class Algorithms {

    constructor(data, noc) {
        this.data = data;
        this.noc = noc;
        // let mathjs = require('mathjs');
        
        // let num = mathjs.square(4);
        // console.log(num);
    }

    phca(X, noc, I, U, delta, verbose, conv_crit, maxiter) {

        let conv_crit = 1*e^-6;
        let maxiter = 500;

        [N, M] = math.size(X);

        if (I === null) {
            I = math.range(0,M);
        }
        if (U === null) {
            U = math.range(0,M);
        }

        let subset_X = []

        for(let i = 0; i < X.length; i++){
            subset_X.push(X[i].slice(0,M));
        }


    }

    S_update(S, XCtX, CtXtXC, muS, SST, SSE, niter) {

        let [noc, J] = math.size(S);

        let e = math.ones(noc, 1);

        for (let k = 0; k < niter; k++) {
            let SSE_old = SSE;
            let g_temp1 = math.subtract((math.dot(CtXtXC, S), XCtX))
            let g_temp2 = math.divide(SST, J);
            let g = math.divide(g_temp1,g_temp2);

            g = math.subtract(g, math.multiply(e, math.sum(math.multiply(g,S))));

            S_old = S
            while (true) {
                let S = math.subtract(S_old, math.multiply(g,muS));

                for (let p = 0; p < S.length; p++) {
                    for (let n = 0; n < S[p].length; n++) {
                        if (S[p][n] < 0) {
                            S[p][n] = 0;
                        }
                    }
                }

                S = math.divide(S, math.dot(e, math.sum(S)));
                let SSt = math.multiply(S, math.transpose(S));

                let SSE = math.subtract(SST, math.multiply(2, math.sum(math.multiply(XCtX,S)) + 
                            math.sum(math.multiply(CtXtXC,SSt))));

                if (SSE <= SSE_old * (1 + 1e-9)) {
                    muS = math.multiply(muS, 1.2);
                    break;
                }
                else {
                    muS = math.divide(muS, 2);
                }
            }
        }
        return S, SSE, muS, SSt;
    }

    C_update(X, XSt, XC, SSt, C, delta, muC, mualpha, SST, SSE, niter) {
        let [noc, J] = math.size(C);

        if (delta != 0) {
            alphaC = math.sum(C);
            C = math.dot(C, math.diag(math.divide(1,alphaC)));
        }

        let e = math.ones(J, 1);

        let XtXSt = math.dot(math.transpose(X), XSt);

        for (let k = 0; k < niter; k++) {
            let SSE_old = SSE;
            let g_temp1 = math.subtract((math.dot(math.transpose(X), math.dot(XC,SSt)),XtXSt)); 
            let g = math.divide(g_temp1,SST);

            if (delta != 0) {
                g = math.dot(g, math.diag(alphaC))
            }
            g = math.subtract(g, math.multiply(e,math.sum(math.multiply(g,C))));

            C_old = C;
            while (true) {
                let C = math.subtract(C_old, math.multiply(muC,g));

                for (let p = 0; p < C.length; p++) {
                    for (let n = 0; n < C[p].length; n++) {
                        if (C[p][n] < 0) {
                            C[p][n] = 0;
                        }
                    }
                }

                nC = math.sum(C) + Number.EPSILON;
                C = math.dot(C, math.diag(math.divide(1, nC[0])));

                if (delta != 0) {
                    Ct = math.multiply(C,math.diag(alphaC));
                }
                else {
                    Ct = C;
                }

                let XC = math.dot(X, Ct);
                let CtXtXC = math.dot(math.transpose(XC), XC);
                let SSE_temp = math.subtract(SST,math.multiply(2,math.sum(XC,XSt)));
                let SSE = math.add(SSE_temp, math.sum(math.multiply(CtXtXC,SSt)));

                if (SSE <= SSE_old * (1 + 1e-9)) {
                    muC = math.multiply(muC,1.2);
                    break;
                }
                else {
                    muC = math.divide(muC,2);
                }
            }

            SSE_old = SSE;
            if (delta != 0) {
                let g_temp1 = math.transpose(math.diag(math.multiply(CtXtXC, SSt)));  
                let g_temp2 = math.divide(g_temp1,alphaC);
                let g_temp3 = math.sum(math.multiply(C,XtXSt));
                let g_temp4 = math.divide(g_temp3, math.multiply(SST,J));
                let g = math.subtract(g_temp2, g_temp4);

                alphaC_old = alphaC;

                while (true) {
                    alphaC = math.subtract(alphaC_old, math.multiply(mualpha,g));
                    alphaC[alphaC < 1 - delta] = 1 - delta;
                    alphaC[alphaC > 1 + delta] = 1 + delta;

                    let XCt = math.dot(XC, math.diag(math.divide(alphaC,alphaC_old)));
                    CtXtXC = math.dot(math.transpose(XCt), XCt);
                    let SSE_temp = math.subtract(SST,math.multiply(2,math.sum(XCt,XSt)));
                    let SSE = math.add(SSE_temp, math.sum(math.multiply(CtXtXC,SSt)));

                    if (SSE <= SSE_old * (1 + 1e-9)) {
                        mualpha = math.multiply(mualpha,1.2);
                        XC = XCt;
                        break;
                    }
                    else {
                        mualpha = mualpha.divide(mualpha,2);
                    }   
                }
            }
        }
        if (delta != 0) {
            C = math.multiply(C,math.diag(alphaC));
        }
        return C, SSE, muC, mualpha, CtXtXC, XC;
    }

    furthest_Sum(ini_obs) {

        // import { create, all } from 'mathjs';

        // const config = { };
        // const math = create(all, config);

        // let num = math.matrix([[4,2],[5,5]]);
        // console.log(math.square(num));

        this.ini_obs = ini_obs; 

        let dimensions = [this.data[0].length, this.data[0].columns.length];
        let index = [];

        for (let i = 0; i < this.data[0].columns.length; i++) {
            index.push(i);
        }

        index[this.ini_obs] = -1;

        let ind_t = this.ini_obs;

        let sum_dist = [];

        for (let i = 0; i < this.data[0].columns.length; i++) {
            sum_dist.push(0);
        }

        debugger;

        if (this.data[0].columns.length > 0) { // noc * I instead of 0
            let kt = this.data[0];
            for (let l = 0; l < this.data[0].length; l++) {

            }
            let kt_temp = math.square(kt);
            
            // for (let l = 0; l < this.data[0].length; l++) {
            //     for (let p = 0; p < this.data[0].columns.length; p++) {
            //         let squared_elem = this.data[0][l][p] * this.data[0][l][p];
            //         kt_temp[l][p] = squared_elem;
            //     }
            // }

            let kt_2 = math.sum(kt_temp);
            
            for (let i = 1; i < this.noc + 10; i++) {
                if (i > this.noc - 1) {
                    kq = dot(kt[0][ini_obs[0]],kt);
                    
                    
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