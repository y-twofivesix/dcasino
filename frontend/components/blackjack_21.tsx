import { BJIInstanceState } from '@/src/interfaces';
import { bj_instance_state } from '@/src/queries';
import React, { useCallback, useEffect, useState } from 'react'
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants';
import { numberToImg, swal_alert, swal_confirm, swal_error, translate_card } from '@/src/helpers';
import { motion } from 'framer-motion';
import { send_tx } from '@/src/transactions';

interface BlackJack21Props {
  active: boolean
}

interface CardProps {
    value: number | undefined,
    hovered: boolean,
    reset: boolean,
    setReset: React.Dispatch<React.SetStateAction<boolean>>,
    dealt: boolean,
    setHovered: React.Dispatch<React.SetStateAction<boolean>>,
    tx_lock: boolean,
    setTxLock: React.Dispatch<React.SetStateAction<boolean>>,
    bet: number,
    setMessage: React.Dispatch<React.SetStateAction<string>>,
  }


interface DealerProps {
    pos: number
    value: number | undefined,
    reset: boolean,
  }

function DealerCard(props: DealerProps) {
    return (<motion.img
    animate={{ x: props.pos * 25 }}
        alt={`dealercard-${props.value}`} 
    src={numberToImg(props.value)}
    className={`
    absolute top-5 w-[100px] 
    h-[150px] duration-700 
    ${ props.value==undefined?'opacity-0':''}`}
    />)
}

function Card (props: CardProps) {

    const [removed, setRemoved] = useState(false);

    useEffect(function(){
        if (!props.reset) {
            setRemoved(false);
        }
    }, [props.reset])

    const handleClick = useCallback(async () => {

        if (props.tx_lock) return
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
         : 
            
        await send_tx(
            dcasino.BLACK_JACK_21_CONTRACT_ADDRESS,
            dcasino.black_jack_21_code_hash, 
            { hit : { 
                sender_key: dcasino.viewing_key,
                as_alias: dcasino.enable_alias
            }},
            [], 150_000, dcasino.enable_alias? dcasino.cli: dcasino.granter);

        props.setTxLock(false)
        if (typeof tx === 'string') {
            swal_error (tx);
            props.setMessage('')
            return;
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
                    await handleClick()
                }
                
            }} 
            className={`
            card ${props.value!==undefined?'is-removed':'down'}
            `}
            />)
} 

