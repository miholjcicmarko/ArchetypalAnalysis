/** Class implementing the Algorithms on the data. */

const { sparse } = require("mathjs");

class Algorithms {

    constructor(data, noc) {
        this.data = data;
        this.noc = noc;
    }

    phca(X, noc, I, U, delta, conv_crit, maxiter) {

        let conv_crit = 1*e^-6;
        let maxiter = 500;

        [N, M] = math.size(X);

        if (I === null) {
            I = math.range(0,M);
        }
        if (U === null) {
            U = math.range(0,M);
        }

        let subset_X_U = []

        for(let p = 0; p < X.length; p++){
            subset_X_U.push(X[p].slice(0,M+1));
        }

        let SST = math.sum(math.multiply(subset_X_U, subset_X_U));

        let subset_X_I = []

        for (let k = 0; k < X.length; k++) {
            subset_X_I.push(X[k].slice(0,M+1))
        }

        let ini_obs = [(Math.ceil(I.length * Math.random()))];
        
        let i = this.furthest_Sum(subset_X_I, noc, ini_obs);

        let j = math.range(noc);
        
        let C_size = math.zeros(I.length,noc);

        for (let p = 0; p < p + j.length; p++) {
            C_size[i][p] = 1;
        }

        let C = math.matrix(C_size, "sparse");
        //let C = math._createDiagonalMatrix(math.ones(i.length), 0, 'sparse', 0, I.length, noc);

        //let C = math.diag(math.ones(i.length));
        //C.resize(I.length, noc);

        
        
        let XC = math.dot(subset_X_I, C);

        let muS = 1;
        let muC = 1;
        let mualpha = 1;
        
        let XCtX = math.dot(math.transpose(XC), subset_X_U);

        let CtXtXC = math.dot(math.transpose(XC), XC);

        let S = math.log(math.random([noc, U.length]));

        let temp_S = math.dot(math.ones(math.matrix([noc, 1])), math.matrix(math.sum(S)));

        S = math.divide(temp_S);

        let SSt = math.dot(S, math.transpose(S));

        let SSE_temp1 = math.multiply(2, math.sum(math.multiply(XCtX, S)));
        let SSE_temp2 = math.subtract(SST, SSE_temp1);
        let SSE = math.add(SSE_temp2, math.sum(CtXtXC, SSt));

        S, SSE, muS, SSt = this.S_update(S, XCtX, CtXtXC, muS, SST, SSE, 25);

        let iter_ = 0;
        let dSSE = Number.POSITIVE_INFINITY;

        let varexpl_temp = math.subtract(SST, SSE);
        let varexpl = math.divide(varexpl_temp, SST);

        while (math.abs(dSSE) >= math.multiply(conv_crit, math.abs(SSE)) && (iter_ < maxiter) && (varexpl < 0.9999)) {
                SSE_old = SSE;

                let XSt = math.dot(subset_X_U, math.transpose(S));

                C, SSE, muC, mualpha, CtXtXC, XC = this.C_update(subset_X_I, XSt,
                    XC, SSt, C, delta, muC, mua, SST, SSE, 10);

                XCtX = math.dot(math.transpose(XC), subset_X_U);
                S, SSE, muS, SSt = this.S_update(S, XCtX, CtXtXC, muS, SST, SSE, 10);

                dSSE = SSE_old - SSE;

                if ((iter_ % 1) === 0) {
                    varexpl_temp = math.subtract(SST, SSE);
                    varexpl = math.divide(varexpl_temp, SST);
                }

        }

        varexpl_temp = math.subtract(SST, SSE);
        varexpl = math.divide(varexpl_temp, SST);

        let S_sum = math._apply(S, 1, sum); 
        // 226. fix the spare matrix and all the sums

        S = math._row(S, ind);
        C = math._column(C, ind);
        XC = math._column(XC, ind);

        return XC, S, C, SSE, varexpl;
    }

    S_update(S, XCtX, CtXtXC, muS, SST, SSE, niter) {

        let [noc, J] = math.size(S);

        let e = math.ones(noc, 1);

        for (let k = 0; k < niter; k++) {
            let SSE_old = SSE;
            let g_temp1 = math.subtract((math.dot(CtXtXC, S), XCtX))
            let g_temp2 = math.divide(SST, J);
            let g = math.divide(g_temp1,g_temp2);

            const sum = math.sum;

            g = math.subtract(g, math.multiply(e, math.apply(math.multiply(g,S), 0, sum)));

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

                S = math.divide(S, math.dot(e, math.apply(S, 0, sum)));
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

    max_ind_val(L) {

    }

    furthest_Sum(K, noc, ini_obs) {

        let [I, J] = math.size(K);

        let index = math.range(0,J);

        index[ini_obs] = -1;

        let ind_t = ini_obs;

        let sum_dist = math.zeros(J);

        if (J > noc * I) {
            let Kt = K;
            let Kt_2 = math.sum(math.square(Kt));

            for (let i = 1; i < noc + 11; i++) {
                if (k > noc - 1) {
                    let Kt_col = math._column(Kt,0);
                    let Kq = math.dot(Kt_col, Kt);

                    let sum_dist_temp1 = math.subtract(Kt_2, math.multiply(2,Kq));
                    let sum_dist_temp2 = math.add(sum_dist_temp1, Kt_2[ini_obs[0]]);
                    sum_dist -= math.sqrt(sum_dist_temp2);

                    index[ini_obs[0]] = ini_obs[0];

                    ini_obs = [];
                }
                let t = [];
                for (let p = 0; p < index.length; p++) {
                    if (index[p] !== -1) {
                        t.push(index[p]); 
                    }
                }
                Kt_ind_t = math._column(Kt, ind_t);
                let Kq = math.dot(math.transpose(Kt_ind_t), Kt);

                let sum_dist_temp1 = math.subtract(Kt_2, math.multiply(2,Kq));
                let sum_dist_temp2 = math.add(sum_dist_temp1, Kt_2[ind_t]);
                sum_dist += math.sqrt(sum_dist_temp2);

                let ind, val = this.max_ind_val();
                //55

                ind_t = t[ind];

                ini_obs.push(ind_t);
                index[ind_t] = -1;
            }

        }
        else {
            if (I !== J || math.sum(math.subtract(K, math.transpose(K))) !== 0) {
                Kt = K;
                K = math.dot(math.transpose(Kt), Kt);
                // 63 - 66
            }
            let Kt_2 = math.diag(K);
            for (k = 0; k < noc + 11; k++) {
                if (k > noc - 1) {
                    // 71
                    index[ini_obs[0]] = ini_obs[0];
                    ini_obs = [];
                }
                let t = [];
                for (let p = 0; p < index.length; p++) {
                    if (index[p] !== -1) {
                        t.push(index[p]); 
                    }
                }
                // 75
                let ind, val = this.max_ind_val();
                // 76
                ind_t = t[ind];
                ini_obs.push(ind_t);
                index[ind_t] = -1;                
            }
        }
        return ini_obs;
    }


}