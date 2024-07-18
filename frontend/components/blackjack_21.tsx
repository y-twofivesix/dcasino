import { BJIInstanceState } from '@/src/interfaces';
import { bj_instance_state } from '@/src/queries';
import React, { useCallback, useEffect, useState } from 'react'
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants';
import { numberToImg, swal_alert, swal_error, translate_card } from '@/src/helpers';
import { motion } from 'framer-motion';
import { send_tx } from '@/src/transactions';
import { Tooltip } from '@mui/material'

interface BlackJack21Props {
  active: boolean
}

interface CardProps {
    value: number | undefined,
    hovered: boolean,
    reset: boolean,
    dealt: boolean | undefined,
    setHovered: React.Dispatch<React.SetStateAction<boolean>>,
    tx_lock: boolean,
    setTxLock: React.Dispatch<React.SetStateAction<boolean>>,
    bet: number,
    setMessage: React.Dispatch<React.SetStateAction<string>>,
  }


interface DealerProps {
    pos: number
    value: number | undefined,
  }

function DealerCard(props: DealerProps) {
    return (
    <motion.img
    animate={{ x: props.pos * 25 }}
        alt={`dealercard-${props.value}`} 
    src={numberToImg(props.value)}
    className={`
    absolute top-24 w-[90px] md:w-[100px] 
    h-[125px] md:h-[150px] duration-700 
    ${ props.value==undefined?'opacity-0':''}`}
    />)
}

function Card (props: CardProps) {

    const handleClick = useCallback(async () => {

        if (props.tx_lock) return

        try {
            props.setTxLock(true)

            props.setMessage('please wait...')

            let tx = !props.dealt ? 

            await send_tx(
                dcasino.BLACK_JACK_21_CONTRACT_ADDRESS,
                dcasino.black_jack_21_code_hash, 
                { deal : { 
                    bet: props.bet,
                    sender_key: dcasino.viewing_key,
                    as_alias: dcasino.enable_alias
                }},
                [], 150_000, dcasino.enable_alias? dcasino.cli: dcasino.granter)
                .catch(async e=> {await swal_error(e)})
            : 
                
            await send_tx(
                dcasino.BLACK_JACK_21_CONTRACT_ADDRESS,
                dcasino.black_jack_21_code_hash, 
                { hit : { 
                    sender_key: dcasino.viewing_key,
                    as_alias: dcasino.enable_alias
                }},
                [], 150_000, dcasino.enable_alias? dcasino.cli: dcasino.granter)
                .catch(async e=> {await swal_error(e)});

            if (typeof tx === 'string') {
                swal_error (tx);
                props.setMessage('')
                return;
            }
        } finally {
            props.setTxLock(false)
        }

    },[props])

    return (<motion.img alt={`card-${props.value}`} 
            src={numberToImg( props.value!==undefined ? props.value : 255 )}
            onMouseOver={e=>{props.setHovered(true && e.currentTarget.className.includes('down'))}}
            onMouseOut={_=>{props.setHovered(false)}}
            onClick={async e =>{
                props.setHovered(false)
                if (!e.currentTarget.className.includes('removed'))
                {
                    await handleClick().catch(async e=> {await swal_error(e)});
                }
                
            }} 
            className={`
            card ${props.value!==undefined?'is-removed':'down'}
            `}
            />)
} 

