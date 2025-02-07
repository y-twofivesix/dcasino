
/******************************************************************************

VIDEO POKER FRONTEND 0.4.2
AUTOGENERATED CONSTANTS.TSX FILE

CREATED:        22 July 2024
AUTHOR:         YAESHA256
AFFILIATIONS:   --
                                                                               
******************************************************************************/




export const ERR_UNAUTHORISED = new RegExp("Unauthorised.")

/******************************************************************************
Secret
******************************************************************************/

import { QueryCodeHashResponse } from "secretjs/src/grpc_gateway/secret/compute/v1beta1/query.pb";
import { MsgExecuteContract, MsgGrantAllowance, SecretNetworkClient, TxResponse, Wallet, stringToCoins } from "secretjs";
import { random_string, swal_confirm, swal_error } from "@/src/helpers";
import { send_tx } from "@/src/transactions";
import { IUser } from "@/src/interfaces";

export class Dcasino {

DCASINO_VERSION : string                = "0.4.2";                        
DCASINO_CONTRACT_ADDRESS : string       = "secret10j4yk7jml5lalhtccwpufhjj4vu92dm7zq3hdv";       
DCASINO_CODE_ID : number                =  1692;                 
CHAIN_ID : string                       = "secret-4";                       
LCD_URL : string                        = "https://lcd.mainnet.secretsaturn.net";                        
VIDEO_POKER_CONTRACT_ADDRESS : string   = "secret1v8sdmxezwts7drp8q9e26e2m7ljl3vpl924fk3";   
VIDEO_POKER_CODE_ID: string             = "1691";            
BLACK_JACK_21_CONTRACT_ADDRESS : string = "secret1646fj7azc55ymnhyzx6d48y55xg5lm6j2t0ydv"; 
BLACK_JACK_21_CODE_ID: string           = "1703";          

  cli         : SecretNetworkClient = {} as SecretNetworkClient;
  granter     : SecretNetworkClient = {} as SecretNetworkClient;
  dcasino_code_hash   : string      = '';
  ready        : boolean = false;
  enable_alias : boolean = false;
  vk_valid : boolean = false;
  viewing_key         : string      = '';
  pos_this_session : number = 0;
  video_poker_code_hash   : string      = '';
  black_jack_21_code_hash : string = '';
  user_info : IUser | undefined = undefined;
  reclaim_code_hash : string = 'db17efceec7a8d2c464af53e142dda38de5ea0665b5c548928d5243b21a624b4';
  reclaim_contract  : string = 'secret18u22df5dan6cyl6xuyjn9wsa3gauf53567ej90';


  constructor () {};

  update_position(val: number) {
    this.pos_this_session += val;
  }

  set_cli( cli : SecretNetworkClient) {
    this.cli = cli;
  }

  set_granter( granter : SecretNetworkClient) {
    this.granter = granter;
  }
  

  set_enable_alias( enable : boolean ) {
    this.enable_alias = enable;
  }


  set_viewing_key( vk : string) {
    this.viewing_key = vk;
    window.localStorage.setItem(`dcasino_${this.granter.address}_vk`, dcasino.viewing_key);
  }

  async set_code_hash( querier : SecretNetworkClient | null = null) {

    let cli = querier ? querier : this.cli;
    this.dcasino_code_hash = (await cli?.query.compute.codeHashByCodeId({code_id: String(this.DCASINO_CODE_ID)})
    .catch(async (e: any) => { 
        console.log(`failed to get code hash:\n${JSON.stringify(e)}`);
      return ""
    }) as QueryCodeHashResponse).code_hash as string;


    this.video_poker_code_hash = (await cli?.query.compute.codeHashByCodeId({code_id: String(this.VIDEO_POKER_CODE_ID)})
    .catch(async (e: any) => { 
        console.log(`failed to get code hash:\n${JSON.stringify(e)}`);
      return ""
    }) as QueryCodeHashResponse).code_hash as string;

    this.black_jack_21_code_hash = (await cli?.query.compute.codeHashByCodeId({code_id: String(this.BLACK_JACK_21_CODE_ID)})
    .catch(async (e: any) => { 
        console.log(`failed to get code hash:\n${JSON.stringify(e)}`);
      return ""
    }) as QueryCodeHashResponse).code_hash as string;

  }

  async generate_vk() : Promise<boolean> {

    // if( !(await swal_confirm('generate a viewing key?'))) {
    //   return false;
    // }
    
    let entropy = random_string();

    let set_vk_result = await send_tx(
      this.DCASINO_CONTRACT_ADDRESS,
      this.dcasino_code_hash as string,
      {set_viewing_key: { key: entropy }}, 
      [], 55_000 ) as TxResponse;
    
    if (set_vk_result.arrayLog) {
      this.viewing_key = set_vk_result.arrayLog[6].value;
    } else if (typeof set_vk_result === 'string' ) {
      await swal_error(set_vk_result);
      return false;
    }

    window.localStorage.setItem(`dcasino_${this.granter.address}_vk`, dcasino.viewing_key);

    return true
  }

  async generate_alias() {

    const new_wallet = new Wallet();

    const grantee = new SecretNetworkClient({
      url: dcasino.LCD_URL,
      chainId: this.CHAIN_ID,
      wallet: new_wallet,
      walletAddress: new_wallet.address,
    });

    const grant_allow_msg = new MsgGrantAllowance (
      {
        granter: this.granter.address,
        grantee: new_wallet.address,
        allowance: {
          spend_limit: stringToCoins("15000000uscrt"),
        },
      });

    const set_alias_msg = new MsgExecuteContract (
      {
        sender: this.granter.address,
        contract_address: dcasino.DCASINO_CONTRACT_ADDRESS,
        code_hash: dcasino.dcasino_code_hash,
        msg: {set_alias: {alias: grantee.address, mnem: new_wallet.mnemonic } },
        sent_funds: [],
      },

    );

    const tx = await this.granter.tx.broadcast([grant_allow_msg, set_alias_msg], {
      gasLimit: 66_000,
      gasPriceInFeeDenom: 0.1,
      feeDenom: "uscrt",
      });

    if (typeof tx === 'string' || (tx as TxResponse).code !== 0 ) {
      await swal_error('fee-grant tx failed!');
      console.log(tx);
      return !await swal_confirm("try again?")
    }

    dcasino.set_cli(grantee);
    window.localStorage.setItem(`dcasino_${this.granter.address}_alias_cli_mnem`, new_wallet.mnemonic);
    return true;

    }
  }

export var dcasino = new Dcasino();