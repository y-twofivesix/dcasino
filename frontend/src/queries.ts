import { dcasino } from "@/generated/constants"
import * as i from "./interfaces"
import { QueryBalanceResponse } from "secretjs/dist/extensions/snip1155/msg/getBalance";
import { currency_str } from "./helpers";
import { Result } from "./interfaces";

export async function balance() : Promise<string> {
    const { balance } = await dcasino.granter?.query.bank.balance({
        address: dcasino.granter.address,
        denom: "uscrt",
      }) as QueryBalanceResponse;
  
    let amount = parseInt(balance?.amount)/1e6;
    let amount_str = (isNaN(amount) ? 'NaN' : String(amount.toFixed(2)));

    return amount_str
}

export async function vp_instance_state():  Promise<Result<i.VPIInstanceState | string>>  {

    let handInfo : i.VPIInstanceState | any = await dcasino.granter?.query.compute.queryContract({
        contract_address: dcasino.VIDEO_POKER_CONTRACT_ADDRESS,
        code_hash: dcasino.video_poker_code_hash,
        query: 
        { instance_state : { 
            sender_addr : dcasino.granter.address, 
            sender_key: dcasino.viewing_key,
            hash: dcasino.dcasino_code_hash,
            contract: dcasino.DCASINO_CONTRACT_ADDRESS
        }},
    }).catch(async (e: any) => {
        //console.error(e)
        return {inner: e, is_ok: false};
    });

    return { inner: handInfo, is_ok: i.isVPInstanceState(handInfo) };
}

export async function user():  Promise<Result<i.IUser | string>>  {

    let user_info : i.IUser | any = await dcasino.granter?.query.compute.queryContract({
        contract_address: dcasino.DCASINO_CONTRACT_ADDRESS,
        code_hash: dcasino.dcasino_code_hash,
        query: 
        { user : { 
            sender_addr : dcasino.granter.address, 
            sender_key: dcasino.viewing_key
        }},
    }).catch(async (e: any) => {
        //console.error(e)
        return { inner: e, is_ok: false };
    });

    return { inner: user_info, is_ok: i.isUser(user_info) };
}


export async function alias_of_info(): 
Promise<Result<i.IAliasInfo>> {
    
    let use_cli = dcasino.granter;
    let alias_of : i.IAliasInfo | any = await use_cli.query.compute.queryContract({
        contract_address: dcasino.DCASINO_CONTRACT_ADDRESS,
        code_hash: dcasino.dcasino_code_hash,
        query: { alias_of : { 
            sender_addr: use_cli.address, 
            sender_key: dcasino.viewing_key
        } },
    }).catch(async (e) => {
        //console.log(`query alias info failed:${JSON.stringify(e)}`)
        return {inner: {}, is_ok: false};
    });

    return { inner: alias_of, is_ok: i.isAliasInfo(alias_of)};
}

export async function alias_mnem_info(): 
Promise<Result<i.IAliasMnem>> {
    
    let use_cli = dcasino.granter;
    let alias_mnem : i.IAliasInfo | any = await use_cli.query.compute.queryContract({
        contract_address: dcasino.DCASINO_CONTRACT_ADDRESS,
        code_hash: dcasino.dcasino_code_hash,
        query: { alias_mnem : { 
            sender_addr: use_cli.address,
            sender_key: dcasino.viewing_key
        } },
    }).catch(async (e) => {
        //console.log(`query alias info failed:${JSON.stringify(e)}`)
        return {inner: {}, is_ok: false};
    });


    return { inner: alias_mnem, is_ok : i.isAliasMnem(alias_mnem) };
}

// blackjack

export async function bj_instance_state():  Promise<Result<i.BJIInstanceState | string>>  {

    let handInfo : i.BJIInstanceState | any = await dcasino.granter?.query.compute.queryContract({
        contract_address: dcasino.BLACK_JACK_21_CONTRACT_ADDRESS,
        code_hash: dcasino.black_jack_21_code_hash,
        query: 
        { instance_state : { 
            sender_addr : dcasino.granter.address, 
            sender_key: dcasino.viewing_key,
            hash: dcasino.dcasino_code_hash,
            contract: dcasino.DCASINO_CONTRACT_ADDRESS
        }},
    }).catch(async (e: any) => {
        //console.error(e)
        return {inner: e, is_ok: false};
    });

    return { inner: handInfo, is_ok: i.isBJInstanceState(handInfo) };
}