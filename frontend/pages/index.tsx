"use client"
import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeMute, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'

import 'swiper/css';
import 'swiper/css/pagination';
import Credits from '@/components/credits'
import Games from '@/components/games'
import Connect from '@/components/connect'

import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants'
import { swal_alert } from '@/src/helpers'
import { IUser } from '@/src/interfaces'
import { balance, user } from "@/src/queries"
import { useRef } from 'react';

const vol_on = <FontAwesomeIcon color='black' icon={faVolumeHigh} />
const vol_off = <FontAwesomeIcon color='black' icon={faVolumeMute} />

export default function Home() {

  const [dark, setDark] = useState( false );
  const [show_connect, setShowConnect] = useState(false);
  const [show_credit, setShowCredits] = useState(false);
  const [show_games, setShowGames] = useState(false);
  const [user_info, setUserInfo] = useState(undefined as undefined | IUser)
  const [wallet_addr, setWallet] = useState('');
  const [need_vk, setNeedVk] = useState(false);
  const [need_alias, setNeedAlias] = useState(false);
  const [play_audio,setPlayAudio] = useState(true)
  const [bal, setBal] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);


  const do_query = useCallback(async () => {
    
    if (!dcasino.ready || !dcasino.granter) { 
      setWallet('')
      dcasino.user_info = undefined;
      dcasino.pos_this_session = 0;
      dcasino.set_enable_alias(false);
      return 
    }

    let user_res = await user()
    let bal_ = await balance()

    setBal(bal_)
    if (user_res.is_ok) {
      setUserInfo(user_res.inner as IUser)
      dcasino.user_info = user_res.inner as IUser;
      dcasino.vk_valid = true;
      setNeedVk(false)
    } 
    else if (ERR_UNAUTHORISED.test(user_res.inner as string)) {
      setUserInfo(undefined)
      dcasino.vk_valid = false;
      setNeedVk(true)
    } else {
      setUserInfo(undefined)
    }
    setNeedAlias(!dcasino.enable_alias)
  }, [wallet_addr, need_vk, user_info, dcasino, bal]);

  useEffect(function () {
    do_query();
    const id = setInterval(do_query, 5_000);
    return () => clearInterval(id);
  }, [])

  useEffect(function () {
    if (audioRef.current) {
      audioRef.current.volume = 0.5
      audioRef.current.loop = true
      audioRef.current.play()
    }
  }, [])

  useEffect(function () {
    if (!audioRef.current) return
    
    if (play_audio) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }, [play_audio])

  return (
  <div className={`${dark?'invert':''} select-none`}>

    <audio ref={audioRef} src='/audio/loop.wav'/>
    <div className="absolute fill w-screen h-screen z-0">
      <motion.img loading="eager" className="absolute object-cover flex justify-center align-center object-contain" src={'/images/leaves.webp'} />
    </div>
        
    <main
    className={`relative flex min-h-screen flex-col items-center justify-between p-2 text-neutral-800 duration-700`}>

      <div
      onClick={e=>setPlayAudio(!play_audio)}
      className='fixed text-xl bg-black py-1 px-2 rounded-lg z-50 hover:opacity-50 duration-700 top-5 right-16 rainbow-bg'>
        {play_audio ? vol_on : vol_off}
      </div>

      <div className='bg-black opacity-[80%] topbar px-2 justify-center content-center mt-16 flex text-center py-8 w-full md:w-2/3 lg:w-1/3 rounded-2xl'>
        <motion.div
          initial={{ width: '20%' }}
          animate={{ width: show_games?'50%':'20%' }}
          transition={{ duration: 0.5 }}
          onClick={
          async e=>{
            if (!wallet_addr) {
                await swal_alert('please connect your wallet!')
                setShowGames(false);
                setShowCredits(false);
                setShowConnect(true);
                return
            }

            if (need_vk) {
              await swal_alert('Please complete the connection steps! You have not created a Viewing Key.')
              setShowGames(false);
              setShowCredits(false);
              setShowConnect(true);
              return
            }


            if (need_alias) {
              await swal_alert('Please complete the connection steps! You have not created an Alias.')
              setShowGames(false);
              setShowCredits(false);
              setShowConnect(true);
              return
            }

            if (!user_info?.credits) {
              await swal_alert('You have zero credits! Convert SCRT to CR via the Bank module.')
            }

          setShowCredits(false);
          setShowConnect(false);
          setShowGames(!show_games);
          }}
          className={`
          ${wallet_addr && user_info?.credits && !need_alias && !need_vk? 'rainbow-bg':''} 
          opacity-75 ${show_games?'invert':''} ${dcasino.ready?'hover:opacity-100':''} 
          hover:invert bg-black text-white p-1 duration-700 text-sm md:text-base rounded-xl z-50`}>
            {`Play`}
        </motion.div>

        <div className='text-white px-1'>{'|'}</div>

        <motion.div
          initial={{ width: '20%' }}
          animate={{ width: show_connect?'50%':'20%' }}
          transition={{ duration: 0.5 }}
         onClick={
        e=>{
          setShowGames(false);
          setShowCredits(false);
          setShowConnect(!show_connect);
        }
          
        }
        className={`
        ${wallet_addr && !need_vk && !need_alias?'':'rainbow-bg'} 
        opacity-75 hover:opacity-100 hover:invert ${show_connect?'invert':''} 
        bg-black p-1 duration-700 text-sm md:text-base text-white rounded-xl z-50`}>
            {wallet_addr && !need_vk && !need_alias?'Account':'Connect'}
        </motion.div>

        <div className='text-white px-1'>{'|'}</div>

        <motion.div
          initial={{ width: '20%' }}
          animate={{ width: show_credit?'45%':'20%' }}
          transition={{ duration: 0.5 }}
         onClick={
          async e=>{
            if (!wallet_addr) {
                await swal_alert('please connect your wallet!')
                setShowCredits(false);
                setShowGames(false);
                setShowConnect(true);

                return
            }

            if (need_vk) {
              await swal_alert('Please complete the connection steps! You have not created a Viewing Key.')
              setShowGames(false);
              setShowCredits(false);
              setShowConnect(true);
              return
            }


            if (need_alias) {
              await swal_alert('Please complete the connection steps! You have not created an Alias.')
              setShowGames(false);
              setShowCredits(false);
              setShowConnect(true);
              return
            }

          setShowGames(false);
          setShowConnect(false);
          setShowCredits(!show_credit);
        }
          
        }
        className={`
        ${!wallet_addr || user_info?.credits || need_alias || need_vk ?'':'rainbow-bg'} 
        opacity-75 ${show_credit?'invert':''} hover:opacity-100 hover:invert bg-black 
        text-white p-1 duration-700 text-sm md:text-base rounded-xl z-50`}>
            {'Bank'}
        </motion.div>
      </div>

      <motion.div
          initial={{ opacity: 0.0, translateY: 0}}
          animate={{ opacity: 0.75, translateY: 0 }}
          transition={{ duration: 1 }}
          className="diamond absolute top-1/3 w-[350px] h-[350px] md:w-[500px] md:h-[500px]">
       
        <div className='relative items-center justify-center opacity-100 top-1/4'>
        <motion.img
          animate={{y: [1, -1.6, -2.0, -1.8, -1.6,  1]}}
          transition={{
            repeat: Infinity, 
            duration: 0.75, 
          }}
          className="relative m-auto invert"
          draggable={false}
          onContextMenu={e=>e.preventDefault()}
          src="/images/spade.webp"
          alt="spade Logo"
          width={'25%'}
          height={'25%'}
        />
        <div className='font-casino text-center text-white text-6xl md:text-8xl w-full'>{`d'CASINO`}</div>
        </div>
        
      </motion.div>

      <div className='absolute bottom-4 z-50 text-xs md:text-sm lg:text-sm text-center'>
        <span className='rainbow text-center'>{`d'casino v${dcasino.DCASINO_VERSION}. © 2024. Powered by AART Labs`}</span>
      </div>

        
        <Games show_games={show_games} setShowGames={setShowGames} dark={dark}/>
        <Credits 
        need_vk={need_vk}
        user_state={user_info} 
        bal={bal} 
        show_credits={show_credit} 
        setShowCredits={setShowCredits} 
        dark={dark}/>

        <Connect 
        show={show_connect} 
        setShow={setShowConnect} 
        dark={dark} 
        setWallet={setWallet} 
        wallet_addr={wallet_addr}
        need_vk={need_vk}
        need_alias={need_alias}/>

    </main>

  </div>
  )
}
