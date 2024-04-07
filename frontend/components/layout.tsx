"use client";

import { useState } from "react";
import Footer from "./footer";
import Header from "./header";

interface LayoutProps {
  children:  React.ReactNode
}

function Layout( props : LayoutProps ) {

  return (
    <>
    <Header/>
      <main>{ props.children }</main>
    </>

  )
}

export default Layout