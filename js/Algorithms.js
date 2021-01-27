/** Class implementing the Algorithms on the data. */
class Algorithms {

    constructor(data, noc, I, U) {
        this.data = data;

        let matrix_data = [];

        for (let m = 0; m < this.data[0].length; m++) {
            let vals = Object.values(this.data[0][m]);
            matrix_data.push(vals);
        }

        //let matrix_data = math.matrix(data);

        if (I === undefined) {
            I = null;
        }

        if (U === undefined) {
            U = null;
        }

        this.phca(matrix_data, noc, I, U, 0, 1 * (math.pow(10, -6)), 500)
    }

    phca(X, noc, I, U, delta, conv_crit, maxiter) {

        const sum = math.sum;

        let M = math.size(X);

        if (I === null) {
            I = math.range(0,M[1]);
        }
        if (U === null) {
            U = math.range(0,M[1]);
        }

        let subset_X_U = math.column(X,Math.min.apply(null, U._data));

        for (let p = Math.min.apply(null, U._data); p < Math.max.apply(null, U._data); p++){
            subset_X_U = math.concat(subset_X_U, math.column(X,p));
        }

        let SST = math.sum(math.dotMultiply(subset_X_U, subset_X_U));

        let ini_obs = [(Math.ceil(I._data.length * Math.random()))];

        let subset_X_I = math.column(X,Math.min.apply(null, I._data));

        for (let p = Math.min.apply(null, I._data) + 1; p < Math.max.apply(null, I._data) + 1; p++){
            subset_X_I = math.concat(subset_X_I, math.column(X,p));
        }
        
        let i = this.furthest_Sum(subset_X_I, noc, ini_obs);

        let j = math.range(0,noc);
        
        let C_size = math.zeros(I._data.length,noc);

        for (let p = 0; p < j._data.length; p++) {
            let i_index = i[p];
            let j_index = j._data[p];
            C_size = C_size.subset(math.index(i_index,j_index),1);
        }

        let C = math.matrix(C_size, "dense");
        //let C = math._createDiagonalMatrix(math.ones(i.length), 0, 'sparse', 0, I.length, noc);

        //let C = math.diag(math.ones(i.length));
        //C.resize(I.length, noc);

        subset_X_I = math.matrix(subset_X_I);

        let XC = math.multiply(subset_X_I, C);

        let muS = 1;
        let muC = 1;
        let mualpha = 1;

        subset_X_U = math.matrix(subset_X_U);

        let XCtX = math.multiply(math.matrix(math.transpose(XC)), subset_X_U);

        let CtXtXC = math.multiply(math.matrix(math.transpose(XC)), math.matrix(XC));

        let S = math.multiply(-1, math.log(math.random([noc, U._data.length])));

        let S_sum_0axis = math.matrix(math.apply(S, 0, sum));

        S_sum_0axis = math.matrix([S_sum_0axis]);

        let ones_matrix = math.matrix(math.ones([noc, 1]));

        let temp_S = math.multiply(ones_matrix, S_sum_0axis);

        S = math.dotDivide(S,temp_S);

        let SSt = math.multiply(S, math.transpose(S));

        let SSE_temp1 = math.multiply(2, math.sum(math.dotMultiply(XCtX, S)));
        let SSE_temp2 = math.subtract(SST, SSE_temp1);
        let SSE = math.add(SSE_temp2, math.sum(math.dotMultiply(CtXtXC, SSt)));

        [S, SSE, muS, SSt] = this.S_update(S, XCtX, CtXtXC, muS, SST, SSE, 25);

        let iter_ = 0;
        let dSSE = Number.POSITIVE_INFINITY;

        let varexpl_temp = math.subtract(SST, SSE);
        let varexpl = math.divide(varexpl_temp, SST);

        while (math.abs(dSSE) >= math.multiply(conv_crit, math.abs(SSE)) && (iter_ < maxiter) && (varexpl < 0.9999)) {
                iter_ += 1;
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
        S = S_sum.sort(function (a,b) {
            return a[0] < b[0];
        })

        let C_temp = [];
        for (let p = 0; p > C.length; p++) {
            C_temp.push(C[p].reverse());
        }

        C = C_temp;

        let XC_temp = [];

        for (let p = 0; p > XC.length; p++) {
            XC_temp.push(C[p].reverse);
        }

        XC = XC_temp;

        return XC, S, C, SSE, varexpl;
    }

    S_update(S, XCtX, CtXtXC, muS, SST, SSE, niter) {

        let M = S._size;

        let noc = parseInt(M[0], 10);

        let J = parseInt(M[1],10);

        let e = math.ones(noc, 1);

        for (let k = 0; k < niter; k++) {
            let SSE_old = SSE;
            let CtXtXC_dot_S = math.multiply(CtXtXC, S);

            let g_temp1 = math.subtract(CtXtXC_dot_S, XCtX)
            let g_temp2 = math.divide(SST, J);
            let g = math.dotDivide(g_temp1,g_temp2);

            const sum = math.sum;

            let g_multiply_S = math.matrix(math.dotMultiply(g,S));

            let g_multiply_S_sum = math.apply(g_multiply_S, 0, sum);

            let g_multiply_S_sum_arr = [g_multiply_S_sum._data[0]];

            for (let p = 1; p < g_multiply_S_sum._data.length; p++) {
                g_multiply_S_sum_arr = math.concat(g_multiply_S_sum_arr, [g_multiply_S_sum._data[p]]);
            }

            let g_multiply_S_sum_matrix = math.matrix([g_multiply_S_sum_arr])

            g = math.subtract(g, math.multiply(e, g_multiply_S_sum_matrix));

            let S_old = S
            while (true) {
                let S = math.subtract(S_old, math.multiply(g,muS));

                for (let p = 0; p < S._data.length; p++) {
                    for (let n = 0; n < S._data[p].length; n++) {
                        if (S._data[p][n] < 0) {
                            S._data[p][n] = 0;
                        }
                    }
                }

                // THIS IS WHERE I AM !!!!!!!!!!!!!!!!!!!!!

                S = math.dotDivide(S, math.multiply(e, math.apply(S, 0, sum)));
                let SSt = math.multiply(S, math.transpose(S));

                let SSE_temp = math.subtract(SST, math.multiply(2, math.sum(math.multiply(XCtX,S)))); 
                
                let SSE = math.add(SSE_temp, math.sum(math.multiply(CtXtXC,SSt)));

                if (SSE <= SSE_old * (1 + 1e-9)) {
                    muS = math.multiply(muS, 1.2);
                    break;
                }
                else {
                    muS = math.divide(muS, 2);
                }
            }
        }
        return [S, SSE, muS, SSt];
    }

    C_update(X, XSt, XC, SSt, C, delta, muC, mualpha, SST, SSE, niter) {
        let [noc, J] = math.size(C);

        const sum = math.sum;

        if (delta != 0) {
            let alphaC = math.apply(C, 0, sum);
            let C = math.dot(C, math.diag(math.divide(1,alphaC)));
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
            
            let g_temp = math.apply((math.multiply(g,C)),0,sum);

            g = math.subtract(g, math.multiply(e,g_temp));

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

                let nC = math.apply(C, 0, sum) + Number.EPSILON;
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

    // max_ind_val(val, ind) {
    //     let max = val;
    //     let maxIndex = ind;

    //     for (let p = 0; p < L.length; p++) {
    //         if (L[p] > max) {
    //             maxIndex = p;
    //             max = L[p];
    //         }
    //     }
    //     return [maxIndex, max];  // zip package from collect
    // }

    repmat (matrix, repeat_rows, repeat_cols) {     // possible
        const concat = math.concat;
        // let J = matrix._size;
        
        // let numberOfColumns = J;
        // let numberOfRows = 1;

        if (repeat_cols > 1) {

            let original_m = [matrix._data];

            let column = [];

            for (let p = 0; p < original_m[0].length; p++) {
                column.push([original_m[0][p]]);
            }

            let rep_matrix = column;

            for (let p = 1; p < repeat_cols; p++) {
                rep_matrix = math.concat(rep_matrix, column);
            }
            return rep_matrix;
        }

        if (repeat_rows > 1) {
            
            let original_m = [matrix._data];

            let rep_matrix = original_m;

            let concat_matrix = rep_matrix;

            for (let p = 1; p < repeat_rows; p++) {
                rep_matrix = math.concat(rep_matrix, concat_matrix, 0);
            }
            return rep_matrix;
        }
    }

    furthest_Sum(K, noc, ini_obs) {

        const sum = math.sum;

        let M = math.size(K);

        let I = parseInt(M[0], 10);

        let J = parseInt(M[1],10);

        let index = math.range(0,J);

        let ini_obs_num = ini_obs[0];

        index._data[ini_obs_num] = -1;
        index = index._data;

        let ind_t = ini_obs[0];

        let sum_dist = math.zeros(1,J);

        if (J > noc * I) { // entire statements within brackets must be fixed
            let Kt = K;
            let Kt_2 = math.apply(math.square(Kt), 0, sum);

            for (let i = 1; i < noc + 11; i++) {
                if (k > noc - 1) {
                    let Kt_col = math.column(Kt,ini_obs[0]);
                    let Kq = math.dot(Kt_col, Kt);

                    let sum_dist_temp1 = math.subtract(Kt_2, math.multiply(2,Kq));
                    let sum_dist_temp2 = math.add(sum_dist_temp1, Kt_2[ini_obs[0]]);
                    sum_dist -= math.sqrt(sum_dist_temp2);

                    ini_obs_num = ini_obs[0];
                    index[ini_obs_num] = ini_obs[0];

                    ini_obs = [];
                }
                let t = [];
                for (let p = 0; p < index.length; p++) {
                    if (index[p] !== -1) {
                        t.push(index[p]);        // possible
                    }
                }
                Kt_ind_t = math.column(Kt, ind_t);
                let Kq = math.dot(math.transpose(Kt_ind_t), Kt);

                let sum_dist_temp1 = math.subtract(Kt_2, math.multiply(2,Kq));
                let sum_dist_temp2 = math.add(sum_dist_temp1, Kt_2[ind_t]);
                sum_dist += math.sqrt(sum_dist_temp2);

                for (let p = 0; p < t.length; p++) {
                    let ind_2, val_2 = this.max_ind_val(math.column(sum_dist,t[p]));
                    if (val_2 > val) {
                        val = val_2;
                        ind = t[p];        // possible
                    }
                }

                ind_t = t[ind];

                ini_obs.push(ind_t);
                index[ind_t] = -1;
            }

        }
        else {
            if (I !== J || math.sum(math.subtract(K, math.transpose(K))) !== 0) {
                let Kt = K;
                let Kt_transpose = math.matrix(math.transpose(Kt));
                
                K = math.matrix(math.multiply(Kt_transpose, Kt));

                let K_diag = math.matrix(math.diag(K));

                // let K_diag_arr = [];

                // for (let p = 0; p < K_diag._size; p++) {
                //     K_diag_arr.push(K_diag._data[p]);
                // }

                let repmat_1 = this.repmat(K_diag, J, 1);
                let repmat_2 = this.repmat(math.matrix(math.transpose(math.diag(K))), 1, J); 

                let K_temp1 = math.subtract(repmat_1, math.multiply(2,K));
                let K_temp2 = math.add(K_temp1, repmat_2);
                K = math.sqrt(K_temp2);

            }
            let Kt_2 = math.diag(K);
            for (let k = 1; k < noc + 11; k++) {
                if (k > noc - 1) {
                    ini_obs_num = ini_obs[0];
                    let K_i_0_row = math.row(K, ini_obs_num); 

                    // let Kt_2_arr1 = [Kt_2._data[0]];

                    // for (let p = 1; p < Kt_2._size; p++) {
                    //     Kt_2_arr1 = math.concat(Kt_2_arr1, [Kt_2._data[p]]);
                    // }

                    let Kt_2_arr = math.matrix([Kt_2]);
                    
                    let sum_dist_temp1 = math.subtract(Kt_2_arr, math.multiply(2, K_i_0_row));

                    let Kt2_ind_o_arr = [Kt_2_arr._data[0]];

                    for (let p = 1; p < Kt_2_arr._size[1]; p++) {
                        Kt2_ind_o_arr = math.concat(Kt2_ind_o_arr, Kt_2_arr._data[0][p]);
                    }

                    let sum_dist_temp2 = math.add(sum_dist_temp1, math.matrix(Kt2_ind_o_arr));
                    
                    let sum_dist_temp3 = math.sqrt(sum_dist_temp2);

                    sum_dist = math.subtract(sum_dist, sum_dist_temp3);

                    ini_obs_num = ini_obs[0];
                    index[ini_obs_num] = ini_obs[0];

                    ini_obs = ini_obs.slice(1);
                }
                let t = index.filter(function (value) {
                    return value !== -1;
                });
                // let t = [];
                // for (let p = 0; p < index._data.length; p++) {
                //     if (index._data[p] !== -1) {
                //         t.push(index._data[p]);     // possible
                //     }
                // }
                
                let K_ind_t_row = math.row(K, ind_t);

                let K_ind_t_row2 = math.multiply(2,K_ind_t_row);

                let K_ind_t_arr = [];

                for (let p = 0; p < K_ind_t_row2._data[0].length; p++) {
                    K_ind_t_arr.push([K_ind_t_row2._data[0][p]]);
                }

                let Kt_2_arr = [];

                for (let p = 0; p < Kt_2._data.length; p++) {
                    Kt_2_arr.push([Kt_2._data[p]]);
                }

                let sum_dist_temp1 = math.subtract(Kt_2_arr, K_ind_t_arr);

                let Kt2_ind_t_arr = [];

                for (let p = 0; p < Kt_2_arr.length; p++) {
                    let Kt2_ind_t = Kt_2._data[ind_t];
                    Kt2_ind_t_arr.push([Kt2_ind_t]);
                }

                let sum_dist_temp2 = math.add(sum_dist_temp1, Kt2_ind_t_arr);
                let sum_dist_temp3 = math.sqrt(sum_dist_temp2);

                let sum_dist_temp4 = [sum_dist_temp3[0]];

                for (let p = 1; p < sum_dist_temp3.length; p++) {
                    sum_dist_temp4 = math.concat(sum_dist_temp4, [sum_dist_temp3[p]]);
                }
                
                let sum_dist_temp5 = math.matrix(sum_dist_temp4);

                sum_dist = math.add(sum_dist, sum_dist_temp5); 

                let ind = 0;
                let val = Number.NEGATIVE_INFINITY;

                for (let p = 0; p < t.length; p++) {
                    let ind = t[p];
                    let val_2 = math.column(sum_dist,t[p]).re;

                    //let [ind, val_2] = this.max_ind_val(math.column(sum_dist,t[p]).re, t[p]);
                    if (val_2 > val) {
                        val = val_2;
                        ind = t[p];   // possible
                    }
                }
            
                ind_t = t[ind];
                ini_obs.push(ind_t);
                index[ind_t] = -1;                
            }
        }
        return ini_obs;
    }


}