function BlackJack21(props: BlackJack21Props) {

    const [last_timestamp, setLastTimeStamp] = useState(0);
    const [dealt, setDealt] = useState(false);
    const [hand, setHand] = useState([] as number[]);
    const [dealer, setDealer] = useState([] as number[]);
    const [won, setWon] = useState(0);
    const [user_bal, setBalance] = useState(undefined as number | undefined);
    const [tx_lock, setTxLock] = useState(false)
    const [cards_hovered, setCardHovered] = useState(false);
    const [reset, setReset] = useState(false);
    const [message, setMessage] = useState('');
    const [bet, setBet] = useState(1);

    const calculateScore = (hand: number[]) => {
        let aces = 0;
        let score = 0;
        hand.forEach( card => {
            let [_, value] = translate_card(card)

            if( value >= 9 ) {
                value = 10;
            } else if ( value == 0 ){
                value = 11; 
                aces=+1;               
            } else {
                value +=1
            }
            score+=(value);
        })

        if (score>21) {
            let inter_value = score
            
            for (let i=0; i<aces; ++i) {
                inter_value -= 10 // discount 10
                if (inter_value <= 21) {
                    score = inter_value
                    break;
                }
            }
        }

        return score
    }

    const handleStand = useCallback(async ()=>{
        if (tx_lock) return
        setTxLock(true)
        setMessage('please wait...')

        let tx = await send_tx(
            dcasino.BLACK_JACK_21_CONTRACT_ADDRESS,
            dcasino.black_jack_21_code_hash, 
            { stand : { 
                sender_key: dcasino.viewing_key,
                as_alias: dcasino.enable_alias
            }},
            [], 150_000, dcasino.enable_alias? dcasino.cli: dcasino.granter);

        setTxLock(false)
        if (typeof tx === 'string') {
            swal_error (tx);
            setMessage('')
            return;
        }
    },[])

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

             console.log(inst_state_result.inner);
             

             if (inst_state.timestamp > last_timestamp) {
    
                setHand([...inst_state.hand]);
                setDealer([...inst_state.dealer]);
                setDealt(inst_state.dealt);
                setWon(inst_state.last_win);
                setBalance(inst_state.credits);
                let curr_score = calculateScore(inst_state.hand);
                let dealer_score = calculateScore(inst_state.dealer);
                let outcome = inst_state.outcome;
                setMessage(`You: ${curr_score} vs House: ${dealer_score} ${inst_state.dealt? '' : `(${inst_state.outcome})`}`)
                setLastTimeStamp(inst_state.timestamp)

                if (!inst_state.dealt) {

                    let message = '';
                    if (outcome == 'Win') { message = `You Won ${inst_state.last_win} Credits!`}
                    else if (outcome == 'Lose') { message = 'You Lost!'}
                    else { message = `${outcome}!`}
                    
                    await swal_alert(message).then(()=>{
                        setReset(true);
                        setMessage('');
                        setHand([]);
                        setDealer([]);
                    });

                    


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
     
         do_query();
     
         const id = setInterval(do_query, 4000);
         return () => clearInterval(id);
       },[dealt, last_timestamp, props.active]);


  return (
    <div className='bg-red-600 w-full h-full overflow-hidden relative'>

        <DealerCard pos={1} reset={reset} value={dealer[0]}/>
        <DealerCard pos={2} reset={reset} value={dealer[1]}/>
        <DealerCard pos={3} reset={reset} value={dealer[2]}/>
        <DealerCard pos={4} reset={reset} value={dealer[3]}/>
        <DealerCard pos={5} reset={reset} value={dealer[4]}/>
        <DealerCard pos={6} reset={reset} value={dealer[5]}/>
        
        
        <div className="cards">
            <Card setMessage={setMessage} bet={bet} reset={reset} setReset={setReset} dealt={dealt} value={hand[4]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
            <Card setMessage={setMessage} bet={bet} reset={reset} setReset={setReset} dealt={dealt} value={hand[3]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
            <Card setMessage={setMessage} bet={bet} reset={reset} setReset={setReset} dealt={dealt} value={hand[2]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
            <Card setMessage={setMessage} bet={bet} reset={reset} setReset={setReset} dealt={dealt} value={hand[1]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
            <Card setMessage={setMessage} bet={bet} reset={reset} setReset={setReset} dealt={dealt} value={hand[0]} hovered={cards_hovered} setHovered={setCardHovered} tx_lock={tx_lock} setTxLock={setTxLock}/>
        </div>

        <div className='absolute top-0 left-0 text-center w-full'>
            <div className='text-white p-8'>
                <span className='p-2 rounded-lg'>CREDITS: {user_bal}</span>
                <span onClick={async _=>{await handleStand()}} className={`p-2 rounded-lg ${hand.length>1?'bg-green-600 hover:bg-green-900':'opacity-50'}`}>STAND</span>
            </div>
            <div>{cards_hovered?(!dealt?`deal?`:`${message} hit?`):message}</div>
        </div>

        <div className='absolute bottom-0 left-0 text-right w-full'>
            <div className='text-white p-8'>
                <span onClick={async _=>{ if (!dealt && bet > 1) setBet( bet-1 )} } className='hover:bg-red-900 p-2 rounded-lg'>DOWN</span>
                <span className='p-2 rounded-lg'>BET: {bet}</span>
                <span onClick={async _=>{ if (!dealt && bet < 21) setBet( bet+1 )}} className='hover:bg-red-900 p-2 rounded-lg'>UP</span>
            </div>
        </div>
    </div>

  )
}

export default BlackJack21