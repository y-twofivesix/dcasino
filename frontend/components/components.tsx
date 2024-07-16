import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, } from 'swiper/modules';
import { motion } from "framer-motion"
import { Dispatch, SetStateAction } from 'react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export function slide ( title_font: [string, string], content_1: any, content_2: any, setDapp?: Dispatch<SetStateAction<string | undefined>> ) {

  return (
    <>
    <SwiperSlide key={title_font[0]}>
    <div className='relative w-full h-full'>
      <h1 className={`bg-neutral-200 text-neutral-800 p-1 text-xl ${title_font[1]}`}>{title_font[0]}</h1>

      <div className='grid md:grid-cols-2 pt-4 px-10'>

        <div className='text-left text-sm md:text-base py-4 h-full overflow-y-auto'>
          {content_1}
        </div>

        {content_2}

      </div>

        <div 
        className='absolute bottom-16 w-full p-1 cursor-pointer text-orange-600 bg-neutral-900'>
          <span onClick={_=>{setDapp ? setDapp(title_font[0]): ''}} >{`let's go!`}</span>
        </div>
        
    </div>
  </SwiperSlide>
  </>
  )
}


export function slide3 ( title: string, content_1: any, external_link?: string) {
  return (
    <SwiperSlide key={title}>
    <div className='relative w-full h-full'>
      <h1 className='bg-neutral-200 text-neutral-800 p-1'>{title}</h1>

      <div className='px-4 pt-4 px-10'>

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
      <div className='relative w-full h-full'>
        <h1 className='bg-neutral-200 text-neutral-800 p-1'>{title}</h1>
  
        <div className='grid md:grid-cols-2 pt-4'>

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
    return (
      <motion.div
      initial={{ opacity: 0, [scaler]: 0}}
      animate={{ opacity: 0.98, [scaler]:props.show?1:0}}
      transition={{ duration: 0.3 }}
      className={`
      rounded-lg
      fixed z-40 top-20 md:top-0 md:bottom-0 left-0 
      right-0 m-auto w-11/12 h-3/4 lg:h-2/3 md:w-[730px] 
      lg:w-[800px] bg-neutral-800 text-neutral-200`}>
        <div
        onClick={e=>props.setShow(false)}
        className='absolute items-center justify-center z-50 top-2 right-2 bg-red-900 hover:bg-red-600 px-2 py-1'>x</div>
        <div className='pt-16 pb-5 px-2  h-full text-center break-words text-white items-center justify-center'>
          <Swiper
          
          className='h-full relative overflow-y-auto'
            modules={[Navigation, Pagination]}
            pagination={{ type: 'progressbar', }}
            navigation= {true}
            spaceBetween={50}
            slidesPerView={1}
          >
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
      rounded-lg
      fixed z-40 top-20 md:top-0 md:bottom-0 left-0 
      right-0 m-auto w-4/5 h-3/4 lg:h-2/3 md:w-[730px] 
      lg:w-[800px] bg-neutral-800 text-neutral-200`}>
        <div
        onClick={e=>props.setShow(false)}
        className='absolute items-center justify-center z-50 top-2 right-2 bg-red-900 hover:bg-red-600 px-2 py-1'>x</div>
        <div className='pt-16 pb-5 px-10  h-full text-center break-words text-white items-center justify-center'>

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
        className='absolute items-center justify-center z-50 top-2 right-2 bg-red-900 hover:bg-red-600 px-2 py-1'>x</div>
        <div className='p-2 overflow-hidden h-full text-center break-words text-white items-center justify-center'>

          {props.children}
  
        </div>
      </motion.div>
    )
  }