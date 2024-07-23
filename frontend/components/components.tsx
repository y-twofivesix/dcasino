import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, } from 'swiper/modules';
import { motion } from "framer-motion"
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useSwiper } from 'swiper/react';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

import 'swiper/css';
import 'swiper/css/pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import 'swiper/css/navigation';

const right = <FontAwesomeIcon color='rainbow' icon={faAngleRight} />
const left = <FontAwesomeIcon color='rainbow' icon={faAngleLeft} />


export function slide ( title_font: [string, string], content_1: any, content_2: any, setDapp?: Dispatch<SetStateAction<string | undefined>> ) {
  return (
    <>
    <SwiperSlide key={title_font[0]}>
    <div className='slide relative w-full h-full'>
      <h1 className={`bg-neutral-200 text-neutral-800 p-1 text-xl ${title_font[1]}`}>{title_font[0]}</h1>

      <div className='grid md:grid-cols-2 pt-4 px-12'>

        <div className='text-left text-sm md:text-base py-4 h-full overflow-y-auto'>
          {content_1}
        </div>

        {content_2}

      </div>

        <div 
        onClick={_=>{setDapp ? setDapp(title_font[0]): ''}}
        className='absolute bottom-16 w-fit m-auto left-0 right-0  rounded-xl p-1 cursor-pointer text-orange-600 bg-neutral-900'>
          <motion.div 
          animate={{y: [1, -1.6, -2.0, -1.8, -1.6,  1] }}
          transition={{
            repeat: Infinity, 
            duration: 0.75, 
          }}
          className='p-2' >{`let's go!`}</motion.div> 
        </div>
        
    </div>
  </SwiperSlide>
  </>
  )
}


export function slide3 ( title: string, content_1: any, external_link?: string) {
  return (
    <SwiperSlide key={title}>

    <div className='slide3 relative w-full h-full'>
      <h1 className='bg-neutral-200 text-neutral-800 p-1'>{title}</h1>

      <div className='pt-4 px-2'>

        <div className='text-left text-sm md:text-base py-4 h-full overflow-y-auto'>
          {content_1}
        </div>

      </div>

        {
        external_link ?
        <a target="_blank" href={external_link} rel="noopener noreferrer">
          <div className='absolute bottom-16 w-full text-orange-600 bg-neutral-900'>visit site</div>
        </a> : <></>}
        
    </div>
  </SwiperSlide>
  )
}

export function slide2 ( title: string, content_1: any, content_2: any, external_link?: string) {
    return (
      <SwiperSlide key={title}>
      <div className='slide2 relative w-full h-full'>
        <h1 className='bg-neutral-200 text-neutral-800 p-1'>{title}</h1>
  
        <div className='grid md:grid-cols-2 pt-4 px-2'>

          <div className='text-left text-sm md:text-base py-4 h-full overflow-y-auto'>
            {content_1}
          </div>
  
          {content_2}
  
        </div>
  
          {
          external_link ?
          <a target="_blank" href={external_link} rel="noopener noreferrer">
            <div className='absolute bottom-16 w-full text-orange-600 bg-neutral-900'>visit site</div>
          </a> : <></>}
          
      </div>
    </SwiperSlide>
    )
  }
  
interface PlainViewer2Props {
  children: React.ReactNode
  show: boolean
  setShow: Dispatch<SetStateAction<any>>
  dark: boolean
  vert:boolean
  dims: {x: number, y: number}
}

