import {
  TerraEvent,
  TerraBlock,
  TerraMessage,
  TerraTransaction,
} from "@subql/types-terra";
import { MsgExecuteContract,MsgInstantiateContract } from "@terra-money/terra.js";
import { createNFTContractDatasource, NftContractInstantiation, SendNFT } from "../types";

export async function handleEvent(
  event: TerraEvent<MsgInstantiateContract>
): Promise<void> {
  const initMsg: any = event.msg.msg.init_msg;
  if(initMsg.name && initMsg.minter && initMsg.symbol) {
    const entity = new NftContractInstantiation(`${event.tx.tx.txhash}-${event.idx}`)
    entity.name = initMsg.name;
    entity.symbol = initMsg.symbol;
    entity.creator = event.msg.msg.sender;
    entity.codeId = event.msg.msg.code_id;
    for(const e of event.event.attributes){
      if(e.key === 'contract_address') {
        entity.contractAddress = e.value;
      }
    }
    await entity.save()
    await createNFTContractDatasource({value: {contract: entity.contractAddress}})
  }
} 

export async function handleSendNFT(message: TerraMessage<MsgExecuteContract>) {
  const executeMsg: any = message.msg.execute_msg;
  const entity = new SendNFT(`${message.tx.tx.txhash}-${message.idx}`)
  entity.seller = message.msg.sender;
  entity.recipient = executeMsg.send_nft.contract;
  entity.nftContract = message.msg.contract;
  entity.tokenId = executeMsg.send_nft.token_id;
  await entity.save();
}
