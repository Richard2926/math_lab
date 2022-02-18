import {
  Box,
  Center,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Button,
  Flex,
  Text,
  HStack,
  Spacer,
  Image
} from "@chakra-ui/react";
import { useState } from "react";
import { FaSchool } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CreateRoom from "./create";

export default function Enter() {
  const navigate = useNavigate();
  const [admin_key, setKey] = useState("");

  return (
    <Box minH="100vh" w="100%" bg="gray.100">
      <Center pt="10vh">
        <VStack w="40%">
        <Image boxSize='200px' src='https://buzzcard.gatech.edu/sites/default/files/images/blocks/buzz.png' alt='Beeee' />
        <Text fontSize={"xs"}>GT Math Lab Scheduler - Made by Richard Rex</Text>
          <HStack bg="gray.100" w="full">
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                children={<FaSchool color="gray.300" />}
              />
              <Input type="tel" placeholder="Admin Key" bg="white" onChange={(e) => setKey(e.target.value)} />
            </InputGroup>
            <Button bg="white" onClick={() => navigate("/admin/" + admin_key)}>
              <Text fontSize={"md"} fontWeight="light" mx="1">
                Enter Room
              </Text>
            </Button>
          </HStack>
          <Text fontSize={"md"} fontWeight="light">
            OR
          </Text>
          <CreateRoom/>
        </VStack>
      </Center>
    </Box>
  );
}
