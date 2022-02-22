import { Box, Center, HStack, Text, VStack, Flex, Spacer, Select, InputGroup, Input, Image, InputLeftElement, Button, toast, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { get_room_data, submit } from "../services/api";
import { FaClock, FaIdBadge, FaMale } from "react-icons/fa";

export default function Form() {
    let location = useLocation();
    const roomId = location.pathname.split('rooms/')[1];
    const [initial, setInitial] = useState(true);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [options, updateOptions] = useState("");
    const [slots, updateSlots] = useState([]);
    const navigate = useNavigate();

    const [student_name, setStudentName] = useState("");
    const [gtid, setGTID] = useState("");
    const [units_needed, setUnits] = useState();

    const [done, setDone] = useState(false);
    const [request, setRequest] = useState(false);
    const [submit_loading, setSubmitLoading] = useState(false);

    const [roomData, setRoomData] = useState({});

    const toast = useToast();

    const change_option_value = (day_index, slot_index, val) => {
        let index = 0;
        for (var i = 0; i < day_index; i ++) {
            index = index + slots[i].slots.length;
        }
        updateOptions((old) => {
            old[index + slot_index] = parseFloat(val);
            return old;
        })
    }
    const submit_data = async () => {
        setSubmitLoading(true);
        const response = await submit({
            name: student_name,
            gtid,
            options,
            room_id: roomData.room_id,
            units_needed: parseInt(units_needed) * 2
        });
        setSubmitLoading(false);

        if (response == "success") {
            setDone(true);
            toast({
                position: "bottom-left",
                title: "Success!",
                description: "Your Response has been recorded. You can close out of the tab now!",
                status: "success",
                duration: 4000,
                isClosable: true,
              })
        } else {
            toast({
                position: "bottom-left",
                title: "Ouch!",
                description: "Looks like we ran into an issue, please check your inputs again",
                status: "error",
                duration: 4000,
                isClosable: true,
              })
        }
    }
    const get_room = async () => {
        const data = await get_room_data(roomId);
        if(data == "error") {
            toast({
                position: "bottom-left",
                title: "Oops!",
                description: "Looks like that form does not exist",
                status: "error",
                duration: 4000,
                isClosable: true,
              })
            return navigate("/");
        }
        let sum = 0;
        for (const day of data.slots) {
            for (const slot of day.slots) {
                sum = sum + 1;
            }
        }
        updateOptions(new Array(sum).fill(0));
        setName(data.name);
        setRoomData(data);
        updateSlots(data.slots);
        setLoading(false);
    }

    useEffect(() => {
        if (initial) {
            setInitial(false);
            get_room()
        }
        if (request) {
            setRequest(false);
            submit_data();
        }
    });
    
    return initial || loading ? (
      <div />
    ) : (
      <Box minH="100vh" w="100%" bg="gray.100">
          <VStack pt="5vh">
          <Image boxSize='200px' src='https://buzzcard.gatech.edu/sites/default/files/images/blocks/buzz.png' alt='Beeee' />
        
          </VStack>
        <Center pt="3vh">
          <Text fontSize={"2xl"}>{name}</Text>
        </Center>
        {slots.map((day) => (
          <Center key={day.day}>
            <VStack w="55%" pb="2">
              <Flex w="full">
                <Text>{day.day}: </Text>
                <Spacer />
              </Flex>
              {day.slots.map((slot) => (
                <Flex w="full" key={slot}>
                  <Box w="full" bg="gray.300" borderRadius={"5"} mr="4">
                    <Center m="2">
                      <Text>{slot}</Text>
                    </Center>
                  </Box>
                  <Select
                    defaultValue={0}
                    disabled={done}
                    w="75%"
                    bg="white"
                    onChange={(e) =>
                      change_option_value(
                        slots.indexOf(day),
                        day.slots.indexOf(slot),
                        e.target.value
                      )
                    }
                  >
                    <option value={0}>- - No Choice - -</option>
                    <option value={1}>First Choice</option>
                    <option value={0.8}>Second Choice</option>
                    <option value={0.6}>Third Choice</option>
                    <option value={0.4}>Fourth Choice</option>
                    <option value={0.2}>Fifth Choice</option>
                  </Select>
                </Flex>
              ))}
            </VStack>
          </Center>
        ))}
        <Center>
          <InputGroup pt="2" w="55%">
            <InputLeftElement
              pointerEvents="none"
              children={
                <Box mt="3">
                  <FaIdBadge color="gray.100" />
                </Box>
              }
            />
            <Input type="tel" placeholder="GTID" bg="white" onChange={(e) => setGTID(e.target.value)} 
                    disabled={done}/>
          </InputGroup>
        </Center>
        <Center pt="2">
          <InputGroup w="55%">
            <InputLeftElement
              pointerEvents="none"
              children={
                <Box mb="1">
                  <FaMale color="gray.100" />
                </Box>
              }
            />
            <Input type="tel" placeholder="Your Name" bg="white" onChange={(e) => setStudentName(e.target.value)} 
                    disabled={done}/>
          </InputGroup>
        </Center>
        <Center>
          <InputGroup pt="2" w="55%">
            <InputLeftElement
              pointerEvents="none"
              children={
                <Box mt="3">
                  <FaClock color="gray.100" />
                </Box>
              }
            />
            <Input type="text" pattern="[0-9]*" placeholder="Hours Needed" bg="white" onChange={(e) => setUnits(e.target.value)} 
                    disabled={done}/>
          </InputGroup>
        </Center>
        <Center pt="4">
          <Button
            w="55%"
            bg="blue.400"
            textColor="white"
            _hover={{ bg: "blue.700" }}
            isDisabled={student_name.trim() == "" || gtid.trim() == "" || done || isNaN(units_needed) || units_needed == ""}
            isLoading={submit_loading}
            onClick={() => submit_data()}
          >
            <Text fontWeight={"light"}>Submit Response</Text>
          </Button>
        </Center>
        <Flex mt="10vh" pr="4" pb="2">
            <Spacer/>
            <Text fontWeight={"light"} fontSize="xs">Made by Richard Rex</Text>
        </Flex>
      </Box>
    );
}