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

  

const set_parent = async () => {

    const DEV_MNEMONIC = unwrap (process.env.DEV_MNEMONIC);
    const URL = unwrap(process.env.SECRET_LCD_URL);
    const CHAIN_ID = unwrap(process.env.SECRET_CHAIN_ID);

    const CHILD_ADDR = process.argv[2];
    const CHILD_HASH = process.argv[3]

    const PARENT_ADDR = process.argv[4];
    const PARENT_HASH = process.argv[5]

    const WALLET = new Wallet(DEV_MNEMONIC);
    const SECRETCLI = new SecretNetworkClient({
      url: URL as string,
      wallet: WALLET,
      walletAddress: WALLET.address,
      chainId: CHAIN_ID as string,
    });

    const gen_msg =  () : Msg => {

      let msg = { set_parent_contract: { addr: PARENT_ADDR, hash: PARENT_HASH} };

      return new MsgExecuteContract({
          sender: WALLET.address,
          contract_address:  CHILD_ADDR,
          code_hash: CHILD_HASH, // optional but way faster
          msg: msg
      })

    }

    let messages = [
        gen_msg()
    ]

    const tx = await SECRETCLI.tx.broadcast(messages, {
        gasLimit: 77_000,
        gasPriceInFeeDenom: 0.1,
        feeDenom: "uscrt",
        }).catch(e=>{ console.log(e)});

    console.log(tx);
    process.exit(0);
  
}

set_parent();