function BlackJack21(props: BlackJack21Props) {

    const [last_timestamp, setLastTimeStamp] = useState(0);
    const [user_bal, setBalance] = useState(undefined as number | undefined);
    const [tx_lock, setTxLock] = useState(false)
    const [cards_hovered, setCardHovered] = useState(false);
    const [reset, setReset] = useState(false);
    const [message, setMessage] = useState('');
    const [bet, setBet] = useState(2);

    const [inst, setInst] = useState(undefined as BJIInstanceState | undefined)

    const handleInsurance = useCallback(async ()=>{
        if (tx_lock) return

        try {
            setTxLock(true)
            setMessage('please wait...')

            let tx = await send_tx(
                dcasino.BLACK_JACK_21_CONTRACT_ADDRESS,
                dcasino.black_jack_21_code_hash, 
                { insurance : { 
                    sender_key: dcasino.viewing_key,
                    as_alias: dcasino.enable_alias,
                }},
                [], 150_000, dcasino.enable_alias? dcasino.cli: dcasino.granter);

            if (typeof tx === 'string') {
                swal_error (tx);
                setMessage('')
                return;
            }
        } finally {
            setTxLock(false)
        }
    },[])

    const handleStand = useCallback(async ( double_down: boolean)=>{
        if (!inst) { console.log(inst); return}
        if (double_down && inst.credits < inst.bet)  {
            await swal_alert('Not enough credits!');
            return
        }
        if (tx_lock) return

        try {
            setTxLock(true)
            setMessage('please wait...')

            let tx = await send_tx(
                dcasino.BLACK_JACK_21_CONTRACT_ADDRESS,
                dcasino.black_jack_21_code_hash, 
                { stand : { 
                    sender_key: dcasino.viewing_key,
                    as_alias: dcasino.enable_alias,
                    double_down: double_down
                }},
                [], 150_000, dcasino.enable_alias? dcasino.cli: dcasino.granter)
                .catch(async e=> {await swal_error(e)});

            
            if (typeof tx === 'string') {
                swal_error (tx);
                setMessage('')
                return;
            }
        } finally{
            setTxLock(false)
        }
    },[inst])

    useEffect(function() {
        let cards = document.getElementsByClassName('card')
        let cardAmount = (cards.length) + 1;

        for (let i = 1; i < cardAmount; i++) {
            var randomRot = -43 + Math.ceil(Math.random() * 3);
            var card  : HTMLElement | null = document.querySelector(`.card:nth-child(${i})`);
            if (!card) return
            card.style.transform = `rotateX(60deg) rotateY(0deg) rotateZ(${randomRot}deg) translateZ(${i*3}px)`;
        }
    })

    useEffect(function () {

        let do_query = async function() {
     
           if (!props.active ) {
             return;
           }
     
           let inst_state_result = await bj_instance_state();
     
           if (inst_state_result.is_ok) {
             let inst_state = inst_state_result.inner as BJIInstanceState;
             // sync state with backend
             setBalance(inst_state.credits)             

             if (inst_state.timestamp > last_timestamp) {
    
                setInst(inst_state);
                let outcome = inst_state.outcome;
                setMessage(`You: ${inst_state.score} vs House: ${inst_state.dealer_score} ${inst_state.dealt? '' : `(${inst_state.outcome})`}`)
                setLastTimeStamp(inst_state.timestamp)

                if (!inst_state.dealt) {

                    let message = '';
                    let results = `You: ${inst_state.score} vs House: ${inst_state.dealer_score}`
                    if (outcome == 'Win') { message = `You Won ${inst_state.last_win} Credits! ${results}`}
                    else if (outcome == 'Lose') { message = `You Lost! ${results}`}
                    else { message = `${outcome}! ${results}`}
                    
                    if (outcome != "Undefined") {
                        await swal_alert(message);
                    }

                    setReset(true);
                    setMessage('');
                    setInst(undefined)

                } else {
                    setBet(inst_state.bet);
                }

             };
     
     
           } else if (ERR_UNAUTHORISED.test(inst_state_result.inner as string)){
             dcasino.vk_valid = false
           } else {
             console.log(inst_state_result.inner);
           }
     
         }
         setCardHovered(window.innerWidth < 700)
         do_query();
     
         const id = setInterval(do_query, 4000);
         return () => clearInterval(id);
       },[inst, last_timestamp, props.active]);


  return (
    <div className='bg-red-600 w-full h-full overflow-hidden relative'>

        <DealerCard pos={1} value={inst?.dealer[0]}/>
        <DealerCard pos={2} value={inst?.dealer[1]}/>
        <DealerCard pos={3} value={inst?.dealer[2]}/>
        <DealerCard pos={4} value={inst?.dealer[3]}/>
        <DealerCard pos={5} value={inst?.dealer[4]}/>
        <DealerCard pos={6} value={inst?.dealer[5]}/>
        
        
        <div className="cards">
            <Card setMessage={setMessage} bet={bet} reset={reset} dealt={inst?.dealt} value={inst?.hand[4]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
            <Card setMessage={setMessage} bet={bet} reset={reset} dealt={inst?.dealt} value={inst?.hand[3]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
            <Card setMessage={setMessage} bet={bet} reset={reset} dealt={inst?.dealt} value={inst?.hand[2]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
            <Card setMessage={setMessage} bet={bet} reset={reset} dealt={inst?.dealt} value={inst?.hand[1]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
            <Card setMessage={setMessage} bet={bet} reset={reset} dealt={inst?.dealt} value={inst?.hand[0]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
        </div>

        <div className='absolute top-10 right-0 text-right w-full'>
            <div className='text-white p-1 w-[125px] absolute top-0 right-0'>
                <div className='p-2 text-center w-full rounded-lg'>CR: {user_bal}</div>
                <Tooltip title='Stand: hold your total and end your turn.' arrow={true}>
                    <div onClick={async _=>{await handleStand(false)}} className={`p-2 text-center w-full rounded-lg ${inst&&inst.hand.length>1?'bg-green-600 hover:bg-green-900':'opacity-50'}`}>STAND</div>
                </Tooltip>

                <Tooltip title='Insurance: put up half your bet - receive double if house has 21.' arrow={true}>
                <div onClick={async _=>{ if ( inst&&!inst.insured&&translate_card(inst&&inst.dealer[0])[1] == 0 ) await handleInsurance()}} 
                className={`
                p-2 rounded-lg text-center w-full
                ${inst && inst.insured 
                    ? 'bg-green-800' 
                    : `${inst&&inst.dealer[0] && translate_card(inst&&inst.dealer[0])[1] == 0 ?'bg-orange-600 hover:bg-orange-900':'opacity-50'}`}
                `}>INSURE</div>
                </Tooltip>

                <Tooltip title='Double Down: take one final card and double your bet.' arrow={true}>
                    <div onClick={async _=>{await handleStand(true)}} 
                    className={`p-2 text-center w-full rounded-lg ${inst&&(inst.credits>=inst.bet)&&inst.hand.length>1?'bg-red-700 hover:bg-red-800':'opacity-50'}`}>DOUBLE</div>
                </Tooltip>
            </div>
            <div className='p-4 text-left md:text-center'>{cards_hovered?(!(inst&&inst.dealt)?`deal?`:`${message} hit?`):message}</div>
        </div>

        <div className='absolute bottom-0 right-0 text-right'>
            <div className='text-white py-4 p-1 w-[125px]'>
                <div onClick={async _=>{ if (!inst?.dealt && bet < 20) setBet( bet+2 )}} className={`p-2 ${inst?.dealt ? 'bg-green-900':'bg-green-600'} md:hover:bg-green-900 rounded-lg text-center`}>UP</div>
                <div className='p-2 rounded-lg text-center'>BET: {bet}</div>
                <div onClick={async _=>{ if (!inst?.dealt && bet > 2) setBet( bet-2 )} } className={`p-2 ${inst?.dealt ? 'bg-red-900':'bg-red-600'} bg-red-900 md:hover:bg-red-900 rounded-lg text-center`}>DOWN</div>
            </div>
        </div>
    </div>

  )
}

export default BlackJack21