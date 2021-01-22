/** Class implementing the Algorithms on the data. */

const { sparse, SparseMatrixDependencies, matrix } = require("mathjs");

class Algorithms {

    constructor(data, noc) {
        this.data = data;
        this.noc = noc;
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
        let C = math.matrix().resize(I.length, noc);
        C_diag = math.ones(i.length);
        C.diagonal(C_diag);
        
        let XC = math.dot(subset_X_I, C);

        let muS = 1;
        let muC = 1;
        let mualpha = 1;
        
        XCtX = math.dot(math.transpose(XC), subset_X_U);

        CtXtXC = math.dot(math.transpose(XC), XC);

        

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
                    let Kt_col = math.column(Kt,0);
                    let Kq = math.dot(Kt_col, Kt);

                    let sum_dist_temp1 = math.subtract(Kt_2, math.multiply(2,Kq));
                    let sum_dist_temp2 = math.add(sum_dist_temp1, Kt_2[ini_obs[0]]);
                    sum_dist -= math.sqrt(sum_dist_temp2);

                    index[ini_obs[0]] = ini_obs[0];

                    ini_obs = [];
                }
                //let t = // 52
            }

        }
        

    }


}