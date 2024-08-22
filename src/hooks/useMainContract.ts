import { useEffect, useState } from "react";
import { MainContract } from "../contracts/MainContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract, toNano } from "ton-core";
import { useTonConnect } from "./useTonConnect";

export function useMainContract() {
  const client = useTonClient();
  const { sender } = useTonConnect();

  const [contractData, setContractData] = useState<null | {
    counter_value: number;
    recent_sender: Address;
    owner_address: Address;
  }>();

  const [balance, setBalance] = useState<null | number>(0);

  const mainContract = useAsyncInitialize(async () => {
    if (!client) return;
    const parsedAddress = Address.parse("EQCdTL_i1CxOx2yvPXG6pLgX42tvg3048bbpySSHbuHOVRq7");
    console.log("🚀 ~ file: useMainContract.ts:22 ~ mainContract ~ parsedAddress:", parsedAddress.toString());

    const contract = new MainContract(parsedAddress);
    return client.open(contract) as OpenedContract<MainContract>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!mainContract) return;
      setContractData(null);
      const contractData = await mainContract.getData();
      const contractBalance = await mainContract.getBalance();
      setContractData({
        counter_value: contractData.number,
        recent_sender: contractData.recent_sender,
        owner_address: contractData.owner_address,
      });
      setBalance(contractBalance.number);
    }

    getValue();
  }, [mainContract]);

  return {
    contract_address: mainContract?.address.toString(),
    contract_balance: balance,
    ...contractData,
    sendIncrement: async () => {
      return mainContract?.sendIncrement(sender, toNano("1"), 1);
    },
    sendDeposit: async () => {
      return mainContract?.sendDeposit(sender, toNano("1"));
    },
    sendWithdrawal: async () => {
      return mainContract?.sendWithdrawalRequest(sender, toNano("0.05"), toNano("0.2"));
    },
  };
}