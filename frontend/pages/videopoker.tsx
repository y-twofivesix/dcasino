import BettingTable from '@/components/betting_table'
import Controls from '@/components/controls';
import Hand from '@/components/hand'
import { IInstanceState } from '@/src/interfaces';
import { balance, vp_instance_state } from '@/src/queries';
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants';
import { currency_str, normal, red, swal_alert } from '@/src/helpers';
import { motion } from 'framer-motion';
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';



function VideoPoker() {

  const { push } = useRouter();
  const [hand, setHand] = useState([255,255,255,255,255]);
  const [bet, setBet] = useState(1);
  const [dealt, setDealt] = useState(false);
  const [outcome, setOutcome] = useState('Undefined');
  const [won, setWon] = useState(0);
  const [need_vk, setNeedVk] = useState(false);
  const [held, setHeld] = useState(new Set<number>([]));
  const [user_bal, setBalance] = useState('-');
  const [updated, setUpdated] = useState('-');
  const [dark, setDark] = useState(false);
  const [last_timestamp, setLastTimeStamp] = useState(0);
  


  useEffect(function () {

    if (!dcasino.ready ) {
      push('/')
      return;
    }


   let do_query = async function() {

      //let bal = await balance();
      //setBalance(`${bal[0]} ${bal[1]}`);
      let inst_state_result = await vp_instance_state();

      if (inst_state_result.is_ok) {
        let inst_state = inst_state_result.inner as IInstanceState;
        // sync state with backend
        setHand(inst_state.hand);
        setDealt(inst_state.dealt);
        setBalance(String(inst_state.credits))
        setWon(Number(inst_state.last_win))

        if (!inst_state.dealt) {
          
          if (inst_state.timestamp!== last_timestamp) {

            setOutcome(inst_state.last_outcome);
            let this_outcome = inst_state.last_outcome;
            if (this_outcome == 'Undefined') return
            let id = 'win'
            if (inst_state.last_outcome == 'Lose') {
              id = 'lose'
            }
            var audio = document.getElementById(id);
            //@ts-ignore
            if (audio) { 
              //@ts-ignore
              audio.volume = 0.2;
              //@ts-ignore
              audio.play();
            }
            setLastTimeStamp(inst_state.timestamp)
          }

        };

        setWon(inst_state.last_win);

      } else if (ERR_UNAUTHORISED.test(inst_state_result.inner as string)){
        setNeedVk(true);
      } else {
        console.log(inst_state_result.inner);
      }

    }

    do_query();

    // check state every 7 seconds
    const id = setInterval(do_query, 7000);
    return () => clearInterval(id);
  },[dealt, outcome, updated]);

  let screen =  <div className='w-full h-full bg-blue-700 absolute p-6'>

    <div className='pt-5 text-white text-center'> {red('\u2665')} Video Poker  {normal('\u2660')} </div>
  <BettingTable
  dealt={dealt}
  bet={bet}
  outcome={outcome}/>

  <div className='relative w-full h-16'>

    <div className='absolute left-0 p-1 text-lg bg-white w-fit inline text-black rounded-r-2xl'>
      {dealt ? '...' : (won == 0 ? 'You lost!':`You won: ${won}`) }
    </div>

    <div className={
      `p-1 text-xl text-center text-white left-0 right-0 m-auto absolute
      ${outcome == 'Lose' || outcome == 'Undefined'? 'bg-red-600': 'bg-green-600' } w-fit text-white`}>
      {dealt ? 'hold and/or draw': `Result: ${outcome}` }
    </div>

    <div className='p-1 absolute right-0 text-lg inline bg-white text-black rounded-l-2xl'>
      <div>Credits: {user_bal}</div>
      <div>position: <span className={dcasino.pos_this_session < 0 ? 'text-red-600':'text-green-600'}>{dcasino.pos_this_session}</span></div>
    </div>
  </div>

  <div className='relative w-2/3 h-fit left-0 right-0 m-auto py-2'>
      <Hand 
      hand={hand}
      dealt={dealt}
      held={held}
      setHeld={setHeld}
      updated={updated}
      dark={dark}/>
  </div>

                
</div>

  return (
    <motion.div 
    exit={{ opacity: 0 }}
    className={`w-screen h-screen relative p-5 bg-blue-800 ${dark?'invert':''} overflow-hidden`}>

      <audio id="bet" className="display-none" src={`/audio/bet.wav`}/>
      <audio id="dealordraw" className="display-none" src={`/audio/dealordraw2.wav`}/>
      <audio id="win" className="display-none" src={`/audio/win.wav`}/>
      <audio id="lose" className="display-none" src={`/audio/lose.wav`}/>
      <audio id="select" className="display-none" src={`/audio/select.wav`}/>

      <div id='crt-screen' className='screen m-auto top-8 left-0 right-0 relative w-[65%] h-[90%] max-h-[700px] max-w-[950px] relative font-ibm text-2xl'>
        {screen}
        <div className='screen_overlay w-full h-full absolute pointer-events-none backdrop-blur-[1px]'></div>
        <div className='scan-bar w-full h-full absolute pointer-events-none'><div className='scan'></div></div>
        <img className='bezel w-full h-full absolute pointer-events-none' src='/images/bezel.png'/>
      </div>


    
      <Controls 
      bet={bet}
      setBet={setBet} 
      dealt={dealt} 
      setDealt={setDealt} 
      need_vk={need_vk} 
      setNeedVk={setNeedVk}
      held={held}
      setHeld={setHeld}
      setOutcome={setOutcome}
      setUpdated={setUpdated}/>
                
    </motion.div>
  )
}

export default VideoPoker