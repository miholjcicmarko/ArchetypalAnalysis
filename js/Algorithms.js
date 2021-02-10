/** Class implementing the Algorithms on the data. */
class Algorithms {

    constructor(data, noc, I, U) {
        this.data = data;

        let matrix_data = [];

        for (let m = 0; m < this.data[0].length; m++) {
            let vals = Object.values(this.data[0][m]);
            matrix_data.push(vals);
        }

        if (I === undefined) {
            I = null;
        }

        if (U === undefined) {
            U = null;
        }

        matrix_data = math.matrix(matrix_data);

        let [XC, S, C, SSE, varexpl] = this.phca(matrix_data, noc, I, U, 0, 1 * (math.pow(10, -6)), 500);
        
        this.XC = XC;
        this.S = S;
        this.C = C;
        this.SSE = SSE;
        this.varexpl = varexpl;
    }

    phca(X, noc, I, U, delta, conv_crit, maxiter) {

        let SSE_old = 0;

        const sum = math.sum;

        let M = math.size(X);

        if (I === null) {
            I = math.range(0,M._data[1]);
        }
        if (U === null) {
            U = math.range(0,M._data[1]);
        }

        let subset_X_U = math.column(X,Math.min.apply(null, U._data));

        for (let p = Math.min.apply(null, U._data) + 1; p < Math.max.apply(null, U._data) + 1; p++){
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

        let C = math.matrix(C_size, "dense"); // possible issue (maybe sparse)

        subset_X_I = math.matrix(subset_X_I);

        let XC = math.multiply(subset_X_I, C);

        let muS = 1;
        let muC = 1;
        let mualpha = 1;

        subset_X_U = math.matrix(subset_X_U);

        let XCtX = math.multiply(math.matrix(math.transpose(XC)), subset_X_U);

        let CtXtXC = math.multiply(math.matrix(math.transpose(XC)), math.matrix(XC));

        let S = math.multiply(-1, math.log(math.random([noc, U._data.length])));
        
        //test S with 0.5
        //let S = math.multiply(-1, math.log(math.subtract(math.ones([noc,U._data.length]),0.5)));

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

                let XSt = math.multiply(subset_X_U, math.transpose(S));

                [C, SSE, muC, mualpha, CtXtXC, XC] = this.C_update(subset_X_I, XSt,
                    XC, SSt, C, delta, muC, mualpha, SST, SSE, 10);

                XCtX = math.multiply(math.transpose(XC), subset_X_U);

                [S, SSE, muS, SSt] = this.S_update(S, XCtX, CtXtXC, muS, SST, SSE, 10);

                dSSE = SSE_old - SSE;

                if ((iter_ % 1) === 0) {
                    varexpl_temp = math.subtract(SST, SSE);
                    varexpl = math.divide(varexpl_temp, SST);
                }
        }
       
        varexpl_temp = math.subtract(SST, SSE);
        varexpl = math.divide(varexpl_temp, SST);

        let S_sum = math.apply(S, 1, sum); 

        let S_sum_arr = [];

        let ind = [];

        for (let p = 0; p < S_sum._data.length; p++) {
            S_sum_arr.push(S_sum._data[p]);
            ind.push(p);
        }

        let vals = S_sum_arr.reverse();

        ind = ind.reverse();

        let subset_S_ind = math.row(S, Math.max.apply(null, ind));

        for (let p = Math.max.apply(null, ind) - 1; p >= Math.min.apply(null, ind); p--){
            subset_S_ind = math.concat(subset_S_ind, math.row(S,p), 0);
        }

        S = subset_S_ind;

        let subset_C_ind = math.column(C, Math.max.apply(null, ind));

        for (let p = Math.max.apply(null, ind) - 1; p >= Math.min.apply(null, ind); p--) {
            subset_C_ind = math.concat(subset_C_ind, math.column(C,p));
        }

        C = subset_C_ind;

        let subset_XC_ind = math.column(XC, Math.max.apply(null, ind));

        for (let p = Math.max.apply(null, ind) - 1; p >= Math.min.apply(null,ind); p--) {
            subset_XC_ind = math.concat(subset_XC_ind, math.column(XC, p));
        }

        XC = subset_XC_ind;

        return [XC, S, C, SSE, varexpl];
    }

