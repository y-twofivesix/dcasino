import { Wallet, SecretNetworkClient, MsgExecuteContract, Msg } from "secretjs";
import * as dotenv from "dotenv"
dotenv.config({ override: true });
import { QueryCodeHashResponse } from "secretjs/dist/grpc_gateway/secret/compute/v1beta1/query.pb";

const unwrap = ( x : any) => { 
  if (x === undefined || x == null) {
    console.trace('unwrap failed')
    process.exit(1) 
  }
  return x
}

const add_child = async () => {

    const DEV_MNEMONIC = unwrap (process.env.DEV_MNEMONIC);
    const CONTRACT_ADDRESS = unwrap(process.env.DEV_CONTRACT_ADDRESS);
    const URL = unwrap(process.env.SECRET_LCD_URL);
    const CHAIN_ID = unwrap(process.env.SECRET_CHAIN_ID);
    const CODE_ID = unwrap(process.env.DEV_CODE_ID)

    const NAME = process.argv[2];
    const ADDR = process.argv[3]

    const WALLET = new Wallet(DEV_MNEMONIC);
    const SECRETCLI = new SecretNetworkClient({
      url: URL as string,
      wallet: WALLET,
      walletAddress: WALLET.address,
      chainId: CHAIN_ID as string,
    });

    const gen_msg =  (code_hash : string ) : Msg => {

      let msg = { add_child_contract: { name: NAME, addr: ADDR} };

      return new MsgExecuteContract({
          sender: WALLET.address,
          contract_address:  CONTRACT_ADDRESS,
          code_hash: code_hash, // optional but way faster
          msg: msg
      })

    }

    const CODE_HASH = (await SECRETCLI.query.compute.codeHashByCodeId({code_id: String(CODE_ID)})
        .catch(async e => { process.exit(1)}) as QueryCodeHashResponse).code_hash as string;


    let messages = [
      gen_msg(CODE_HASH),
    ]

    const tx = await SECRETCLI.tx.broadcast(messages, {
        gasLimit: 77_000,
        gasPriceInFeeDenom: 0.1,
        feeDenom: "uscrt",
        }).catch(e=>{ console.log(e)});

    console.log(tx);
    process.exit(0);
  
}

add_child();
