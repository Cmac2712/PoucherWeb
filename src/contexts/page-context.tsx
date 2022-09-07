// https://kentcdodds.com/blog/how-to-use-react-context-effectively
import { useState, useContext, createContext, } from "react"
import { ReactNode } from 'react'

interface PageProviderProps {
  children: ReactNode
}

type PageContextProps = {
    setOffset: (num: number) => void
    setPerPage: (num: number) => void
    setCount: (num: number) => void
    setSearch: (num: string) => void
    search: string
    perPage: number
    offset: number
    count: number
} | undefined

const PageContext = createContext<PageContextProps>(undefined)

export const usePage = () => {
  const context = useContext(PageContext)

  if (context === undefined) {
    throw new Error('usePage must be used within a PageProvider')
  }

  return context
}

export const PageProvider = ({ children }: PageProviderProps) => {
  const [perPage, setPerPage] = useState(7)
  const [offset, setOffset] = useState(0)
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState("")

  const value = { perPage, setPerPage, offset, setOffset, count, setCount, search, setSearch }
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>
}