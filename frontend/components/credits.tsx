import React, { CSSProperties, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { PlainViewer, slide } from './components'
import { ERR_UNAUTHORISED, dcasino } from '@/generated/constants'
import { balance, user } from '@/src/queries'
import { IUser } from '@/src/interfaces'
import { swal_alert, swal_error, swal_success } from '@/src/helpers'
import { send_tx } from '@/src/transactions'
import BounceLoader from 'react-spinners/BounceLoader'

interface ConsultProps {
    show_credits: boolean
    setShowCredits: Dispatch<SetStateAction<boolean>>,
    dark: boolean
}

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};


function Credits(props: ConsultProps) {
  const [user_state, setUserInfo] = useState(undefined as undefined | IUser);
  const [bal, setBalance] = useState(undefined as undefined | string)
  const [pay_in, setPayIn] = useState(undefined as number | undefined)
  const [pay_out, setPayOut] = useState(undefined as number | undefined)
  const [loading, setLoading] = useState('');


  const handlePayIn = useCallback (async ()=> {
    
    if (!dcasino.ready || !pay_in) return 
    if (!dcasino.vk_valid) {
      await swal_alert(`Please set a viewing key in the top left corner`,'Viewing key not set')
      return
    }


    if ( user_state && !user_state.kyc_validated && ( pay_in > 50 || user_state?.credits >= 50)) {
      await swal_alert('Credits are temporarily capped at 50 for users without KYC');
      return
    }

    try {
      setLoading('Depositing...')
      let tx = await send_tx(
        dcasino.DCASINO_CONTRACT_ADDRESS,
        dcasino.dcasino_code_hash, 
        { pay_in : { amount: pay_in }},
        [{ amount: String( pay_in * 1_000_000 ) , denom: 'uscrt' }], 
        66_000);

      if (typeof tx === 'string') {
          await swal_error (tx);
          return;
      } else {
        await swal_success('transaction complete!', '',1500)
        setPayIn(undefined)
      }
    }
    finally {
      setLoading('')
    }
}, [user_state, pay_in])

const handlePayOut = useCallback (async ()=> {
    
  if (!dcasino.ready || !pay_out) return 
  if (!dcasino.vk_valid) {
    await swal_alert(`Please set a viewing key in the top left corner`,'Viewing key not set')
    return
  }

  try {
    setLoading('Withdrawing...')
    let tx = await send_tx(
      dcasino.DCASINO_CONTRACT_ADDRESS,
      dcasino.dcasino_code_hash, 
      { pay_out : { amount: pay_out }},
      [], 
      66_000);

    if (typeof tx === 'string') {
        await swal_error (tx);
        return;
    } else {
      await swal_success('transaction complete!', '',1500)
      setPayOut(undefined)
    }
  }
  finally {
    setLoading('')
  }
}, [pay_out])

  const do_query = useCallback(async () => {

    if (!dcasino.ready) return

    let user_res = await user()
    if (user_res.is_ok) {
      setUserInfo(user_res.inner as IUser)
    } 
    else if (ERR_UNAUTHORISED.test(user_res.inner as string)) {
      dcasino.vk_valid = false;
    }

    let bal_ = await balance();
    setBalance(bal_[0])

  }, []);

  useEffect(function () {
    do_query();
    const id = setInterval(do_query, 5_000);
    return () => clearInterval(id);
  }, [])

  
  return (
    <>
     <PlainViewer
    show={props.show_credits}
    setShow={props.setShowCredits}
    dark={props.dark}
    vert={false}
      >
      <div className='px-2'>
        <table className='m-auto w-full'>
          <tbody>
            <tr className='p-2 bg-black text-white'>
              <td className='p-2 text-left'>1CR = 1SCRT</td>
            </tr>
            <tr className='p-2'>
              <td className='p-2 text-left'>My Credits</td>
              <td className='text-right'>{user_state? user_state.credits:'-'}</td>
            </tr>
            <tr className='p-2'>
              <td className='p-2 text-left'>My Scrt Balance</td>
              <td className='p-2 text-right'>{bal} scrt</td>
            </tr>
          </tbody>
        </table>

        <div    
        className='m-auto items-center justify-center py-2 px-4 text-neutral-800 flex justify-items'>

            <div className='p-1'>
                <input
                    type="number"
                    min={1}
                    value={pay_in}
                    onChange={e => { 
                    let input_value = parseInt(e.currentTarget.value);
                    setPayIn(input_value); 
                }} 
                className={`
                outline-none p-2 max-w-[150px] text-center text-black`}
                placeholder='deposit'/>
            </div>
            
            <div className='p-1'>
              <div 
              onClick={async _=> { handlePayIn() }}
              className="outline-none p-2 text-sm text-neutral-200 hover:bg-green-600 bg-green-800 w-[100px] text-center">
                  Deposit 
              </div>
            </div>
            
        </div>

        <div    
        className='m-auto items-center justify-center py-2 px-10 text-neutral-800 flex justify-items'>

              <div className='p-1'>
                <input
                    type="number"
                    min={1}
                    value={pay_out}
                    onChange={e => { 
                    let input_value = parseInt(e.currentTarget.value);
                    setPayOut(input_value); 
                }} 
                className={`
                outline-none px-4 py-2 max-w-[150px] text-center text-black`}
                placeholder='withdraw'/>
            </div>

            <div className='p-1'>
              <div 
              onClick={async _=> { handlePayOut() }}
              className="outline-none px-4 py-2 text-sm text-neutral-200 hover:bg-green-600 bg-green-800 w-[100px] text-center">
                  Withdraw
              </div>
            </div>
            
        </div>

      </div>
      </PlainViewer>

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

export default Credits
