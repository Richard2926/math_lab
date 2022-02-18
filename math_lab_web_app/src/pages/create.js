import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Button,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Spacer,
  Flex,
  Box,
  Select,
  IconButton,
  useToast
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { FaBook, FaClock, FaHeading, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { create_room } from "../services/api";

export default function CreateRoom() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ day, setDay ] = useState("Monday");
  const [ slot, setSlot ] = useState("");
  const [ name, setName ] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [slots, updateSlots] = useState([
    {
      day: "Monday",
      slots: [],
    },
    {
      day: "Tuesday",
      slots: [],
    },
    {
      day: "Wednesday",
      slots: [],
    },
    {
      day: "Thursday",
      slots: [],
    },
    {
      day: "Friday",
      slots: [],
    },
    {
      day: "Saturday",
      slots: [],
    },
    {
      day: "Sunday",
      slots: [],
    }
  ]);

  const submit = async () => {
    setLoading(true);
    const response = await create_room({
      slots: slots.filter(slot => slot.slots.length != 0),
      name
    });
    // console.log(response);
    setLoading(false);

    if (response == "error") {
      toast({
        position: "bottom-left",
        title: "Oops!",
        description:
          "Looks like I ran into an issue, please contact Richard Rex",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } else {
      navigate("/admin/" + response.admin_key);
    }
  };

  return (
    <>
      <Button w="full" bg="white" onClick={onOpen}>
        <Text fontSize={"md"} fontWeight="light">
          Create Room
        </Text>
      </Button>

      <Modal
        onClose={onClose}
        isOpen={isOpen}
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Center>
              <Text fontSize={"xl"} fontWeight="normal">
                Make a new room!
              </Text>
            </Center>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack w="full">
              <InputGroup pb="5">
                <InputLeftElement
                  pointerEvents="none"
                  children={<FaBook color="gray.100" />}
                />
                <Input type="tel" placeholder="Name for the Room" bg="white" onChange={(e) => setName(e.target.value)}/>
              </InputGroup>
              {slots.map((day) => (
                <VStack w="full" pb="2" key={day.day} display={day.slots.length == 0 ? 'none': 'flex'}>
                  <Flex w="full">
                    <Text>{day.day}: </Text>
                    <Spacer />
                  </Flex>
                  {day.slots.map((slot) => (
                    <Flex w="full" key={slot}>
                      <Box w="full" bg="gray.200" borderRadius={"5"}>
                        <Center m="2">
                          <Text>{slot}</Text>
                        </Center>
                      </Box>
                      <IconButton color="red" variant="outline" onClick={() => {
                        slots[slots.indexOf(day)].slots.splice(day.slots.indexOf(slot), 1);
                        updateSlots((old) => [...old]);
                      }} icon={<FaTrash />} ml="2"/>
                    </Flex>
                  ))}
                </VStack>
              ))}
              <Flex w="full">
                <Text>Add New Slot: </Text>
                <Spacer />
              </Flex>
              <Flex>
                <Select defaultValue={"Monday"} w="60%" onChange={(e) => setDay(e.target.value)}>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </Select>
                <InputGroup ml="3">
                  <InputLeftElement
                    pointerEvents="none"
                    children={<Box pb="1"> <FaClock color="gray.100" /></Box>}
                  />
                  <Input
                    type="tel"
                    placeholder="Slot eg: (10 - 10:30 AM)"
                    bg="white"
                    onChange={(e) => setSlot(e.target.value)}
                  />
                </InputGroup>
              </Flex>
              <Button w="full" bg="white" onClick={() => {
                  for (const item of slots) {
                    if (item.day === day) {
                      if (!item.slots.includes(slot)) {
                        item.slots = [...item.slots, slot];
                      }
                      break;
                    }
                  }
                  updateSlots((old) => [ ... old]);
                
              }} bg="gray.200" disabled={slot == ""}>
                <Text fontSize={"md"} fontWeight="light">
                  Add Slot
                </Text>
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button isLoading={loading} onClick={() => submit()}>
              <Text fontSize={"md"} fontWeight="normal">
                Create
              </Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
