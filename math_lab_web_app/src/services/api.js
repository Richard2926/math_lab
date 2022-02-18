import instance from "./setups";

export const get_room_data = async (room_id) => {
  try {
    const room = await instance.post("/get_room", {room_id});
    return room.data;
  } catch (err) {
    console.log(err);
    return "error";
  }
};

export const get_admin_room_data = async (admin_key) => {
  try {
    const room = await instance.post("/get_admin_room", {admin_key});
    return room.data;
  } catch (err) {
    console.log(err);
    return "error";
  }
};

export const generate = async (admin_key) => {
  try {
    const schedule = await instance.post("/generate_schedule", {admin_key});
    return schedule.data;
  } catch (err) {
    console.log(err);
    return "error";
  }
};

export const submit = async (data) => {
  try {
    console.log(data);
    await instance.post("/log_response", data);
    return "success";
  } catch (err) {
    console.log(err);
    return "error";
  }
};

export const create_room = async (room_data) => {
  try {
    const result = await instance.post("/create_room", room_data);
    return result.data;
  } catch (err) {
    console.log(err);
    return "error";
  }
};