    S_update(S, XCtX, CtXtXC, muS, SST, SSE, niter) { 

        let SSE_old = 0;

        let SSt = 0;

        let M = S._size;

        let noc = parseInt(M[0], 10);

        let J = parseInt(M[1],10);

        let e = math.ones(noc, 1);

        for (let k = 0; k < niter; k++) {
            SSE_old = SSE;
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
                S = math.subtract(S_old, math.multiply(g,muS));

                for (let p = 0; p < S._data.length; p++) {
                    for (let n = 0; n < S._data[p].length; n++) {
                        if (S._data[p][n] < 0) {
                            S._data[p][n] = 0;   // possible can be improved with numjs
                        }
                    }
                }

                let sum_S_axis0 = math.apply(S, 0, sum);

                S = math.dotDivide(S, math.multiply(e, math.matrix([sum_S_axis0])));
                SSt = math.multiply(S, math.transpose(S));

                let SSE_temp = math.subtract(SST, math.multiply(2, math.sum(math.dotMultiply(XCtX,S)))); 
                
                SSE = math.add(SSE_temp, math.sum(math.dotMultiply(CtXtXC,SSt)));

                if (SSE <= (SSE_old * (1 + (math.pow(10, -9))))) {
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
        let g = 0;
        
        let alphaC_old = 0;
        
        let XCt = 0;

        let SSE_old = 0;
        
        let alphaC = 0;
        
        let Ct = 0;

        let CtXtXC = 0;

        let M = C._size;

        let J = parseInt(M[0], 10);

        let noc = parseInt(M[1],10);

        const sum = math.sum;

        if (delta != 0) {
            alphaC = math.apply(C, 0, sum);
            alphaC = math.dotDivide(1,alphaC);
            C = math.multiply(C, math.diag(alphaC));
        }

        let e = math.ones(J, 1);

        let XtXSt = math.multiply(math.transpose(X), XSt);

        for (let k = 0; k < niter; k++) {
            SSE_old = SSE;

            let g_temp1 = math.multiply(XC,SSt);
            let g_temp2 = math.multiply(math.transpose(X), g_temp1)

            let g_temp3 = math.subtract(g_temp2,XtXSt); 
            g = math.divide(g_temp3, SST);

            if (delta != 0) {
                g = math.multiply(g, math.diag(alphaC))
            }
            
            g_temp1 = math.dotMultiply(g,C);

            g_temp2 = math.matrix([math.apply(g_temp1,0,sum)]);

            g = math.subtract(g, math.multiply(e,g_temp2));

            let C_old = C;
            while (true) {
                C = math.subtract(C_old, math.dotMultiply(muC,g));

                for (let p = 0; p < C._data.length; p++) {
                    for (let n = 0; n < C._data[p].length; n++) {
                        if (C._data[p][n] < 0) {
                            C._data[p][n] = 0;     // possible can be improved with numjs
                        }
                    }
                }

                let nC_temp = math.matrix([math.apply(C, 0, sum)]);

                let nC = math.add(nC_temp, Number.EPSILON);
                let one_div_nC = math.dotDivide(1,math.matrix(nC._data[0]));
                let one_div_nC_diag = math.diag(one_div_nC);

                C = math.multiply(C, one_div_nC_diag);

                if (delta != 0) {
                    Ct = math.multiply(C, math.diag(alphaC));
                }
                else {
                    Ct = C;
                }

                XC = math.multiply(X, Ct);
                CtXtXC = math.multiply(math.transpose(XC), XC);

                let XC_mult_XSt = math.dotMultiply(XC,XSt);

                let XC_mult_XSt_sum = math.sum(XC_mult_XSt);

                let SSE_temp = math.subtract(SST,math.multiply(2,XC_mult_XSt_sum));

                let CtXtXC_mult_SSt = math.dotMultiply(CtXtXC,SSt);
 
                SSE = math.add(SSE_temp, math.sum(CtXtXC_mult_SSt));

                if (SSE <= (SSE_old * (1 + (math.pow(10, -9))))) {
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
                let g_temp2 = math.dotDivide(g_temp1,alphaC);
                let g_temp3 = math.sum(math.dotMultiply(C,XtXSt));
                let g_temp4 = math.subtract(g_temp2,g_temp3);
                let g_temp5 = math.multiply(SST,J)
                let g = math.dotDivide(g_temp4, g_temp5);

                alphaC_old = alphaC;

                while (true) {
                    alphaC = math.subtract(alphaC_old, math.multiply(mualpha,g));

                    for (let p = 0; p < alphaC._data.length; p++) {
                        if (alphaC._data[p] < 1 - delta) {
                            alphaC._data[p] = 1 - delta;
                        }
                        if (alphaC._data[p] > 1 + delta) {
                            alphaC._data[p] = 1 + delta;
                        }
                    }

                    let alphaC_div_alphaC_old = math.dotDivide(alphaC,alphaC_old);

                    XCt = math.multiply(XC, math.diag(alphaC_div_alphaC_old));

                    CtXtXC = math.multiply(math.transpose(XCt), XCt);

                    let XCt_mult_Xst = math.dotMultiply(XCt, XSt);

                    let XCt_mult_XSt_sum = math.sum(XCt_mult_Xst);

                    let SSE_temp = math.subtract(SST,math.multiply(2,XCt_mult_XSt_sum));
                    SSE = math.add(SSE_temp, math.sum(math.dotMultiply(CtXtXC,SSt)));

                    if (SSE <= (SSE_old * (1 + (math.pow(10, -9))))) {
                        mualpha = math.multiply(mualpha,1.2);
                        XC = XCt;
                        break;
                    }
                    else {
                        mualpha = math.divide(mualpha,2);
                    }   
                }
            }
        }
        if (delta != 0) {
            C = math.multiply(C,math.diag(alphaC));
        }
        return [C, SSE, muC, mualpha, CtXtXC, XC];
    }

    repmat (matrix, repeat_rows, repeat_cols) {   
        const concat = math.concat;

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

        let I = parseInt(M._data[0], 10);

        let J = parseInt(M._data[1],10);

        let index = math.range(0,J);

        let ini_obs_num = ini_obs[0];

        index._data[ini_obs_num] = -1;
        index = index._data;

        let ind_t = ini_obs[0];

        let sum_dist = math.zeros(1,J);

        if (J > noc * I) {
            let Kt = K;
            let Kt_2 = math.apply(math.square(Kt), 0, sum);

            for (let k = 1; k < noc + 11; k++) {
                if (k > noc - 1) { 
                    let Kt_col = math.column(Kt,ini_obs[0]);

                    let Kt_col_arr = [Kt_col._data[0]];

                    for (let p = 1; p < Kt_col._size[0]; p++) {
                        Kt_col_arr = math.concat(Kt_col_arr, [Kt_col._data[p]]);
                    }

                    let Kt_col_matrix = math.matrix(Kt_col_arr);

                    let Kq = math.multiply(Kt_col_matrix, Kt);

                    let Kt_2_arr = [Kt_2._data[0]];

                    for (let p = 1; p < Kt_2._data.length; p++) {
                        Kt_2_arr = math.concat(Kt_2_arr, [Kt_2._data[p]]);
                    }

                    let Kt_2_matrix = math.matrix([Kt_2_arr]);

                    let sum_dist_temp1 = math.subtract(Kt_2_matrix, math.multiply(2,Kq));

                    let Kt2_obs_arr = [];

                    for (let p = 0; p < Kt_2_arr.length; p++) {
                        let Kt2_obs = Kt_2._data[ini_obs[0]];
                        Kt2_obs_arr.push(Kt2_obs);
                    }

                    let Kt2_obs_matrix = math.matrix([Kt2_obs_arr]);

                    let sum_dist_temp2 = math.add(sum_dist_temp1, Kt2_obs_matrix);
                    let sum_dist_temp3 = math.sqrt(sum_dist_temp2);
                    
                    sum_dist = math.subtract(sum_dist,sum_dist_temp3);

                    ini_obs_num = ini_obs[0];
                    index[ini_obs_num] = ini_obs[0];

                    ini_obs = ini_obs.slice(1);
                }
                let t = index.filter(function (value) {
                    return value !== -1;
                });
      
                let Kt_ind_t = math.column(Kt, ind_t);

                let Kq = math.multiply(math.transpose(Kt_ind_t), Kt);

                let Kq_2 = math.multiply(2,Kq);

                let Kt_2_arr = [];

                for (let p = 0; p < Kt_2._data.length; p++) {
                    Kt_2_arr.push(Kt_2._data[p]);
                }

                let Kt_2_matrix = math.matrix([Kt_2_arr]);

                let sum_dist_temp1 = math.subtract(Kt_2_matrix, Kq_2);

                let Kt2_ind_t_arr = [];

                for (let p = 0; p < Kt_2_arr.length; p++) {
                    let Kt2_ind_t = Kt_2._data[ind_t];
                    Kt2_ind_t_arr.push(Kt2_ind_t);
                }

                let Kt2_ind_t_matrix = math.matrix([Kt2_ind_t_arr]);

                let sum_dist_temp2 = math.add(sum_dist_temp1, Kt2_ind_t_matrix);
                let sum_dist_temp3 = math.sqrt(sum_dist_temp2);

                sum_dist = math.add(sum_dist, sum_dist_temp3);

                let ind = 0;
                let val = Number.NEGATIVE_INFINITY;

                for (let p = 0; p < t.length; p++) {
                    let ind = t[p];
                    let val_2 = math.column(sum_dist,t[p]).re;

                    if (val_2 > val) {
                        val = val_2;
                        ind = t[p];   // possible issue
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
                    Kt2_ind_t_arr.push(Kt2_ind_t);
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

                    if (val_2 > val) {
                        val = val_2;
                        ind = t[p];   // possible issue
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