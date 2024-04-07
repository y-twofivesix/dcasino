"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'

import 'swiper/css';
import 'swiper/css/pagination';
import Credits from '@/components/credits'
import Games from '@/components/games'
import About from '@/components/about'
import DappViewer from "@/components/dappviewer"


import { dcasino } from '@/generated/constants'
import { swal_alert } from '@/src/helpers'
import { IUser } from '@/src/interfaces'
import Swal from "sweetalert2"

const moon = <FontAwesomeIcon color='black' icon={faMoon} />
const sun = <FontAwesomeIcon color='black' icon={faSun} />

export default function Home() {

  const hours = (new Date()).getHours();
  const [dark, setDark] = useState( hours >= 18 || hours < 6 );
  const [show_about, setShowAbout] = useState(false);
  const [show_credit, setShowCredits] = useState(false);
  const [show_games, setShowGames] = useState(false);

  const [user_state, setUserInfo] = useState(undefined as undefined | IUser)

  useEffect(function() {
    setUserInfo(dcasino.user_info)
  }, [dcasino.user_info])

  return (
  <div className={`${dark?'invert':''} select-none`}>

    <main
    className={`flex min-h-screen flex-col items-center justify-between p-5 bg-orange-100 text-neutral-800 duration-700`}>

      <div
      onClick={e=>setDark(!dark)}
      className='fixed text-xl opacity-25 z-50 hover:opacity-100 duration-700 top-5 right-16'>
        {dark ? sun : moon}
      </div>

      <motion.div
          initial={{ opacity: 0, translateY: 0}}
          animate={{ opacity: 1, translateY: -100 }}
          transition={{ duration: 1 }}
          className="relative z-40  justify-between m-auto top-28 bottom-0">
       
        <div className='relative items-center justify-center'>
        <motion.img
          className="relative m-auto"
          draggable={false}
          onContextMenu={e=>e.preventDefault()}
          src="/images/spade.png"
          alt="spade Logo"
          width={180}
          height={180}
        />
        </div>
        <div className='font-casino text-8xl w-full'>{`d'CASINO`}</div>


      </motion.div>

      <div className='flex text-center py-4 w-full md:w-[35%]'>
        <motion.div
          initial={{ width: '33%' }}
          animate={{ width: show_games?'100vw':'33%' }}
          transition={{ duration: 1 }}
          onClick={
          async e=>{
            if (!dcasino.ready) {
                await swal_alert('please connect your wallet!')
                setShowGames(false);
                setShowCredits(false);
                setShowAbout(true);
                return
            }

            if (!dcasino.vk_valid) {
                await swal_alert('please set a viewing key!')
                setShowGames(false);
                setShowCredits(false);
                setShowAbout(true);
                return
            }
          //setShowPartners(false);
          setShowCredits(false);
          setShowAbout(false);
          setShowGames(!show_games);
          }}
          className={`opacity-50 ${show_games?'invert':''} ${dcasino.ready?'hover:opacity-100':''} hover:invert bg-orange-100 p-1 duration-700 text-sm md:text-base`}>
            {`d'Apps`}
        </motion.div>

        <div className=''>{'|'}</div>

        <motion.div
          initial={{ width: '33%' }}
          animate={{ width: show_about?'100vw':'33%' }}
          transition={{ duration: 1 }}
         onClick={
        e=>{
          setShowGames(false);
          setShowCredits(false);
          setShowAbout(!show_about);
        }
          
        }
        className={`opacity-50 hover:opacity-100 hover:invert ${show_about?'invert':''} bg-orange-100 p-1 duration-700 text-sm md:text-base`}>
            About
        </motion.div>

        <div className=''>{'|'}</div>

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
                setShowAbout(true);

                return
            }

            if (!dcasino.vk_valid) {
                await swal_alert('please set a viewing key!')
                setShowCredits(false);
                setShowGames(false);
                setShowAbout(true);

                return
            }
          //setShowPartners(false);
          setShowGames(false);
          setShowAbout(false);
          setShowCredits(!show_credit);
        }
          
        }
        className={`opacity-50 ${show_credit?'invert':''} hover:opacity-100 hover:invert bg-orange-100 p-1 duration-700 text-sm md:text-base`}>
            Credits
        </motion.div>

      </div>

      <div className='text-xs md:text-sm lg:text-sm text-center'>
        <span className='opacity-25 '>{`d'casino v${dcasino.DCASINO_VERSION}. © 2024. Powered by AART Labs`}</span>
      </div>

        
        <Games show_games={show_games} setShowGames={setShowGames} dark={dark}/>
        <Credits show_credits={show_credit} setShowCredits={setShowCredits} dark={dark}/>
        <About show_about={show_about} setShowAbout={setShowAbout} dark={dark}/>

    </main>

  </div>
  )
}
