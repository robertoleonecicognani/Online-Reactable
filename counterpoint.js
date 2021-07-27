export function counterpoint_1(in_array) {
    const allowed_intervals = ['P1', 'm3', 'M3', 'm6', 'M6', 'P5', 'P8', 'm10', 'M10', 'P12'
        //, 'm13', 'M13', 'P15'
    ];
    const tonic = in_array[0];
    const scale = teoria.scale(tonic, 'major');

    var out_array = []; //we initialize the output array as empty
    var in_intervals = []; //intervals between cantus firmus (cf) notes
    var out_intervals = []; //intervals between counterpoint (cp) notes
    var cfcp_intervals = []; //intervals between cf and cp notes for every index

    var jump_cont = 0;

    var fill = function (index) { //this function chooses a note at a given index and adds it to output_array
        var poss_pref = []; //array of preferred possibilites
        var poss_non_pref = []; //non preferred possibilities
        if (out_array.length == in_array.length) { //if we get to the end
            return;
        }

        var cf_note = teoria.note(in_array[index]);

        for (let i = 0; i < allowed_intervals.length; i++) {  //we loop for every allowed interval from cf
            //console.log(poss);
            var candidate = cf_note.interval(allowed_intervals[i]); //we select a candidate with an allowed distance from the cf note

            var check = check_conditions(cf_note, candidate, in_array, out_array, index, scale, cfcp_intervals, in_intervals, out_intervals, jump_cont) //checking conditions

            if (check != false) { //if note passes the test
                var preferred = check[1];
                if (preferred) { poss_pref.push(candidate.toString()) }
                else poss_non_pref.push(candidate.toString()); //we add to the array of possible candidates
            }
        }

        shuffle(poss_pref); //we put the elements of the array in random order
        shuffle(poss_non_pref);

        var poss = poss_non_pref.concat(poss_pref); //we concatenate: preferred notes will come first

        if (choose_random(2)) shuffle(poss); //we choose randomly to apply preference or not

        while (poss.length != 0) { //while there are possibilities
            console.log('poss for index ' + index, poss);
            const chosen = poss.pop(); //we chose random candidate, last one of the list
            out_array.push(chosen); //we add the chosen candidate to the out_array
            var cp_note = teoria.note(chosen);
            if (index > 0) {

                //out_intervals
                var prev_cp_note = teoria.note(out_array[index - 1]);
                var out_int = teoria.interval.between(prev_cp_note, cp_note);
                out_intervals.push(out_int);

                //in_intervals
                var prev_cf_note = teoria.note(in_array[index - 1]);
                var in_int = teoria.interval.between(prev_cf_note, cf_note);
                in_intervals.push(in_int);
            }

            var cfcp_int = teoria.interval.between(cf_note, cp_note);
            cfcp_intervals.push(cfcp_int);

            console.log('chosen for index: ' + index, chosen);
            console.log('out intervals: ' + out_intervals);
            console.log('in intervals: ' + in_intervals);
            console.log('cfcp intervals: ' + cfcp_intervals);

            fill(index + 1); //self-reference, we execute function for next index

            if (out_array.length == in_array.length) { //if we get to the end...
                return;
            }

            out_array.pop(); //we get rid of the last candidate we chose and try another one
            in_intervals.pop();
            out_intervals.pop();
            cfcp_intervals.pop();
        }

        if (poss.length == 0) {
            console.log('no possibilities for index = ' + index); //if there are no more candidates
            return;
        }

    }
    fill(0); //we start checking for candidates from index = 0
    return out_array;







    function choose_random(max_index) {
        const index = Math.floor(Math.random() * max_index);
        return index;
    }



    function check_conditions(cf_note, cp_note, in_array, out_array, index, scale, cfcp_intervals, in_intervals, out_intervals) {
        const total_length = in_array.length;
        const ver_interval = teoria.interval.between(cf_note, cp_note);
        //console.log(interval.toString());

        var pref = false;

        //cond 1: belongs to scale
        if (!cp_note.scaleDegree(scale)) return false;

        //cond 2: if index = 0 only P5 and P8
        if (index == 0 && !['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())) return false;


        if (index > 0) { //for all notes after the first

            const prev_cp = teoria.note(out_array[index - 1]);
            const prev_cf = teoria.note(in_array[index - 1]);
            const prev_interval = cfcp_intervals[cfcp_intervals.length - 1];
            const hor_cp_interval = teoria.interval.between(prev_cp, cp_note);
            const hor_cf_interval = teoria.interval.between(prev_cf, cf_note);

            //cond3: P1 not admissible but at the end
            if (ver_interval == 'P1' && index != total_length - 1) return false;

            //cond4: No consecutive P5 or P8
            if (['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())) {
                if (ver_interval.equal(prev_interval)) return false;
            }

            //cond5: Only unison and P8 for last note
            if (index == total_length - 1) {
                if (!['P1', 'P8'].includes(ver_interval.toString())) return false;

                //cond6: Last note must be approached by semitone
                if (hor_cp_interval != 'm2') return false;

            }


            //cond6: allowed jumps
            if (['M6', 'M-6', 'm-6', 'M7', 'm7', 'M-7', 'm-7'].includes(hor_cp_interval.toString())) return false;
            if (hor_cp_interval.number() > 8) return false;

            //cond7: no two consecutive notes being the same
            if (cp_note.toString() == prev_cp.toString()) return false;


            //cond8: perfect intervals approached by opposite motion
            if (
                ver_interval.quality() == 'P' &&
                hor_cp_interval.direction() == hor_cf_interval.direction() &&
                hor_cp_interval.value() != 2
            ) return false;

            //cond9: no d5 or A (JUST FOR CP1)

            if (['d', 'A'].includes(hor_cp_interval.quality())) return false;


            if (index > 1) {
                const hor_cf_interval = teoria.interval.between(prev_cf, cf_note);

                //cond10 and 11: leaps higher than 5th must be between changes of direction
                if (
                    hor_cp_interval.number() > 5 &&
                    out_intervals[index - 2].direction() == hor_cp_interval.direction()
                ) return false;

                if (
                    out_intervals[index - 2].number() > 5 &&
                    out_intervals[index - 2].direction() == hor_cp_interval.direction()
                ) return false;


                const last_interval = cfcp_intervals[index - 1];
                const sec_last_interval = cfcp_intervals[index - 2];



                //cond13: two leaps don't go above an 8th
                if (Math.abs(out_intervals[index - 2].value() + hor_cp_interval.value()) > 9) return false;

                //cond14: no 4-3 or 4-5 ascending
                if (out_intervals[index - 2].value() == 4
                    && hor_cp_interval.value() == 3
                ) return false

                if (out_intervals[index - 2].value() == 4
                    && hor_cp_interval.value() == 5
                ) return false


                //cond15: no returning to the same note by jump
                if (
                    out_array[index - 2].toString() == cp_note.toString()
                    && hor_cp_interval.number() > 2
                ) return false;

                /*
                //cond16: at least two setp motions after jumps
                if (
                  hor_cp_interval.number() > 2
                  && out_intervals[index-2].number() == 2
                  && out_intervals[index-3].number() > 2
                )
                */

                //PREFERENCE FOR STEP-WISE MOTION
                if (hor_cp_interval.number() == 2
                    //&& hor_cp_interval.direction() != hor_cf_interval.direction()
                    //&& hor_cp_interval.direction() == out_intervals[index-2].direction()
                ) {
                    pref = true;
                    console.log('preferred: ' + cp_note)
                }

                if (index > 2) {
                    const th_last_interval = cfcp_intervals[index - 3];

                    //cond12: no more than 3 6ths or 3ths in succession
                    if (
                        [3, 6, 10, 13].includes(th_last_interval.number())
                        && th_last_interval.value() == sec_last_interval.value()
                        && sec_last_interval.value() == last_interval.value()
                        && last_interval.value() == ver_interval.value()
                    ) return false;


                    //cond14: no three consecutive jumps

                    if (
                        hor_cp_interval.number() > 2
                        && out_intervals[index - 2].number() > 2
                        && out_intervals[index - 3].number() > 2
                    ) return false;



                    if (index > 3) {

                        //cond15: no 'trills'
                        if (
                            hor_cp_interval.direction() != out_intervals[index - 2].direction()
                            && hor_cp_interval.direction() == out_intervals[index - 3].direction()
                            && out_intervals[index - 2].number() == 2
                            && out_intervals[index - 3].number() == 2
                            && hor_cp_interval.number() == 2
                        ) {
                            return false;
                        }

                    }


                }

            }

        }


        return [true, pref];
    }



    function shuffle(array) {
        array = array.sort(() => Math.random() - 0.5);
        return array;
    }



}









export function counterpoint_2(in_array) {

    const cons_intervals = ['P1', 'm3', 'M3', 'm6', 'M6', 'P5', 'P8', 'm10', 'M10', 'P12'
        //, 'm13', 'M13', 'P15'
    ];
    const diss_intervals = ['m2', 'M2', 'P4', 'A4', 'd5', 'm7', 'M7', 'm9', 'M9', 'P11', 'A11', 'd12']


    const all_intervals = cons_intervals.concat(diss_intervals);



    const notes_ratio = 2;
    const in_length = in_array.length;
    const out_length = notes_ratio * (in_length - 1) + 1;
    const tonic = in_array[0];
    const scale = teoria.scale(tonic, 'major');

    var out_array = []; //we initialize the output array as empty
    var in_intervals = []; //intervals between cantus firmus (cf) notes
    var out_intervals = []; //intervals between counterpoint (cp) notes
    var cfcp_intervals = []; //intervals between cf and cp notes for every index


    //intervals in cf
    for (let i = 1; i < in_array.length; i++) {
        var note = teoria.note(in_array[i]);
        var prev_note = teoria.note(in_array[i - 1]);
        var in_int = teoria.interval.between(prev_note, note);
        in_intervals.push(in_int);
    }


    var fill = function (out_index) { //this function chooses a note at a given out index and adds it to output_array

        const in_index = Math.floor(out_index / notes_ratio);

        const upbeat = (out_index) % notes_ratio; //check if it's downbeat or upbeat

        var poss_pref = []; //array of preferred possibilites
        var poss_non_pref = []; //non preferred possibilities
        if (out_array.length == out_length) { //if we get to the end CP2
            return;
        }

        var allowed_intervals = all_intervals;
        if (!upbeat) {
            allowed_intervals = cons_intervals
        }


        var cf_note = teoria.note(in_array[in_index]); //we chose the note in corr with index

        for (let i = 0; i < allowed_intervals.length; i++) {  //we loop for every allowed interval from cf
            //console.log(poss);
            var candidate = cf_note.interval(allowed_intervals[i]); //we select a candidate with an allowed distance from the cf note

            //console.log('checking for:' +candidate)

            var check = check_conditions(notes_ratio, !upbeat, cf_note, candidate, in_array, out_array, in_index, out_index, scale, cfcp_intervals, in_intervals, out_intervals) //checking conditions

            if (check != false) { //if note passes the test
                var preferred = check[1];
                if (preferred) { poss_pref.push(candidate.toString()) }
                else poss_non_pref.push(candidate.toString()); //we add to the array of possible candidates
            }
        }

        shuffle(poss_pref); //we put the elements of the array in random order
        shuffle(poss_non_pref);

        var poss = poss_non_pref.concat(poss_pref); //we concatenate: preferred notes will come first

        //if (choose_random(2)) shuffle(poss); //we choose randomly to apply preference or not

        while (poss.length != 0) { //while there are possibilities
            console.log('poss for index ' + out_index, poss);
            const chosen = poss.pop(); //we chose random candidate, last one of the list
            out_array.push(chosen); //we add the chosen candidate to the out_array
            var cp_note = teoria.note(chosen);
            if (out_index > 0) {

                //out_intervals
                var prev_cp_note = teoria.note(out_array[out_index - 1]);
                var out_int = teoria.interval.between(prev_cp_note, cp_note);
                out_intervals.push(out_int);

                //in_intervals
                /*
                if (downbeat) {
                  var prev_cf_note = teoria.note(in_array[in_index-1]);
                  var in_int  = teoria.interval.between(prev_cf_note, cf_note);
                  in_intervals.push(in_int);  
                }
                */
            }

            var cfcp_int = teoria.interval.between(cf_note, cp_note);
            cfcp_intervals.push(cfcp_int);

            console.log('chosen for index: ' + out_index, chosen);
            console.log('out intervals: ' + out_intervals);
            //console.log('in intervals: '+in_intervals);
            console.log('cfcp intervals: ' + cfcp_intervals);

            fill(out_index + 1); //self-reference, we execute function for next index

            if (out_array.length == out_length) { //if we get to the end...
                return;
            }

            out_array.pop(); //we get rid of the last candidate we chose and try another one
            //in_intervals.pop();
            out_intervals.pop();
            cfcp_intervals.pop();
        }

        if (poss.length == 0) {
            console.log('no possibilities for index = ' + out_index); //if there are no more candidates
            return;
        }

    }
    fill(0); //we start checking for candidates from index = 0
    return out_array;







    function choose_random(max_index) {
        const index = Math.floor(Math.random() * max_index);
        return index;
    }



    function check_conditions(notes_ratio, downbeat, cf_note, cp_note, in_array, out_array, in_index, out_index, scale, cfcp_intervals, in_intervals, out_intervals) {

        const total_out_length = notes_ratio * (in_array.length - 1) + 1;
        const ver_interval = teoria.interval.between(cf_note, cp_note);
        //console.log(interval.toString());

        var pref = false;

        //cond 1: belongs to scale
        if (!cp_note.scaleDegree(scale)) return false;

        //cond 2: if index = 0 only P5 and P8
        if (out_index == 0 && !['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())) return false;


        if (out_index > 0) { //for all notes after the first


            const prev_cp = teoria.note(out_array[out_index - 1]);
            //const prev_cf = teoria.note(in_array[index-1]);
            const prev_interval = cfcp_intervals[out_index - 1];
            const hor_cp_interval = teoria.interval.between(prev_cp, cp_note);
            //const hor_cf_interval = teoria.interval.between(prev_cf, cf_note);




            //cond3: P1 not ammissible but at the end
            if (ver_interval == 'P1' && out_index != total_out_length - 1) return false;

            //cond4: No consecutive P5 or P8
            if (
                ['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())
                && ver_interval.equal(prev_interval)
            ) return false;



            //cond5: Only unison and P8 for last note
            if (out_index == total_out_length - 1) {
                if (!['P1', 'P8'].includes(ver_interval.toString())) return false;

                //cond6: Last note must be approached by semitone
                if (hor_cp_interval != 'm2') return false;

            }


            //cond6: allowed jumps
            if (['M6', 'M-6', 'm-6', 'M7', 'm7', 'M-7', 'm-7'].includes(hor_cp_interval.toString())) return false;
            if (hor_cp_interval.number() > 8) return false;

            //cond7: no two consecutive notes being the same
            if (cp_note.toString() == prev_cp.toString()) return false;





            //cond9: no d5 or A jumps

            if (['d', 'A'].includes(hor_cp_interval.quality())) return false;


            if (out_index > 1) {



                const prev_cf = teoria.note(in_array[in_index - 1]);
                const hor_cf_interval = teoria.interval.between(prev_cf, cf_note);

                const sec_prev_interval = cfcp_intervals[out_index - 2];

                //cond4: No consecutive P5 or P8 between two downbeats CP2
                if (
                    ['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())
                    && ver_interval.equal(sec_prev_interval)
                ) return false;


                //COND FOR DISSONANCE: APPROACHED AND LEFT BY STEPWISE MOTION IN THE SAME DIRECTION
                if (diss_intervals.includes(prev_interval.toString())) {
                    if (
                        hor_cp_interval.direction() != out_intervals[out_index - 2].direction()
                        || hor_cp_interval.number() > 2
                        || out_intervals[out_index - 2].number() > 2
                    ) return false;
                }



                //cond8: perfect intervals approached by opposite motion
                if (
                    ver_interval.quality() == 'P' &&
                    hor_cp_interval.direction() == hor_cf_interval.direction() &&
                    hor_cp_interval.value() != 2
                ) return false;



                //cond10 and 11: leaps higher than 5th must be between changes of direction
                if (
                    hor_cp_interval.number() > 5 &&
                    out_intervals[out_index - 2].direction() == hor_cp_interval.direction()
                ) return false;

                if (
                    out_intervals[out_index - 2].number() > 5 &&
                    out_intervals[out_index - 2].direction() == hor_cp_interval.direction()
                ) return false;





                //cond13: two leaps don't go above an 8th
                if (Math.abs(out_intervals[out_index - 2].value() + hor_cp_interval.value()) > 9) return false;

                //cond14: no 4-3 or 4-5 ascending
                if (out_intervals[out_index - 2].value() == 4
                    && hor_cp_interval.value() == 3
                ) return false

                if (out_intervals[out_index - 2].value() == 4
                    && hor_cp_interval.value() == 5
                ) return false


                //cond15: no returning to the same note by jump
                if (
                    out_array[out_index - 2].toString() == cp_note.toString()
                    && hor_cp_interval.number() > 2
                ) return false;

                /*
                //cond16: at least two setp motions after jumps
                if (
                  hor_cp_interval.number() > 2
                  && out_intervals[index-2].number() == 2
                  && out_intervals[index-3].number() > 2
                )
                */

                //PREFERENCE FOR STEP-WISE MOTION
                if (hor_cp_interval.number() == 2
                    //&& hor_cp_interval.direction() != hor_cf_interval.direction()
                    //&& hor_cp_interval.direction() == out_intervals[index-2].direction()
                ) {
                    pref = true;
                    console.log('preferred: ' + cp_note)
                }

                if (out_index > 2) {


                    //cond14: no three consecutive jumps

                    if (
                        hor_cp_interval.number() > 2
                        && out_intervals[out_index - 2].number() > 2
                        && out_intervals[out_index - 3].number() > 2
                    ) return false;



                    if (out_index > 3) {

                        //cond15: no 'trills'
                        if (
                            hor_cp_interval.direction() != out_intervals[out_index - 2].direction()
                            && hor_cp_interval.direction() == out_intervals[out_index - 3].direction()
                            && hor_cp_interval.direction() != out_intervals[out_index - 4].direction()
                            && out_intervals[out_index - 2].number() == 2
                            && out_intervals[out_index - 3].number() == 2
                            && out_intervals[out_index - 4].number() == 2
                        ) return false;


                    }


                }

            }

        }


        return [true, pref];
    }



    function shuffle(array) {
        array = array.sort(() => Math.random() - 0.5);
        return array;
    }




}






export function counterpoint_3(in_array) {


    const cons_intervals = ['P1', 'm3', 'M3', 'm6', 'M6', 'P5', 'P8', 'm10', 'M10', 'P12'
        //, 'm13', 'M13', 'P15'
    ];

    const diss_intervals = ['m2', 'M2', 'P4', 'A4', 'd5', 'm7', 'M7', 'm9', 'M9', 'P11', 'A11', 'd12']


    const all_intervals = cons_intervals.concat(diss_intervals);



    const notes_ratio = 4;
    const in_length = in_array.length;
    const out_length = notes_ratio * (in_length - 1) + 1;
    const tonic = in_array[0];
    const scale = teoria.scale(tonic, 'major');

    var out_array = []; //we initialize the output array as empty
    var in_intervals = []; //intervals between cantus firmus (cf) notes
    var out_intervals = []; //intervals between counterpoint (cp) notes
    var cfcp_intervals = []; //intervals between cf and cp notes for every index


    //intervals in cf
    for (let i = 1; i < in_array.length; i++) {
        var note = teoria.note(in_array[i]);
        var prev_note = teoria.note(in_array[i - 1]);
        var in_int = teoria.interval.between(prev_note, note);
        in_intervals.push(in_int);
    }


    var fill = function (out_index) { //this function chooses a note at a given out index and adds it to output_array

        const in_index = Math.floor(out_index / notes_ratio);

        const upbeat = (out_index) % notes_ratio; //check if it's downbeat or upbeat

        var poss_pref = []; //array of preferred possibilites
        var poss_non_pref = []; //non preferred possibilities
        if (out_array.length == out_length) { //if we get to the end CP2
            return;
        }

        var allowed_intervals = all_intervals;
        if (!upbeat) {
            allowed_intervals = cons_intervals
        }


        var cf_note = teoria.note(in_array[in_index]); //we chose the note in corr with index

        for (let i = 0; i < allowed_intervals.length; i++) {  //we loop for every allowed interval from cf
            //console.log(poss);
            var candidate = cf_note.interval(allowed_intervals[i]); //we select a candidate with an allowed distance from the cf note

            //console.log('checking for:' +candidate)

            var check = check_conditions(notes_ratio, !upbeat, cf_note, candidate, in_array, out_array, in_index, out_index, scale, cfcp_intervals, in_intervals, out_intervals) //checking conditions

            if (check != false) { //if note passes the test
                var preferred = check[1];
                if (preferred) { poss_pref.push(candidate.toString()) }
                else poss_non_pref.push(candidate.toString()); //we add to the array of possible candidates
            }
        }

        shuffle(poss_pref); //we put the elements of the array in random order
        shuffle(poss_non_pref);

        var poss = poss_non_pref.concat(poss_pref); //we concatenate: preferred notes will come first

        //if (choose_random(2)) shuffle(poss); //we choose randomly to apply preference or not

        while (poss.length != 0) { //while there are possibilities
            console.log('poss for index ' + out_index, poss);
            const chosen = poss.pop(); //we chose random candidate, last one of the list
            out_array.push(chosen); //we add the chosen candidate to the out_array
            var cp_note = teoria.note(chosen);
            if (out_index > 0) {

                //out_intervals
                var prev_cp_note = teoria.note(out_array[out_index - 1]);
                var out_int = teoria.interval.between(prev_cp_note, cp_note);
                out_intervals.push(out_int);

                //in_intervals
                /*
                if (downbeat) {
                  var prev_cf_note = teoria.note(in_array[in_index-1]);
                  var in_int  = teoria.interval.between(prev_cf_note, cf_note);
                  in_intervals.push(in_int);  
                }
                */
            }

            var cfcp_int = teoria.interval.between(cf_note, cp_note);
            cfcp_intervals.push(cfcp_int);

            console.log('chosen for index: ' + out_index, chosen);
            console.log('out intervals: ' + out_intervals);
            //console.log('in intervals: '+in_intervals);
            console.log('cfcp intervals: ' + cfcp_intervals);

            fill(out_index + 1); //self-reference, we execute function for next index

            if (out_array.length == out_length) { //if we get to the end...
                return;
            }

            out_array.pop(); //we get rid of the last candidate we chose and try another one
            //in_intervals.pop();
            out_intervals.pop();
            cfcp_intervals.pop();
        }

        if (poss.length == 0) {
            console.log('no possibilities for index = ' + out_index); //if there are no more candidates
            return;
        }

    }
    fill(0); //we start checking for candidates from index = 0
    return out_array;







    function choose_random(max_index) {
        const index = Math.floor(Math.random() * max_index);
        return index;
    }



    function check_conditions(notes_ratio, downbeat, cf_note, cp_note, in_array, out_array, in_index, out_index, scale, cfcp_intervals, in_intervals, out_intervals) {

        const total_out_length = notes_ratio * (in_array.length - 1) + 1;
        const ver_interval = teoria.interval.between(cf_note, cp_note);
        //console.log(interval.toString());

        var pref = false;

        //cond 1: belongs to scale
        if (!cp_note.scaleDegree(scale)) return false;

        //cond 2: if index = 0 only P5 and P8
        if (out_index == 0 && !['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())) return false;


        if (out_index > 0) { //for all notes after the first


            const prev_cp = teoria.note(out_array[out_index - 1]);
            //const prev_cf = teoria.note(in_array[index-1]);
            const prev_interval = cfcp_intervals[out_index - 1];
            const hor_cp_interval = teoria.interval.between(prev_cp, cp_note);
            //const hor_cf_interval = teoria.interval.between(prev_cf, cf_note);




            //cond3: P1 not ammissible but at the end
            if (ver_interval == 'P1' && out_index != total_out_length - 1) return false;

            //cond4: No consecutive P5 or P8
            if (
                ['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())
                && ver_interval.equal(prev_interval)
            ) return false;



            //cond5: Only unison and P8 for last note
            if (out_index == total_out_length - 1) {
                if (!['P1', 'P8'].includes(ver_interval.toString())) return false;

                //cond6: Last note must be approached by semitone
                if (hor_cp_interval != 'm2') return false;

            }


            //cond6: allowed jumps
            if (['M6', 'M-6', 'm-6', 'M7', 'm7', 'M-7', 'm-7'].includes(hor_cp_interval.toString())) return false;
            if (hor_cp_interval.number() > 8) return false;

            //cond7: no two consecutive notes being the same
            if (cp_note.toString() == prev_cp.toString()) return false;





            //cond9: no d5 or A jumps

            if (['d', 'A'].includes(hor_cp_interval.quality())) return false;



            //FIRST CONDITION FOR DISSONANCE
            if (
                diss_intervals.includes(ver_interval.toString())
            ) {
                if (hor_cp_interval.number() > 2) return false;
            }



            if (out_index > 1) {




                const sec_prev_interval = cfcp_intervals[out_index - 2];
                /*
                //cond4: No consecutive P5 or P8 between two downbeats CP2
                if (
                  ['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())
                  && ver_interval.equal(sec_prev_interval)
                  ) return false;
                */
                /*
                //COND FOR DISSONANCE: APPROACHED AND LEFT BY STEPWISE MOTION IN THE SAME DIRECTION
                if (diss_intervals.includes(prev_interval.toString())) {
                  if (
                    hor_cp_interval.direction() != out_intervals[out_index-2].direction()
                    || hor_cp_interval.number() > 2
                    || out_intervals[out_index-2].number() > 2
                  ) return false;
                }
                */


                // PASSING NOTES AND NEIGHBOR NOTES
                if (
                    diss_intervals.includes(ver_interval.toString())
                    && diss_intervals.includes(prev_interval.toString())
                ) {
                    if (
                        out_intervals[index - 2].value() > 2
                        || hor_cp_interval.direction() != out_intervals[index - 2].direction()
                    ) return false;
                }


                if (
                    cons_intervals.includes(cp_note)
                    && diss_intervals.includes(prev_cp)
                ) {
                    if (
                        hor_cp_interval.value() > 2
                        || out_intervals[index - 2].value() > 2
                    ) return false;
                }



                //cond10 and 11: leaps higher than 5th must be between changes of direction
                if (
                    hor_cp_interval.number() > 5 &&
                    out_intervals[out_index - 2].direction() == hor_cp_interval.direction()
                ) return false;

                if (
                    out_intervals[out_index - 2].number() > 5 &&
                    out_intervals[out_index - 2].direction() == hor_cp_interval.direction()
                ) return false;



                //cond13: two leaps don't go above an 8th
                if (Math.abs(out_intervals[out_index - 2].value() + hor_cp_interval.value()) > 9) return false;

                //cond14: no 4-3 or 4-5 ascending
                if (out_intervals[out_index - 2].value() == 4
                    && hor_cp_interval.value() == 3
                ) return false

                if (out_intervals[out_index - 2].value() == 4
                    && hor_cp_interval.value() == 5
                ) return false


                //cond15: no returning to the same note by jump
                if (
                    out_array[out_index - 2].toString() == cp_note.toString()
                    && hor_cp_interval.number() > 2
                ) return false;

                /*
                //cond16: at least two setp motions after jumps
                if (
                  hor_cp_interval.number() > 2
                  && out_intervals[index-2].number() == 2
                  && out_intervals[index-3].number() > 2
                )
                */


                //PREFERENCE FOR STEP-WISE MOTION
                if (hor_cp_interval.number() == 2
                    //&& hor_cp_interval.direction() != hor_cf_interval.direction()
                    //&& hor_cp_interval.direction() == out_intervals[out_index-2].direction()
                ) {
                    pref = true;
                    console.log('preferred: ' + cp_note)
                }



                if (out_index > 2) {


                    //cond14: no three consecutive jumps

                    if (
                        hor_cp_interval.number() > 2
                        && out_intervals[out_index - 2].number() > 2
                        && out_intervals[out_index - 3].number() > 2
                    ) return false;



                    if (out_index > 3) {
                        const prev_cf = teoria.note(in_array[in_index - 1]);
                        const hor_cf_interval = teoria.interval.between(prev_cf, cf_note);

                        if (
                            hor_cp_interval.direction() != out_intervals[out_index - 2].direction()
                            && hor_cp_interval.direction() == out_intervals[out_index - 3].direction()
                            && hor_cp_interval.direction() != out_intervals[out_index - 4].direction()
                            && out_intervals[out_index - 2].number() == 2
                            && out_intervals[out_index - 3].number() == 2
                            && out_intervals[out_index - 4].number() == 2
                        ) return false;


                        //AFTER 4 cond8: perfect intervals approached by opposite motion
                        if (
                            out_index % notes_ratio == 0
                            && ver_interval.quality() == 'P'
                            && hor_cp_interval.direction() == hor_cf_interval.direction()
                            && hor_cp_interval.value() != 2
                        ) return false;



                        //cond15: no 'trills'
                        if (
                            hor_cp_interval.direction() != out_intervals[out_index - 2].direction()
                            && hor_cp_interval.direction() == out_intervals[out_index - 3].direction()
                            && hor_cp_interval.direction() != out_intervals[out_index - 4].direction()
                            && out_intervals[out_index - 2].number() == 2
                            && out_intervals[out_index - 3].number() == 2
                            && out_intervals[out_index - 4].number() == 2
                        ) return false;







                    }


                }

            }

        }


        return [true, pref];
    }



    function shuffle(array) {
        array = array.sort(() => Math.random() - 0.5);
        return array;
    }

}






export function counterpoint_4(in_array) {


    const cons_intervals = ['P1', 'm3', 'M3', 'm6', 'M6', 'P5', 'P8', 'm10', 'M10', 'P12'
        //, 'm13', 'M13', 'P15'
    ];
    const diss_intervals = ['m2', 'M2', 'P4', 'A4', 'd5', 'm7', 'M7', 'm9', 'M9', 'P11', 'A11', 'd12']

    const all_intervals = cons_intervals.concat(diss_intervals);


    const chant_ar = ['C3', 'E3', 'D3', 'F3', 'E3', 'G3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3']; //test cantus firmus

    //allowed consonant intervals according to rules of CP1



    const allowed_intervals = cons_intervals;
    const tonic = in_array[0];
    const scale = teoria.scale(tonic, 'major');

    var jump_cont = 0;

    var out_array = []; //we initialize the output array as empty
    var in_intervals = []; //intervals between cantus firmus (cf) notes
    var out_intervals = []; //intervals between counterpoint (cp) notes
    var cfcp_intervals = []; //intervals between cf and cp notes for every index


    var fill = function (index) { //this function chooses a note at a given index and adds it to output_array
        var poss_pref = []; //array of preferred possibilites
        var poss_non_pref = []; //non preferred possibilities
        if (out_array.length == in_array.length) { //if we get to the end
            return;
        }

        var cf_note = teoria.note(in_array[index]);

        for (let i = 0; i < allowed_intervals.length; i++) {  //we loop for every allowed interval from cf
            //console.log(poss);
            var candidate = cf_note.interval(allowed_intervals[i]); //we select a candidate with an allowed distance from the cf note

            var check = check_conditions(cf_note, candidate, in_array, out_array, index, scale, cfcp_intervals, in_intervals, out_intervals, jump_cont) //checking conditions

            if (check != false) { //if note passes the test
                var preferred = check[1];
                if (preferred) { poss_pref.push(candidate.toString()) }
                else poss_non_pref.push(candidate.toString()); //we add to the array of possible candidates
            }
        }

        shuffle(poss_pref); //we put the elements of the array in random order
        shuffle(poss_non_pref);

        var poss = poss_non_pref.concat(poss_pref); //we concatenate: preferred notes will come first

        //if (choose_random(2)) shuffle(poss); //we choose randomly to apply preference or not

        while (poss.length != 0) { //while there are possibilities
            console.log('poss for index ' + index, poss);
            const chosen = poss.pop(); //we chose random candidate, last one of the list
            out_array.push(chosen); //we add the chosen candidate to the out_array
            var cp_note = teoria.note(chosen);
            if (index > 0) {

                //out_intervals
                var prev_cp_note = teoria.note(out_array[index - 1]);
                var out_int = teoria.interval.between(prev_cp_note, cp_note);
                out_intervals.push(out_int);

                //in_intervals
                var prev_cf_note = teoria.note(in_array[index - 1]);
                var in_int = teoria.interval.between(prev_cf_note, cf_note);
                in_intervals.push(in_int);
            }

            var cfcp_int = teoria.interval.between(cf_note, cp_note);
            cfcp_intervals.push(cfcp_int);

            console.log('chosen for index: ' + index, chosen);
            console.log('out intervals: ' + out_intervals);
            console.log('in intervals: ' + in_intervals);
            console.log('cfcp intervals: ' + cfcp_intervals);

            fill(index + 1); //self-reference, we execute function for next index

            if (out_array.length == in_array.length) { //if we get to the end...
                return;
            }

            out_array.pop(); //we get rid of the last candidate we chose and try another one
            in_intervals.pop();
            out_intervals.pop();
            cfcp_intervals.pop();
        }

        if (poss.length == 0) {
            console.log('no possibilities for index = ' + index); //if there are no more candidates
            return;
        }

    }
    fill(0); //we start checking for candidates from index = 0
    return out_array;







    function choose_random(max_index) {
        const index = Math.floor(Math.random() * max_index);
        return index;
    }



    function check_conditions(cf_note, cp_note, in_array, out_array, index, scale, cfcp_intervals, in_intervals, out_intervals) {
        const total_length = in_array.length;
        const ver_interval = teoria.interval.between(cf_note, cp_note);
        //ONLY FOR CP4: ver_int can be preparation or resolution
        //console.log(interval.toString());

        var pref = false;

        //THIS VERSION ADMITS ONLY A REST AT THE BEGINNING, SO IT'S GOT THE COUNTERPOINT STRUCTURE OF CP1 BUT THE CP IS DELAYED OF A HALF-NOTE

        //cond 1: belongs to scale
        if (!cp_note.scaleDegree(scale)) return false;

        //cond 2: if index = 0 only P5 and P8
        if (index == 0 && !['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())) return false;


        if (index > 0) { //for all notes after the first

            const prev_cp = teoria.note(out_array[index - 1]);
            const prev_cf = teoria.note(in_array[index - 1]);
            const prev_interval = cfcp_intervals[cfcp_intervals.length - 1];
            const hor_cp_interval = teoria.interval.between(prev_cp, cp_note);
            const hor_cf_interval = teoria.interval.between(prev_cf, cf_note);

            const syncopation = teoria.interval.between(cf_note, prev_cp); //ONLY FOR CP4!!

            //cond3: P1 not admissible but at the end
            if (ver_interval == 'P1' && index != total_length - 1) return false;

            //cond4: Consecutive P5 or P8 allowed if: 1. separated by consonances
            if (
                ['P5', 'P8', 'P12', 'P15'].includes(ver_interval.toString())
                && ver_interval.equal(prev_interval) //preparation equals resolution
            ) {
                if (
                    !cons_intervals.includes(syncopation.toString())
                ) return false;
            }

            //cond5: Only unison and P8 for last note
            if (index == total_length - 1) {
                if (!['P1', 'P8'].includes(ver_interval.toString())) return false;

                //cond6: Last note must be approached by semitone
                if (hor_cp_interval != 'm2') return false;

            }




            //RULES FOR SUSPENSION AND RESOLUTION

            /*
            if (
              diss_intervals.includes(syncopation.toString())
            ) {
              if (
                !cons_intervals.includes(ver_interval.toString()) //resolution must be consonant
                || !cons_intervals.includes(prev_interval.toString())
              ) return false;
            }
            */
            if (
                [9, 7, 6, 4].includes(syncopation.value())
                && ver_interval.value() == syncopation.value() - 1
            ) { pref = true; console.log('preferred: ' + cp_note); }


            //cond6: allowed jumps
            if (['M6', 'M-6', 'm-6', 'M7', 'm7', 'M-7', 'm-7'].includes(hor_cp_interval.toString())) return false;
            if (hor_cp_interval.number() > 8) return false;

            //cond7: no two consecutive notes being the same
            if (cp_note.toString() == prev_cp.toString()) return false;

            /*
            //cond8: perfect intervals approached by opposite motion
            if (
              ver_interval.quality() == 'P' &&
              hor_cp_interval.direction() == hor_cf_interval.direction() &&
              hor_cp_interval.value() != 2
              ) return false;
              */

            //cond9: no d5 or A

            if (['d', 'A'].includes(hor_cp_interval.quality())) return false;


            if (index > 1) {
                const hor_cf_interval = teoria.interval.between(prev_cf, cf_note);

                //cond10 and 11: leaps higher than 5th must be between changes of direction
                if (
                    hor_cp_interval.number() > 5 &&
                    out_intervals[index - 2].direction() == hor_cp_interval.direction()
                ) return false;

                if (
                    out_intervals[index - 2].number() > 5 &&
                    out_intervals[index - 2].direction() == hor_cp_interval.direction()
                ) return false;


                const last_interval = cfcp_intervals[index - 1];
                const sec_last_interval = cfcp_intervals[index - 2];



                //cond13: two leaps don't go above an 8th
                if (Math.abs(out_intervals[index - 2].value() + hor_cp_interval.value()) > 9) return false;

                //cond14: no 4-3 or 4-5 ascending
                if (out_intervals[index - 2].value() == 4
                    && hor_cp_interval.value() == 3
                ) return false

                if (out_intervals[index - 2].value() == 4
                    && hor_cp_interval.value() == 5
                ) return false


                //cond15: no returning to the same note by jump
                if (
                    out_array[index - 2].toString() == cp_note.toString()
                    && hor_cp_interval.number() > 2
                ) return false;

                /*
                //cond16: at least two setp motions after jumps
                if (
                  hor_cp_interval.number() > 2
                  && out_intervals[index-2].number() == 2
                  && out_intervals[index-3].number() > 2
                )
                */
                /*
                //PREFERENCE FOR STEP-WISE MOTION
                if(hor_cp_interval.number() == 2
                  //&& hor_cp_interval.direction() != hor_cf_interval.direction()
                  //&& hor_cp_interval.direction() == out_intervals[index-2].direction()
                  )
                {
                  pref = true;
                  console.log('preferred: '+ cp_note)
                }
                */
                if (index > 2) {
                    const th_last_interval = cfcp_intervals[index - 3];

                    /*
                    //cond12: no more than 3 6ths or 3ths in succession
                    if (
                        [3, 6, 10, 13].includes(th_last_interval.number())
                        && th_last_interval.value() == sec_last_interval.value()
                        && sec_last_interval.value() == last_interval.value()
                        && last_interval.value() == ver_interval.value()
                        ) return false;
                    */

                    //cond14: no three consecutive jumps

                    if (
                        hor_cp_interval.number() > 2
                        && out_intervals[index - 2].number() > 2
                        && out_intervals[index - 3].number() > 2
                    ) return false;



                    if (index > 3) {

                        //cond15: no 'trills'
                        if (
                            hor_cp_interval.direction() != out_intervals[index - 2].direction()
                            && hor_cp_interval.direction() == out_intervals[index - 3].direction()
                            && out_intervals[index - 2].number() == 2
                            && out_intervals[index - 3].number() == 2
                            && hor_cp_interval.number() == 2
                        ) {
                            return false;
                        }


                    }


                }

            }

        }


        return [true, pref];
    }



    function shuffle(array) {
        array = array.sort(() => Math.random() - 0.5);
        return array;
    }

}