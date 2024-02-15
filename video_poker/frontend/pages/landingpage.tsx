"use client";

import React, { useEffect, useState } from 'react'
import { check_env, do_init, swal_error, swal_success } from '@/src/helpers'
import { pvp } from '@/generated/constants';
import Image from 'next/image';
import { SecretNetworkClient, Wallet } from 'secretjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/*
function LandingPage() {

  const { push } = useRouter();


  useEffect( function() {

    // detect whether there are multiple wallets

      (async function () {
        
        let wallet = new Wallet();

        let cli = new SecretNetworkClient({                      
          url: pvp.LCD_URL,   
          wallet: wallet,                                 
          walletAddress: wallet.address,                  
          chainId: pvp.CHAIN_ID,                            
          });

        pvp.set_code_hash(cli);

      })();

  }, []);

  return (
    <>
      <div className='grid relative border-solid border-white place-items-center bg-black h-screen w-screen'>

        <Image
            src={`/images/banner.png`}
            alt={`banner`}
            fill={true}
            style={{objectFit:"cover"}}
          />

        <div className=' absolute w-1/2 h-48 pl-5 right-0 top-1/3 rounded-l-2xl select-none rainbow-bg'>
          <Image 
              width="0"
              height="0"
              sizes="100vw"
              className="w-full h-full rounded-l-2xl select-none"
              alt='header' 
              src="/images/header.png"
              />
          </div>

        <div 
        onClick={async e => await handleConnect() }

        className={`p-4 m-auto absolute bottom-48 left-0 right-0
        bg-red-900 text-white text-center w-fit
        select-none hover:bg-red-600 rounded-lg shadow-retro`}>
        Connect Wallet 
        </div>



      </div> 
    </>
  
  )
}

export default LandingPage

*/