interface ViewerProps {
  children: React.ReactNode
  show: boolean
  setShow: Dispatch<SetStateAction<any>>
  dark: boolean
  vert:boolean
}
  export function Viewer (props: ViewerProps) {
    let scaler = props.vert ? 'scaleX': 'scaleY'
    const swiper_ref = useRef<any>(null)
    const [current_slide, setCurrentSlide] = useState(0);


    return (
      <motion.div
      initial={{ opacity: 0, [scaler]: 0}}
      animate={{ opacity: 0.98, [scaler]:props.show?1:0}}
      transition={{ duration: 0.3 }}
      className={`
      rounded-lg ${props.dark?'invert':''}
      fixed z-40 top-20 md:top-0 md:bottom-0 left-0 
      right-0 m-auto w-[95%] h-3/4 lg:h-2/3 md:w-[730px] 
      lg:w-[800px] bg-neutral-800 text-neutral-200`}>
        
        <div
        onClick={e=>props.setShow(false)}
        className='absolute items-center justify-center z-50 top-2 right-2 bg-red-900 hover:bg-red-600 px-2 py-1 rounded-lg'>close module</div>
        <div className={`viewer pt-12 pb-5 px-2 h-full text-center break-words items-center justify-center`}>
          <Swiper
          onSwiper={(swiper) => {
            swiper_ref.current = swiper;
          }}
            className='h-full relative overflow-y-auto'
            modules={[Pagination]}
            pagination={{ type:'progressbar', }}
            navigation= {true}
            spaceBetween={50}
            slidesPerView={1}
          >
            <div
            onClick={()=> {
              if (!swiper_ref.current?.isBeginning) {
                swiper_ref.current?.slidePrev();
              }
            }} 
            className={`
            ${!swiper_ref.current?.isBeginning?'rainbow':'text-white opacity-50'} 
            duration-700 bg-neutral-900
            absolute top-1/2 z-50 left-0.5 px-3 py-1`}>{left}</div>
            <div
            onClick={()=> {
              if (!swiper_ref.current?.isEnd) {
                swiper_ref.current?.slideNext()
              }

              }
              
            }  
            className={`
            ${!swiper_ref.current?.isEnd?'rainbow':'text-white opacity-50'} 
            duration-700 bg-neutral-900
            absolute top-1/2 z-50 right-0.5 px-3 py-1`}>{right}</div>
            {props.children}
          </Swiper>
  
        </div>
      </motion.div>
    )
  }

  export function PlainViewer (props: ViewerProps) {
    let scaler = props.vert ? 'scaleX': 'scaleY'
    return (
      <motion.div
      initial={{ opacity: 0, [scaler]: 0}}
      animate={{ opacity: 0.98, [scaler]:props.show?1:0}}
      transition={{ duration: 0.3 }}
      className={`
      rounded-lg ${props.dark?'invert':''}
      fixed z-40 top-20 md:top-0 md:bottom-0 left-0 
      right-0 m-auto w-[95%] h-3/4 lg:h-2/3 md:w-[730px] 
      lg:w-[800px] bg-neutral-800 text-neutral-200`}>
        <div
        onClick={e=>props.setShow(false)}
        className='absolute items-center justify-center z-50 top-2 right-2 bg-red-900 hover:bg-red-600 px-2 py-1 rounded-lg'>close module</div>
        <div className={`plainviewer pt-16 pb-5 px-10  h-full text-center break-words text-white items-center justify-center`}>

          {props.children}
  
        </div>
      </motion.div>
    )
  }

  export function PlainViewer2 (props: PlainViewer2Props) {

    return (
      <motion.div
      initial={{ opacity: 0, scale: 0}}
      animate={{ opacity: 1, scale: props.show?1:0}}
      transition={{ duration: 0.3 }}
      className={`
      rounded-lg ${props.dark? 'invert':''}
      fixed md:z-40 z-50 md:top-20 left-0 
      right-0 m-auto w-full max-h-[750px] h-[95%] md:w-[900px] md:h-[800px] 
      bg-neutral-800 text-neutral-200 overflow-hidden`}>
        <div
        onClick={e=>props.setShow(false)}
        className='absolute items-center justify-center z-50 top-2 right-2 bg-red-900 hover:bg-red-600 px-2 py-1'>{"close d'App"}</div>
        <div className={`plainviewer2 p-2 overflow-hidden h-full text-center break-words text-white items-center justify-center`}>

          {props.children}
  
        </div>
      </motion.div>
    )
  }