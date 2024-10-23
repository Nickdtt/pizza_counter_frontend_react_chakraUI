import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Button, Input, Heading, Text, Image, VStack, Flex } from '@chakra-ui/react';
import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = "http://localhost:8000";

function App() {
  const [competitionId, setCompetitionId] = useState(null);
  const [competitorName, setCompetitorName] = useState('');
  const [slices, setSlices] = useState(0);
  const [opponentSlices, setOpponentSlices] = useState(0);
  const [screen, setScreen] = useState('home');
  const [outputMessage, setOutputMessage] = useState('');
  const socket = React.useRef();

  const createCompetition = async (name) => {
    try {
      const response = await axios.post(`${BASE_URL}/competition/`, { name });
      setCompetitionId(response.data.id);
      return true;
    } catch (error) {
      return false;
    }
  };

  const registerCompetitor = async (name) => {
    const response = await axios.post(`${BASE_URL}/competition/${competitionId}/register/`, { name });
    return response.data.message;
  };

  const connectWebSocket = () => {
    socket.current = io(`http://localhost:8000/ws/${competitionId}`);

    socket.current.on('message', (data) => {
      const [name, slices] = data.split(":");
      setOpponentSlices(parseInt(slices));
    });
  };

  const createCompetitionAction = async () => {
    const name = document.getElementById('competitionName').value;
    const creatorName = document.getElementById('creatorName').value; 
    setCompetitorName(creatorName); 
    if (await createCompetition(name)) {
      await registerCompetitor(creatorName);
      setOutputMessage(`Competição '${name}' criada com ID: ${competitionId}`);
      setScreen('competition');
      connectWebSocket();
    } else {
      setOutputMessage("Erro ao criar competição.");
    }
  };

  const enterCompetitionAction = async () => {
    const id = document.getElementById('competitionId').value;
    const enterName = document.getElementById('enterName').value; 
    setCompetitorName(enterName); 
    setCompetitionId(id);
    const message = await registerCompetitor(enterName);
    setOutputMessage(message);
    setScreen('competition');
    connectWebSocket();
  };

  const addSliceAction = async () => {
    setSlices(slices + 1);
    await axios.post(`${BASE_URL}/competition/${competitionId}/increment/`, { name: competitorName });
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on('message', (data) => {
        const [name, slices] = data.split(":");
        setOpponentSlices(parseInt(slices));
      });
    }
  }, []);

  return (
    <ChakraProvider>
      <Flex 
        height="100vh" 
        width="100vw"  // Largura ajustada para ocupar 100% da tela
        justifyContent="center" 
        alignItems="center" 
        bg="yellow.100"
      >
        <Box 
          p={5} 
          borderWidth={1} 
          borderRadius="lg" 
          boxShadow="lg" 
          textAlign="center" 
          width="100%" 
          maxWidth="500px"
        >
          <Heading 
            color="red.600" 
            fontSize="3xl"
          >
            Pizza Battle!
          </Heading>
          <VStack spacing={4} mt={5}>
            {screen === 'home' && (
              <>
                <Image 
                  src="https://img.icons8.com/plasticine/2x/pizza.png" 
                  alt="Pizza" 
                  boxSize="200px" 
                  maxWidth="100%" 
                />
                <Input id="competitionName" placeholder="Nome da Competição" variant="outline" />
                <Input id="creatorName" placeholder="Seu Nome" variant="outline" />
                <Button colorScheme="red" onClick={createCompetitionAction}>
                  Criar Competição
                </Button>
                <Input id="competitionId" placeholder="ID da Competição (para entrar)" variant="outline" />
                <Input id="enterName" placeholder="Seu Nome" variant="outline" />
                <Button colorScheme="red" onClick={enterCompetitionAction}>
                  Entrar em Competição
                </Button>
                <Text>{outputMessage}</Text>
              </>
            )}
            {screen === 'competition' && (
              <>
                <Text fontSize="lg">Suas fatias: {slices}</Text>
                <Text fontSize="lg">Fatias do Oponente: {opponentSlices}</Text>
                <Button colorScheme="green" onClick={addSliceAction}>
                  +1 Fatia
                </Button>
              </>
            )}
          </VStack>
        </Box>
      </Flex>
    </ChakraProvider>
  );
}

export default App;
