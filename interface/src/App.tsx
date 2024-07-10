import React, { useEffect, useMemo, useState } from "react";
import {
  AccountAddressInput,
  Aptos,
  AptosConfig,
  Hex,
  Network,
} from "@aptos-labs/ts-sdk";
import {
  NetworkName,
  InputTransactionData,
  WalletName,
  Wallet,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import styled from "styled-components";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleName = process.env.REACT_APP_MODULE_NAME;
const moduleAddress = process.env.REACT_APP_MODULE_ADDRESS;

const WindowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const WalletWrapper = styled.div`
  position: absolute;
  align-items: right;
  right: 10px;
  top: 10px;
  background-color: #f0f0f0;
`;

const CenteredWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const GameWrapper = styled.div`
  width: 550px;
  padding: 20px;
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Display = styled.div`
  background-color: #e0e0e0;
  color: black;
  font-size: 18px;
  padding: 20px;
  border-radius: 15px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const DisplayComputerHeading = styled.div`
  background-color: transparent;
  color: black;
  font-size: 25px;
  padding: 20px;
  border-radius: 15px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const ResultBox = styled.div<{
  color?: string;
}>`
  background-color: "#4CAF50";
  color: white;
  font-size: 25px;
  padding: 20px;
  border-radius: 15px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
`;

const Button = styled.button<{
  color?: string;
  wide?: boolean;
  disabled?: boolean;
}>`
  background-color: ${({ color, disabled }) =>
    disabled ? "#c0c0c0" : color || "#d0d0d0"};
  color: ${({ disabled }) => (disabled ? "#888888" : "black")};
  font-size: 24px;
  padding: 20px;
  border: none;
  border-radius: 15px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  grid-column: ${({ wide }) => (wide ? "span 2" : "span 1")};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  &:hover {
    opacity: ${({ disabled }) => (disabled ? "1" : "0.8")};
  }
`;

const OperationButton = styled(Button)`
  background-color: ${({ disabled }) => (disabled ? "#c0c0c0" : "#ff9500")};
  color: ${({ disabled }) => (disabled ? "#888888" : "white")};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background-color: ${({ active }) => (active ? "#4CAF50" : "#f44336")};
  color: white;
  font-size: 18px;
  padding: 10px 20px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  &:hover {
    opacity: 0.8;
  }
`;

const App: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [computerSelection, setComputerSelection] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [transactionInProgress, setTransactionInProgress] =
    useState<boolean>(false);

  const handleOperationClick = async (operation: string) => {
    if (operation === "Rock" || operation === "Paper" || operation === "Scissors") {
      setInput(` ${operation} `);
      try {
        if (!account) return;
        let functionName = "duel"

        setTransactionInProgress(true);

        const payload: InputTransactionData = {
          data: {
            function: `${moduleAddress}::${moduleName}::${functionName}`,
            functionArguments: [operation],
          },
        };

        const response = await signAndSubmitTransaction(payload);

        console.log(response);

        const resultData = await client.getAccountResource({
          accountAddress: account?.address,
          resourceType: `${moduleAddress}::${moduleName}::DuelResult`,
        });

        console.log(resultData);
        setResult(resultData.duel_result.toString());
        setComputerSelection(resultData.computer_selection.toString())
      } catch (error) {
        console.error(error);
      } finally {
        setTransactionInProgress(false);
      }
    } else {
      setInput(` ${operation} `);
    }
  };

  const toggleActiveState = async () => {
    setIsActive(!isActive);
    if (!account) return;
    if (!isActive) {
      console.log("Toggling active state: " + isActive);
      const payload: InputTransactionData = {
        data: {
          function: `${moduleAddress}::${moduleName}::createGame`,
          functionArguments: [],
        },
      };

      const response = await signAndSubmitTransaction(payload);
      console.log(response);
    }
  };

  const connectedView = () => {
    return (
      <CenteredWrapper>
        <ToggleButton active={isActive} onClick={toggleActiveState}>
          {isActive ? "Stop Game" : "Start Game"}
        </ToggleButton>
        <GameWrapper>
          {<Display>{input || "Your Move"}</Display>}
          <ButtonGrid>
            <Button
              color="#FF6663"
              onClick={() => {
                setInput("");
                setResult("");
              }}
              disabled={!isActive}
            >
              Clear
            </Button>
            {/* <Button color="#FF33FF" onClick={() => setInput(input + '  ')} disabled={!isActive}>^</Button> */}
            <OperationButton
              onClick={() => {handleOperationClick("Rock");}}
              disabled={!isActive || transactionInProgress}
            >
              Rock
            </OperationButton>
            <OperationButton
              onClick={() => handleOperationClick("Paper")}
              disabled={!isActive || transactionInProgress}
            >
              Paper
            </OperationButton>
            <OperationButton
              onClick={() => handleOperationClick("Scissors")}
              disabled={!isActive || transactionInProgress}
            >
              Scissors
            </OperationButton>    
          </ButtonGrid>
        </GameWrapper><br></br><br></br>
        <GameWrapper> 
          <DisplayComputerHeading>
          {/* <p>Computer Move</p> */}
            {!computerSelection && <Display>{computerSelection || "Computer Move"}</Display>}
            {computerSelection && <Display>{computerSelection}</Display>}
          </DisplayComputerHeading>
            {result && <ResultBox>{result}</ResultBox>}
        </GameWrapper>
      </CenteredWrapper>
    );
  };

  const notConnectedView = () => {
    return (
      <WindowWrapper>
        <h1>Please connect your wallet to continue</h1>
      </WindowWrapper>
    );
  };

  return (
    <WindowWrapper>
      <WalletWrapper>
        <WalletSelector />
      </WalletWrapper>
      {connected ? connectedView() : notConnectedView()}
    </WindowWrapper>
  );
};

export default App;
