import React, { Dispatch, SetStateAction,} from 'react'
import { Viewer, slide3 } from './components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey, faSquareCheck, faUserGroup, faWallet } from '@fortawesome/free-solid-svg-icons'

interface ConsultProps {
    show_about: boolean
    setShowAbout: Dispatch<SetStateAction<boolean>>,
    dark: boolean
}


function About(props: ConsultProps) {

  const wallet = <FontAwesomeIcon color='white' icon={faWallet} />
  const key = <FontAwesomeIcon color='white' icon={faKey} />
  const check = <FontAwesomeIcon color='white' icon={faSquareCheck} />
  const alias = <FontAwesomeIcon color='white' icon={faUserGroup} />
  
  return (
    <>
     <Viewer
    show={props.show_about}
    setShow={props.setShowAbout}
    dark={props.dark}
    vert={true}
      >
      {[
        
        slide3('Getting Started',
        <div className='p-4'>
          <div className='p-2'>step 1. Connect your wallet ({wallet}), be sure to have enough tokens for gas fees!</div>
          <div className='p-2'>step 2. Create a viewing key ({key}), this is how you view your private onchain data.</div>
          <div className='p-2'>step 3. (recommended) create an alias ({alias}). This will greatly improve your dapp experience</div>
          <div className='p-2'>step 4. (recommended) generate a zk-proof of your humanity ({check}) for KYC, using {`reclaim's`} Zero-knowledge solution</div>
         
        </div>),
        slide3('What is a dCasino?',
        <div className='p-4'>
          {`A dCasino is simply a platform with a suite of casino games. Users can connect their wallets to the platform,
          onboard and cash in tokens, play casino games seamlessly with their tokens, then cash out again. 
          A dCasino is made possible by on-chain privacy and VRF, which would be necessary for a positive user 
          experience and some core game functionalities, and which are not readily available on other blockchains.`}
        </div>, ),

      ]}
      </Viewer>
    </>
   
    
  )
}

export default About
