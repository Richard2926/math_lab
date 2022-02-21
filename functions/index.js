const functions = require("firebase-functions");
const admin = require("firebase-admin");
const GLPK = require("glpk.js");
const { document } = require("firebase-functions/v1/firestore");
const glpk = GLPK();
const cors = require("cors")({ origin: true });

admin.initializeApp();
var db = admin.firestore();

const rnd = (() => {
  const gen = (min, max) => max++ && [...Array(max-min)].map((s, i) => String.fromCharCode(min+i));

  const sets = {
      num: gen(48,57),
      alphaLower: gen(97,122),
      alphaUpper: gen(65,90),
      special: [...`$&`]
  };

  function* iter(len, set) {
      if (set.length < 1) set = Object.values(sets).flat(); 
      for (let i = 0; i < len; i++) yield set[Math.random() * set.length|0]
  }

  return Object.assign(((len, ...set) => [...iter(len, set.flat())].join('')), sets);
})();

const options = {
  // msglev: glpk.GLP_MSG_ALL,
  // presol: true,
  // cb: {
  //     call: progress => console.log(progress),
  //     each: 1
  // }
};

exports.get_room = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    var room_data = await db
      .collection("rooms")
      .where("room_id", "==", request.body.room_id)
      .get();
    console.log(request.body.room_id);
    if (room_data.empty) {
      return response.sendStatus(404);
    }
    var result = room_data.docs[0].data();
    result.admin_key = "sike";
    result.students = {};
    return response.send(result);
  });
});

exports.log_response = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    try {
      let { name, gtid, options, units_needed, room_id } = request.body;

      var response_update = {};

      response_update[`students.${gtid}`] = {
        name,
        options,
        units_needed,
      };

      var room_data = await db
        .collection("rooms")
        .where("room_id", "==", room_id)
        .get();

      await db
        .collection("rooms")
        .doc(room_data.docs[0].id)
        .update(response_update);

      return response.sendStatus(200);
    } catch (err) {
      console.log(err);
      return response.sendStatus(404);
    }
  });
});

exports.get_admin_room = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    var room_data = await db
      .collection("rooms")
      .where("admin_key", "==", request.body.admin_key)
      .get();

    if (room_data.empty) {
      return response.sendStatus(404);
    }
    var result = room_data.docs[0].data();
    return response.send(result);
  });
});

exports.create_room = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    try {

      const admin_key = rnd(5);

      var newdoc = {
          name: request.body.name,
          students: {},
          slots: request.body.slots,
          room_id: rnd(10),
          admin_key: admin_key
      }

      await db
      .collection("rooms")
      .add(newdoc);

      return response.send({
        admin_key: admin_key
      });

    } catch (err) {
      return response.sendStatus(404);
    }
  });
});

exports.generate_schedule = functions.https.onRequest(
  async (request, response) => {
    cors(request, response, async () => {
      // console.log("Triggered");
      var room_data = await db
        .collection("rooms")
        .where("admin_key", "==", request.body.admin_key)
        .get();

      if (room_data.empty) {
        return response.sendStatus(404);
      }
      var room_data = room_data.docs[0].data();

      // console.log(room_data);

      let schedule_slots = [];

      for (const day of room_data.slots) {
        let temp = [];
        for (const d of day.slots) {
          temp = [...temp, day.day + '_' + d]
        }
        schedule_slots = [...schedule_slots, ...temp];
      }
      
      const students = new Map(Object.entries(room_data.students));
      // console.log(students);
      // console.log(schedule_slots);

      // const schedule_slots = ["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5"];
      // const students = new Map(
      //   Object.entries({
      //     123: { name: "Richard", options: [1, 0.8, 0, 0, 0], units_needed: 2 },
      //     124: {
      //       name: "Bruh Moment",
      //       options: [1, 1, 1, 0.8, 1],
      //       units_needed: 2,
      //     },
      //     133: { name: "Steph", options: [0, 0.8, 0, 0, 1], units_needed: 2 },
      //   })
      // );

      let variables = [];
      let binaries = [];
      let slot_constraints = [];
      let hours_constraints = [];

      for (const gtid of students.keys()) {
        const student = students.get(gtid);
        let temp_hours_constraints = [];

        for (const slot of schedule_slots) {
          const id = gtid + "_" + slot;

          variables.push({
            name: id,
            coef: student.options[schedule_slots.indexOf(slot)],
          });

          temp_hours_constraints.push({
            name: id,
            coef: 1,
          });

          binaries.push(id);
        }

        hours_constraints.push({
          name: gtid,
          vars: temp_hours_constraints,
          bnds: {
            type: glpk.GLP_FX,
            ub: student.units_needed,
            lb: student.units_needed,
          },
        });
      }

      for (const slot of schedule_slots) {
        let temp_slot_constraints = [];

        for (const gtid of students.keys()) {
          temp_slot_constraints.push({
            name: gtid + "_" + slot,
            coef: 1,
          });
        }

        slot_constraints.push({
          name: slot,
          vars: temp_slot_constraints,
          bnds: {
            type: glpk.GLP_DB,
            ub: 5,
            lb: 1,
          },
        });
      }

      //   console.log(binaries);
      //   console.log(variables);
      //   console.log(slot_constraints);
      //   console.log(hours_constraints);

      const result = await glpk.solve(
        {
          name: "LP",
          objective: {
            direction: glpk.GLP_MAX,
            name: "obj",
            vars: variables,
          },
          subjectTo: [...hours_constraints, ...slot_constraints],
          binaries: binaries,
        },
        options
      );
      // if (result.result.status == 4) {
      //   return response.status(404);
      // }
      var schedule = {};

      for (const day of room_data.slots) {

         let temp = {};

         for (const slot of day.slots) {
           temp[slot] = [];
         }

         schedule[day.day] = (temp);
      }
      // console.log(schedule);
      // console.log(result.result.vars);

      for (const opt of new Map(Object.entries(result.result.vars)).keys()) {
        if (result.result.vars[opt] == 1) {
          let destruct = opt.split('_');
          schedule[destruct[1]][destruct[2]].push(room_data.students[destruct[0]]);
        }
      }
      // console.log(schedule);
      response.send({
        schedule,
        status: result.result.status
      });
    });
  }
);
