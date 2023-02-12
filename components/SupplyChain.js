//Have a function to deliver the supply chain
import { useWeb3Contract } from "react-moralis";
import { abi } from "@/constants";
import { contractAddresses } from "@/constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function SupplyChain() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const randomAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const [viewFee, setViewFee] = useState("0");
  const [numWords, setNumWords] = useState("0");
  const [randomNumbers, setRandomNumbers] = useState("0");

  const dispatch = useNotification();

  const { runContractFunction: viewSupplyChain } = useWeb3Contract({
    abi: abi,
    contractAddress: randomAddress,
    functionName: "viewSupplyChain",
    params: {},
    msgValue: viewFee,
  });

  const { runContractFunction: getViewFee } = useWeb3Contract({
    abi: abi,
    contractAddress: randomAddress,
    functionName: "getViewFee",
    params: {},
  });

  const {
    runContractFunction: getRandomNumbers,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: randomAddress,
    functionName: "getRandomNumbers",
    params: {},
  });

  const { runContractFunction: getNumWords } = useWeb3Contract({
    abi: abi,
    contractAddress: randomAddress,
    functionName: "getNumWords",
    params: {},
  });

  async function updateUI() {
    const viewFeeFromCall = (await getViewFee()).toString();
    setViewFee(viewFeeFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      async function updateUI() {
        const viewFeeFromCall = (await getViewFee()).toString();
        const numWordsFromCall = (await getNumWords()).toString();
        const randomNumbersFromCall = await getRandomNumbers(1);
        setViewFee(viewFeeFromCall);
        setNumWords(numWordsFromCall);
        setRandomNumbers(randomNumbersFromCall);
      }
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNewNotificacion(tx);
    updateUI();
  };

  const handleNewNotificacion = function () {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <div className="p-5">
      Hi from supply chain
      {randomAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async function () {
              await viewSupplyChain({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              });
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>View Supply Chain</div>
            )}
          </button>
          <div>
            View Supply Chain Fee: {ethers.utils.formatUnits(viewFee, "ether")}
            ETH
          </div>
          <div>Number of Words: {numWords}</div>
          <div>Random Words: {randomNumbers}</div>
        </div>
      ) : (
        <div> No Supply Address Detected </div>
      )}
    </div>
  );
}
