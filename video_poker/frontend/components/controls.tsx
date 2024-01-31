import { pvp } from '@/generated/constants'
import { swal_error } from '@/src/helpers'
import { send_tx } from '@/src/transactions'
import React, { useCallback } from 'react'
import { stringToCoin } from 'secretjs'


interface ControlsProps {
    bet: number,
    dealt: boolean,
    setBet: React.Dispatch<React.SetStateAction<number>>,
    setDealt: React.Dispatch<React.SetStateAction<boolean>>,
    need_vk: boolean,
    setNeedVk: React.Dispatch<React.SetStateAction<boolean>>,
    held: Set<number>,
    setHeld: React.Dispatch<React.SetStateAction<Set<number>>>,
    setOutcome: React.Dispatch<React.SetStateAction<string>>,
    setUpdated: React.Dispatch<React.SetStateAction<string>>
}
function Controls( props : ControlsProps) {

    const handleSetVk = async () => {
        props.setNeedVk(!(await pvp.generate_vk()));
    }

    const handleDeal = async () => {
        let tx = await send_tx(
            pvp.code_hash, 
            { deal : { bet: props.bet}},
            [{ amount: String(props.bet * 1_000_000), denom: 'uscrt' }], 66_000);

        if (typeof tx === 'string') {

            swal_error (tx);
            return;
        }
        props.setDealt(true);
        props.setHeld(new Set<number>([]));
        props.setOutcome('-');
        props.setUpdated('dealt');
        pvp.update_position(-props.bet);
    }

    const handleDraw = async () => {
        let tx = await send_tx(
            pvp.code_hash, 
            { draw : { held: Array.from(props.held) }},
            [], 66_000);

        if (typeof tx === 'string') {

            swal_error (tx);
            return;
        }
        props.setDealt(false);
        props.setUpdated('drawn');
        let tx_arr_log = tx.arrayLog;
        if ( 
            tx_arr_log && tx_arr_log[0].key =='receiver' &&
            tx_arr_log[0].value == pvp.granter.address &&
            tx_arr_log[1].key == 'amount'
            ) {
                let coins_won = stringToCoin(tx_arr_log[1].value);
                if (coins_won.denom == 'uscrt') {
                    let pos_update = parseInt(coins_won.amount) / 1e6;
                    pvp.update_position(pos_update);
                }

        }

    }
    
  return (
    <div className='absolute select-none text-white m-auto bottom-5 p-4 left-0 right-0 w-full h-fit'>

        <div 
        onClick={async _ => { 
            if (props.need_vk) {
                await handleSetVk()
            }
        }} 
        className={`float-left bg-red-300 p-4 rounded-l-2xl hover:bg-red-600 ${props.need_vk ? 'rainbow-bg' :'opacity-50'}`}>
            {props.need_vk ? 'set viewing key' : 'viewing!'}
        </div>

        <div 
        onClick={_ => { if (!props.dealt && props.bet>1)  props.setBet(props.bet-1) }} 
        className={`${props.dealt?'opacity-50':''} float-left bg-red-400 p-4 hover:bg-red-800 select-none`}>
            down bet
        </div>

        <div 
        className={`float-left bg-red-600 ${props.dealt? 'opacity-50' :''} p-4 select-none`}>
            bet {props.bet}
        </div>

        <div 
        onClick={_ => { if (!props.dealt && props.bet<5)  props.setBet(props.bet+1) }} 
        className={`${props.dealt?'opacity-50':''} float-left bg-red-400 p-4 hover:bg-red-800 select-none`}>
            up bet
        </div>

        <div 
        onClick={async _ => {  if (!props.need_vk) {props.dealt? await handleDraw() : await handleDeal()} }}
        className={`float-left bg-red-400 rounded-r-2xl p-4 hover:bg-red-800 ${props.need_vk? 'opacity-50': ''}`}>
            {props.dealt ? 'draw':'deal'}
        </div>
    </div>
  )
}

export default Controls