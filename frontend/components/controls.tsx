import { dcasino } from '@/generated/constants'
import { swal_error } from '@/src/helpers'
import { send_tx } from '@/src/transactions'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

const home = <FontAwesomeIcon color='black' icon={faHome} />

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

    const [tx_lock, setTxLock] = useState(false)
    const { push } = useRouter()

    function play(id: string) {
        var audio = document.getElementById(id);
        
        if (audio) { 
            //@ts-ignore
            audio.volume = 0.2;
            //@ts-ignore
            audio.play();
        }
      }

    const handleDeal = async () => {
        play('dealordraw');

        if (tx_lock) return
        setTxLock(true)
        
        props.setUpdated('dealt');
        let tx = await send_tx(
            dcasino.VIDEO_POKER_CONTRACT_ADDRESS,
            dcasino.video_poker_code_hash, 
            { deal : { 
                        bet: props.bet, 
                        sender_key: dcasino.viewing_key,
                        as_alias: dcasino.enable_alias
                     }
            },
            [], 
            150_000, 
            dcasino.enable_alias? dcasino.cli: dcasino.granter);

        if (typeof tx === 'string') {
            swal_error (tx);
            setTxLock(false)
            return;
        }

        setTxLock(false)

        props.setDealt(true);
        props.setHeld(new Set<number>([]));
        props.setOutcome('Undefined');
        dcasino.update_position(-props.bet);
    }

    const handleDraw = async () => {
        play('dealordraw');
       

        if (tx_lock) return
        setTxLock(true)

        props.setUpdated('drawn');
        let tx = await send_tx(
            dcasino.VIDEO_POKER_CONTRACT_ADDRESS,
            dcasino.video_poker_code_hash, 
            { draw : { 
                held: Array.from(props.held),
                sender_key: dcasino.viewing_key,
                as_alias: dcasino.enable_alias
            }},
            [], 150_000, dcasino.enable_alias? dcasino.cli: dcasino.granter);

        if (typeof tx === 'string') {

            swal_error (tx);
            setTxLock(false)
            return;
        }

        setTxLock(false)

        props.setDealt(false);
        let tx_arr_log = tx.arrayLog;
        if ( tx_arr_log && tx_arr_log[7] && tx_arr_log[7].key =='credits' ) {
            dcasino.update_position(Number(tx_arr_log[7].value));
        }

    }
    
  return (
    <div className='absolute bottom-5 w-full'>
    <div className='rainbow text-center w-full'>{props.dealt?'Choose cards to hold and then draw!':'Place your bet and then deal!'}</div>
    <div className='select-none text-white w-full flex justify-center items-center'>
        <div 
        onClick={async _ => { 
            push('/')
        }} 
        className={`bg-neutral-800 p-4 rounded-l-2xl hover:bg-red-600`}>
            {home}
        </div>

        <div 
        onClick={_ => { 
            if (!props.dealt && props.bet>1)  {
                props.setBet(props.bet-1);
                props.setOutcome('Undefined');
                play('bet')
            }
        }
        } 
        className={`${props.dealt || props.bet==1  ?'opacity-50':''} bg-neutral-800 p-4 hover:bg-red-800 select-none`}>
            down bet
        </div>

        <div 
        className={`bg-neutral-800 ${props.dealt? 'opacity-50' :''} p-4 select-none`}>
            bet {props.bet}
        </div>

        <div 
        onClick={_ => { 
            if (!props.dealt && props.bet<5)  {
                props.setBet(props.bet+1);
                props.setOutcome('Undefined');
                play('bet');
            } 
        }} 
        className={`${props.dealt || props.bet==5 ?'opacity-50':''} bg-neutral-800 p-4 hover:bg-green-800 select-none`}>
            up bet
        </div>

        <div 
        onClick={async _ => {  if (!props.need_vk) {props.dealt? await handleDraw() : await handleDeal()} }}
        className={`bg-blue-600 rounded-r-2xl p-4 hover:bg-green-800 ${props.need_vk? 'opacity-50': ''}`}>
            { tx_lock ? '...' : (props.dealt? 'draw':'deal')}
        </div>
    </div>
    </div>
  )
}

export default Controls