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
import { user } from "@/src/queries"
import { useRef } from 'react';


const moon = <FontAwesomeIcon color='rainbow' icon={faVolumeHigh} />
const sun = <FontAwesomeIcon color='rainbow' icon={faVolumeMute} />

export default function Home() {

  //const hours = (new Date()).getHours();
  const [dark, setDark] = useState( false );
  const [show_connect, setShowConnect] = useState(false);
  const [show_credit, setShowCredits] = useState(false);
  const [show_games, setShowGames] = useState(false);
  const [user_info, setUserInfo] = useState(undefined as undefined | IUser)
  const [wallet_addr, setWallet] = useState('');
  const [need_vk, setNeedVk] = useState(false);
  const [need_alias, setNeedAlias] = useState(false);
  const [play_audio,setPlayAudio] = useState(true)
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
  }, [wallet_addr, need_vk, user_info]);

  useEffect(function () {
    do_query();
    const id = setInterval(do_query, 5_000);
    return () => clearInterval(id);
  }, [])

  useEffect(function () {
    if (audioRef.current) {
      audioRef.current.volume = 0.3
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
      <motion.img className="absolute object-cover flex justify-center align-center object-contain" src={'/images/leaves.png'} />
    </div>
        
    <main
    className={`flex min-h-screen flex-col items-center justify-between p-5 text-neutral-800 duration-700`}>

      <div
      onClick={e=>setPlayAudio(!play_audio)}
      className='fixed text-xl bg-black py-1 px-2 rounded-lg z-50 hover:opacity-50 duration-700 top-10 right-16 rainbow-bg'>
        {play_audio ? sun : moon}
      </div>

      <div className='bg-black opacity-[80%] mt-20 z-40 flex text-center py-8 w-full md:w-1/3'>
        <motion.div
          initial={{ width: '33%' }}
          animate={{ width: show_games?'100vw':'33%' }}
          transition={{ duration: 1 }}
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
          opacity-50 ${show_games?'invert':''} ${dcasino.ready?'hover:opacity-100':''} 
          hover:invert bg-black text-white p-1 duration-700 text-sm md:text-base`}>
            {`Play`}
        </motion.div>

        <div className='text-white'>{'|'}</div>

        <motion.div
          initial={{ width: '33%' }}
          animate={{ width: show_connect?'100vw':'33%' }}
          transition={{ duration: 1 }}
         onClick={
        e=>{
          setShowGames(false);
          setShowCredits(false);
          setShowConnect(!show_connect);
        }
          
        }
        className={`
        ${wallet_addr && !need_vk && !need_alias?'':'rainbow-bg'} 
        opacity-50 hover:opacity-100 hover:invert ${show_connect?'invert':''} 
        bg-black p-1 duration-700 text-sm md:text-base text-white`}>
            {wallet_addr && !need_vk && !need_alias?'Account':'Connect'}
        </motion.div>

        <div className='text-white'>{'|'}</div>

        <motion.div
          initial={{ width: '33%' }}
          animate={{ width: show_credit?'100vw':'33%' }}
          transition={{ duration: 1 }}
         onClick={
          async e=>{
            if (!dcasino.ready) {
                await swal_alert('please connect your wallet!')
                setShowCredits(false);
                setShowGames(false);
                setShowConnect(true);

                return
            }

            if (!dcasino.vk_valid) {
                await swal_alert('please set a viewing key!')
                setShowCredits(false);
                setShowGames(false);
                setShowConnect(true);

                return
            }
          //setShowPartners(false);
          setShowGames(false);
          setShowConnect(false);
          setShowCredits(!show_credit);
        }
          
        }
        className={`
        ${!wallet_addr || user_info?.credits || need_alias || need_vk ?'':'rainbow-bg'} 
        opacity-50 ${show_credit?'invert':''} hover:opacity-100 hover:invert bg-black 
        text-white p-1 duration-700 text-sm md:text-base`}>
            {'Bank'}
        </motion.div>
      </div>

      <motion.div
          initial={{ opacity: 0.0, translateY: 0}}
          animate={{ opacity: 0.75, translateY: -100 }}
          transition={{ duration: 1 }}
          className="relative z-40 p-16 mx-1 md:w-1/3 justify-between m-auto top-28 bottom-0 bg-black">
       
        <div className='relative items-center justify-center opacity-100'>
        <motion.img
          animate={{y: [1, -1.6, -2.0, -1.8, -1.6,  1]}}
          transition={{
            repeat: Infinity, 
            duration: 0.75, 
          }}
          className="relative m-auto invert"
          draggable={false}
          onContextMenu={e=>e.preventDefault()}
          src="/images/spade.png"
          alt="spade Logo"
          width={180}
          height={180}
        />
        <div className='font-casino text-center text-white text-6xl md:text-8xl w-full'>{`d'CASINO`}</div>
        </div>
        
      </motion.div>

      <div className='z-50 text-xs md:text-sm lg:text-sm text-center'>
        <span className='rainbow text-center'>{`d'casino v${dcasino.DCASINO_VERSION}. © 2024. Powered by AART Labs`}</span>
      </div>

        
        <Games show_games={show_games} setShowGames={setShowGames} dark={dark}/>
        <Credits show_credits={show_credit} setShowCredits={setShowCredits} dark={dark}/>
        <Connect 
        show={show_connect} 
        setShow={setShowConnect} 
        dark={dark} 
        setWallet={setWallet} 
        wallet_addr={wallet_addr}
        need_vk={need_vk}/>

    </main>

  </div>
  )
}
