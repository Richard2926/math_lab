import { Box, Center, HStack, Text, VStack, Flex, Spacer, Select, InputGroup, Input, InputLeftElement, Link, Button, toast, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { get_admin_room_data, generate } from "../services/api";
import { FaClock, FaIdBadge, FaMale } from "react-icons/fa";

export default function Admin() {

    let location = useLocation();

    const admin_key = location.pathname.split('admin/')[1];
    const [initial, setInitial] = useState(true);
    const [loading, setLoading] = useState(true);
    const [room, setRoom] = useState({});

    const [schedule, setSchedule] = useState({});
    const [gen_loading, setGenLoading] = useState(false);
    const [done, setDone] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const get_room = async () => {
        const data = await get_admin_room_data(admin_key);
        if(data == "error") {
            toast({
                position: "bottom-left",
                title: "Oops!",
                description: "Looks like that room does not exist",
                status: "error",
                duration: 4000,
                isClosable: true,
              })
            return navigate("/");
        }
        setRoom(data);
        setLoading(false);
    }

    const generate_schedule = async () => {
        setGenLoading(true);
        const result = await generate(admin_key);
        setGenLoading(false);

        if (result == "error") {
            toast({
                position: "bottom-left",
                title: "Oops!",
                description: "Looks like I ran into an issue, please contact Richard Rex",
                status: "error",
                duration: 4000,
                isClosable: true,
              })
        } else {
            if (result.status == 4) {
                toast({
                    position: "bottom-left",
                    title: "Oops!",
                    description: "Constraints have no optimal solution. Contact Richard Rex to resolve!",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                  })
            } else {
                setSchedule(result.schedule);
                setDone(true);
                console.log(result.schedule);
                toast({
                    position: "bottom-left",
                    title: "Success!",
                    description: "Yay! Schedule has been generated.",
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                  })
            }
        }
    }
    useEffect(() => {
        if (initial) {
            setInitial(false);
            get_room()
        }
    });
    const index = (day_index, slot_index) => {
        let index = 0;
        for (var i = 0; i < day_index; i ++) {
            index = index + room.slots[i].slots.length;
        }
        return index + slot_index;
    }

    const noPreference = (day_index, options) => {
      let index = 0;
        for (var i = 0; i < day_index; i++) {
            index = index + room.slots[i].slots.length;
        }
        let pref = 0;

        for (var j = 0; j < room.slots[day_index].slots.length; j++) {
          pref = pref + options[index + j];
        }
        
        return pref === 0;
    }

    return initial || loading ? (
      <div />
    ) : (
      <Box minH="100vh" w="100%" bg="gray.100">
        <Center pt="8vh" pb="5vh">
          <Text fontSize={"2xl"}>{room.name}</Text>
        </Center>
        <Center w="full">
          <Box w="55%" bg="blue.200" borderRadius={"5"}>
            <Center m="2">
              <Text>
                Your Admin Key: <b>{room.admin_key}</b> (Use this to access the
                schedule results)
              </Text>
            </Center>
          </Box>
        </Center>

        <Center w="full" pt="4">
          <Box w="55%" bg="blue.200" borderRadius={"5"}>
            <Center m="2">
              <Text>
                Link for users/students:{" "}
                <Link
                  color="teal.500"
                  href={"https://gt-math-lab.web.app/rooms/" + room.room_id}
                >
                  https://gt-math-lab.web.app/rooms/{room.room_id}
                </Link>
              </Text>
            </Center>
          </Box>
        </Center>

        <Center pb="4" pt="4">
          <Button
            w="55%"
            bg="blue.400"
            textColor="white"
            _hover={{ bg: "blue.700" }}
            isLoading={gen_loading}
            onClick={() => generate_schedule()}
          >
            <Text fontWeight={"light"}>Generate Schedule</Text>
          </Button>
        </Center>
        {room.slots.map((day) => (
          <Center key={day.day}>
            <VStack w="55%" pb="2">
              <Flex w="full">
                <Text>{day.day}: </Text>
                <Spacer />
              </Flex>
              {day.slots.map((slot) => (
                <VStack w="full" key={slot}>
                  <Flex w="full">
                    <Box w="full" bg="gray.300" borderRadius={"5"} mr="4">
                      <Center m="2">
                        <Text>{slot}</Text>
                      </Center>
                    </Box>
                  </Flex>
                  {done &&
                    schedule[day.day][slot].map((student) => (
                      <Flex w="full" key={student.name}>
                        <Box w="full" bg="blue.200" borderRadius={"5"} mr="4">
                          <Center m="2">
                            <Text>{student.name}</Text>
                          </Center>
                        </Box>
                      </Flex>
                    ))}
                </VStack>
              ))}
            </VStack>
          </Center>
        ))}
        {Object.entries(room.students).map(([gtid, student]) => (
          <Center w="full" key={gtid} pt="3">
            <VStack w="full" pb="2">
              <Flex w="55%">
                <Text>
                  {student.name}'s Preferences: (Needed Hours:{" "}
                  {student.units_needed / 2})
                </Text>
                <Spacer />
              </Flex>
              {room.slots.map((day) => (
                <Center
                  key={day.day}
                  w="55%"
                  display={
                    noPreference(room.slots.indexOf(day), student.options)
                      ? "none"
                      : "display"
                  }
                >
                  <VStack w="full">
                    {day.slots.map((slot) => (
                      <Flex
                        w="full"
                        key={slot}
                        display={
                          student.options[
                            index(
                              room.slots.indexOf(day),
                              day.slots.indexOf(slot)
                            )
                          ] == 0
                            ? "none"
                            : "display"
                        }
                      >
                        <Text fontSize={"sm"} pl="4">
                          {day.day}: {slot}, Preference Level:{" "}
                          {5 *
                            student.options[
                              index(
                                room.slots.indexOf(day),
                                day.slots.indexOf(slot)
                              )
                            ]}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Center>
              ))}
            </VStack>
          </Center>
        ))}
      </Box>
    );
}