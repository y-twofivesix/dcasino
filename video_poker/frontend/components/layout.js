"use client";

import { AnimatePresence } from "framer-motion";


function Layout({ children  }) {

  return (
    <AnimatePresence>
      <main>{ children }</main>
    </AnimatePresence>
  )
}

export default Layout