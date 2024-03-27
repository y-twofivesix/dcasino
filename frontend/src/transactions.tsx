
import { TxResponse, Coin, MsgExecuteContract } from "secretjs";
import { dcasino } from "../generated/constants";

export async function send_tx (
  contract_address: string,
  code_hash: string, 
  msg: object, 
  sent: Coin[] = [],
  gas: number = 50_000,
  cli = dcasino.granter): Promise<TxResponse | string> {

  if (!dcasino.granter) {
    let msg = 'Failed to get Secret Client';
    console.error(msg);
    return msg;
  }
  
  let tx_resp = await  cli.tx.compute.executeContract(
    {
      sender: cli.address,
      contract_address: contract_address,
      code_hash: code_hash,
      msg: msg,
      sent_funds: sent,
    },

    {
      gasLimit: gas,
      feeGranter: (cli.address != dcasino.granter.address) ? dcasino.granter.address : undefined,
    }

  ).catch(e => {
      return `send tx failed: ${JSON.stringify(e)}`
  });

  // gas manangement
  if ((tx_resp as TxResponse).code != 0) {

      if ((tx_resp as TxResponse).rawLog) {
        return `${(tx_resp as TxResponse).rawLog}`;
      } else {
        return `${tx_resp}`;
      }
      
  }

  return tx_resp as TxResponse;
}
