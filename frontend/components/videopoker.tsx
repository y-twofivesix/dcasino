import BettingTable from '@/components/betting_table'
import Controls from '@/components/controls';
import Hand from '@/components/hand'
import { VPIInstanceState } from '@/src/interfaces';
import { vp_instance_state } from '@/src/queries';
import React, { useEffect, useState } from 'react'
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants';
import { normal, red, } from '@/src/helpers';
import { motion } from 'framer-motion';


interface VideoPokerProps {
  active: boolean
}

function VideoPoker(props: VideoPokerProps) {

  const [hand, setHand] = useState([255,255,255,255,255]);
  const [bet, setBet] = useState(1);
  const [dealt, setDealt] = useState(false);
  const [outcome, setOutcome] = useState('Undefined');
  const [won, setWon] = useState(0);
  const [need_vk, setNeedVk] = useState(false);
  const [held, setHeld] = useState(new Set<number>([]));
  const [user_bal, setBalance] = useState(undefined as number | undefined);
  const [updated, setUpdated] = useState('-');
  const [last_timestamp, setLastTimeStamp] = useState(0);
  const [crt, setCrt] = useState(true);
  const [mobile, setMobile] = useState(true);
  

  useEffect(function () {
    if (updated=='drawn'|| updated=='dealt') {
      let hand_cpy = [...hand];
      if (updated=='drawn') {
        if (!held.has(hand_cpy[0])) hand_cpy[0] = 255
        if (!held.has(hand_cpy[1])) hand_cpy[1] = 255
        if (!held.has(hand_cpy[2])) hand_cpy[2] = 255
        if (!held.has(hand_cpy[3])) hand_cpy[3] = 255
        if (!held.has(hand_cpy[4])) hand_cpy[4] = 255
        setHand([...hand_cpy])
      } else {
        setHand([255, 255, 255, 255, 255])
      }

    }

  }, [held, updated])

  useEffect(function () {

    setMobile(window.innerWidth < 700)

   let do_query = async function() {

      if (!props.active ) {
        return;
      }

      let inst_state_result = await vp_instance_state();

      if (inst_state_result.is_ok) {
        let inst_state = inst_state_result.inner as VPIInstanceState;

        // sync state with backend
        setBalance(inst_state.credits)

        if (inst_state.timestamp > last_timestamp) {

          setHand([...inst_state.hand]);
          setDealt(inst_state.dealt);
          setUpdated('-');
          setWon(inst_state.last_win);


          if (!inst_state.dealt) {
            
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
            
          }
          
          setLastTimeStamp(inst_state.timestamp)

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
  },[dealt, outcome, last_timestamp, props.active]);

  let screen =  <div className={`w-full h-full bg-blue-700 absolute p-3 md:p-6 vp-sys-font text-sm ${crt && !mobile?'screen-jerk':''}`}>

    <div className={`pt-4 text-lg text-white text-center ${crt && !mobile?'screen-glitch screen-glitch2':''}`}><span>{red('\u2665')} Video Poker {normal('\u2660')}</span></div>

    <div className='p-1 relative right-0 text-base inline bg-white text-black rounded-2xl'>
      <span className='px-2'>CR: {user_bal!=undefined? user_bal: '-'}</span>
      <span className='px-2'>pos: <span className={dcasino.pos_this_session < 0 ? 'text-red-600':'text-green-600'}>{dcasino.pos_this_session}</span></span>
    </div>

    <div className='relative md:max-h-[50%] max-h-[32%] overflow-auto'>
    <BettingTable
    dealt={dealt}
    bet={bet}
    outcome={outcome}
    crt={crt && !mobile}/>
    </div>

  <div className='relative w-full h-auto p-3 max-h-[10%] overflow-hidden'>

    <span className={
      `p-1 text-base text-center text-white left-0 right-0 m-auto relative
      ${dealt? 'bg-orange-600': (outcome == 'Lose' ? 'bg-red-600':  outcome == 'Undefined' ? '' :'bg-green-600') } w-fit text-white`}>
      {dealt ? 'hold and/or draw': `${outcome == 'Undefined'? '...': outcome}` }
    </span>

    <span className='relative left-0 p-1 text-base bg-white w-fit inline text-black'>
      {dealt || outcome == 'Undefined'  ? '...' : (won == 0 ? 'You lost!':`You won: ${won}`) }
    </span>

  </div>

  <div className='relative md:w-[80%] md:h-[30%] left-0 right-0 m-auto md:py-2'>
      <Hand 
      hand={hand}
      dealt={dealt}
      held={held}
      setHeld={setHeld}
      updated={updated}
      dark={false}/>
  </div>

                
</div>

  return (
    <motion.div 
    exit={{ opacity: 0 }}
    className={`w-full h-full relative p-1 bg-blue-800 overflow-hidden invert-0`}>

      <audio id="bet" className="display-none" src={`/audio/bet.wav`}/>
      <audio id="dealordraw" className="display-none" src={`/audio/dealordraw2.wav`}/>
      <audio id="win" className="display-none" src={`/audio/win.wav`}/>
      <audio id="lose" className="display-none" src={`/audio/lose.wav`}/>
      <audio id="select" className="display-none" src={`/audio/select.wav`}/>

      <div id='crt-screen' className='screen m-auto top-1 left-0 right-0 relative w-full h-full md:w-[90%] md:h-[85%] relative text-2xl'>
        {screen}
        <div className={`screen_overlay w-full h-full absolute pointer-events-none ${crt?'backdrop-blur-[0.5px]':''}`}></div>
        <div className={`${crt && !mobile?'':'hidden'} scan-bar w-full h-full absolute pointer-events-none`}><div className='scan'></div></div>
        <img className='bezel w-full h-full absolute pointer-events-none' src='/images/bezel.webp'/>
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
      setUpdated={setUpdated}
      user_bal={user_bal}
      crt={crt && !mobile}
      mobile={mobile}
      setCrt={setCrt}/>    
    </motion.div>
  )
}

export default VideoPoker