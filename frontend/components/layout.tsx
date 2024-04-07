"use client";

import { useState } from "react";

interface LayoutProps {
  children:  React.ReactNode
}

function Layout( props : LayoutProps ) {

  return (
    <>
    
      <main>{ props.children }</main>
    </>

  )
}

export default Layout