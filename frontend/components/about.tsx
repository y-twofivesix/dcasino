import React, { CSSProperties, Dispatch, SetStateAction, useCallback, useEffect, useState,} from 'react'
import { Viewer, slide3 } from './components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey, faSquareCheck, faUserGroup, faWallet, faCaretRight, faCircleXmark, faCircle } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { check_env, do_init, swal_alert, swal_error, swal_success } from '@/src/helpers'
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants'
import { user } from '@/src/queries'
import { IUser } from '@/src/interfaces'
import BounceLoader from "react-spinners/BounceLoader";

interface AboutProps {
    show_about: boolean
    setShowAbout: Dispatch<SetStateAction<boolean>>,
    dark: boolean,
    wallet_addr: string,
    setWallet: Dispatch<SetStateAction<string>>,
    need_vk: boolean
}

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};


function About(props: AboutProps) {

  const wallet = <FontAwesomeIcon color='white' icon={faWallet} />
  const key = <FontAwesomeIcon color='white' icon={faKey} />
  const check = <FontAwesomeIcon color='green' icon={faSquareCheck} />
  const alias = <FontAwesomeIcon color='white' icon={faUserGroup} />
  const caret = <FontAwesomeIcon color='green' icon={faCaretRight} />
  const cross = <FontAwesomeIcon color='red' icon={faCircleXmark} />
  const circle = <FontAwesomeIcon color='grey' icon={faCircle} />

  const [show_wallets, setShowWallets] = useState(false);
  const [show_kyc, setShowKYC] = useState(false);
  const [verification_link, setVerificationLink] = useState(undefined as string | undefined);
  const [loading, setLoading] = useState('');

  const handleAlias = async () => {

    if (!dcasino.ready || !props.wallet_addr){ 
      await swal_alert(`Please connect a wallet first`,'')
      return 
    }
    if (!dcasino.vk_valid) {
      await swal_alert(`Please set a viewing key in the top left corner`,'Viewing key not set')
      return
    }

    // query 
    setLoading('Generating an alias.')
    if (await dcasino.generate_alias()) { 
      await swal_success('alias created!','',1000);
      dcasino.set_enable_alias(true);
    }
    setLoading('')
  }

  const handleViewingKey = async () => {

    if (!dcasino.ready || !props.wallet_addr){ 
      await swal_alert(`Please connect a wallet first`,'')
      return 
    }

    setLoading('Generating a Viewing Key.')
    if (await dcasino.generate_vk()) { 
      await swal_success('viewing key created!','',1000);
    }
    setLoading('')
  }
  
  const handleConnect = async () =>{

    // if (!accepted_terms) {
    //   await checkAcceptedTerms();
    //   if (!accepted_terms) return
    // }

    if (props.wallet_addr) {
      props.setWallet('');
      dcasino.ready = false;
      dcasino.user_info = undefined;
      dcasino.pos_this_session = 0;
      return;
    }
    
    //setRoute(route)
    let wallets = [];
      //@ts-ignore
    if (window.keplr) wallets.push('Keplr');
    //@ts-ignore
    if (window.leap) wallets.push('Leap');
     //@ts-ignore
    if (window.ethereum) wallets.push('MetaMask');
    //@ts-ignore
    if (window.fina) wallets.push('Fina');

    if (wallets.length==1) {
      await swal_success(`${wallets[0]} wallet detected!`, '', 1500);
      // do init
      //await try_enter_game(wallets[0], route);
      await connect(wallets[0]);

    } else  {
      //@ts-ignore
      // show wallet options
      setShowWallets(true);
    }
  }

  const connect = async ( wallet: string,) => {
    setShowWallets(false);
    if (await do_init(wallet)) {
      await check_env();
      
      let addr_pre = dcasino.granter.address.substring(0,6)
      let addr_end = dcasino.granter.address.substring(40)

      props.setWallet(`${wallet} address: ${addr_pre}...${addr_end}`)
    }
  }
  
  return (
    <>
      <Viewer
    show={props.show_about}
    setShow={props.setShowAbout}
    dark={props.dark}
    vert={true}
      >
      {[
        
        slide3('Connect',
        <div className='p-4'>

          <div 
          onClick={_=>handleConnect()}
          className={`px-1 py-3 max-w-[500px] m-auto left-0 right-0 opacity-50 flex rounded-lg text-white ${props.wallet_addr?'':'bg-green-900 hover:bg-blue-600'}`}>
            <div className={`${props.wallet_addr?'':'leftandright'} p-3 h-full m-auto top-0 bottom-0`}>{props.wallet_addr?check:caret}</div>
            <div className={`px-4`}>
              {wallet} {props.wallet_addr?`${props.wallet_addr} connected! Click to disconnect.`:
              'Connect your wallet, be sure to have enough tokens for gas fees!'}
            </div>
          </div>

          <div 
          onClick={async _=> await handleViewingKey()}
          className={`px-1 py-3 max-w-[500px] m-auto left-0 right-0 opacity-50 flex rounded-lg text-white ${(props.wallet_addr&&!props.need_vk) || (!props.wallet_addr) ?'':'bg-green-900 md:hover:bg-blue-600'}`}>
            <div className={`${(props.wallet_addr&&!props.need_vk) || !props.wallet_addr ?'':'leftandright'} p-3 h-full m-auto top-0 bottom-0`}>{props.wallet_addr?(props.need_vk?caret:check):circle}</div>
            <div className='p-2'>{key} Create a viewing key, this is how you view your private onchain data.</div>
          </div>

          <div 
          onClick={async _=>await handleAlias()}
          className={`px-1 py-3 max-w-[500px] m-auto left-0 right-0 opacity-50 flex rounded-lg text-white  ${(props.wallet_addr&&!props.need_vk&&dcasino.enable_alias) || (!props.wallet_addr) || (props.need_vk) ?'':'bg-green-900 md:hover:bg-blue-600'}`}>
            <div className={`${(props.wallet_addr&&!props.need_vk&&dcasino.enable_alias) || (!props.wallet_addr) || (props.need_vk)?'':'leftandright'} p-3 h-full m-auto top-0 bottom-0`}>{props.wallet_addr&&!props.need_vk?(dcasino.enable_alias?check:caret):circle}</div>
            <div className='p-2'>{alias} Create an Alias; a dummy wallet for faster app interaction This will greatly improve your experience.</div>
          </div>

          <div className={`hidden px-1 py-3 max-w-[500px] m-auto left-0 right-0 opacity-50 flex rounded-lg text-white ${dcasino.enable_alias?'':'bg-green-900 md:hover:bg-blue-600'}`}>
            <div className={`p-3 h-full m-auto top-0 bottom-0`}>{circle}</div>
            <div className='p-2'>(recommended) generate a zk-proof of your humanity for KYC, using {`Reclaim Protocol's`} Zero-knowledge solution</div>
          </div>

        </div>),
        slide3('What is a dCasino?',
        <div className='px-12'>
          {`A dCasino is simply a platform with a suite of casino games. Users can connect their wallets to the platform,
          onboard and cash in tokens, play casino games seamlessly with their tokens, then cash out again. 
          A dCasino is made possible by on-chain privacy and VRF, which would be necessary for a positive user 
          experience and some core game functionalities, and which are not readily available on other blockchains.`}
        </div>, ),

      ]}
      </Viewer>
      <div className={`
          fixed top-0 left-0 z-50 p-1
          w-screen h-screen backdrop-blur-md 
          ${show_wallets?'':'hidden'}`}>
            <motion.div
              animate={{ opacity: show_wallets ? 1: 0, scale: show_wallets ? 1: 0}}
              transition={{
                duration: 0.4,
                delay: 0.2,
                ease: [0, 0.71, 0.2, 1.01]
              }}
              className={` ${show_wallets? '':'hidden'}
              ${props.dark?'invert':''}
              absolute bg-black h-fit text-center text-white
              top-0 bottom-0 left-3 right-3 m-auto z-50
              p-4 rounded-2xl 
              md:w-1/3`}>
                <div 
                onClick={_=>setShowWallets(false)}
                className='p-2 absolute top-0 right-0 rounded-tr-lg bg-red-900 hover:bg-red-600'>x</div>
                <h1 className=' px-2 py-4 text-2xl rounded-2xl'>Choose your wallet</h1>
                <ul>
                  <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('Keplr')}>Keplr</li>
                  <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('MetaMask')}>MetaMask</li>
                  <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('Fina')}>Fina</li>
                  <li className='py-4 hoverrainbow hover:bg-indigo-900 rounded-2xl' onClick={async _ => await connect('Leap')}>Leap</li>
                </ul>
            </motion.div>
      </div>

      <div className={`
          fixed top-0 left-0 z-50 p-1
          w-screen h-screen backdrop-blur-md 
          ${loading?'':'hidden'}`}>
            <motion.div
              animate={{ opacity: loading ? 1: 0, scale: loading ? 1: 0}}
              transition={{
                duration: 0.4,
                delay: 0.2,
                ease: [0, 0.71, 0.2, 1.01]
              }}
              className={` ${loading? '':'hidden'}
              ${props.dark?'invert':''}
              absolute bg-black opacity-[25%] h-40 text-center text-white
              top-0 bottom-0 left-3 right-3 m-auto z-50
              p-4 rounded-2xl 
              md:w-1/3`}>
                <div><BounceLoader cssOverride={override} color='blue'/></div>
                <div>{loading}</div>

            </motion.div>
      </div>
    </>
   
    
  )
}

export default About
